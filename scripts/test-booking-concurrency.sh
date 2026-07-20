#!/usr/bin/env bash
set -euo pipefail

booking_test_db_url="${BOOKING_TEST_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

slot_sql="make_timestamptz(
  extract(year from ((now() at time zone 'Europe/Istanbul')::date + 2))::integer,
  extract(month from ((now() at time zone 'Europe/Istanbul')::date + 2))::integer,
  extract(day from ((now() at time zone 'Europe/Istanbul')::date + 2))::integer,
  17, 0, 0, 'Europe/Istanbul'
)"

request_sql="select * from public.create_appointment(
  gen_random_uuid(),
  'cut-style',
  'Concurrency Test',
  '+905551112233',
  '',
  'tr',
  ${slot_sql},
  'admin'
);"

pids=()
for _ in $(seq 1 20); do
  psql "${booking_test_db_url}" -v ON_ERROR_STOP=1 -c "${request_sql}" >/dev/null 2>&1 &
  pids+=("$!")
done

for pid in "${pids[@]}"; do
  wait "${pid}" || true
done

created_count=$(psql "${booking_test_db_url}" -v ON_ERROR_STOP=1 -Atc "
  select count(*)
  from public.appointments a
  join public.calendar_entries ce on ce.id = a.calendar_entry_id
  where ce.start_at = ${slot_sql}
    and a.customer_name = 'Concurrency Test';
")

if [[ "${created_count}" != "1" ]]; then
  echo "Expected exactly one appointment from 20 parallel requests, got ${created_count}." >&2
  exit 1
fi

echo "Concurrency test passed: 20 parallel requests created exactly one appointment."
