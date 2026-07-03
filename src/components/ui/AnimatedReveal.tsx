import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Gecikme (saniye) */
  delay?: number
  /** Dikey kayma miktarı (px) */
  y?: number
  as?: 'div' | 'li' | 'span' | 'section'
}

/**
 * Scroll'a girince ince bir opacity + y geçişiyle içeriği açığa çıkarır.
 * Reduced-motion açıksa animasyon uygulanmaz.
 */
export function AnimatedReveal({ children, className, delay = 0, y = 24, as = 'div' }: Props) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
