-- Keep the database-generated availability aligned with the public booking API.
-- The first release accepts hourly appointments from 09:00 through 18:00.
update public.booking_settings
set
  opening_hour = 9,
  last_slot_hour = 18
where singleton = true;
