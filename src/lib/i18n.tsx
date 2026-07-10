/* ============================================================
   Dil yönetimi (TR / EN).
   Seçim localStorage'da saklanır; <html lang> ve sayfa başlığı
   / açıklaması dile göre güncellenir.
   ============================================================ */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { content, type Lang, type SiteContent } from '../data/site'

const STORAGE_KEY = 'line-iba-lang'

type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void }

const LangContext = createContext<LangContextValue>({ lang: 'tr', setLang: () => {} })

function initialLang(): Lang {
  // ?lang=en gibi bir adresle açılırsa URL kazanır (paylaşılabilir link)
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (fromUrl === 'en' || fromUrl === 'tr') return fromUrl
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'tr'
  } catch {
    return 'tr'
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* gizli modda sessizce geç */
    }
    document.documentElement.lang = lang
    const t = content[lang]
    document.title = t.meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t.meta.description)
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  return useContext(LangContext)
}

/** Aktif dilin tüm site içeriği. */
export function useContent(): SiteContent {
  return content[useLang().lang]
}
