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
    from generate_series(cfg.opening_hour::integer, cfg.last_slot_hour::integer) as hour_value
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

revoke all on function public.get_booking_availability(date) from public, anon, authenticated;
grant execute on function public.get_booking_availability(date) to service_role;
