import { isAllowedOrigin } from '../_shared/cors.ts'
import { json, options } from '../_shared/http.ts'
import { adminClient } from '../_shared/supabase.ts'
import { staffCodes, validDate } from '../_shared/validation.ts'

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'GET') return json(request, { code: 'METHOD_NOT_ALLOWED' }, 405)
  if (!isAllowedOrigin(request)) return json(request, { code: 'ORIGIN_NOT_ALLOWED' }, 403)

  const searchParams = new URL(request.url).searchParams
  const date = searchParams.get('date')
  const staffCode = searchParams.get('staffCode')
  if (!validDate(date)) return json(request, { code: 'INVALID_DATE' }, 422)
  if (!staffCodes.includes(staffCode as (typeof staffCodes)[number])) return json(request, { code: 'INVALID_STAFF' }, 422)

  try {
    const { data, error } = await adminClient().rpc('get_booking_availability', { p_date: date, p_staff_code: staffCode })
    if (error) throw error
    return json(request, {
      date,
      staffCode,
      timezone: 'Europe/Istanbul',
      slots: (data ?? []).map((slot: { start_at: string; label: string; available: boolean }) => ({
        startAt: slot.start_at,
        label: slot.label,
        available: slot.available,
      })),
    })
  } catch (error) {
    console.error('booking-availability', error)
    const detail = Deno.env.get('DEBUG_BOOKING_ERRORS') === 'true' && error && typeof error === 'object'
      ? Object.fromEntries(['message', 'code', 'details', 'hint'].flatMap((key) => key in error ? [[key, String((error as Record<string, unknown>)[key])]] : []))
      : undefined
    return json(request, { code: 'AVAILABILITY_UNAVAILABLE', ...(detail ? { detail } : {}) }, 503)
  }
})
