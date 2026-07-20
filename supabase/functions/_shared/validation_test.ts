import { assertEquals } from 'jsr:@std/assert@1'
import { normalizeTurkishPhone, toIstanbulTimestamp, validDate, validTime } from './validation.ts'

Deno.test('normalizes supported Turkish mobile phone formats', () => {
  assertEquals(normalizeTurkishPhone('0533 321 22 83'), '+905333212283')
  assertEquals(normalizeTurkishPhone('+90 533 321 22 83'), '+905333212283')
  assertEquals(normalizeTurkishPhone('5333212283'), '+905333212283')
})

Deno.test('rejects landlines and malformed mobile numbers', () => {
  assertEquals(normalizeTurkishPhone('0216 407 27 77'), null)
  assertEquals(normalizeTurkishPhone('123'), null)
})

Deno.test('validates the fixed booking grid', () => {
  assertEquals(validDate('2026-07-21'), true)
  assertEquals(validDate('21.07.2026'), false)
  assertEquals(validTime('09:00'), true)
  assertEquals(validTime('18:00'), true)
  assertEquals(validTime('18:30'), false)
})

Deno.test('rejects impossible calendar dates', () => {
  assertEquals(validDate('2026-02-28'), true)
  assertEquals(validDate('2026-02-29'), false)
  assertEquals(validDate('2026-13-01'), false)
})

Deno.test('converts Istanbul wall time to UTC', () => {
  assertEquals(toIstanbulTimestamp('2026-07-21', '09:00'), '2026-07-21T06:00:00.000Z')
})
