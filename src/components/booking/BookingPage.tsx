import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import type { Lang } from '../../data/site'
import { BookingApiError, bookingConfigured, createBooking, getAvailability, type BookingResult, type BookingSlot } from '../../lib/booking'
import { TurnstileWidget } from './TurnstileWidget'
import './BookingPage.css'

const services = [
  { code: 'cut-style', tr: 'Kesim & Stil', en: 'Cut & Style', index: '01' },
  { code: 'color', tr: 'Renklendirme', en: 'Color', index: '02' },
  { code: 'bridal', tr: 'Gelin Başı', en: 'Bridal Hair', index: '03' },
  { code: 'nails-makeup', tr: 'Tırnak & Makyaj', en: 'Nails & Makeup', index: '04' },
]

const staff = [
  { code: 'ergun-sarica', name: 'Ergün Sarıca', image: '/assets/photos/ergun-sarica.webp' },
  { code: 'ibrahim-yilmaz', name: 'İbrahim Yılmaz', image: '/assets/photos/ibrahim-yilmaz.webp' },
  { code: 'ahmet-yilmaz', name: 'Ahmet Yılmaz', image: '/assets/photos/ahmet-yilmaz.webp' },
]

const text = {
  tr: {
    eyebrow: 'Online Randevu', title: 'Size ayrılmış bir saat.', intro: 'Hizmetinizi, personelinizi ve uygun saati seçin. Randevunuz anında kesinleşsin.',
    steps: ['Hizmet', 'Personel', 'Tarih & Saat', 'Bilgiler'], chooseService: 'Hangi hizmet için geliyorsunuz?', chooseStaff: 'Kiminle randevu oluşturmak istersiniz?', staffNote: 'Her personelin randevu takvimi ayrıdır.', continue: 'Devam Et', back: 'Geri',
    chooseTime: 'Uygun bir zaman seçin', date: 'Tarih', available: 'Uygun', full: 'Dolu', loading: 'Saatler kontrol ediliyor…', noSlots: 'Bu tarih için uygun saat bulunamadı.',
    details: 'Randevu bilgilerinizi tamamlayın', name: 'Ad Soyad', phone: 'Cep Telefonu', note: 'Notunuz (isteğe bağlı)',
    consent: 'KVKK aydınlatma metnini okudum ve randevu için bilgilerimin işlenmesini kabul ediyorum.', privacy: 'KVKK metni',
    submit: 'Randevuyu Kesinleştir', submitting: 'Randevu oluşturuluyor…', success: 'Randevunuz kesinleşti.', reference: 'Randevu kodunuz',
    successNote: 'Değişiklik veya iptal için randevu kodunuzla bizi arayabilir ya da WhatsApp’tan ulaşabilirsiniz.', home: 'Ana Sayfaya Dön', another: 'Yeni Randevu',
    config: 'Randevu altyapısı henüz canlı ortam için yapılandırılmamış.',
  },
  en: {
    eyebrow: 'Online Booking', title: 'An hour reserved for you.', intro: 'Choose your service, stylist and an available time. Your booking is confirmed instantly.',
    steps: ['Service', 'Stylist', 'Date & Time', 'Details'], chooseService: 'Which service would you like?', chooseStaff: 'Who would you like to book with?', staffNote: 'Each stylist has a separate appointment calendar.', continue: 'Continue', back: 'Back',
    chooseTime: 'Choose an available time', date: 'Date', available: 'Available', full: 'Full', loading: 'Checking availability…', noSlots: 'No available times for this date.',
    details: 'Complete your booking details', name: 'Full Name', phone: 'Mobile Phone', note: 'Note (optional)',
    consent: 'I have read the privacy notice and consent to processing my information for this appointment.', privacy: 'Privacy notice',
    submit: 'Confirm Booking', submitting: 'Creating booking…', success: 'Your booking is confirmed.', reference: 'Booking reference',
    successNote: 'To change or cancel, contact us by phone or WhatsApp with your booking reference.', home: 'Return Home', another: 'New Booking',
    config: 'The booking infrastructure is not configured for production yet.',
  },
}

function dateInIstanbul(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function addDays(date: string, amount: number) {
  const value = new Date(`${date}T12:00:00+03:00`)
  value.setUTCDate(value.getUTCDate() + amount)
  return dateInIstanbul(value)
}

export function BookingPage({ lang, navigate }: { lang: Lang; navigate: (href: string) => (event: MouseEvent<HTMLAnchorElement>) => void }) {
  const t = text[lang]
  const turnstileEnabled = import.meta.env.VITE_TURNSTILE_ENABLED === 'true'
  const today = useMemo(() => dateInIstanbul(new Date()), [])
  const [step, setStep] = useState(1)
  const [serviceCode, setServiceCode] = useState('')
  const [staffCode, setStaffCode] = useState('')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('')
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<BookingResult | null>(null)
  const [requestId, setRequestId] = useState(() => crypto.randomUUID())
  const handleToken = useCallback((token: string) => setTurnstileToken(token), [])

  const loadSlots = useCallback(async () => {
    if (!bookingConfigured()) return
    setLoadingSlots(true)
    setError('')
    try {
      const response = await getAvailability(date, staffCode)
      setSlots(response.slots)
      setTime((current) => response.slots.some((slot) => slot.label === current && slot.available) ? current : '')
    } catch {
      setSlots([])
      setError(lang === 'tr' ? 'Uygun saatler şu anda alınamıyor. Lütfen tekrar deneyin.' : 'Availability is temporarily unavailable. Please try again.')
    } finally {
      setLoadingSlots(false)
    }
  }, [date, lang, staffCode])

  useEffect(() => {
    if (step === 3 && staffCode) void loadSlots()
  }, [loadSlots, staffCode, step])

  const selectedService = services.find((service) => service.code === serviceCode)
  const selectedStaff = staff.find((person) => person.code === staffCode)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!name.trim() || !phone.trim() || !consent || (turnstileEnabled && !turnstileToken)) {
      setError(lang === 'tr' ? 'Lütfen zorunlu alanları tamamlayın.' : 'Complete the required fields.')
      return
    }
    setSubmitting(true)
    try {
      const booking = await createBooking({ requestId, serviceCode, staffCode, date, startTime: time, customerName: name, phone, note, locale: lang, consent, turnstileToken })
      setResult(booking)
      setStep(5)
    } catch (cause) {
      if (turnstileEnabled) {
        setTurnstileToken('')
        setTurnstileResetKey((value) => value + 1)
      }
      if (cause instanceof BookingApiError && cause.code === 'SLOT_TAKEN') {
        setError(lang === 'tr' ? 'Bu saat az önce doldu. Lütfen başka bir saat seçin.' : 'This time was just booked. Please choose another.')
        setStep(3)
        await loadSlots()
      } else if (cause instanceof BookingApiError && cause.code === 'VALIDATION_ERROR') {
        const fields = Array.isArray(cause.details.fields) ? cause.details.fields : []
        if (fields.includes('phone')) setError(lang === 'tr' ? 'Cep telefonu 05xx xxx xx xx veya +90 5xx xxx xx xx formatında olmalı.' : 'Enter a valid Turkish mobile number beginning with 05 or +90 5.')
        else setError(lang === 'tr' ? 'Form bilgilerinden biri geçersiz. Lütfen alanları kontrol edip tekrar deneyin.' : 'One of the form fields is invalid. Review the form and try again.')
      } else if (cause instanceof BookingApiError && cause.code === 'SLOT_OUTSIDE_WINDOW') {
        setError(lang === 'tr' ? 'Bu saat artık randevu aralığının dışında. En az iki saat sonrası için yeni bir saat seçin.' : 'This time is outside the booking window. Choose a new time at least two hours ahead.')
        setStep(3)
        await loadSlots()
      } else if (cause instanceof BookingApiError && cause.code === 'TURNSTILE_FAILED') {
        setError(lang === 'tr' ? 'Güvenlik doğrulamasının süresi doldu. Kontrolü yenileyip tekrar deneyin.' : 'The security check expired. Complete it again and retry.')
      } else {
        setError(lang === 'tr' ? 'Randevu oluşturulamadı. Bilgilerinizi kontrol edip tekrar deneyin.' : 'We could not create the booking. Check your details and try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep(1); setServiceCode(''); setStaffCode(''); setTime(''); setName(''); setPhone(''); setNote(''); setConsent(false); setTurnstileToken(''); setResult(null); setError(''); setRequestId(crypto.randomUUID())
  }

  return (
    <section className="booking-page">
      <header className="booking-page__intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </header>
      <div className="booking-shell container">
        <aside className="booking-progress" aria-label={t.eyebrow}>
          {t.steps.map((label, index) => (
            <div className={step === index + 1 ? 'is-active' : step > index + 1 ? 'is-complete' : ''} key={label}>
              <span>0{index + 1}</span><b>{label}</b>
            </div>
          ))}
        </aside>
        <div className="booking-panel">
          {!bookingConfigured() && <div className="booking-alert">{t.config}</div>}
          {error && <div className="booking-alert booking-alert--error" role="alert">{error}</div>}

          {step === 1 && <div>
            <p className="booking-panel__number">01 / 04</p>
            <h2>{t.chooseService}</h2>
            <div className="booking-services">
              {services.map((service) => <button type="button" aria-pressed={serviceCode === service.code} className={serviceCode === service.code ? 'is-selected' : ''} onClick={() => setServiceCode(service.code)} key={service.code}>
                <span>{service.index}</span><strong>{service[lang]}</strong><i aria-hidden="true">↗</i>
              </button>)}
            </div>
            <div className="booking-actions"><button className="button button--dark" type="button" disabled={!serviceCode || !bookingConfigured()} onClick={() => setStep(2)}>{t.continue}</button></div>
          </div>}

          {step === 2 && <div>
            <p className="booking-panel__number">02 / 04</p>
            <h2>{t.chooseStaff}</h2>
            <p className="booking-staff-note">{t.staffNote}</p>
            <div className="booking-staff">
              {staff.map((person, index) => <button type="button" aria-pressed={staffCode === person.code} className={staffCode === person.code ? 'is-selected' : ''} onClick={() => { setStaffCode(person.code); setTime('') }} key={person.code}>
                <img src={person.image} alt="" /><span>0{index + 1}</span><strong>{person.name}</strong><i aria-hidden="true">✓</i>
              </button>)}
            </div>
            <div className="booking-actions"><button className="button" type="button" onClick={() => setStep(1)}>{t.back}</button><button className="button button--dark" type="button" disabled={!staffCode} onClick={() => setStep(3)}>{t.continue}</button></div>
          </div>}

          {step === 3 && <div>
            <p className="booking-panel__number">03 / 04</p>
            <h2>{t.chooseTime}</h2>
            <label className="booking-field booking-field--date"><span>{t.date}</span><input type="date" value={date} min={today} max={addDays(today, 30)} onChange={(event) => { setDate(event.target.value); setTime('') }} /></label>
            <div className="booking-legend"><span><i className="is-free" />{t.available}</span><span><i />{t.full}</span></div>
            {loadingSlots ? <div className="booking-slot-loading" aria-live="polite" aria-label={t.loading}>
              {Array.from({ length: 10 }, (_, index) => <span key={index} />)}
            </div> : <div className="booking-slots">
              {slots.map((slot) => <button type="button" aria-pressed={time === slot.label} disabled={!slot.available} className={time === slot.label ? 'is-selected' : ''} onClick={() => setTime(slot.label)} key={slot.startAt}>{slot.label}</button>)}
            </div>}
            {!loadingSlots && slots.length > 0 && !slots.some((slot) => slot.available) && <p className="booking-loading">{t.noSlots}</p>}
            <div className="booking-actions"><button className="button" type="button" onClick={() => setStep(2)}>{t.back}</button><button className="button button--dark" type="button" disabled={!time} onClick={() => setStep(4)}>{t.continue}</button></div>
          </div>}

          {step === 4 && <form onSubmit={submit}>
            <p className="booking-panel__number">04 / 04</p>
            <h2>{t.details}</h2>
            <div className="booking-summary"><div><strong>{selectedService?.[lang]}</strong><small>{selectedStaff?.name}</small></div><span>{new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { dateStyle: 'long', timeZone: 'Europe/Istanbul' }).format(new Date(`${date}T12:00:00+03:00`))} · {time}</span></div>
            <div className="booking-fields">
              <label className="booking-field"><span>{t.name}</span><input autoComplete="name" placeholder={lang === 'tr' ? 'Adınız ve soyadınız' : 'Your full name'} value={name} maxLength={100} onChange={(event) => setName(event.target.value)} required /></label>
              <label className="booking-field"><span>{t.phone}</span><input type="tel" inputMode="tel" autoComplete="tel" placeholder="+90 5__ ___ __ __" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
              <label className="booking-field booking-field--wide"><span>{t.note}</span><textarea rows={4} placeholder={lang === 'tr' ? 'Varsa paylaşmak istediğiniz detaylar…' : 'Anything you would like us to know…'} maxLength={600} value={note} onChange={(event) => setNote(event.target.value)} /></label>
            </div>
            <label className="booking-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>{t.consent} <a href="/kvkk" onClick={navigate('/kvkk')}>{t.privacy}</a></span></label>
            {turnstileEnabled && <TurnstileWidget language={lang} onToken={handleToken} resetKey={turnstileResetKey} />}
            <div className="booking-actions"><button className="button" type="button" onClick={() => setStep(3)}>{t.back}</button><button className="button button--dark" type="submit" disabled={submitting || (turnstileEnabled && !turnstileToken) || !consent}>{submitting ? t.submitting : t.submit}</button></div>
          </form>}

          {step === 5 && result && <div className="booking-success">
            <span className="booking-success__mark">✓</span><p className="eyebrow">{t.eyebrow}</p><h2>{t.success}</h2>
            <div><span>{t.reference}</span><strong>{result.reference}</strong></div><p>{t.successNote}</p>
            <div className="booking-actions"><a className="button" href="/" onClick={navigate('/')}>{t.home}</a><button className="button button--dark" type="button" onClick={reset}>{t.another}</button></div>
          </div>}
        </div>
      </div>
    </section>
  )
}
