import { contact } from '../../data/site'
import { SectionHeader } from '../ui/SectionHeader'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import './Contact.css'

export function Contact() {
  return (
    <section className="section contact" id="iletisim">
      <div className="container contact__inner">
        <SectionHeader number={contact.number} eyebrow={contact.eyebrow} title={contact.title} />

        <div className="contact__body">
          <AnimatedReveal className="contact__details">
            <div className="contact__row">
              <span className="mono">Adres</span>
              <p className="contact__text">{contact.address}</p>
            </div>
            <div className="rule" />
            <div className="contact__row">
              <span className="mono">Telefon</span>
              <a href={contact.phoneHref} className="contact__phone">
                {contact.phoneDisplay}
              </a>
            </div>
            <div className="rule" />
            <div className="contact__row">
              <span className="mono">Çalışma Saatleri</span>
              <p className="contact__text">{contact.hours}</p>
            </div>
          </AnimatedReveal>

          <AnimatedReveal className="contact__cta" delay={0.1}>
            <div className="contact__cta-card">
              <p className="contact__cta-title">
                Salonumuza uğrayın veya bizi arayın.
              </p>
              <div className="contact__actions">
                <a href={contact.phoneHref} className="btn btn--dark">
                  {contact.callLabel}
                  <span aria-hidden="true">→</span>
                </a>
                <a
                  href={contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost"
                >
                  {contact.directionsLabel}
                </a>
              </div>
            </div>
          </AnimatedReveal>
        </div>
      </div>
    </section>
  )
}
