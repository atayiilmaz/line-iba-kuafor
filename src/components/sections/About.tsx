import { about } from '../../data/site'
import { SectionHeader } from '../ui/SectionHeader'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import { Frame } from '../ui/Frame'
import './About.css'

export function About() {
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
                  alt="Line & İba Kuaför salon içi"
                  onError={(e) => {
                    e.currentTarget.style.visibility = 'hidden'
                  }}
                />
                <figcaption className="about__image-mark mono">Caddebostan / İstanbul</figcaption>
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
      </div>
    </section>
  )
}
