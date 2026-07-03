import { reviews } from '../../data/site'
import { SectionHeader } from '../ui/SectionHeader'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import './Reviews.css'

export function Reviews() {
  return (
    <section className="section reviews section--dark" id="yorumlar">
      <div className="container">
        <SectionHeader number={reviews.number} eyebrow={reviews.eyebrow} title={reviews.title} />

        <ul className="reviews__grid">
          {reviews.items.map((review, i) => (
            <AnimatedReveal
              as="li"
              key={`${review.quote}-${i}`}
              className="reviews__card"
              delay={(i % 3) * 0.08}
            >
              <span className="reviews__quote-mark" aria-hidden="true">
                “
              </span>
              <p className="reviews__quote">{review.quote}</p>
              <div className="reviews__meta">
                <span className="reviews__stars" aria-label="5 üzerinden 5 yıldız">
                  ★★★★★
                </span>
                <span className="reviews__author">{review.name}</span>
              </div>
            </AnimatedReveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
