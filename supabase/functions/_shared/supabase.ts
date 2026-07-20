import { createClient } from 'npm:@supabase/supabase-js@2'

function serverSecretKey() {
  const hostedKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
  if (hostedKeys) {
    try {
      const keys = JSON.parse(hostedKeys) as Record<string, string>
      if (keys.default) return keys.default
    } catch {
      throw new Error('SUPABASE_SECRET_KEYS_INVALID')
    }
  }
  return Deno.env.get('SUPABASE_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
}

export function adminClient() {
  const url = Deno.env.get('SUPABASE_URL')
  const secretKey = serverSecretKey()
  if (!url || !secretKey) throw new Error('SUPABASE_SERVER_CONFIG_MISSING')
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function requireAdmin(request: Request) {
  const authorization = request.headers.get('authorization') ?? ''
  const token = authorization.replace(/^Bearer\s+/i, '')
  if (!token) return { code: 'UNAUTHORIZED' as const }

  const client = adminClient()
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) return { code: 'UNAUTHORIZED' as const }

  const { data: profile, error: profileError } = await client
    .from('admin_profiles')
    .select('user_id, role, display_name')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (profileError) throw profileError
  if (!profile) return { code: 'ADMIN_PROFILE_MISSING' as const, user: data.user }

  return { user: data.user, profile, client }
}
