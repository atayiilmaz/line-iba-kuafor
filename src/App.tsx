import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { LanguageProvider, useLang } from './lib/i18n'
import { brand, contactInfo, social, type Lang } from './data/site'

const BookingPage = lazy(() => import('./components/booking/BookingPage').then((module) => ({ default: module.BookingPage })))
const AdminPage = lazy(() => import('./components/admin/AdminPage').then((module) => ({ default: module.AdminPage })))

type RouteKey = 'home' | 'services' | 'about' | 'partner' | 'gallery' | 'contact' | 'booking' | 'privacy' | 'admin'
type PartnerKey = 'ahmet' | 'ergun' | 'ibrahim'

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
    benefitsLabel: string
    items: { title: string; body: string; benefits: string[] }[]
    featuredTitle: string
    featuredBody: string
  }
  about: {
    title: string
    partnersTitle: string
    partnersIntro: string[]
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
  hero: '/assets/photos/IMG_7858.PNG',
  philosophyMain: '/assets/photos/philosophy-blonde.webp',
  philosophyMini: [
    '/assets/photos/philosophy-red-hair.webp',
    '/assets/photos/IMG_8443.JPG',
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
  ergun:
    'https://images.pexels.com/photos/3993320/pexels-photo-3993320.jpeg?auto=compress&cs=tinysrgb&w=1100',
  ibrahim:
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
      booking: 'Randevu',
      privacy: 'KVKK',
      admin: 'Yönetim',
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
        'Bizim için kuaförlük, yalnızca saç kesmek, renklendirmek ya da şekillendirmek değildir. Her misafirimizin kendini en iyi hissettiği, karakterini yansıtan ve özgüvenini ortaya çıkaran bir görünüm tasarlamak, işimizin en değerli parçasıdır.',
        'LİNE&İBA olarak her dokunuşun bir sanat eseri olduğuna inanıyoruz. Bu nedenle her müşterimizi dikkatle dinliyor, yüz hatlarını, yaşam tarzını ve kişisel stilini analiz ederek tamamen ona özel bir deneyim sunuyoruz. Bizim için gerçek lüks; kişiye özel hizmet, detaylara gösterilen özen ve kusursuz sonuçtur.',
        'Dünyadaki trendleri yakından takip ederken, modayı birebir kopyalamak yerine onu misafirlerimizin karakteriyle buluşturuyoruz. Sürekli eğitim, yenilikçi bakış açısı ve gelişime olan bağlılığımız sayesinde her zaman bir adım önde olmayı hedefliyoruz.',
        'Salonumuzun temelinde güven, samimiyet, estetik ve kalite vardır. Buradan ayrılan herkesin yalnızca saçından değil, kendini hissetme biçiminden de memnun ayrılması en büyük motivasyonumuzdur.',
        'Çünkü biz, saçın bir görünümden çok daha fazlası olduğuna inanıyoruz. Saç; bir duruş, bir ifade ve kişinin kendini anlatma biçimidir. LİNE&İBA’da bu hikâyeyi birlikte yazıyor, her dokunuşumuzla güzelliği sanata dönüştürüyoruz.',
      ],
      cta: 'Devamını Oku',
    },
    services: {
      eyebrow: 'Seçkin Uygulamalar',
      title: 'En çok tercih edilen hizmetler',
      intro:
        'Tek ekranda anlaşılır, salonda detaylandırılır. Her işlem öncesi saç analizi ve beklenti konuşması yapılır.',
      benefitsLabel: 'Verilen Hizmetler',
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
          benefits: ['Manikür', 'Pedikür', 'Kalıcı oje', 'Profesyonel makyaj', 'Kirpik'],
        },
      ],
      featuredTitle: 'Öne çıkan işlem: renk tasarımı',
      featuredBody:
        'Doğal ışıltı, yumuşak geçiş ve saç sağlığını koruyan planlama. Renk uygulamasında hedefimiz fotoğraf için değil, gündelik ışıkta iyi görünen saçtır.',
    },
    about: {
      title: 'Üç ortağın aynı salonda buluşan ustalığı.',
      partnersTitle: 'Üç Ortağın Hikâyesi',
      partnersIntro: [
        '2020 yılında Ahmet Yılmaz ve Ergün Sarıca, ortak vizyonumuz ve saç sanatına duyduğumuz büyük tutkuyla Line Cadde’yi kurduk. Kurulduğumuz ilk günden itibaren amacımız; sadece kaliteli hizmet sunan bir kuaför salonu olmak değil, yaratıcılığı, estetik anlayışı ve sürekli gelişimi merkeze alan bir marka oluşturmaktı.',
        'Bu vizyon, 2024 yılında İBA markasının kurucusu İbrahim Yılmaz’ın üçüncü ortak olarak aramıza katılmasıyla daha da güçlendi. Farklı deneyimlerimizi, uzmanlık alanlarımızı ve sanatsal bakış açılarımızı bir araya getirerek, misafirlerimize her zaman en yenilikçi ve en kaliteli hizmeti sunmayı hedefledik.',
        'Bugün LİNE&İBA, yalnızca bir kuaför salonu değil; saç sanatına yön veren, trendleri yakından takip eden ve kendi çizgisini oluşturan, sektörde tanınan ve güven duyulan bir marka olarak hizmet vermeye devam etmektedir.',
      ],
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
        key: 'ergun',
        slug: 'ergun-sarica',
        name: 'Ergün Sarıca',
        role: 'Kurucu Ortak / Renk Uzmanı',
        image: images.ergun,
        intro:
          'Ergün, renklendirme ve bakım protokollerinde doğal geçiş, parlak bitiş ve saç sağlığı dengesine odaklanır.',
        experience: ['Balayage ve doğal renk geçişleri', 'Bakım protokolü planlama', 'Tonlama ve parlaklık servisleri', 'Saç analizi danışmanlığı'],
        quote: 'Renk, saçın kendi hareketini saklamamalı; onu görünür kılmalı.',
      },
      {
        key: 'ibrahim',
        slug: 'ibrahim-yilmaz',
        name: 'İbrahim Yılmaz',
        role: 'Kurucu Ortak / Stil & Makyaj',
        image: images.ibrahim,
        intro:
          'İbrahim, özel gün hazırlıkları, makyaj ve final styling tarafında bütün görünümün dengeli çalışmasını sağlar.',
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
      booking: 'Booking',
      privacy: 'Privacy',
      admin: 'Management',
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
        'For us, hairdressing is not simply about cutting, colouring or styling hair. The most valuable part of our work is creating a look that helps every guest feel their best, reflects their character and brings out their confidence.',
        'At LINE&IBA, we believe that every touch is a work of art. That is why we listen carefully to every guest and offer a completely personal experience by considering their facial features, lifestyle and individual style. To us, true luxury means personalised service, meticulous attention to detail and flawless results.',
        'We follow global trends closely, but rather than copying fashion, we bring it together with the character of each guest. Through continuous education, an innovative perspective and our commitment to improvement, we always aim to remain one step ahead.',
        'Trust, sincerity, aesthetics and quality are the foundations of our salon. Our greatest motivation is for every guest to leave satisfied not only with their hair, but also with the way they feel about themselves.',
        'We believe that hair is far more than appearance. It is an attitude, a form of expression and a way of telling your story. At LINE&IBA, we write that story together and transform beauty into art with every touch.',
      ],
      cta: 'Read More',
    },
    services: {
      eyebrow: 'Selected Treatments',
      title: 'Most requested services',
      intro:
        'Clear online, detailed in the salon. Every service begins with hair analysis and a short expectation consultation.',
      benefitsLabel: 'Services Provided',
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
          benefits: ['Manicure', 'Pedicure', 'Permanent polish', 'Professional makeup', 'Lashes'],
        },
      ],
      featuredTitle: 'Featured service: color design',
      featuredBody:
        'Natural light, soft transitions and planning that protects hair health. The goal is hair that works in real daylight, not only in photographs.',
    },
    about: {
      title: 'Three partners, one shared craft.',
      partnersTitle: 'The Story of Three Partners',
      partnersIntro: [
        'In 2020, Ahmet Yılmaz and Ergün Sarıca founded Line Cadde, united by a shared vision and a deep passion for the art of hair. From the very beginning, our aim was not simply to become a salon known for quality service, but to build a brand centred on creativity, aesthetics and continuous development.',
        'This vision grew even stronger in 2024, when İbrahim Yılmaz, founder of the İBA brand, joined us as our third partner. By bringing together our different experiences, areas of expertise and artistic perspectives, we set out to offer our guests the most innovative and highest-quality service at all times.',
        'Today, LINE&IBA is more than a hair salon. It continues to serve as a recognised and trusted brand in the industry—one that helps shape the art of hair, follows trends closely and creates a distinctive style of its own.',
      ],
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
        key: 'ergun',
        slug: 'ergun-sarica',
        name: 'Ergün Sarıca',
        role: 'Founding Partner / Color Specialist',
        image: images.ergun,
        intro:
          'Ergün focuses on natural color transitions, glossy finishes and the balance between beauty and hair health.',
        experience: ['Balayage and soft transitions', 'Care protocol planning', 'Toning and shine services', 'Hair analysis consultation'],
        quote: 'Color should not hide hair movement. It should reveal it.',
      },
      {
        key: 'ibrahim',
        slug: 'ibrahim-yilmaz',
        name: 'İbrahim Yılmaz',
        role: 'Founding Partner / Style & Makeup',
        image: images.ibrahim,
        intro:
          'İbrahim shapes event preparation, makeup and final styling so the full look feels balanced and intentional.',
        experience: ['Bridal hair and trial process', 'Professional makeup', 'Updo and editorial styling', 'Nail service coordination'],
        quote: 'A final look is remembered through balance, not excess.',
      },
    ],
  },
}

const routeOrder: RouteKey[] = ['home', 'services', 'about', 'gallery', 'contact', 'booking', 'privacy', 'admin']

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
        const pageItems = Array.from(document.querySelectorAll<HTMLElement>('.js-page-in'))
        const revealItems = Array.from(document.querySelectorAll<HTMLElement>('.js-reveal'))
        if (reduceMotion) {
          if (pageItems.length) gsap.set(pageItems, { autoAlpha: 1, y: 0 })
          if (revealItems.length) gsap.set(revealItems, { autoAlpha: 1, y: 0 })
          return
        }

        if (pageItems.length) {
          gsap.fromTo(
            pageItems,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
          )
        }

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

        if (revealItems.length) {
          gsap.set(revealItems, { autoAlpha: 0, y: 34 })
          revealItems.forEach((item) => observer.observe(item))
        }

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

  if (route.key === 'admin') return <Suspense fallback={<RouteLoader />}><AdminPage /></Suspense>

  return (
    <>
      <SiteHeader t={t} lang={lang} setLang={setLang} nav={nav} />
      <main>
        {route.key === 'home' && <HomePage t={t} nav={nav} />}
        {route.key === 'services' && <ServicesPage t={t} nav={nav} />}
        {route.key === 'about' && <AboutPage t={t} nav={nav} />}
        {route.key === 'partner' && <PartnerPage t={t} partner={route.partner} nav={nav} />}
        {route.key === 'gallery' && <GalleryPage t={t} />}
        {route.key === 'contact' && <ContactPage t={t} nav={nav} />}
        {route.key === 'booking' && <Suspense fallback={<RouteLoader />}><BookingPage lang={lang} navigate={nav} /></Suspense>}
        {route.key === 'privacy' && <PrivacyPage lang={lang} />}
      </main>
      <SiteFooter t={t} lang={lang} setLang={setLang} nav={nav} />
      {route.key !== 'booking' && <a className="whatsapp" href={social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.')} target="_blank" rel="noreferrer" aria-label="WhatsApp">
        <WhatsAppIcon />
      </a>}
    </>
  )
}

function RouteLoader() {
  return <div className="route-loader" role="status">Yükleniyor…</div>
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
  const primaryLinks = [
    ['/', t.nav.home],
    ['/hizmetler', t.nav.services],
    ['/hakkimizda', t.nav.about],
    ['/koleksiyon', t.nav.gallery],
    ['/iletisim', t.nav.contact],
  ] as const
  const links = [...primaryLinks, ['/randevu', t.book] as const]

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
          <img className="brand-logo" src={brand.logoDark} alt="Line & İba Kuaför" />
        </a>
        <div className="desktop-nav">
          {primaryLinks.map(([href, label]) => (
            <a key={href} href={href} onClick={nav(href)}>
              {label}
            </a>
          ))}
        </div>
        <a className="nav-booking masthead-booking" href="/randevu" onClick={nav('/randevu')}>{t.book}</a>
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
            <a className="button button--light" href="/randevu" onClick={nav('/randevu')}>
              {t.book}
            </a>
            <a className="button button--ghost-light" href="/hizmetler" onClick={nav('/hizmetler')}>
              {t.hero.cta}
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
            <div className="portrait-main-frame">
              <img className="portrait-main" src={images.philosophyMain} alt="" loading="lazy" />
            </div>
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
      <CtaBand t={t} nav={nav} />
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
              <strong>{t.services.benefitsLabel}</strong>
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
            <a className="button button--light" href="/randevu" onClick={nav('/randevu')}>
              {t.book}
            </a>
          </div>
        </div>
      </section>
      <CtaBand t={t} nav={nav} />
    </>
  )
}

function AboutPage({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <>
      <PageHero title={t.about.title} image={images.aboutHero} />
      <section className="partners section-pad">
        <div className="container">
          <div className="section-heading js-reveal">
            <p className="eyebrow">{t.about.partnersTitle}</p>
            <h2>{t.about.partnersTitle}</h2>
            {t.about.partnersIntro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
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

function ContactPage({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
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
            <a href="/randevu" onClick={nav('/randevu')}>
              <span>{t.book}</span>
              {t.contact.title}
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

function CtaBand({ t, nav }: { t: Copy; nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <section className="cta-band js-reveal">
      <p className="eyebrow">{t.contact.eyebrow}</p>
      <h2>{t.contact.title}</h2>
      <div>
        <a className="button button--light" href="/randevu" onClick={nav('/randevu')}>
          {t.book}
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
    { label: t.book, href: '/randevu' },
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
        <img className="footer-logo__image" src={brand.logoDark} alt="Line & İba Kuaför" />
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

function PrivacyPage({ lang }: { lang: Lang }) {
  const isTr = lang === 'tr'
  return (
    <section className="privacy-page section-pad">
      <div className="container privacy-copy js-page-in">
        <p className="eyebrow">{isTr ? 'Randevu Sistemi' : 'Booking System'}</p>
        <h1>{isTr ? 'KVKK Aydınlatma Metni' : 'Privacy Notice'}</h1>
        <p className="lead">{isTr
          ? 'Bu metin, online randevu sırasında paylaştığınız kişisel verilerin nasıl kullanıldığını açıklar.'
          : 'This notice explains how the personal data you provide during online booking is used.'}</p>
        <h2>{isTr ? 'İşlenen bilgiler' : 'Data we process'}</h2>
        <p>{isTr ? 'Ad-soyad, cep telefonu, seçilen hizmet, randevu tarihi ve saati ile isteğe bağlı notunuz işlenir.' : 'We process your name, mobile number, selected service, appointment date and time, and any optional note.'}</p>
        <h2>{isTr ? 'Amaç ve hukuki sebep' : 'Purpose and legal basis'}</h2>
        <p>{isTr ? 'Bilgileriniz randevuyu oluşturmak, salon takvimini yönetmek, sizinle iletişim kurmak ve işletmeye WhatsApp bildirimi göndermek amacıyla kullanılır.' : 'Your information is used to create the appointment, manage salon availability, contact you, and notify the business through WhatsApp.'}</p>
        <h2>{isTr ? 'Saklama ve güvenlik' : 'Retention and security'}</h2>
        <p>{isTr ? 'Randevu bilgileri 12 ay saklanır, ardından kimlik bilgileri anonimleştirilir. Veriler yalnızca yetkili işletme hesapları tarafından görüntülenebilir.' : 'Booking information is retained for 12 months, after which identifying information is anonymized. Only authorized business accounts can access it.'}</p>
        <h2>{isTr ? 'Haklarınız ve iletişim' : 'Your rights and contact'}</h2>
        <p>{isTr ? `Bilgilerinize ilişkin talepleriniz için ${contactInfo.phoneDisplay} numarasından veya ${social.whatsappDisplay} WhatsApp hattından bize ulaşabilirsiniz.` : `For requests about your personal data, contact us at ${contactInfo.phoneDisplay} or through WhatsApp at ${social.whatsappDisplay}.`}</p>
        <p className="privacy-note">{isTr ? 'Bu metin canlıya geçmeden önce işletmenin hukuk danışmanı tarafından gözden geçirilmelidir.' : 'This notice should be reviewed by the business’s legal adviser before production launch.'}</p>
      </div>
    </section>
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
  if (clean === '/randevu') return { key: 'booking' }
  if (clean === '/kvkk') return { key: 'privacy' }
  if (clean === '/yonetim' || clean === '/yonetim/randevular') return { key: 'admin' }
  if (!routeOrder.includes(clean.slice(1) as RouteKey)) return { key: 'home' }
  return { key: 'home' }
}

export default App
