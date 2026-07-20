const defaults = ['http://localhost:5173', 'http://127.0.0.1:5173']

export function corsHeaders(request: Request) {
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const allowed = configured.length > 0 ? configured : defaults
  const origin = request.headers.get('origin') ?? ''

  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const configured = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return (configured.length > 0 ? configured : defaults).includes(origin)
}
