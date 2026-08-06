-- Appointments are capacity-limited per staff member, not per salon.
-- Existing calendar records are assigned to Ergün Sarıca during the migration.
alter table public.calendar_entries
  add column staff_code text not null default 'ergun-sarica'
  check (staff_code in ('ergun-sarica', 'ibrahim-yilmaz', 'ahmet-yilmaz'));

drop index public.calendar_entries_one_active_slot;

create unique index calendar_entries_one_active_staff_slot
  on public.calendar_entries (start_at, staff_code)
  where status = 'active';

drop function public.get_booking_availability(date);

create function public.get_booking_availability(p_date date, p_staff_code text)
returns table (start_at timestamptz, label text, available boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.booking_settings%rowtype;
  local_today date;
begin
  if p_staff_code not in ('ergun-sarica', 'ibrahim-yilmaz', 'ahmet-yilmaz') then
    raise exception 'INVALID_STAFF' using errcode = 'P0001';
  end if;

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
    from generate_series(cfg.opening_hour::integer, cfg.last_slot_hour::integer) as hour_value
  )
  select
    slots.slot_at,
    to_char(slots.slot_at at time zone cfg.timezone, 'HH24:MI'),
    slots.slot_at >= now() + make_interval(mins => cfg.min_lead_minutes)
      and not exists (
        select 1
        from public.calendar_entries ce
        where ce.start_at = slots.slot_at
          and ce.staff_code = p_staff_code
          and ce.status = 'active'
      )
  from slots
  order by slots.slot_at;
end;
$$;

drop function public.create_appointment(uuid, text, text, text, text, text, timestamptz, text);

create function public.create_appointment(
  p_request_id uuid,
  p_service_code text,
  p_staff_code text,
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
  if p_staff_code not in ('ergun-sarica', 'ibrahim-yilmaz', 'ahmet-yilmaz') then
    raise exception 'INVALID_STAFF' using errcode = 'P0001';
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
    insert into public.calendar_entries (start_at, staff_code, kind, status)
    values (p_start_at, p_staff_code, 'appointment', 'active')
    returning id into entry_id;
  exception when unique_violation then
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

drop function public.admin_block_slot(timestamptz, text, uuid);

create function public.admin_block_slot(p_start_at timestamptz, p_staff_code text, p_reason text, p_actor_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  perform public.assert_booking_admin(p_actor_id);
  if p_staff_code not in ('ergun-sarica', 'ibrahim-yilmaz', 'ahmet-yilmaz') then
    raise exception 'INVALID_STAFF' using errcode = 'P0001';
  end if;
  begin
    insert into public.calendar_entries (start_at, staff_code, kind, reason, created_by)
    values (p_start_at, p_staff_code, 'block', nullif(trim(coalesce(p_reason, '')), ''), p_actor_id)
    returning id into new_id;
  exception when unique_violation then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end;
  return new_id;
end;
$$;

drop function public.claim_notification_jobs(integer);

create function public.claim_notification_jobs(p_limit integer default 10)
returns table (
  outbox_id uuid,
  appointment_id uuid,
  recipient text,
  reference_code text,
  service_code text,
  staff_code text,
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
    where o.status in ('pending', 'failed')
      and o.next_attempt_at <= now()
      and o.attempts < 5
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
    ce.staff_code, a.customer_name, a.phone_e164, a.note, ce.start_at, a.locale, c.attempts
  from claimed c
  join public.appointments a on a.id = c.appointment_id
  join public.calendar_entries ce on ce.id = a.calendar_entry_id
  where a.status = 'confirmed';
$$;

revoke all on function public.get_booking_availability(date, text) from public, anon, authenticated;
revoke all on function public.create_appointment(uuid, text, text, text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.admin_block_slot(timestamptz, text, text, uuid) from public, anon, authenticated;
revoke all on function public.claim_notification_jobs(integer) from public, anon, authenticated;

grant execute on function public.get_booking_availability(date, text) to service_role;
grant execute on function public.create_appointment(uuid, text, text, text, text, text, text, timestamptz, text) to service_role;
grant execute on function public.admin_block_slot(timestamptz, text, text, uuid) to service_role;
grant execute on function public.claim_notification_jobs(integer) to service_role;
