import { useId, useState } from 'react'
import { AnimatedReveal } from './AnimatedReveal'
import type { ServiceGroup } from '../../data/site'
import './ServiceCard.css'

type Props = {
  group: ServiceGroup
  index: number
}

/** Hizmet grubu — editoryal, açılır-kapanır index satırı. */
export function ServiceCard({ group, index }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <AnimatedReveal as="li" className={`srow ${open ? 'is-open' : ''}`} delay={(index % 4) * 0.05} y={16}>
      <button
        type="button"
        className="srow__head"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="srow__title">{group.title}</span>
        <span className="srow__desc">{group.description}</span>
        <span className="srow__toggle" aria-hidden="true">
          <span className="srow__toggle-bar" />
          <span className="srow__toggle-bar srow__toggle-bar--v" />
        </span>
      </button>

      <div id={panelId} className="srow__panel" hidden={!open}>
        <ul className="srow__items">
          {group.items.map((item) => (
            <li key={item} className="srow__item">
              <span className="srow__dot" aria-hidden="true">✳</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </AnimatedReveal>
  )
}
