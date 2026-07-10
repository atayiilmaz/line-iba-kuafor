import { useContent } from '../../lib/i18n'
import { SectionHeader } from '../ui/SectionHeader'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import { Frame } from '../ui/Frame'
import './About.css'

export function About() {
  const { about } = useContent()
  return (
    <section className="section about section--bone" id="hakkimizda">
      <div className="container">
        <div className="about__head">
          <SectionHeader number={about.number} eyebrow={about.eyebrow} title={about.title} />
          <AnimatedReveal className="about__lead" delay={0.1}>
            <p className="lead">{about.copy}</p>
          </AnimatedReveal>
        </div>

        <div className="about__body">
          <AnimatedReveal className="about__visual" delay={0.05}>
            <Frame tone="dark">
              <figure className="about__image">
                {/* Editoryal salon görselini buraya koyun: public/assets/gallery/salon.jpg */}
                <img
                  src="/assets/gallery/salon.jpg"
                  alt={about.imageAlt}
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden'
                  }}
                />
                <figcaption className="about__image-mark mono">{about.imageMark}</figcaption>
              </figure>
            </Frame>
          </AnimatedReveal>

          <ul className="about__features">
            {about.features.map((f, i) => (
              <AnimatedReveal as="li" key={f.title} className="about__feature" delay={0.1 + i * 0.1}>
                <div className="about__feature-body">
                  <h3 className="about__feature-title">{f.title}</h3>
                  <p className="about__feature-text">{f.text}</p>
                </div>
              </AnimatedReveal>
            ))}
          </ul>
        </div>

        {/* Üç ortağın hikayesi — metinler ortaklardan geldikçe
            src/data/site.ts içindeki about.story alanından güncellenir. */}
        <div className="about__story">
          <AnimatedReveal className="about__story-head">
            <div>
              <span className="mono about__story-eyebrow">{about.story.eyebrow}</span>
              <h3 className="about__story-title display">{about.story.title}</h3>
            </div>
            <p className="lead">{about.story.intro}</p>
          </AnimatedReveal>

          <ul className="about__partners">
            {about.story.partners.map((partner, i) => (
              <AnimatedReveal
                as="li"
                key={`${partner.name}-${i}`}
                className="about__partner"
                delay={0.1 + i * 0.12}
              >
                <Frame tone="dark" className="about__partner-frame">
                  <figure className="about__partner-photo">
                    {/* Portre yoksa baş harfler görünür */}
                    <span className="about__partner-initials display" aria-hidden="true">
                      {initials(partner.name)}
                    </span>
                    <img
                      src={partner.image}
                      alt={partner.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </figure>
                </Frame>
                <h4 className="about__partner-name">{partner.name}</h4>
                <span className="mono about__partner-role">{partner.role}</span>
                <p className="about__partner-story">{partner.story}</p>
              </AnimatedReveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/** 'Ahmet Yılmaz' → 'A.Y.' */
function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('.') + '.'
  )
}
