import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { adminAction, adminBookings, BookingApiError } from '../../lib/booking'
import { getSupabaseClient } from '../../lib/supabaseClient'
import { BlogManager } from './BlogManager'
import './AdminPage.css'

type CalendarEntry = { id: string; start_at: string; staff_code: string; kind: 'appointment' | 'block'; status: 'active' | 'released'; reason: string | null; created_at: string }
type Appointment = {
  id: string; calendar_entry_id: string; reference_code: string; service_code: string; customer_name: string | null;
  phone_e164: string | null; note: string | null; source: string; status: string; notification_status: string; created_at: string
}
type Notification = { appointment_id: string; status: string; attempts: number; next_attempt_at: string; last_error: string | null; sent_at: string | null }
type AdminData = { date: string; entries: CalendarEntry[]; appointments: Appointment[]; notifications: Notification[]; admin: { display_name: string | null; role: string } }

const services: Record<string, string> = { 'cut-style': 'Kesim & Stil', color: 'Renklendirme', bridal: 'Gelin Başı', 'nails-makeup': 'Tırnak & Makyaj' }
const staff: Record<string, string> = { 'ergun-sarica': 'Ergün Sarıca', 'ibrahim-yilmaz': 'İbrahim Yılmaz', 'ahmet-yilmaz': 'Ahmet Yılmaz' }
const timeOptions = Array.from({ length: 10 }, (_, index) => `${String(index + 9).padStart(2, '0')}:00`)

function localDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

function timeLabel(value: string) {
  return new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

export function AdminPage() {
  const client = useMemo(() => getSupabaseClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [date, setDate] = useState(localDate)
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [section, setSection] = useState<'appointments' | 'blogs'>(() => typeof window !== 'undefined' && window.location.pathname === '/yonetim/blog' ? 'blogs' : 'appointments')

  const openSection = (next: 'appointments' | 'blogs') => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.history.pushState(null, '', next === 'blogs' ? '/yonetim/blog' : '/yonetim/randevular')
    setSection(next)
  }

  useEffect(() => {
    if (!client) { setChecking(false); return }
    void client.auth.getSession().then(({ data: auth }) => { setSession(auth.session); setChecking(false) })
    const { data: listener } = client.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setData(null); setError(''); setAccessDenied(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [client])

  const refresh = useCallback(async () => {
    if (!session) return
    setLoading(true); setError(''); setAccessDenied(false)
    try { setData(await adminBookings<AdminData>(session.access_token, date)) }
    catch (cause) {
      if (cause instanceof BookingApiError && cause.status === 401) {
        setError('Oturumunuz sona erdi. Lütfen yeniden giriş yapın.')
        await client?.auth.signOut()
        return
      }
      if (cause instanceof BookingApiError && cause.status === 403) {
        setAccessDenied(true)
        setError('Bu Auth kullanıcısı henüz yönetici olarak yetkilendirilmemiş.')
        return
      }
      setError('Randevular şu anda alınamadı. Bağlantıyı kontrol edip yeniden deneyin.')
    } finally { setLoading(false) }
  }, [client, date, session])

  useEffect(() => { void refresh() }, [refresh])

  const login = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    const { error: authError } = await client!.auth.signInWithPassword({ email, password })
    if (authError) setError('E-posta veya şifre hatalı.')
    setBusy(false)
  }

  const action = async (payload: Record<string, unknown>) => {
    if (!session) return
    setBusy(true); setError('')
    try { await adminAction(session.access_token, payload); await refresh() }
    catch (cause) { setError(cause instanceof BookingApiError && cause.code === 'SLOT_TAKEN' ? 'Bu saat dolu veya kapalı.' : 'İşlem tamamlanamadı.') }
    finally { setBusy(false) }
  }

  if (checking) return <AdminLoading label="Oturum kontrol ediliyor" />
  if (!client) return <main className="admin-page"><div className="admin-login"><h1>Yönetim</h1><p>Supabase ortam değişkenleri yapılandırılmamış.</p></div></main>
  if (!session) return <main className="admin-page admin-page--auth">
    <form className="admin-login" onSubmit={login}>
      <div className="admin-login__top"><a href="/">← Siteye dön</a><span>Güvenli işletme girişi</span></div>
      <div className="admin-login__title"><p className="eyebrow">Line &amp; İba Kuaför / Yönetim</p><h1>Randevu<br />Yönetimi</h1><p>Günlük akışı, kapalı saatleri ve WhatsApp bildirimlerini tek ekrandan yönetin.</p></div>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      <div className="admin-login__fields">
        <label className="admin-field"><span>E-posta</span><input type="email" autoComplete="email" placeholder="ornek@lineibakuafor.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="admin-field"><span>Şifre</span><input type="password" autoComplete="current-password" placeholder="••••••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      </div>
      <button className="button button--dark" disabled={busy}>{busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}</button>
      <p className="admin-login__foot">Bu alan yalnızca Line &amp; İba Kuaför yetkili hesaplarına açıktır.</p>
    </form>
  </main>

  if (accessDenied) return <AdminGate
    eyebrow="Yetki gerekli"
    title="Hesap bulundu, yönetim yetkisi yok."
    body={`${session.user.email ?? 'Bu kullanıcı'} Supabase Auth içinde mevcut; ancak admin_profiles tablosunda bir owner veya admin kaydı bulunmuyor.`}
    actionLabel="Yetkiyi Tekrar Kontrol Et"
    onAction={() => void refresh()}
    onSignOut={() => void client.auth.signOut()}
  />

  if (!data && error) return <AdminGate
    eyebrow="Bağlantı hatası"
    title="Randevu akışı yüklenemedi."
    body={error}
    actionLabel="Tekrar Dene"
    onAction={() => void refresh()}
    onSignOut={() => void client.auth.signOut()}
  />

  if (!data) return <AdminLoading label="Yetki ve randevular kontrol ediliyor" />

  if (section === 'blogs') return <main className="admin-page">
    <header className="admin-head">
      <div><p className="eyebrow">Line &amp; İba Kuaför</p><h1>Blog</h1><p>{data.admin.display_name || session.user.email}</p></div>
      <div><a className="button" href="/blog">Blogu Gör</a><button className="button button--dark" onClick={() => void client.auth.signOut()}>Çıkış</button></div>
    </header>
    <AdminSectionNav section={section} openSection={openSection} />
    <BlogManager client={client} session={session} />
  </main>

  const appointmentByEntry = new Map(data?.appointments.map((appointment) => [appointment.calendar_entry_id, appointment]) ?? [])
  const notificationByAppointment = new Map(data?.notifications.map((notification) => [notification.appointment_id, notification]) ?? [])
  const activeEntries = data?.entries.filter((entry) => entry.status === 'active') ?? []

  return <main className="admin-page">
    <header className="admin-head">
      <div><p className="eyebrow">Line &amp; İba Kuaför</p><h1>Randevular</h1><p>{data?.admin.display_name || session.user.email}</p></div>
      <div><a className="button" href="/">Siteyi Gör</a><button className="button button--dark" onClick={() => void client.auth.signOut()}>Çıkış</button></div>
    </header>
    <AdminSectionNav section={section} openSection={openSection} />
    <section className="admin-toolbar">
      <label className="admin-field"><span>Takvim Günü</span><input type="date" value={date} onChange={(event) => { setData(null); setDate(event.target.value) }} /></label>
      <button className="button" onClick={() => void refresh()} disabled={loading}>{loading ? 'Yükleniyor…' : 'Yenile'}</button>
      <button className="button button--dark" onClick={() => setShowManual((value) => !value)}>{showManual ? 'Formu Kapat' : 'Manuel Randevu'}</button>
    </section>
    {error && <div className="admin-alert" role="alert">{error}</div>}

    <section className="admin-grid">
      <div className="admin-list">
        <div className="admin-section-title"><h2>Günlük Akış</h2><span>{activeEntries.length} kayıt</span></div>
        {activeEntries.length === 0 && !loading && <p className="admin-empty">Bu gün için randevu veya kapalı saat yok.</p>}
        {activeEntries.map((entry) => {
          const appointment = appointmentByEntry.get(entry.id)
          if (entry.kind === 'block') return <article className="admin-row admin-row--block" key={entry.id}>
            <time>{timeLabel(entry.start_at)}</time><div><span>Kapalı Saat · {staff[entry.staff_code]}</span><strong>{entry.reason || 'İşletme tarafından kapatıldı'}</strong></div>
            <button disabled={busy} onClick={() => void action({ action: 'unblock', entryId: entry.id })}>Saati Aç</button>
          </article>
          if (!appointment) return null
          const notification = notificationByAppointment.get(appointment.id)
          return <article className="admin-row" key={entry.id}>
            <time>{timeLabel(entry.start_at)}</time>
            <div className="admin-row__person"><span>{appointment.reference_code}</span><strong>{appointment.customer_name}</strong><a href={`tel:${appointment.phone_e164}`}>{appointment.phone_e164}</a></div>
            <div><span>Hizmet / Personel</span><strong>{services[appointment.service_code]}</strong><small>{staff[entry.staff_code]}</small>{appointment.note && <small>{appointment.note}</small>}</div>
            <div className={`admin-status is-${appointment.notification_status}`}>
              <span>WhatsApp</span><strong>{appointment.notification_status}</strong>
              {notification?.last_error && <small title={notification.last_error}>Deneme {notification.attempts}: {notification.last_error.slice(0, 90)}</small>}
            </div>
            <div className="admin-row__actions">
              {appointment.notification_status === 'failed' && <button disabled={busy} onClick={() => void action({ action: 'retry', appointmentId: appointment.id })}>Tekrar Gönder</button>}
              {appointment.status === 'confirmed' && <button className="is-danger" disabled={busy} onClick={() => {
                if (window.confirm(`${appointment.reference_code} kodlu randevu iptal edilsin mi?`)) void action({ action: 'cancel', appointmentId: appointment.id })
              }}>İptal Et</button>}
            </div>
          </article>
        })}
      </div>
      <aside className="admin-side">
        <BlockForm date={date} busy={busy} onSubmit={(startTime, staffCode, reason) => action({ action: 'block', date, startTime, staffCode, reason })} />
        {showManual && <ManualForm date={date} busy={busy} onSubmit={(payload) => action({ action: 'manual', date, requestId: crypto.randomUUID(), ...payload })} />}
      </aside>
    </section>
  </main>
}

function AdminSectionNav({ section, openSection }: { section: 'appointments' | 'blogs'; openSection: (next: 'appointments' | 'blogs') => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return <nav className="admin-section-nav" aria-label="Yönetim bölümleri">
    <a className={section === 'appointments' ? 'is-active' : ''} href="/yonetim/randevular" onClick={openSection('appointments')}>Randevular</a>
    <a className={section === 'blogs' ? 'is-active' : ''} href="/yonetim/blog" onClick={openSection('blogs')}>Blog Yönetimi</a>
  </nav>
}

function AdminLoading({ label }: { label: string }) {
  return <main className="admin-page admin-page--loading" aria-busy="true" aria-live="polite">
    <div className="admin-loader">
      <span className="admin-loader__monogram">LC</span>
      <p className="eyebrow">Line &amp; İba Kuaför / Yönetim</p>
      <h1>{label}</h1>
      <div className="admin-loader__track"><i /></div>
      <p>Güvenli oturum hazırlanıyor.</p>
    </div>
  </main>
}

function AdminGate({ eyebrow, title, body, actionLabel, onAction, onSignOut }: { eyebrow: string; title: string; body: string; actionLabel: string; onAction: () => void; onSignOut: () => void }) {
  return <main className="admin-page admin-page--auth">
    <section className="admin-gate" role="alert">
      <span className="admin-gate__index">LC / 01</span>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{body}</p>
      <div><button className="button button--dark" onClick={onAction}>{actionLabel}</button><button className="button" onClick={onSignOut}>Çıkış Yap</button></div>
    </section>
  </main>
}

function BlockForm({ date, busy, onSubmit }: { date: string; busy: boolean; onSubmit: (time: string, staffCode: string, reason: string) => Promise<void> }) {
  const [time, setTime] = useState('09:00'); const [staffCode, setStaffCode] = useState('ergun-sarica'); const [reason, setReason] = useState('')
  return <form className="admin-card" onSubmit={(event) => { event.preventDefault(); void onSubmit(time, staffCode, reason) }}>
    <p className="eyebrow">Müsaitlik</p><h3>Saat Kapat</h3><p>{date} tarihinde bir personelin rezervasyon alınmayacak saatini belirleyin.</p>
    <label className="admin-field"><span>Saat</span><select value={time} onChange={(event) => setTime(event.target.value)}>{timeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="admin-field"><span>Personel</span><select value={staffCode} onChange={(event) => setStaffCode(event.target.value)}>{Object.entries(staff).map(([code, label]) => <option value={code} key={code}>{label}</option>)}</select></label>
    <label className="admin-field"><span>Neden</span><input maxLength={240} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Örn. toplantı" /></label>
    <button className="button button--dark" disabled={busy}>Saati Kapat</button>
  </form>
}

function ManualForm({ date, busy, onSubmit }: { date: string; busy: boolean; onSubmit: (payload: Record<string, unknown>) => Promise<void> }) {
  const [startTime, setStartTime] = useState('09:00'); const [serviceCode, setServiceCode] = useState('cut-style'); const [staffCode, setStaffCode] = useState('ergun-sarica'); const [customerName, setName] = useState(''); const [phone, setPhone] = useState(''); const [note, setNote] = useState('')
  return <form className="admin-card" onSubmit={(event) => { event.preventDefault(); void onSubmit({ startTime, serviceCode, staffCode, customerName, phone, note }) }}>
    <p className="eyebrow">Telefon / Salon</p><h3>Manuel Randevu</h3><p>{date} tarihine işletme adına randevu ekleyin.</p>
    <label className="admin-field"><span>Saat</span><select value={startTime} onChange={(event) => setStartTime(event.target.value)}>{timeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="admin-field"><span>Hizmet</span><select value={serviceCode} onChange={(event) => setServiceCode(event.target.value)}>{Object.entries(services).map(([code, label]) => <option value={code} key={code}>{label}</option>)}</select></label>
    <label className="admin-field"><span>Personel</span><select value={staffCode} onChange={(event) => setStaffCode(event.target.value)}>{Object.entries(staff).map(([code, label]) => <option value={code} key={code}>{label}</option>)}</select></label>
    <label className="admin-field"><span>Ad Soyad</span><input value={customerName} onChange={(event) => setName(event.target.value)} required /></label>
    <label className="admin-field"><span>Telefon</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
    <label className="admin-field"><span>Not</span><textarea rows={3} maxLength={600} value={note} onChange={(event) => setNote(event.target.value)} /></label>
    <button className="button button--dark" disabled={busy}>Randevu Ekle</button>
  </form>
}
