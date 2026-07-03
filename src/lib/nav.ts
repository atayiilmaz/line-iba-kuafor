/* ============================================================
   Temiz URL yönlendirme (hash'siz).
   Tek sayfa kaydırmalı site; bölümler path olarak yansıtılır:
   /  /hakkimizda  /hizmetler  /calismalar  /yorumlar  /iletisim
   ============================================================ */

export type Section = { path: string; id: string }

export const SECTIONS: Section[] = [
  { path: '/', id: 'ana-sayfa' },
  { path: '/hakkimizda', id: 'hakkimizda' },
  { path: '/hizmetler', id: 'hizmetler' },
  { path: '/calismalar', id: 'calismalar' },
  { path: '/yorumlar', id: 'yorumlar' },
  { path: '/iletisim', id: 'iletisim' },
]

export const pathToId = (path: string): string | null =>
  SECTIONS.find((s) => s.path === path)?.id ?? null

export const idToPath = (id: string): string | null =>
  SECTIONS.find((s) => s.id === id)?.path ?? null

/** Sabit masthead yüksekliğini hesaba katarak ilgili bölüme kaydırır. */
export function scrollToId(id: string, smooth = true) {
  const el = document.getElementById(id)
  if (!el) return
  const nav = document.querySelector('.navbar') as HTMLElement | null
  const navH = nav?.offsetHeight ?? 0
  const top = id === 'ana-sayfa' ? 0 : el.getBoundingClientRect().top + window.scrollY - navH
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' })
}
