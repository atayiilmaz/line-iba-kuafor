create extension if not exists pgcrypto;

create table public.booking_settings (
  singleton boolean primary key default true check (singleton),
  timezone text not null default 'Europe/Istanbul',
  opening_hour smallint not null default 9 check (opening_hour between 0 and 23),
  last_slot_hour smallint not null default 18 check (last_slot_hour between 0 and 23),
  min_lead_minutes integer not null default 120 check (min_lead_minutes >= 0),
  booking_horizon_days integer not null default 30 check (booking_horizon_days between 1 and 365),
  retention_months integer not null default 12 check (retention_months between 1 and 120),
  whatsapp_recipients text[] not null default array['905333212283']::text[]
);

insert into public.booking_settings (singleton) values (true)
on conflict (singleton) do nothing;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner', 'admin')),
  display_name text,
  created_at timestamptz not null default now()
);

create table public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  start_at timestamptz not null,
  kind text not null check (kind in ('appointment', 'block')),
  status text not null default 'active' check (status in ('active', 'released')),
  reason text check (char_length(reason) <= 240),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  released_at timestamptz
);

create unique index calendar_entries_one_active_slot
  on public.calendar_entries (start_at)
  where status = 'active';

create index calendar_entries_start_at_idx
  on public.calendar_entries (start_at);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  calendar_entry_id uuid not null unique references public.calendar_entries(id) on delete restrict,
  request_id uuid not null unique,
  reference_code text not null unique,
  service_code text not null check (service_code in ('cut-style', 'color', 'bridal', 'nails-makeup')),
  customer_name text check (customer_name is null or char_length(customer_name) between 2 and 100),
  phone_e164 text check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{9,14}$'),
  note text check (note is null or char_length(note) <= 600),
  locale text not null default 'tr' check (locale in ('tr', 'en')),
  source text not null default 'web' check (source in ('web', 'admin')),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'no_show')),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sent', 'failed')),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  anonymized_at timestamptz
);

create index appointments_status_idx on public.appointments (status, created_at desc);

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  recipient text not null check (recipient ~ '^[1-9][0-9]{9,14}$'),
  event_type text not null default 'appointment_created' check (event_type in ('appointment_created')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  provider_message_id text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (appointment_id, recipient, event_type)
);

create index notification_outbox_due_idx
  on public.notification_outbox (status, next_attempt_at)
  where status in ('pending', 'failed');

create table public.booking_rate_limits (
  key_hash text not null,
  bucket_start timestamptz not null,
  request_count integer not null default 1,
  primary key (key_hash, bucket_start)
);

alter table public.booking_settings enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.calendar_entries enable row level security;
alter table public.appointments enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.booking_rate_limits enable row level security;

create policy "admins can read own profile"
  on public.admin_profiles for select to authenticated
  using (user_id = auth.uid());

create policy "admins can read calendar"
  on public.calendar_entries for select to authenticated
  using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));

create policy "admins can read appointments"
  on public.appointments for select to authenticated
  using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));

create policy "admins can read notifications"
  on public.notification_outbox for select to authenticated
  using (exists (select 1 from public.admin_profiles p where p.user_id = auth.uid()));

create or replace function public.get_booking_availability(p_date date)
returns table (start_at timestamptz, label text, available boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.booking_settings%rowtype;
  local_today date;
begin
  select * into cfg from public.booking_settings where singleton = true;
  local_today := (now() at time zone cfg.timezone)::date;

  if p_date < local_today or p_date > local_today + cfg.booking_horizon_days then
    return;
  end if;

  return query
  with slots as (
    select make_timestamptz(
      extract(year from p_date)::integer,
      extract(month from p_date)::integer,
      extract(day from p_date)::integer,
      hour_value,
      0,
      0,
      cfg.timezone
    ) as slot_at
    from generate_series(cfg.opening_hour, cfg.last_slot_hour) as hour_value
  )
  select
    slots.slot_at,
    to_char(slots.slot_at at time zone cfg.timezone, 'HH24:MI'),
    slots.slot_at >= now() + make_interval(mins => cfg.min_lead_minutes)
      and not exists (
        select 1
        from public.calendar_entries ce
        where ce.start_at = slots.slot_at and ce.status = 'active'
      )
  from slots
  order by slots.slot_at;
end;
$$;

create or replace function public.create_appointment(
  p_request_id uuid,
  p_service_code text,
  p_customer_name text,
  p_phone_e164 text,
  p_note text,
  p_locale text,
  p_start_at timestamptz,
  p_source text default 'web'
)
returns table (
  appointment_id uuid,
  reference_code text,
  start_at timestamptz,
  booking_status text,
  notification_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.booking_settings%rowtype;
  existing public.appointments%rowtype;
  entry_id uuid;
  appointment_row public.appointments%rowtype;
  local_start timestamp;
  local_today date;
  recipient_value text;
  generated_reference text;
begin
  select * into existing from public.appointments where request_id = p_request_id;
  if found then
    return query
      select existing.id, existing.reference_code, ce.start_at, existing.status, existing.notification_status
      from public.calendar_entries ce where ce.id = existing.calendar_entry_id;
    return;
  end if;

  select * into cfg from public.booking_settings where singleton = true;
  local_start := p_start_at at time zone cfg.timezone;
  local_today := (now() at time zone cfg.timezone)::date;

  if p_service_code not in ('cut-style', 'color', 'bridal', 'nails-makeup') then
    raise exception 'INVALID_SERVICE' using errcode = 'P0001';
  end if;
  if p_locale not in ('tr', 'en') or p_source not in ('web', 'admin') then
    raise exception 'INVALID_INPUT' using errcode = 'P0001';
  end if;
  if char_length(trim(p_customer_name)) not between 2 and 100 then
    raise exception 'INVALID_NAME' using errcode = 'P0001';
  end if;
  if p_phone_e164 !~ '^\+[1-9][0-9]{9,14}$' then
    raise exception 'INVALID_PHONE' using errcode = 'P0001';
  end if;
  if extract(minute from local_start) <> 0
    or extract(second from local_start) <> 0
    or extract(hour from local_start) < cfg.opening_hour
    or extract(hour from local_start) > cfg.last_slot_hour then
    raise exception 'INVALID_SLOT' using errcode = 'P0001';
  end if;
  if local_start::date < local_today
    or local_start::date > local_today + cfg.booking_horizon_days
    or (p_source = 'web' and p_start_at < now() + make_interval(mins => cfg.min_lead_minutes)) then
    raise exception 'SLOT_OUTSIDE_WINDOW' using errcode = 'P0001';
  end if;

  begin
    insert into public.calendar_entries (start_at, kind, status)
    values (p_start_at, 'appointment', 'active')
    returning id into entry_id;
  exception when unique_violation then
    -- A concurrent replay with the same request id should receive the original
    -- booking instead of a misleading SLOT_TAKEN response.
    select * into existing from public.appointments where request_id = p_request_id;
    if found then
      return query
        select existing.id, existing.reference_code, ce.start_at, existing.status, existing.notification_status
        from public.calendar_entries ce where ce.id = existing.calendar_entry_id;
      return;
    end if;
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end;

  generated_reference := 'LC-' || to_char(local_start, 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.appointments (
    calendar_entry_id, request_id, reference_code, service_code,
    customer_name, phone_e164, note, locale, source
  ) values (
    entry_id, p_request_id, generated_reference, p_service_code,
    trim(p_customer_name), p_phone_e164, nullif(trim(coalesce(p_note, '')), ''), p_locale, p_source
  ) returning * into appointment_row;

  foreach recipient_value in array cfg.whatsapp_recipients loop
    insert into public.notification_outbox (appointment_id, recipient)
    values (appointment_row.id, recipient_value)
    on conflict do nothing;
  end loop;

  return query select appointment_row.id, appointment_row.reference_code, p_start_at, appointment_row.status, appointment_row.notification_status;
end;
$$;

create or replace function public.consume_booking_rate_limit(
  p_key_hash text,
  p_max_requests integer,
  p_window_minutes integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_bucket timestamptz;
  updated_count integer;
begin
  current_bucket := date_bin(make_interval(mins => p_window_minutes), now(), timestamptz '2020-01-01 00:00:00+00');
  insert into public.booking_rate_limits (key_hash, bucket_start, request_count)
  values (p_key_hash, current_bucket, 1)
  on conflict (key_hash, bucket_start)
  do update set request_count = public.booking_rate_limits.request_count + 1
  returning request_count into updated_count;
  return updated_count <= p_max_requests;
end;
$$;

create or replace function public.assert_booking_admin(p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_profiles where user_id = p_actor_id) then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_cancel_appointment(p_appointment_id uuid, p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  entry_id uuid;
begin
  perform public.assert_booking_admin(p_actor_id);
  update public.appointments
  set status = 'cancelled', cancelled_at = coalesce(cancelled_at, now())
  where id = p_appointment_id
  returning calendar_entry_id into entry_id;
  if entry_id is null then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
  update public.calendar_entries
  set status = 'released', released_at = now()
  where id = entry_id and status = 'active';
  update public.notification_outbox
  set status = 'cancelled', last_error = 'APPOINTMENT_CANCELLED'
  where appointment_id = p_appointment_id and status <> 'sent';
end;
$$;

create or replace function public.admin_block_slot(p_start_at timestamptz, p_reason text, p_actor_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  perform public.assert_booking_admin(p_actor_id);
  begin
    insert into public.calendar_entries (start_at, kind, reason, created_by)
    values (p_start_at, 'block', nullif(trim(coalesce(p_reason, '')), ''), p_actor_id)
    returning id into new_id;
  exception when unique_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end;
  return new_id;
end;
$$;

create or replace function public.admin_release_block(p_entry_id uuid, p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_booking_admin(p_actor_id);
  update public.calendar_entries
  set status = 'released', released_at = now()
  where id = p_entry_id and kind = 'block' and status = 'active';
  if not found then raise exception 'NOT_FOUND' using errcode = 'P0001'; end if;
end;
$$;

create or replace function public.admin_retry_notification(p_appointment_id uuid, p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_booking_admin(p_actor_id);
  update public.notification_outbox
  set status = 'pending', next_attempt_at = now(), last_error = null
  where appointment_id = p_appointment_id and status <> 'sent';
  update public.appointments set notification_status = 'pending' where id = p_appointment_id;
end;
$$;

create or replace function public.claim_notification_jobs(p_limit integer default 10)
returns table (
  outbox_id uuid,
  appointment_id uuid,
  recipient text,
  reference_code text,
  service_code text,
  customer_name text,
  phone_e164 text,
  note text,
  start_at timestamptz,
  locale text,
  attempts integer
)
language sql
security definer
set search_path = public
as $$
  with selected as (
    select o.id
    from public.notification_outbox o
    join public.appointments a on a.id = o.appointment_id and a.status = 'confirmed'
    where o.status in ('pending', 'failed') and o.next_attempt_at <= now()
    order by o.created_at
    for update skip locked
    limit greatest(1, least(p_limit, 50))
  ), claimed as (
    update public.notification_outbox o
    set status = 'processing', attempts = o.attempts + 1
    from selected s
    where o.id = s.id
    returning o.*
  )
  select c.id, a.id, c.recipient, a.reference_code, a.service_code,
    a.customer_name, a.phone_e164, a.note, ce.start_at, a.locale, c.attempts
  from claimed c
  join public.appointments a on a.id = c.appointment_id
  join public.calendar_entries ce on ce.id = a.calendar_entry_id
  where a.status = 'confirmed';
$$;

create or replace function public.anonymize_expired_appointments()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.booking_settings%rowtype;
  affected integer;
begin
  select * into cfg from public.booking_settings where singleton = true;
  update public.appointments
  set customer_name = null, phone_e164 = null, note = null, anonymized_at = now()
  where anonymized_at is null and created_at < now() - make_interval(months => cfg.retention_months);
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.get_booking_availability(date) from public, anon, authenticated;
revoke all on function public.create_appointment(uuid, text, text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.consume_booking_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.assert_booking_admin(uuid) from public, anon, authenticated;
revoke all on function public.admin_cancel_appointment(uuid, uuid) from public, anon, authenticated;
revoke all on function public.admin_block_slot(timestamptz, text, uuid) from public, anon, authenticated;
revoke all on function public.admin_release_block(uuid, uuid) from public, anon, authenticated;
revoke all on function public.admin_retry_notification(uuid, uuid) from public, anon, authenticated;
revoke all on function public.claim_notification_jobs(integer) from public, anon, authenticated;
revoke all on function public.anonymize_expired_appointments() from public, anon, authenticated;

grant execute on function public.get_booking_availability(date) to service_role;
grant execute on function public.create_appointment(uuid, text, text, text, text, text, timestamptz, text) to service_role;
grant execute on function public.consume_booking_rate_limit(text, integer, integer) to service_role;
grant execute on function public.admin_cancel_appointment(uuid, uuid) to service_role;
grant execute on function public.admin_block_slot(timestamptz, text, uuid) to service_role;
grant execute on function public.admin_release_block(uuid, uuid) to service_role;
grant execute on function public.admin_retry_notification(uuid, uuid) to service_role;
grant execute on function public.claim_notification_jobs(integer) to service_role;
grant execute on function public.anonymize_expired_appointments() to service_role;
