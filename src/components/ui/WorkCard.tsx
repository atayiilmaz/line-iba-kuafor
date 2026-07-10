import { AnimatedReveal } from './AnimatedReveal'
import type { WorkCategory } from '../../data/site'
import './WorkCard.css'

type Props = {
  work: WorkCategory
  index: number
}

/**
 * Çalışma kartı. Gerçek fotoğraf public/assets/gallery/ altına konunca görünür;
 * yoksa monokrom bir doku bloğu gösterilir. Her görsel otomatik siyah-beyaz olur.
 */
export function WorkCard({ work, index }: Props) {
  return (
    <AnimatedReveal as="li" className={`work work--${work.size}`} delay={(index % 3) * 0.08}>
      <figure className="work__figure">
        <div className="work__media" data-key={work.key}>
          <img
            src={work.image}
            alt={`${work.label} — Line & İba Kuaför`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
        <figcaption className="work__caption">
          <span className="work__label">{work.label}</span>
          <span className="mono work__sub">{work.caption}</span>
        </figcaption>
      </figure>
    </AnimatedReveal>
  )
}
