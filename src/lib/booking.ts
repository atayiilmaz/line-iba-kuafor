export type BookingSlot = { startAt: string; label: string; available: boolean }

export type BookingResult = {
  appointmentId: string
  reference: string
  startAt: string
  status: 'confirmed'
  notificationStatus: 'pending' | 'sent' | 'failed'
}

export type BookingPayload = {
  requestId: string
  serviceCode: string
  date: string
  startTime: string
  customerName: string
  phone: string
  note: string
  locale: 'tr' | 'en'
  consent: boolean
  turnstileToken: string
}

export class BookingApiError extends Error {
  code: string
  status: number
  details: Record<string, unknown>

  constructor(code: string, status: number, details: Record<string, unknown> = {}) {
    super(code)
    this.code = code
    this.status = status
    this.details = details
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY

export function bookingConfigured() {
  return Boolean(supabaseUrl && publishableKey)
}

function functionUrl(name: string) {
  if (!supabaseUrl) throw new BookingApiError('BOOKING_NOT_CONFIGURED', 503)
  return `${supabaseUrl}/functions/v1/${name}`
}

async function request<T>(name: string, init: RequestInit = {}, query = ''): Promise<T> {
  if (!publishableKey) throw new BookingApiError('BOOKING_NOT_CONFIGURED', 503)
  const response = await fetch(`${functionUrl(name)}${query}`, {
    ...init,
    headers: {
      apikey: publishableKey,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const body = await response.json().catch(() => ({})) as Record<string, unknown>
  if (!response.ok) throw new BookingApiError(String(body.code ?? 'UNKNOWN_ERROR'), response.status, body)
  return body as T
}

export async function getAvailability(date: string) {
  return request<{ date: string; timezone: string; slots: BookingSlot[] }>(
    'booking-availability',
    { method: 'GET' },
    `?date=${encodeURIComponent(date)}`,
  )
}

export async function createBooking(payload: BookingPayload) {
  return request<BookingResult>('booking-create', { method: 'POST', body: JSON.stringify(payload) })
}

export async function adminBookings<T>(token: string, date: string): Promise<T> {
  return request<T>('admin-bookings', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  }, `?date=${encodeURIComponent(date)}`)
}

export async function adminAction<T>(token: string, payload: Record<string, unknown>): Promise<T> {
  return request<T>('admin-bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}
