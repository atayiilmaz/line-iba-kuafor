import { nav, contact, footer, brand } from '../../data/site'
import { Logo } from '../ui/Logo'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import './Footer.css'

export function Footer() {
  const links = [...nav.left, ...nav.right]

  return (
    <footer className="footer section--dark">
      <div className="container">
        <AnimatedReveal className="footer__top">
          <a href="/" className="footer__brand" aria-label={`${brand.name} — ana sayfa`}>
            <Logo variant="light" className="footer__logo" />
          </a>
          <p className="footer__sentence lead">{footer.sentence}</p>
        </AnimatedReveal>

        <div className="rule footer__divider" />

        <div className="footer__grid">
          <div className="footer__col">
            <span className="mono">Adres</span>
            <p>{contact.address}</p>
          </div>
          <div className="footer__col">
            <span className="mono">İletişim</span>
            <p>
              <a href={contact.phoneHref} className="footer__phone">
                {contact.phoneDisplay}
              </a>
            </p>
            <p className="footer__muted">{contact.hours}</p>
          </div>
          <nav className="footer__col" aria-label="Alt menü">
            <span className="mono">Menü</span>
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

        <p className="footer__copyright">{footer.copyright}</p>
      </div>
    </footer>
  )
}
