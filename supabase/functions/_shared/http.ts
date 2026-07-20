import { corsHeaders } from './cors.ts'

export function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export function options(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) })
}
