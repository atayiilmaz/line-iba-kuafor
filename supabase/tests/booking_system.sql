begin;

select plan(5);

update public.booking_settings
set min_lead_minutes = 0, booking_horizon_days = 30
where singleton = true;

create temporary table booking_test_values as
select
  gen_random_uuid() as first_request,
  gen_random_uuid() as second_request,
  make_timestamptz(
    extract(year from ((now() at time zone 'Europe/Istanbul')::date + 1))::integer,
    extract(month from ((now() at time zone 'Europe/Istanbul')::date + 1))::integer,
    extract(day from ((now() at time zone 'Europe/Istanbul')::date + 1))::integer,
    12, 0, 0, 'Europe/Istanbul'
  ) as slot_at;

select lives_ok(
  format(
    'select * from public.create_appointment(%L::uuid, %L, %L, %L, %L, %L, %L::timestamptz, %L)',
    first_request, 'cut-style', 'Test Müşteri', '+905551112233', '', 'tr', slot_at, 'web'
  ),
  'first request reserves the slot'
)
from booking_test_values;

select lives_ok(
  format(
    'select * from public.create_appointment(%L::uuid, %L, %L, %L, %L, %L, %L::timestamptz, %L)',
    first_request, 'cut-style', 'Test Müşteri', '+905551112233', '', 'tr', slot_at, 'web'
  ),
  'replaying the same request is idempotent'
)
from booking_test_values;

select is(
  (select count(*) from public.appointments a join booking_test_values t on a.request_id = t.first_request),
  1::bigint,
  'idempotent replay creates one appointment'
);

select throws_like(
  format(
    'select * from public.create_appointment(%L::uuid, %L, %L, %L, %L, %L, %L::timestamptz, %L)',
    second_request, 'color', 'İkinci Müşteri', '+905559998877', '', 'tr', slot_at, 'web'
  ),
  '%SLOT_TAKEN%',
  'another request cannot reserve the active slot'
)
from booking_test_values;

select is(
  (
    select availability.available
    from booking_test_values values
    cross join lateral public.get_booking_availability((values.slot_at at time zone 'Europe/Istanbul')::date) availability
    where availability.start_at = values.slot_at
  ),
  false,
  'reserved slot is unavailable'
);

select * from finish();
rollback;
