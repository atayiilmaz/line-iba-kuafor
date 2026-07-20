-- The first release has a fixed 09:00-18:00 hourly booking grid.
-- Enforce it at the database boundary so availability and creation cannot drift.
update public.booking_settings
set opening_hour = 9, last_slot_hour = 18
where singleton = true;

alter table public.booking_settings
  add constraint booking_settings_fixed_hours
  check (opening_hour = 9 and last_slot_hour = 18);
