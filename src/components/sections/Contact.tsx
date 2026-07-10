import { contactInfo, social } from '../../data/site'
import { useContent } from '../../lib/i18n'
import { SectionHeader } from '../ui/SectionHeader'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import './Contact.css'

export function Contact() {
  const t = useContent()
  const c = t.contact

  return (
    <section className="section contact" id="iletisim">
      <div className="container contact__inner">
        <SectionHeader number={c.number} eyebrow={c.eyebrow} title={c.title} />

        <div className="contact__body">
          <AnimatedReveal className="contact__details">
            <div className="contact__row">
              <span className="mono">{c.addressLabel}</span>
              <p className="contact__text">{contactInfo.address}</p>
            </div>
            <div className="rule" />
            <div className="contact__row">
              <span className="mono">{c.phoneLabel}</span>
              <a href={contactInfo.phoneHref} className="contact__phone">
                {contactInfo.phoneDisplay}
              </a>
            </div>
            <div className="rule" />
            <div className="contact__row">
              <span className="mono">{c.instagramLabel}</span>
              <a
                href={social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact__text contact__link"
              >
                {social.instagramHandle}
              </a>
            </div>
            <div className="rule" />
            <div className="contact__row">
              <span className="mono">{c.hoursLabel}</span>
              <p className="contact__text">{c.hours}</p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal className="contact__cta" delay={0.1}>
            <div className="contact__cta-card">
              <p className="contact__cta-title">{c.ctaTitle}</p>
              <div className="contact__actions">
                <a
                  href={c.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--solid"
                >
                  {c.whatsappLabel}
                  <span aria-hidden="true">→</span>
                </a>
                <a href={contactInfo.phoneHref} className="btn btn--ghost">
                  {c.callLabel}
                </a>
                <a
                  href={contactInfo.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost"
                >
                  {c.directionsLabel}
                </a>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  )
}
