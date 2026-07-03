import { services } from '../../data/site'
import { SectionHeader } from '../ui/SectionHeader'
import { ServiceCard } from '../ui/ServiceCard'
import './Services.css'

export function Services() {
  return (
    <section className="section services" id="hizmetler">
      <div className="container">
        <SectionHeader
          number={services.number}
          eyebrow={services.eyebrow}
          title={services.title}
        />

        <ul className="services__list">
          {services.groups.map((group, i) => (
            <ServiceCard key={group.key} group={group} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}
