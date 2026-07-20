import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { LanguageProvider, useLang } from './lib/i18n'
import { brand, contactInfo, social, type Lang } from './data/site'

type RouteKey = 'home' | 'services' | 'about' | 'partner' | 'gallery' | 'contact'
type PartnerKey = 'ahmet' | 'elif' | 'merve'

type Partner = {
  key: PartnerKey
  slug: string
  name: string
  role: string
  image: string
  intro: string
  experience: string[]
  quote: string
}

type Copy = {
  nav: Record<RouteKey, string>
  langLabel: string
  menu: string
  close: string
  book: string
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    cta: string
    secondary: string
    mark: string
  }
  philosophy: {
    title: string
    body: string[]
    cta: string
  }
  services: {
    eyebrow: string
    title: string
    intro: string
    items: { title: string; body: string; benefits: string[] }[]
    featuredTitle: string
    featuredBody: string
  }
  about: {
    eyebrow: string
    title: string
    intro: string
    partnersTitle: string
    partnersIntro: string
    detailCta: string
  }
  gallery: {
    eyebrow: string
    title: string
    intro: string
    items: string[]
  }
  instagramFollow: {
    label: string
    aria: string
  }
  contact: {
    eyebrow: string
    title: string
    intro: string
    address: string
    phone: string
    hours: string
    directions: string
  }
  footer: {
    copyright: string
  }
  partners: Partner[]
}

const images = {
  hero: '/assets/photos/hero-bridal.webp',
  philosophyMain: '/assets/photos/philosophy-blonde.webp',
  philosophyMini: [
    '/assets/photos/philosophy-red-hair.webp',
    '/assets/photos/philosophy-brunette.webp',
    '/assets/photos/philosophy-volume.webp',
  ],
  servicesHero: '/assets/photos/services-blonde.webp',
  servicesFeatured: '/assets/photos/color-blonde.webp',
  aboutHero: '/assets/photos/about-red-hair.webp',
  collectionHero:
    'https://images.pexels.com/photos/20046793/pexels-photo-20046793.jpeg?auto=compress&cs=tinysrgb&w=1400',
  contactHero:
    'https://images.pexels.com/photos/35844833/pexels-photo-35844833.png?auto=compress&cs=tinysrgb&w=1600',
  ahmet:
    'https://images.pexels.com/photos/8867400/pexels-photo-8867400.jpeg?auto=compress&cs=tinysrgb&w=1100',
  elif:
    'https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&w=1100',
  merve:
    'https://images.pexels.com/photos/20046793/pexels-photo-20046793.jpeg?auto=compress&cs=tinysrgb&w=1100',
}

const galleryVideos = [
  {
    src: '/assets/videos/2026/salon-finish-01.mp4',
    poster: '/assets/videos/2026/salon-finish-01-poster.jpg',
  },
  {
    src: '/assets/videos/2026/archive-02.mp4',
    poster: '/assets/videos/2026/salon-02-poster.jpg',
  },
  {
    src: '/assets/videos/2026/salon-finish-02.mp4',
    poster: '/assets/videos/2026/salon-finish-02-poster.jpg',
  },
  {
    src: '/assets/videos/2026/archive-03.mp4',
    poster: '/assets/videos/2026/salon-03-poster.jpg',
  },
  {
    src: '/assets/videos/2026/collection-hero.mp4',
    poster: '/assets/videos/2026/collection-hero-poster.jpg',
  },
  {
    src: '/assets/videos/2026/archive-04.mp4',
    poster: '/assets/videos/2026/salon-04-poster.jpg',
  },
  {
    src: '/assets/videos/2026/salon-finish-03.mp4',
    poster: '/assets/videos/2026/salon-finish-03-poster.jpg',
  },
  {
    src: '/assets/videos/2026/archive-05.mp4',
    poster: '/assets/videos/2026/salon-05-poster.jpg',
  },
  {
    src: '/assets/videos/2026/contact-hero.mp4',
    poster: '/assets/videos/2026/contact-hero-poster.jpg',
  },
  {
    src: '/assets/videos/2026/archive-01.mp4',
    poster: '/assets/videos/2026/home-feature-poster.jpg',
  },
]

const copy: Record<Lang, Copy> = {
  tr: {
    nav: {
      home: 'Ana Sayfa',
      services: 'Hizmetler',
      about: 'Hakkımızda',
      partner: 'Ortaklar',
      gallery: 'Koleksiyon',
      contact: 'İletişim',
    },
    langLabel: 'Dil',
    menu: 'Menü',
    close: 'Kapat',
    book: 'Randevu',
    hero: {
      eyebrow: 'Line & İba Kuaför',
      title: 'Güzelliğin ötesinde.',
      subtitle:
        'Caddebostan’da saç kesimi, renklendirme, gelin başı, tırnak ve makyaj için rafine bir salon deneyimi.',
      cta: 'Hizmetleri İncele',
      secondary: 'Hikayemiz',
      mark: 'CADDEBOSTAN HAIRDRESSING',
    },
    philosophy: {
      title: 'Felsefemiz',
      body: [
        'Line & İba’da güzellik, hızlı bir işlem değil; doğru dinleme, doğru teknik ve sakin bir ritüeldir.',
        'Saçın dokusuna, yüzün oranına ve günlük hayatına göre şekillenen bir sonuç hedefleriz. Az konuşan, çok iyi çalışan bir salon dili kurarız.',
        'Üç ortağın ortak standardı: temiz işçilik, doğal bitiş ve misafirin kendisi gibi hissettiği bir görünüm.',
      ],
      cta: 'Devamını Oku',
    },
    services: {
      eyebrow: 'Seçkin Uygulamalar',
      title: 'En çok tercih edilen hizmetler',
      intro:
        'Tek ekranda anlaşılır, salonda detaylandırılır. Her işlem öncesi saç analizi ve beklenti konuşması yapılır.',
      items: [
        {
          title: 'Kesim & Stil',
          body: 'Form, yüz hattı ve günlük kullanım rutini üzerinden planlanan kesim.',
          benefits: ['Kadın saç kesimi', 'Fön ve maşa', 'Topuz ve özel gün stili'],
        },
        {
          title: 'Renklendirme',
          body: 'Işıltı, tonlama ve doğal geçişlerde kontrollü teknik uygulama.',
          benefits: ['Boya', 'Ombre / sombre', 'Bakım destekli açma'],
        },
        {
          title: 'Gelin Başı',
          body: 'Düğün günü için prova, saç formu ve makyaj uyumuyla bütün hazırlık.',
          benefits: ['Prova planı', 'Gelin topuzu', 'Makyaj uyumu'],
        },
        {
          title: 'Tırnak & Makyaj',
          body: 'Bakımlı eller, net bitişler ve özel gün makyajı için tamamlayıcı servis.',
          benefits: ['Manikür', 'Kalıcı oje', 'Profesyonel makyaj'],
        },
      ],
      featuredTitle: 'Öne çıkan işlem: renk tasarımı',
      featuredBody:
        'Doğal ışıltı, yumuşak geçiş ve saç sağlığını koruyan planlama. Renk uygulamasında hedefimiz fotoğraf için değil, gündelik ışıkta iyi görünen saçtır.',
    },
    about: {
      eyebrow: 'Hikayemiz',
      title: 'Üç ortağın aynı salonda buluşan ustalığı.',
      intro:
        'Line & İba, üç farklı mesleki yolculuğun Caddebostan’da birleşmesiyle kuruldu. Her ortak kendi disiplinini, müşteriyle kurduğu dili ve teknik deneyimini salona taşır.',
      partnersTitle: 'Ortaklar',
      partnersIntro:
        'Müşteri, her ortağın hikayesine ve deneyim alanlarına ayrı ayrı ulaşabilir. Ahmet’in profilinde deneyim çizgisi örnek olarak detaylandırıldı.',
      detailCta: 'Deneyimlerine Bak',
    },
    gallery: {
      eyebrow: 'Koleksiyon',
      title: 'Salonumuzdan gerçek anlar.',
      intro:
        'Line & İba’daki uygulamalar, salon atmosferi ve hazırlık süreçlerinden seçilmiş kısa videolar.',
      items: [
        'Uzun katlar & ışıltı',
        'Saç uygulaması',
        'Yumuşak dalga & tonlama',
        'Renk & bakım',
        'Parlak sarı dalgalar',
        'Salon atmosferi',
        'Kesim & final görünüm',
        'Final dokunuş',
        'Keskin bob & sarı ton',
        'Hazırlık ritüeli',
      ],
    },
    instagramFollow: {
      label: 'Bizi Takip Edin',
      aria: 'Instagram’da Line & İba Kuaför hesabını aç',
    },
    contact: {
      eyebrow: 'Randevu',
      title: 'Size en uygun zamanı birlikte belirleyelim.',
      intro:
        'WhatsApp, telefon veya yol tarifi bağlantılarıyla hızlıca ulaşın. Hizmet süresi ve fiyat bilgisi işlem öncesinde netleştirilir.',
      address: 'Adres',
      phone: 'Telefon',
      hours: 'Her gün 09:00 - 19:30',
      directions: 'Yol Tarifi',
    },
    footer: { copyright: 'Tüm hakları saklıdır.' },
    partners: [
      {
        key: 'ahmet',
        slug: 'ahmet-yilmaz',
        name: 'Ahmet Yılmaz',
        role: 'Kurucu Ortak / Saç Tasarım',
        image: images.ahmet,
        intro:
          'Ahmet, salonun teknik kesim ve renk planlama tarafında öncü rol alır. Müşterinin saç geçmişini dinleyerek uygulanabilir, sürdürülebilir sonuçlar tasarlar.',
        experience: ['18+ yıl salon deneyimi', 'Kesim, form ve renk danışmanlığı', 'Gelin ve özel gün saç planlama', 'Ekip içi teknik eğitim'],
        quote: 'İyi saç, salondan çıktıktan üç hafta sonra da formunu koruyandır.',
      },
      {
        key: 'elif',
        slug: 'elif-kara',
        name: 'Elif Kara',
        role: 'Kurucu Ortak / Renk Uzmanı',
        image: images.elif,
        intro:
          'Elif, renklendirme ve bakım protokollerinde doğal geçiş, parlak bitiş ve saç sağlığı dengesine odaklanır.',
        experience: ['Balayage ve doğal renk geçişleri', 'Bakım protokolü planlama', 'Tonlama ve parlaklık servisleri', 'Saç analizi danışmanlığı'],
        quote: 'Renk, saçın kendi hareketini saklamamalı; onu görünür kılmalı.',
      },
      {
        key: 'merve',
        slug: 'merve-inal',
        name: 'Merve İnal',
        role: 'Kurucu Ortak / Stil & Makyaj',
        image: images.merve,
        intro:
          'Merve, özel gün hazırlıkları, makyaj ve final styling tarafında bütün görünümün dengeli çalışmasını sağlar.',
        experience: ['Gelin başı ve prova süreci', 'Profesyonel makyaj', 'Topuz ve editorial styling', 'Tırnak servis koordinasyonu'],
        quote: 'Final görünüm abartıyla değil, doğru dengeyle akılda kalır.',
      },
    ],
  },
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      about: 'About',
      partner: 'Partners',
      gallery: 'Collection',
      contact: 'Contact',
    },
    langLabel: 'Language',
    menu: 'Menu',
    close: 'Close',
    book: 'Booking',
    hero: {
      eyebrow: 'Line & Iba Hairdressing',
      title: 'Beyond beauty.',
      subtitle:
        'A refined salon experience in Caddebostan for haircuts, color, bridal hair, nails and makeup.',
      cta: 'View Services',
      secondary: 'Our Story',
      mark: 'CADDEBOSTAN HAIRDRESSING',
    },
    philosophy: {
      title: 'Philosophy',
      body: [
        'At Line & Iba, beauty is not a rushed service. It is careful listening, precise technique and a calm ritual.',
        'Every result is shaped around hair texture, face structure and daily routine. The salon language is quiet, focused and exact.',
        'The three partners share one standard: clean craft, natural finish and a look that still feels like the guest.',
      ],
      cta: 'Read More',
    },
    services: {
      eyebrow: 'Selected Treatments',
      title: 'Most requested services',
      intro:
        'Clear online, detailed in the salon. Every service begins with hair analysis and a short expectation consultation.',
      items: [
        {
          title: 'Cut & Style',
          body: 'Haircuts planned around form, face line and daily styling habits.',
          benefits: ['Women’s haircut', 'Blow dry and waves', 'Updo and event styling'],
        },
        {
          title: 'Color',
          body: 'Controlled technique for highlights, tonal work and soft transitions.',
          benefits: ['Color', 'Ombre / sombre', 'Care-supported lightening'],
        },
        {
          title: 'Bridal Hair',
          body: 'A full preparation plan for the wedding day, from trial to final hair and makeup balance.',
          benefits: ['Trial planning', 'Bridal updo', 'Makeup harmony'],
        },
        {
          title: 'Nails & Makeup',
          body: 'Complementary services for polished hands, clean finishes and event makeup.',
          benefits: ['Manicure', 'Permanent polish', 'Professional makeup'],
        },
      ],
      featuredTitle: 'Featured service: color design',
      featuredBody:
        'Natural light, soft transitions and planning that protects hair health. The goal is hair that works in real daylight, not only in photographs.',
    },
    about: {
      eyebrow: 'Our Story',
      title: 'Three partners, one shared craft.',
      intro:
        'Line & Iba was founded when three different professional journeys met in Caddebostan. Each partner brings a distinct discipline, client language and technical background.',
      partnersTitle: 'Partners',
      partnersIntro:
        'Guests can open each partner profile and read their story. Ahmet’s profile includes a detailed experience example.',
      detailCta: 'View Experience',
    },
    gallery: {
      eyebrow: 'Collection',
      title: 'Real moments from our salon.',
      intro:
        'Short videos from treatments, salon atmosphere and preparation at Line & Iba.',
      items: [
        'Long layers & dimension',
        'Hair application',
        'Soft waves & toning',
        'Colour & care',
        'Glossy blonde waves',
        'Salon atmosphere',
        'Cut & final look',
        'Finishing touch',
        'Sharp bob & blonde tone',
        'Preparation ritual',
      ],
    },
    instagramFollow: {
      label: 'Follow Us',
      aria: 'Open Line & Iba Hairdressing on Instagram',
    },
    contact: {
      eyebrow: 'Booking',
      title: 'Let’s find the right time for you.',
      intro:
        'Reach us by WhatsApp, phone or directions. Service duration and pricing are clarified before the appointment.',
      address: 'Address',
      phone: 'Phone',
      hours: 'Every day 09:00 - 19:30',
      directions: 'Directions',
    },
    footer: { copyright: 'All rights reserved.' },
    partners: [
      {
        key: 'ahmet',
        slug: 'ahmet-yilmaz',
        name: 'Ahmet Yılmaz',
        role: 'Founding Partner / Hair Design',
        image: images.ahmet,
        intro:
          'Ahmet leads technical cutting and color planning. He listens to each guest’s hair history and designs practical, sustainable results.',
        experience: ['18+ years of salon experience', 'Cut, form and color consultation', 'Bridal and event hair planning', 'Technical education for the team'],
        quote: 'Good hair keeps its form three weeks after leaving the salon.',
      },
      {
        key: 'elif',
        slug: 'elif-kara',
        name: 'Elif Kara',
        role: 'Founding Partner / Color Specialist',
        image: images.elif,
        intro:
          'Elif focuses on natural color transitions, glossy finishes and the balance between beauty and hair health.',
        experience: ['Balayage and soft transitions', 'Care protocol planning', 'Toning and shine services', 'Hair analysis consultation'],
        quote: 'Color should not hide hair movement. It should reveal it.',
      },
      {
        key: 'merve',
        slug: 'merve-inal',
        name: 'Merve İnal',
        role: 'Founding Partner / Style & Makeup',
        image: images.merve,
        intro:
          'Merve shapes event preparation, makeup and final styling so the full look feels balanced and intentional.',
        experience: ['Bridal hair and trial process', 'Professional makeup', 'Updo and editorial styling', 'Nail service coordination'],
        quote: 'A final look is remembered through balance, not excess.',
      },
    ],
  },
}

const routeOrder: RouteKey[] = ['home', 'services', 'about', 'gallery', 'contact']

function App() {
  return (
    <LanguageProvider>
      <LineIbaSite />
    </LanguageProvider>
  )
}

function LineIbaSite() {
  const { lang, setLang } = useLang()
  const t = copy[lang]
  const [path, setPath] = useState(window.location.pathname)
  const route = getRoute(path, t.partners)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(
      {
        isActive: '(min-width: 0px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const reduceMotion = context.conditions?.reduceMotion
        if (reduceMotion) {
          gsap.set('.js-page-in, .js-reveal', { autoAlpha: 1, y: 0 })
          return
        }

        gsap.fromTo(
          '.js-page-in',
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
        )

        const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.js-reveal'))
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue
              gsap.to(entry.target, {
                autoAlpha: 1,
                y: 0,
                duration: 0.85,
                ease: 'power3.out',
                overwrite: 'auto',
              })
              observer.unobserve(entry.target)
            }
          },
          { threshold: 0.18 },
        )

        gsap.set(revealItems, { autoAlpha: 0, y: 34 })
        revealItems.forEach((item) => observer.observe(item))

        return () => observer.disconnect()
      },
    )
    return () => mm.revert()
  }, [path])

  const navigate = (href: string) => {
    const next = href === '' ? '/' : href
    if (next !== window.location.pathname) {
      window.history.pushState(null, '', next)
      setPath(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const nav = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(href)
  }

  return (
    <>
      <SiteHeader t={t} lang={lang} setLang={setLang} nav={nav} />
      <main>
        {route.key === 'home' && <HomePage t={t} nav={nav} />}
        {route.key === 'services' && <ServicesPage t={t} nav={nav} />}
        {route.key === 'about' && <AboutPage t={t} nav={nav} />}
        {route.key === 'partner' && <PartnerPage t={t} partner={route.partner} nav={nav} />}
        {route.key === 'gallery' && <GalleryPage t={t} />}
        {route.key === 'contact' && <ContactPage t={t} />}
      </main>
      <SiteFooter t={t} lang={lang} setLang={setLang} nav={nav} />
      <a className="whatsapp" href={social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.')} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <WhatsAppIcon />
      </a>
    </>
  )
}

function SiteHeader({
  t,
  lang,
  setLang,
  nav,
}: {
  t: Copy
  lang: Lang
  setLang: (lang: Lang) => void
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const [open, setOpen] = useState(false)
  const links = [
    ['/', t.nav.home],
    ['/hizmetler', t.nav.services],
    ['/hakkimizda', t.nav.about],
    ['/koleksiyon', t.nav.gallery],
    ['/iletisim', t.nav.contact],
  ] as const

  return (
    <header className="site-head js-page-in">
      <div className="utility">
        <span className="utility__dot" />
        <span>{t.hero.eyebrow}</span>
        <span className="utility__langs" aria-label={t.langLabel}>
          <button className={lang === 'en' ? 'is-active' : ''} type="button" onClick={() => setLang('en')}>
            EN
          </button>
          <button className={lang === 'tr' ? 'is-active' : ''} type="button" onClick={() => setLang('tr')}>
            TR
          </button>
        </span>
      </div>
      <nav className="masthead" aria-label="Main">
        <a className="brand" href="/" onClick={nav('/')}>
          <img className="brand-logo brand-logo--dark" src={brand.logoLight} alt="Line & İba Kuaför" />
        </a>
        <div className="desktop-nav">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={nav(href)}>
              {label}
            </a>
          ))}
        </div>
        <button className="menu-toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span>{open ? t.close : t.menu}</span>
          <i />
        </button>
      </nav>
      <div className={`mobile-panel ${open ? 'is-open' : ''}`} hidden={!open}>
        {links.map(([href, label]) => (
          <a
            key={href}
            href={href}
            onClick={(event) => {
              setOpen(false)
              nav(href)(event)
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </header>
  )
}

function HomePage({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <>
      <section className="hero">
        <img className="hero__image js-page-in" src={images.hero} alt="" />
        <div className="hero__scrim" />
        <div className="hero__copy">
          <h1 className="js-page-in">{t.hero.title}</h1>
          <p className="hero__subtitle js-page-in">{t.hero.subtitle}</p>
          <div className="hero__actions js-page-in">
            <a className="button button--light" href="/hizmetler" onClick={nav('/hizmetler')}>
              {t.hero.cta}
            </a>
            <a className="button button--ghost-light" href="/hakkimizda" onClick={nav('/hakkimizda')}>
              {t.hero.secondary}
            </a>
          </div>
        </div>
        <div className="hero__mark js-page-in">
          <img className="hero__mark-logo" src={brand.logoLight} alt="" />
          <span>{t.hero.mark}</span>
        </div>
      </section>

      <section className="philosophy section-pad">
        <div className="split container">
          <div className="copy-block js-reveal">
            <h2>{t.philosophy.title}</h2>
            {t.philosophy.body.map((item) => (
              <p key={item}>{item}</p>
            ))}
            <a className="button button--dark" href="/hakkimizda" onClick={nav('/hakkimizda')}>
              {t.philosophy.cta}
            </a>
          </div>
          <div className="editorial-stack js-reveal">
            <img className="portrait-main" src={images.philosophyMain} alt="" loading="lazy" />
            <div className="mini-row">
              {images.philosophyMini.map((image) => (
                <img src={image} alt="" loading="lazy" key={image} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesStrip t={t} nav={nav} />
      <GalleryTeaser t={t} />
      <InstagramFollowBanner t={t} />
      <CtaBand t={t} />
    </>
  )
}

function ServicesStrip({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <section className="services-strip section-pad">
      <div className="container">
        <div className="section-heading js-reveal">
          <p className="eyebrow">{t.services.eyebrow}</p>
          <h2>{t.services.title}</h2>
          <p>{t.services.intro}</p>
        </div>
        <div className="service-grid">
          {t.services.items.map((item) => (
            <article className="service-card js-reveal" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <strong>Faydaları</strong>
              <ul>
                {item.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="center-line js-reveal">
          <a className="button button--dark" href="/hizmetler" onClick={nav('/hizmetler')}>
            {t.nav.services}
          </a>
        </div>
      </div>
    </section>
  )
}

function ServicesPage({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <>
      <PageHero title={t.services.title} image={images.servicesHero} />
      <ServicesStrip t={t} nav={nav} />
      <section className="featured-service section-pad">
        <div className="container feature-box js-reveal">
          <img src={images.servicesFeatured} alt="" loading="lazy" />
          <div>
            <p className="eyebrow">Line & İba Signature</p>
            <h2>{t.services.featuredTitle}</h2>
            <p>{t.services.featuredBody}</p>
            <a className="button button--light" href="/iletisim" onClick={nav('/iletisim')}>
              {t.book}
            </a>
          </div>
        </div>
      </section>
      <CtaBand t={t} />
    </>
  )
}

function AboutPage({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <>
      <PageHero title={t.about.title} image={images.aboutHero} />
      <section className="about-intro section-pad">
        <div className="container narrow-copy js-reveal">
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h2>{t.about.title}</h2>
          <p>{t.about.intro}</p>
        </div>
      </section>
      <section className="partners section-pad">
        <div className="container">
          <div className="section-heading js-reveal">
            <p className="eyebrow">{t.about.partnersTitle}</p>
            <h2>{t.about.partnersTitle}</h2>
            <p>{t.about.partnersIntro}</p>
          </div>
          <div className="partner-grid">
            {t.partners.map((partner) => (
              <article className="partner-card js-reveal" key={partner.slug}>
                <a href={`/hakkimizda/${partner.slug}`} onClick={nav(`/hakkimizda/${partner.slug}`)}>
                  <img src={partner.image} alt={partner.name} />
                  <span>{partner.role}</span>
                  <h3>{partner.name}</h3>
                  <p>{partner.intro}</p>
                  <b>{t.about.detailCta}</b>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function PartnerPage({
  t,
  partner,
  nav,
}: {
  t: Copy
  partner: Partner
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <section className="partner-detail">
      <div className="partner-detail__media js-page-in">
        <img src={partner.image} alt={partner.name} />
      </div>
      <div className="partner-detail__copy">
        <h1 className="js-page-in">{partner.name}</h1>
        <p className="partner-role js-page-in">{partner.role}</p>
        <p className="lead js-page-in">{partner.intro}</p>
        <blockquote className="js-page-in">{partner.quote}</blockquote>
        <ul className="experience-list js-reveal">
          {partner.experience.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <a className="button button--dark js-reveal" href="/hakkimizda" onClick={nav('/hakkimizda')}>
          {t.nav.about}
        </a>
      </div>
    </section>
  )
}

function GalleryPage({ t }: { t: Copy }) {
  return (
    <>
      <PageHero title={t.gallery.title} image={images.collectionHero} />
      <GalleryTeaser t={t} />
      <InstagramFollowBanner t={t} />
    </>
  )
}

function GalleryTeaser({ t }: { t: Copy }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videos = Array.from(gridRef.current?.querySelectorAll('video') ?? [])
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reducedMotion) return

    const playVideo = (video: HTMLVideoElement) => {
      video.muted = true
      video.defaultMuted = true
      void video.play().catch(() => {
        // Mobil tarayıcı henüz yeterli veri indirmediyse canplay olayı tekrar dener.
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) playVideo(video)
          else video.pause()
        })
      },
      { rootMargin: '120px 0px', threshold: 0.15 },
    )

    const handleCanPlay = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement
      const rect = video.getBoundingClientRect()
      if (rect.bottom >= -120 && rect.top <= window.innerHeight + 120) playVideo(video)
    }

    const resumeVisibleVideos = () => {
      if (document.visibilityState !== 'visible') return
      videos.forEach((video) => {
        const rect = video.getBoundingClientRect()
        if (rect.bottom >= -120 && rect.top <= window.innerHeight + 120) playVideo(video)
      })
    }

    videos.forEach((video) => {
      video.addEventListener('canplay', handleCanPlay)
      observer.observe(video)
    })
    document.addEventListener('visibilitychange', resumeVisibleVideos)
    window.addEventListener('pageshow', resumeVisibleVideos)

    return () => {
      observer.disconnect()
      videos.forEach((video) => video.removeEventListener('canplay', handleCanPlay))
      document.removeEventListener('visibilitychange', resumeVisibleVideos)
      window.removeEventListener('pageshow', resumeVisibleVideos)
    }
  }, [])

  return (
    <section className="gallery section-pad">
      <div className="container">
        <div className="section-heading js-reveal">
          <p className="eyebrow">{t.gallery.eyebrow}</p>
          <h2>{t.gallery.title}</h2>
          <p>{t.gallery.intro}</p>
        </div>
        <div className="insta-grid" ref={gridRef}>
          {galleryVideos.map((video, index) => (
            <figure className="video-tile" key={video.src}>
              <video
                src={video.src}
                poster={video.poster}
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={t.gallery.items[index]}
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function InstagramFollowBanner({ t }: { t: Copy }) {
  return (
    <section className="instagram-follow">
      <a className="instagram-follow__link" href={social.instagramUrl} target="_blank" rel="noreferrer" aria-label={t.instagramFollow.aria}>
        <span className="instagram-follow__pattern" aria-hidden="true">
          <span className="instagram-follow__word instagram-follow__word--top">INSTAGRAM</span>
          <span className="instagram-follow__word instagram-follow__word--bottom">LINE &amp; IBA</span>
        </span>
        <span className="instagram-follow__panel">
          <span className="instagram-follow__icon" aria-hidden="true">
            <InstagramIcon />
          </span>
          <span className="instagram-follow__copy">
            <span className="instagram-follow__label">{t.instagramFollow.label}</span>
            <span className="instagram-follow__handle">{social.instagramHandle}</span>
          </span>
        </span>
      </a>
    </section>
  )
}

function ContactPage({ t }: { t: Copy }) {
  return (
    <>
      <PageHero title={t.contact.title} image={images.contactHero} />
      <section className="contact-page section-pad">
        <div className="container contact-grid">
          <div className="js-reveal">
            <p className="eyebrow">{t.contact.eyebrow}</p>
            <h2>{t.contact.title}</h2>
            <p>{t.contact.intro}</p>
          </div>
          <div className="contact-list js-reveal">
            <a href={contactInfo.mapsUrl} target="_blank" rel="noreferrer">
              <span>{t.contact.address}</span>
              {contactInfo.address}
            </a>
            <a href={contactInfo.phoneHref}>
              <span>{t.contact.phone}</span>
              {contactInfo.phoneDisplay}
            </a>
            <div>
              <span>{t.contact.hours}</span>
              Caddebostan / İstanbul
            </div>
            <a href={social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.')} target="_blank" rel="noreferrer">
              <span>WhatsApp</span>
              {social.whatsappDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function PageHero({ title, image }: { title: string; image: string }) {
  return (
    <section className="page-hero">
      <img className="page-hero__media js-page-in" src={image} alt="" />
      <div className="page-hero__copy">
        <h1 className="js-page-in">{title}</h1>
      </div>
    </section>
  )
}

function CtaBand({ t }: { t: Copy }) {
  return (
    <section className="cta-band js-reveal">
      <p className="eyebrow">{t.contact.eyebrow}</p>
      <h2>{t.contact.title}</h2>
      <div>
        <a className="button button--light" href={social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.')} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
        <a className="button button--outline-light" href={contactInfo.phoneHref}>
          {contactInfo.phoneDisplay}
        </a>
      </div>
    </section>
  )
}

function SiteFooter({
  t,
  lang,
  setLang,
  nav,
}: {
  t: Copy
  lang: Lang
  setLang: (lang: Lang) => void
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const year = useMemo(() => new Date().getFullYear(), [])
  const footerPrimary =
    lang === 'tr'
      ? [
          { label: 'Felsefemiz', href: '/hakkimizda' },
          { label: 'Hizmetler', href: '/hizmetler' },
          { label: 'Koleksiyon', href: '/koleksiyon' },
        ]
      : [
          { label: 'Philosophy', href: '/hakkimizda' },
          { label: 'Services', href: '/hizmetler' },
          { label: 'Collection', href: '/koleksiyon' },
        ]
  const footerContact = [
    { label: t.nav.contact, href: '/iletisim' },
    { label: t.contact.directions, href: contactInfo.mapsUrl, external: true },
    {
      label: 'WhatsApp',
      href: social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.'),
      external: true,
    },
  ]

  return (
    <footer className="site-footer">
      <a href="/" onClick={nav('/')} className="footer-logo">
        <img className="footer-logo__image" src={brand.logoLight} alt="Line & İba Kuaför" />
      </a>
      <div className="footer-cols">
        <nav className="footer-links" aria-label={lang === 'tr' ? 'Alt menü' : 'Footer menu'}>
          {footerPrimary.map((item) => (
            <a key={item.href} href={item.href} onClick={nav(item.href)}>
              {item.label}
            </a>
          ))}
        </nav>
        <nav className="footer-links" aria-label={lang === 'tr' ? 'Alt iletişim' : 'Footer contact'}>
          {footerContact.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={item.external ? undefined : nav(item.href)}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-social">
        <a href={social.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a href={social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.')} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>
      </div>
      <div className="footer-lang">
        <button className={lang === 'tr' ? 'is-active' : ''} type="button" onClick={() => setLang('tr')}>
          TR
        </button>
        <button className={lang === 'en' ? 'is-active' : ''} type="button" onClick={() => setLang('en')}>
          EN
        </button>
      </div>
      <small>
        © {year} Line & İba Kuaför. {t.footer.copyright}
      </small>
    </footer>
  )
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16.02 4.25c-6.42 0-11.64 5.1-11.64 11.38 0 2.13.61 4.19 1.76 5.99L4.25 28l6.6-1.81a11.87 11.87 0 0 0 5.17 1.18c6.42 0 11.64-5.1 11.64-11.38S22.44 4.25 16.02 4.25Zm0 20.95c-1.65 0-3.27-.42-4.7-1.22l-.34-.19-3.91 1.07 1.1-3.71-.22-.36a9.3 9.3 0 0 1-1.41-4.86c0-5.08 4.25-9.21 9.48-9.21s9.48 4.13 9.48 9.21-4.25 9.27-9.48 9.27Zm5.2-6.94c-.28-.14-1.69-.82-1.95-.91-.26-.1-.45-.14-.64.14-.19.27-.73.91-.9 1.09-.16.18-.33.2-.61.07-.28-.14-1.19-.43-2.27-1.37-.84-.73-1.4-1.64-1.57-1.91-.16-.27-.02-.42.12-.56.13-.13.28-.33.42-.49.14-.16.19-.27.28-.45.09-.18.05-.34-.02-.48-.07-.14-.64-1.52-.87-2.08-.23-.55-.47-.47-.64-.48h-.55c-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.81 1.17 3c.14.18 2.03 3.03 4.92 4.25.69.29 1.22.47 1.64.6.69.21 1.31.18 1.81.11.55-.08 1.69-.68 1.93-1.34.24-.66.24-1.23.16-1.34-.07-.12-.26-.19-.55-.33Z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M10.4 4.5h11.2c3.25 0 5.9 2.65 5.9 5.9v11.2c0 3.25-2.65 5.9-5.9 5.9H10.4a5.91 5.91 0 0 1-5.9-5.9V10.4c0-3.25 2.65-5.9 5.9-5.9Zm0 2.45a3.45 3.45 0 0 0-3.45 3.45v11.2a3.45 3.45 0 0 0 3.45 3.45h11.2a3.45 3.45 0 0 0 3.45-3.45V10.4a3.45 3.45 0 0 0-3.45-3.45H10.4Zm5.6 4.45a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2Zm0 2.45a2.15 2.15 0 1 0 0 4.3 2.15 2.15 0 0 0 0-4.3Zm6.2-3.65a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  )
}

function getRoute(path: string, partners: Partner[]): { key: RouteKey; partner: Partner } | { key: Exclude<RouteKey, 'partner'> } {
  const clean = path.replace(/\/$/, '') || '/'
  const partner = partners.find((item) => clean === `/hakkimizda/${item.slug}`)
  if (partner) return { key: 'partner', partner }
  if (clean === '/hizmetler') return { key: 'services' }
  if (clean === '/hakkimizda') return { key: 'about' }
  if (clean === '/koleksiyon') return { key: 'gallery' }
  if (clean === '/iletisim') return { key: 'contact' }
  if (!routeOrder.includes(clean.slice(1) as RouteKey)) return { key: 'home' }
  return { key: 'home' }
}

export default App
