import { isAllowedOrigin } from '../_shared/cors.ts'
import { json, options } from '../_shared/http.ts'
import { adminClient } from '../_shared/supabase.ts'
import { normalizeTurkishPhone, serviceCodes, staffCodes, toIstanbulTimestamp, validDate, validTime } from '../_shared/validation.ts'
import { verifyTurnstile } from '../_shared/turnstile.ts'

type BookingPayload = {
  requestId?: string
  serviceCode?: string
  staffCode?: string
  date?: string
  startTime?: string
  customerName?: string
  phone?: string
  note?: string
  locale?: string
  consent?: boolean
  turnstileToken?: string
}

function rpcErrorCode(message: string) {
  return ['SLOT_TAKEN', 'INVALID_SERVICE', 'INVALID_STAFF', 'INVALID_INPUT', 'INVALID_NAME', 'INVALID_PHONE', 'INVALID_SLOT', 'SLOT_OUTSIDE_WINDOW']
    .find((code) => message.includes(code))
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return options(request)
  if (request.method !== 'POST') return json(request, { code: 'METHOD_NOT_ALLOWED' }, 405)
  if (!isAllowedOrigin(request)) return json(request, { code: 'ORIGIN_NOT_ALLOWED' }, 403)

  let body: BookingPayload
  try {
    body = await request.json()
  } catch {
    return json(request, { code: 'INVALID_JSON' }, 400)
  }

  const phone = normalizeTurkishPhone(body.phone)
  const name = String(body.customerName ?? '').trim()
  const note = String(body.note ?? '').trim()
  const requestId = String(body.requestId ?? '')
  const serviceCode = String(body.serviceCode ?? '')
  const staffCode = String(body.staffCode ?? '')
  const date = String(body.date ?? '')
  const startTime = String(body.startTime ?? '')
  const turnstileToken = String(body.turnstileToken ?? '')
  const turnstileEnabled = Deno.env.get('TURNSTILE_ENABLED') === 'true'
  const locale = body.locale === 'en' ? 'en' : 'tr'
  const invalidFields = [
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId) && 'requestId',
    !serviceCodes.includes(serviceCode as (typeof serviceCodes)[number]) && 'serviceCode',
    !staffCodes.includes(staffCode as (typeof staffCodes)[number]) && 'staffCode',
    !validDate(date) && 'date',
    !validTime(startTime) && 'startTime',
    (name.length < 2 || name.length > 100) && 'customerName',
    note.length > 600 && 'note',
    !phone && 'phone',
    body.consent !== true && 'consent',
    turnstileEnabled && !turnstileToken && 'turnstileToken',
  ].filter((field): field is string => Boolean(field))
  if (invalidFields.length) return json(request, { code: 'VALIDATION_ERROR', fields: invalidFields }, 422)

  if (turnstileEnabled) {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    const turnstile = await verifyTurnstile(turnstileToken, forwarded)
    if (!turnstile.success) return json(request, { code: 'TURNSTILE_FAILED', reason: turnstile.reason }, 403)
  }

  try {
    const client = adminClient()
    const { data, error } = await client.rpc('create_appointment', {
      p_request_id: requestId,
      p_service_code: serviceCode,
      p_staff_code: staffCode,
      p_customer_name: name,
      p_phone_e164: phone,
      p_note: note,
      p_locale: locale,
      p_start_at: toIstanbulTimestamp(date, startTime),
      p_source: 'web',
    })
    if (error) {
      const code = rpcErrorCode(error.message)
      if (code === 'SLOT_TAKEN') return json(request, { code }, 409)
      if (code) return json(request, { code }, 422)
      throw error
    }

    const booking = data?.[0]
    const internalSecret = Deno.env.get('INTERNAL_FUNCTION_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    if (internalSecret && supabaseUrl) {
      await fetch(`${supabaseUrl}/functions/v1/send-whatsapp-notifications`, {
        method: 'POST',
        headers: { 'x-internal-secret': internalSecret },
      }).catch((error) => console.error('notification trigger', error))
    }

    return json(request, {
      appointmentId: booking.appointment_id,
      reference: booking.reference_code,
      startAt: booking.start_at,
      status: booking.booking_status,
      notificationStatus: booking.notification_status,
    }, 201)
  } catch (error) {
    console.error('booking-create', error)
    return json(request, { code: 'BOOKING_UNAVAILABLE' }, 503)
  }
})
