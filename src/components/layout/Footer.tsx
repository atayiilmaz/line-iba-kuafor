import { contactInfo, social } from '../../data/site'
import { useContent } from '../../lib/i18n'
import { Logo } from '../ui/Logo'
import { WhatsAppIcon } from '../ui/WhatsAppButton'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import './Footer.css'

export function Footer() {
  const t = useContent()
  const links = [...t.nav.left, ...t.nav.right]

  return (
    <footer className="footer section--dark">
      <div className="container">
        <AnimatedReveal className="footer__top">
          <a href="/" className="footer__brand" aria-label={t.footer.ariaHome}>
            <Logo variant="light" className="footer__logo" />
          </a>
          <p className="footer__sentence lead">{t.footer.sentence}</p>

          {/* Sosyal medya — Instagram + WhatsApp */}
          <div className="footer__social">
            <span className="mono footer__social-label">{t.footer.followLabel}</span>
            <a
              href={social.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              <InstagramIcon />
              <span className="mono footer__social-handle">{social.instagramHandle}</span>
            </a>
            <a
              href={t.contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="footer__social-link"
            >
              <WhatsAppIcon size={18} />
              <span className="mono">WhatsApp</span>
            </a>
          </div>
        </AnimatedReveal>

        <div className="rule footer__divider" />

        <div className="footer__grid">
          <div className="footer__col">
            <span className="mono">{t.footer.addressLabel}</span>
            <p>{contactInfo.address}</p>
          </div>
          <div className="footer__col">
            <span className="mono">{t.footer.contactLabel}</span>
            <p>
              <a href={contactInfo.phoneHref} className="footer__phone">
                {contactInfo.phoneDisplay}
              </a>
            </p>
            <p className="footer__muted">{t.contact.hours}</p>
          </div>
          <nav className="footer__col" aria-label={t.footer.ariaMenu}>
            <span className="mono">{t.footer.menuLabel}</span>
            <ul className="footer__nav">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer__nav-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="rule footer__divider" />

        <p className="footer__copyright">{t.footer.copyright}</p>
      </div>
    </footer>
  )
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.4" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
