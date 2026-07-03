import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { nav, brand } from '../../data/site'
import './Navbar.css'

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc ile kapat + odak yönetimi
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const firstLink = panelRef.current?.querySelector<HTMLElement>('a')
    firstLink?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const allLinks = [...nav.left, ...nav.right]

  const entrance = reduce
    ? {}
    : {
        initial: { y: -24, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 },
      }

  return (
    <>
    <motion.header className={`navbar ${scrolled ? 'is-scrolled' : ''}`} {...entrance}>
      <nav className="navbar__inner container" aria-label="Ana menü">
        <ul className="navbar__links navbar__links--left">
          {nav.left.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="/" className="navbar__brand" aria-label="Line & İba Kuaför — ana sayfa">
          <img className="navbar__logo" src={brand.logoDark} alt="Line & İba Kuaför" />
        </a>

        <ul className="navbar__links navbar__links--right">
          {nav.right.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="navbar__link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={toggleRef}
          type="button"
          className={`navbar__burger ${open ? 'is-open' : ''}`}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </nav>
    </motion.header>

    {/* Mobil menü — transform'lu header dışında tutulur ki fixed konumlama
        viewport'a göre çalışsın (aksi halde header containing-block olur). */}
    <div
      id="mobile-menu"
      ref={panelRef}
      className={`navbar__mobile ${open ? 'is-open' : ''}`}
      hidden={!open}
    >
      <ul className="navbar__mobile-links">
        {allLinks.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="navbar__mobile-link" onClick={() => setOpen(false)}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
    </>
  )
}
