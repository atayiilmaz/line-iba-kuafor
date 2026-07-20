import { json } from '../_shared/http.ts'
import { adminClient } from '../_shared/supabase.ts'

type Job = {
  outbox_id: string
  appointment_id: string
  recipient: string
  reference_code: string
  service_code: string
  customer_name: string | null
  phone_e164: string | null
  note: string | null
  start_at: string
  locale: string
  attempts: number
}

const services: Record<string, string> = {
  'cut-style': 'Kesim & Stil',
  color: 'Renklendirme',
  bridal: 'Gelin Başı',
  'nails-makeup': 'Tırnak & Makyaj',
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json(request, { code: 'METHOD_NOT_ALLOWED' }, 405)
  const expected = Deno.env.get('INTERNAL_FUNCTION_SECRET')
  if (!expected || request.headers.get('x-internal-secret') !== expected) return json(request, { code: 'FORBIDDEN' }, 403)

  const client = adminClient()
  const { data, error } = await client.rpc('claim_notification_jobs', { p_limit: 10 })
  if (error) return json(request, { code: 'CLAIM_FAILED' }, 500)

  const token = Deno.env.get('META_WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID')
  const apiVersion = Deno.env.get('META_GRAPH_API_VERSION')
  const template = Deno.env.get('META_WHATSAPP_TEMPLATE') ?? 'new_appointment_owner_tr'
  const panelUrl = Deno.env.get('ADMIN_PANEL_URL') ?? 'https://example.com/yonetim/randevular'
  const results: { id: string; status: string }[] = []

  for (const job of (data ?? []) as Job[]) {
    try {
      if (!token || !phoneNumberId || !apiVersion) throw new Error('META_WHATSAPP_CONFIG_MISSING')
      const start = new Date(job.start_at)
      const dateLabel = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', dateStyle: 'long' }).format(start)
      const timeLabel = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' }).format(start)
      const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: job.recipient,
          type: 'template',
          template: {
            name: template,
            language: { code: 'tr' },
            components: [{
              type: 'body',
              parameters: [
                { type: 'text', text: job.reference_code },
                { type: 'text', text: dateLabel },
                { type: 'text', text: timeLabel },
                { type: 'text', text: services[job.service_code] ?? job.service_code },
                { type: 'text', text: job.customer_name ?? 'Anonim' },
                { type: 'text', text: job.phone_e164 ?? '-' },
                { type: 'text', text: job.note || '-' },
                { type: 'text', text: panelUrl },
              ],
            }],
          },
        }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(`META_${response.status}:${JSON.stringify(payload)}`)
      const providerId = payload.messages?.[0]?.id ?? null
      await client.from('notification_outbox').update({
        status: 'sent', provider_message_id: providerId, sent_at: new Date().toISOString(), last_error: null,
      }).eq('id', job.outbox_id)
      await client.from('appointments').update({ notification_status: 'sent' }).eq('id', job.appointment_id)
      results.push({ id: job.outbox_id, status: 'sent' })
    } catch (error) {
      const delayMinutes = Math.min(60, 2 ** Math.min(job.attempts, 6))
      await client.from('notification_outbox').update({
        status: 'failed',
        last_error: String(error).slice(0, 1000),
        next_attempt_at: new Date(Date.now() + delayMinutes * 60_000).toISOString(),
      }).eq('id', job.outbox_id)
      await client.from('appointments').update({ notification_status: 'failed' }).eq('id', job.appointment_id)
      results.push({ id: job.outbox_id, status: 'failed' })
    }
  }

  return json(request, { processed: results.length, results })
})
