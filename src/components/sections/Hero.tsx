import { motion, useReducedMotion } from 'motion/react'
import { contactInfo } from '../../data/site'
import { useContent } from '../../lib/i18n'
import { Frame } from '../ui/Frame'
import './Hero.css'

export function Hero() {
  const reduce = useReducedMotion()
  const t = useContent()
  const hero = t.hero

  const line = (i: number) =>
    reduce
      ? {}
      : {
          initial: { y: '108%' },
          animate: { y: '0%' },
          transition: { duration: 0.9, delay: 0.3 + i * 0.12, ease: [0.19, 1, 0.22, 1] as const },
        }

  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.19, 1, 0.22, 1] as const },
        }

  const img = reduce
    ? {}
    : {
        initial: { clipPath: 'inset(100% 0 0 0)', scale: 1.12 },
        animate: { clipPath: 'inset(0% 0 0 0)', scale: 1 },
        transition: { duration: 1.1, delay: 0.45, ease: [0.19, 1, 0.22, 1] as const },
      }

  return (
    <section className="hero" id="ana-sayfa">
      <div className="container hero__inner">
        <div className="hero__content">
          <motion.div className="hero__meta" {...fade(0.1)}>
            <span className="mono hero__eyebrow">{hero.eyebrow}</span>
            <span className="hero__meta-rule" />
          </motion.div>

          <h1 className="hero__title display">
            {hero.title.map((l, i) => (
              <span className="hero__line" key={l}>
                <motion.span className="hero__line-inner" {...line(i)}>
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p className="hero__subtitle lead" {...fade(0.7)}>
            {hero.subtitle}
          </motion.p>

          <motion.div className="hero__actions" {...fade(0.85)}>
            <a href={hero.ctaPrimary.href} className="btn btn--solid">
              {hero.ctaPrimary.label}
              <span className="btn__arrow" aria-hidden="true">→</span>
            </a>
            <a
              href={contactInfo.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost"
            >
              {hero.ctaSecondaryLabel}
            </a>
          </motion.div>
        </div>

        <div className="hero__visual">
          <Frame className="hero__frame" tone="dark" immediate>
            <motion.figure className="hero__image" {...img}>
              {/* Gerçek salon fotoğrafını buraya koyun: public/assets/gallery/hero.jpg
                  (renkli olsa bile CSS ile otomatik siyah-beyaza dönüşür). */}
              <img
                src="/assets/gallery/hero.jpg"
                alt={hero.imageAlt}
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden'
                }}
              />
              <figcaption className="hero__image-mark mono">{hero.imageMark}</figcaption>
            </motion.figure>
          </Frame>

          <motion.aside className="hero__review" {...fade(1)}>
            <span className="hero__review-score">{hero.reviewCard.rating}</span>
            <span className="hero__review-stars" aria-hidden="true">★★★★★</span>
            <span className="mono hero__review-count">{hero.reviewCard.count}</span>
          </motion.aside>
        </div>
      </div>

      {/* İmza: hizmetlerin sessiz mono şeridi */}
      <div className="hero__ticker" aria-hidden="true">
        <motion.div
          className="hero__ticker-track"
          animate={reduce ? {} : { x: ['0%', '-50%'] }}
          transition={reduce ? {} : { duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 1].map((dup) => (
            <span className="hero__ticker-group mono" key={dup}>
              {t.ticker.map((item) => (
                <span className="hero__ticker-item" key={item}>
                  <span className="hero__ticker-star">✳</span>
                  {item}
                </span>
              ))}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
