import { adminClient } from '../_shared/supabase.ts'

type MetaStatus = { id?: string; status?: string; errors?: unknown }
type MetaWebhookPayload = {
  entry?: Array<{ changes?: Array<{ value?: { statuses?: MetaStatus[] } }> }>
}

async function validSignature(request: Request, body: string) {
  const appSecret = Deno.env.get('META_APP_SECRET')
  const signature = request.headers.get('x-hub-signature-256')
  if (!appSecret || !signature?.startsWith('sha256=')) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(appSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const expected = `sha256=${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')}`
  if (expected.length !== signature.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index)
  return difference === 0
}

Deno.serve(async (request) => {
  const url = new URL(request.url)
  if (request.method === 'GET') {
    const valid = url.searchParams.get('hub.mode') === 'subscribe'
      && url.searchParams.get('hub.verify_token') === Deno.env.get('META_WEBHOOK_VERIFY_TOKEN')
    return new Response(valid ? url.searchParams.get('hub.challenge') ?? '' : 'Forbidden', { status: valid ? 200 : 403 })
  }
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const rawBody = await request.text()
  if (!await validSignature(request, rawBody)) return new Response('Forbidden', { status: 403 })
  let payload: MetaWebhookPayload
  try {
    payload = JSON.parse(rawBody) as MetaWebhookPayload
  } catch {
    return new Response('Bad Request', { status: 400 })
  }
  const statuses: MetaStatus[] = (payload.entry ?? [])
    .flatMap((entry) => entry.changes ?? [])
    .flatMap((change) => change.value?.statuses ?? [])
  const client = adminClient()
  for (const status of statuses) {
    if (!status.id) continue
    if (['sent', 'delivered', 'read'].includes(status.status ?? '')) {
      const { data: outbox } = await client
        .from('notification_outbox')
        .update({ status: 'sent', sent_at: new Date().toISOString(), last_error: null })
        .eq('provider_message_id', status.id)
        .select('appointment_id')
        .maybeSingle()
      if (outbox?.appointment_id) await client.from('appointments').update({ notification_status: 'sent' }).eq('id', outbox.appointment_id)
    } else if (status.status === 'failed') {
      const { data: outbox } = await client
        .from('notification_outbox')
        .update({ status: 'failed', last_error: JSON.stringify(status.errors ?? 'META_DELIVERY_FAILED') })
        .eq('provider_message_id', status.id)
        .select('appointment_id')
        .maybeSingle()
      if (outbox?.appointment_id) await client.from('appointments').update({ notification_status: 'failed' }).eq('id', outbox.appointment_id)
    }
  }
  return new Response('OK')
})
