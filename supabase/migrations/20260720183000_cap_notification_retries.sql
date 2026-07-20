create or replace function public.admin_retry_notification(p_appointment_id uuid, p_actor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_booking_admin(p_actor_id);
  update public.notification_outbox
  set status = 'pending', attempts = 0, next_attempt_at = now(), last_error = null
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
    a.customer_name, a.phone_e164, a.note, ce.start_at, a.locale, c.attempts
  from claimed c
  join public.appointments a on a.id = c.appointment_id
  join public.calendar_entries ce on ce.id = a.calendar_entry_id
  where a.status = 'confirmed';
$$;

revoke all on function public.admin_retry_notification(uuid, uuid) from public, anon, authenticated;
revoke all on function public.claim_notification_jobs(integer) from public, anon, authenticated;
grant execute on function public.admin_retry_notification(uuid, uuid) to service_role;
grant execute on function public.claim_notification_jobs(integer) to service_role;
