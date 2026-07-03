import { useEffect } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Services } from './components/sections/Services'
import { Works } from './components/sections/Works'
import { Trust } from './components/sections/Trust'
import { Reviews } from './components/sections/Reviews'
import { Contact } from './components/sections/Contact'
import { SECTIONS, pathToId, idToPath, scrollToId } from './lib/nav'

function App() {
  useCleanRouting()

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
        <Works />
        <Trust />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

/**
 * Hash'siz, temiz URL yönlendirmesi:
 * - İç bağlantı tıklamaları path'i günceller ve ilgili bölüme kaydırır (pushState)
 * - Doğrudan /iletisim gibi bir adresle açılınca o bölüme gider
 * - Geri/ileri (popstate) doğru bölüme kaydırır
 * - Kaydırdıkça URL aktif bölümü yansıtır (replaceState)
 */
function useCleanRouting() {
  useEffect(() => {
    // İlk açılış: adres bir bölüme işaret ediyorsa oraya git
    const initialId = pathToId(window.location.pathname)
    if (initialId && initialId !== 'ana-sayfa') {
      requestAnimationFrame(() => scrollToId(initialId, false))
    }

    // Tüm iç bağlantılar için delege edilmiş tıklama
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return
      }
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href)
      if (url.origin !== window.location.origin) return
      const targetId = pathToId(url.pathname)
      if (!targetId) return
      e.preventDefault()
      if (url.pathname !== window.location.pathname) {
        window.history.pushState(null, '', url.pathname)
      }
      scrollToId(targetId)
    }

    const onPop = () => {
      const id = pathToId(window.location.pathname)
      if (id) scrollToId(id)
    }

    // Kaydırma takibi: aktif bölümü URL'ye yansıt (geçmişi kirletmeden)
    let activeId = pathToId(window.location.pathname) ?? 'ana-sayfa'
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeId = entry.target.id
        }
        const nextPath = idToPath(activeId)
        if (nextPath && nextPath !== window.location.pathname) {
          window.history.replaceState(null, '', nextPath)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPop)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPop)
      observer.disconnect()
    }
  }, [])
}

export default App
