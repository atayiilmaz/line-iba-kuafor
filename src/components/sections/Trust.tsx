import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { trust } from '../../data/site'
import { SectionHeader } from '../ui/SectionHeader'
import { AnimatedReveal } from '../ui/AnimatedReveal'
import './Trust.css'

export function Trust() {
  return (
    <section className="section trust" id="deneyim">
      <div className="container">
        <SectionHeader
          number={trust.number}
          eyebrow={trust.eyebrow}
          title={trust.title}
          align="center"
        />

        <div className="trust__stats">
          {trust.stats.map((stat) => (
            <div className="trust__stat" key={stat.label}>
              <Counter value={stat.value} suffix={stat.suffix} />
              <span className="trust__stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        <AnimatedReveal className="trust__notes" delay={0.1}>
          {trust.notes.map((note) => (
            <span key={note} className="trust__note">
              {note}
            </span>
          ))}
        </AnimatedReveal>
      </div>
    </section>
  )
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(reduce ? value : 0)
  const isDecimal = !Number.isInteger(value)

  useEffect(() => {
    if (reduce || !inView) return
    let raf = 0
    const duration = 1200
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(value * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setDisplay(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, value])

  const shown = isDecimal ? display.toFixed(1) : Math.round(display).toString()

  return (
    <span className="trust__stat-value" ref={ref}>
      {shown}
      <span className="trust__stat-suffix">{suffix}</span>
    </span>
  )
}
