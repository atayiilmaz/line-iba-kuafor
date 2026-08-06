export const serviceCodes = ['cut-style', 'color', 'bridal', 'nails-makeup'] as const
export const staffCodes = ['ergun-sarica', 'ibrahim-yilmaz', 'ahmet-yilmaz'] as const

export function normalizeTurkishPhone(input: unknown) {
  const raw = String(input ?? '').trim()
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `90${digits.slice(1)}`
  else if (digits.length === 10 && digits.startsWith('5')) digits = `90${digits}`
  if (!digits.startsWith('90') || digits.length !== 12 || digits[2] !== '5') return null
  return `+${digits}`
}

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
}

export function validTime(value: unknown): value is string {
  return typeof value === 'string' && /^(0[9]|1[0-8]):00$/.test(value)
}

export function toIstanbulTimestamp(date: string, time: string) {
  return new Date(`${date}T${time}:00+03:00`).toISOString()
}
