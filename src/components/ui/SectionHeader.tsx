import { motion, useReducedMotion } from 'motion/react'
import './SectionHeader.css'

type Props = {
  number: string
  eyebrow: string
  title: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
}

export function SectionHeader({ eyebrow, title, align = 'left' }: Props) {
  const reduce = useReducedMotion()
  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.7, ease: [0.19, 1, 0.22, 1] as const },
      }

  return (
    <motion.header className={`section-header section-header--${align}`} {...anim}>
      <div className="section-header__meta">
        <span className="mono section-header__eyebrow">{eyebrow}</span>
        <span className="section-header__rule" />
      </div>
      <h2 className="section-header__title">{title}</h2>
    </motion.header>
  )
}
