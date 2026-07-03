import { useState } from 'react'
import { brand } from '../../data/site'
import './Logo.css'

type Props = {
  variant?: 'dark' | 'light'
  /** 'full' = tam kilit (makas + LINE CADDE + İBA); 'mark' = sadece makas ikonu */
  type?: 'full' | 'mark'
  className?: string
  label?: string
}

/**
 * Marka logosu — gerçek PDF'ten çıkarılmış varyantları kullanır:
 *   logo-dark / logo-light : tam kilit
 *   mark-dark / mark-light : sadece makas ikonu (navbar için)
 * Dosya bulunamazsa zarif bir tipografik wordmark'a düşer.
 */
export function Logo({ variant = 'dark', type = 'full', className = '', label = brand.name }: Props) {
  const [failed, setFailed] = useState(false)

  const src =
    type === 'mark'
      ? variant === 'light'
        ? brand.markLight
        : brand.markDark
      : variant === 'light'
        ? brand.logoLight
        : brand.logoDark

  if (failed) {
    return (
      <span className={`logo-wordmark logo-wordmark--${variant} ${className}`} aria-label={label}>
        <span className="logo-wordmark__line">Line</span>
        <span className="logo-wordmark__amp">&amp;</span>
        <span className="logo-wordmark__line">İba</span>
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={label}
      className={`logo-img ${className}`}
      onError={() => setFailed(true)}
    />
  )
}
