import { useEffect, useRef } from 'react'

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

let scriptPromise: Promise<void> | null = null

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-line-cadde-turnstile]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('TURNSTILE_SCRIPT_FAILED')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.lineCaddeTurnstile = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('TURNSTILE_SCRIPT_FAILED'))
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function TurnstileWidget({ onToken, language, resetKey }: { onToken: (token: string) => void; language: 'tr' | 'en'; resetKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const configuredKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  const siteKey = configuredKey || (import.meta.env.DEV ? '1x00000000000000000000AA' : '')

  useEffect(() => {
    if (!siteKey || !containerRef.current) return
    let widgetId: string | undefined
    let disposed = false
    void loadTurnstile().then(() => {
      if (disposed || !containerRef.current || !window.turnstile) return
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: 'turnstile-spin-v2',
        theme: 'light',
        language,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      })
    }).catch(() => onToken(''))
    return () => {
      disposed = true
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [language, onToken, resetKey, siteKey])

  if (!siteKey) {
    return <p className="booking-form__config">Turnstile site anahtarı yapılandırılmamış.</p>
  }

  return <div ref={containerRef} className="cf-turnstile booking-turnstile" data-action="turnstile-spin-v2" />
}
