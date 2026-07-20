type TurnstileResult = {
  success: boolean
  action?: string
  hostname?: string
  'error-codes'?: string[]
}

export async function verifyTurnstile(token: string, remoteIp?: string | null) {
  const secret = Deno.env.get('TURNSTILE_SECRET')
  if (!secret) return { success: false, reason: 'TURNSTILE_NOT_CONFIGURED' }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  let result: TurnstileResult
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    result = (await response.json()) as TurnstileResult
  } catch {
    return { success: false, reason: 'SITEVERIFY_UNAVAILABLE' }
  }
  const expectedHosts = (Deno.env.get('TURNSTILE_EXPECTED_HOSTNAMES') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const validHost = expectedHosts.length === 0 || (result.hostname ? expectedHosts.includes(result.hostname) : false)
  const validAction = result.action === 'turnstile-spin-v2'

  return {
    success: result.success && validHost && validAction,
    reason: result['error-codes']?.join(',') || (!validHost ? 'HOSTNAME_MISMATCH' : !validAction ? 'ACTION_MISMATCH' : undefined),
  }
}
