import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import './Frame.css'

type Props = {
  children: ReactNode
  className?: string
  /** Braket rengini bağlama göre ayarlamak için */
  tone?: 'dark' | 'light'
  /** Ekranın üstündeki (hero) çerçeveler için: scroll beklemeden çizilir */
  immediate?: boolean
}

/**
 * İmza öğesi: logodaki iç içe geçmiş iki kare motifini yankılayan çerçeve.
 * İki kare scroll'a girince "çizilir" (reduced-motion'da statik durur).
 */
export function Frame({ children, className = '', tone = 'dark', immediate = false }: Props) {
  const reduce = useReducedMotion()

  const draw = (delay: number) => {
    if (reduce) return { style: { clipPath: 'inset(0 0 0 0)' } }
    const target = { clipPath: 'inset(0 0 0 0)' }
    const transition = { duration: 0.9, delay, ease: [0.19, 1, 0.22, 1] as const }
    return immediate
      ? { initial: { clipPath: 'inset(0 100% 100% 0)' }, animate: target, transition }
      : {
          initial: { clipPath: 'inset(0 100% 100% 0)' },
          whileInView: target,
          viewport: { once: true, amount: 0.25 },
          transition,
        }
  }

  return (
    <div className={`frame frame--${tone} ${className}`}>
      <motion.span className="frame__square frame__square--back" {...draw(0.05)} />
      <motion.span className="frame__square frame__square--front" {...draw(0.2)} />
      {children}
    </div>
  )
}
