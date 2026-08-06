import { isAllowedOrigin } from '../_shared/cors.ts'
import { json, options } from '../_shared/http.ts'
import { requireAdmin } from '../_shared/supabase.ts'
import { normalizeTurkishPhone, serviceCodes, staffCodes, toIstanbulTimestamp, validDate, validTime } from '../_shared/validation.ts'

type AdminAction = {
  action?: 'cancel' | 'block' | 'unblock' | 'retry' | 'manual'
  appointmentId?: string
  entryId?: string
  date?: string
  startTime?: string
  reason?: string
  requestId?: string
  serviceCode?: string
  staffCode?: string
  customerName?: string
  phone?: string
  note?: string
}

async function triggerNotifications() {
  const secret = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  const url = Deno.env.get('SUPABASE_URL')
  if (!secret || !url) return
  await fetch(`${url}/functions/v1/send-whatsapp-notifications`, {
    method: 'POST', headers: { 'x-internal-secret': secret },
  }).catch((error) => console.error('admin notification trigger', error))
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return options(request)
  if (!isAllowedOrigin(request)) return json(request, { code: 'ORIGIN_NOT_ALLOWED' }, 403)
  const admin = await requireAdmin(request)
  if ('code' in admin) {
    const status = admin.code === 'ADMIN_PROFILE_MISSING' ? 403 : 401
    return json(request, { code: admin.code }, status)
  }

  if (request.method === 'GET') {
    const date = new URL(request.url).searchParams.get('date')
    if (!validDate(date)) return json(request, { code: 'INVALID_DATE' }, 422)
    const from = new Date(`${date}T00:00:00+03:00`).toISOString()
    const to = new Date(new Date(from).getTime() + 24 * 60 * 60 * 1000).toISOString()
    const { data: entries, error: entryError } = await admin.client
      .from('calendar_entries')
      .select('id, start_at, staff_code, kind, status, reason, created_at')
      .gte('start_at', from)
      .lt('start_at', to)
      .order('start_at')
    if (entryError) return json(request, { code: 'ADMIN_QUERY_FAILED' }, 500)

    const entryIds = (entries ?? []).map((entry) => entry.id)
    const { data: appointments, error: appointmentError } = entryIds.length
      ? await admin.client
        .from('appointments')
        .select('id, calendar_entry_id, reference_code, service_code, customer_name, phone_e164, note, locale, source, status, notification_status, created_at')
        .in('calendar_entry_id', entryIds)
      : { data: [], error: null }
    if (appointmentError) return json(request, { code: 'ADMIN_QUERY_FAILED' }, 500)
    const appointmentIds = (appointments ?? []).map((appointment) => appointment.id)
    const { data: notifications, error: notificationError } = appointmentIds.length
      ? await admin.client
        .from('notification_outbox')
        .select('appointment_id, status, attempts, next_attempt_at, last_error, sent_at')
        .in('appointment_id', appointmentIds)
      : { data: [], error: null }
    if (notificationError) return json(request, { code: 'ADMIN_QUERY_FAILED' }, 500)
    return json(request, { date, timezone: 'Europe/Istanbul', entries, appointments, notifications, admin: admin.profile })
  }

  if (request.method !== 'POST') return json(request, { code: 'METHOD_NOT_ALLOWED' }, 405)
  const body = await request.json().catch(() => null) as AdminAction | null
  if (!body?.action) return json(request, { code: 'INVALID_ACTION' }, 422)

  try {
    if (body.action === 'cancel' && body.appointmentId) {
      const { error } = await admin.client.rpc('admin_cancel_appointment', {
        p_appointment_id: body.appointmentId, p_actor_id: admin.user.id,
      })
      if (error) throw error
    } else if (body.action === 'block' && validDate(body.date) && validTime(body.startTime) && staffCodes.includes(body.staffCode as (typeof staffCodes)[number])) {
      const { error } = await admin.client.rpc('admin_block_slot', {
        p_start_at: toIstanbulTimestamp(body.date, body.startTime),
        p_staff_code: body.staffCode,
        p_reason: String(body.reason ?? '').slice(0, 240),
        p_actor_id: admin.user.id,
      })
      if (error) throw error
    } else if (body.action === 'unblock' && body.entryId) {
      const { error } = await admin.client.rpc('admin_release_block', {
        p_entry_id: body.entryId, p_actor_id: admin.user.id,
      })
      if (error) throw error
    } else if (body.action === 'retry' && body.appointmentId) {
      const { error } = await admin.client.rpc('admin_retry_notification', {
        p_appointment_id: body.appointmentId, p_actor_id: admin.user.id,
      })
      if (error) throw error
      await triggerNotifications()
    } else if (
      body.action === 'manual'
      && body.requestId
      && validDate(body.date)
      && validTime(body.startTime)
      && serviceCodes.includes(body.serviceCode as (typeof serviceCodes)[number])
      && staffCodes.includes(body.staffCode as (typeof staffCodes)[number])
    ) {
      const phone = normalizeTurkishPhone(body.phone)
      const name = String(body.customerName ?? '').trim()
      if (!phone || name.length < 2) return json(request, { code: 'VALIDATION_ERROR' }, 422)
      const { data, error } = await admin.client.rpc('create_appointment', {
        p_request_id: body.requestId,
        p_service_code: body.serviceCode,
        p_staff_code: body.staffCode,
        p_customer_name: name,
        p_phone_e164: phone,
        p_note: String(body.note ?? '').slice(0, 600),
        p_locale: 'tr',
        p_start_at: toIstanbulTimestamp(body.date, body.startTime),
        p_source: 'admin',
      })
      if (error) throw error
      await triggerNotifications()
      return json(request, { ok: true, booking: data?.[0] })
    } else {
      return json(request, { code: 'VALIDATION_ERROR' }, 422)
    }
    return json(request, { ok: true })
  } catch (error) {
    const message = String(error)
    if (message.includes('SLOT_TAKEN')) return json(request, { code: 'SLOT_TAKEN' }, 409)
    console.error('admin-bookings', error)
    return json(request, { code: 'ADMIN_ACTION_FAILED' }, 500)
  }
})
