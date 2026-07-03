import { works } from '../../data/site'
import { SectionHeader } from '../ui/SectionHeader'
import { WorkCard } from '../ui/WorkCard'
import './Works.css'

export function Works() {
  return (
    <section className="section works section--dark" id="calismalar">
      <div className="container">
        <SectionHeader number={works.number} eyebrow={works.eyebrow} title={works.title} />

        <ul className="works__grid">
          {works.categories.map((work, i) => (
            <WorkCard key={work.key} work={work} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
