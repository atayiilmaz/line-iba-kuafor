/* ============================================================
   Line & İba Kuaför — Editable site content (TR + EN)
   Tek marka: Line & İba Kuaför. Tüm metinler buradan düzenlenir.
   İki dil desteklenir: content.tr ve content.en aynı yapıyı taşır.
   ============================================================ */

export type Lang = 'tr' | 'en'

/* ---------- Dilden bağımsız marka varlıkları ---------- */
export const brand = {
  name: 'Line & İba Kuaför',
  logoDark: '/assets/logo/logo-dark.png', // koyu logo — açık zeminlerde kullanılır
  logoLight: '/assets/logo/logo-light.png', // beyaz logo — koyu zeminlerde kullanılır
  markDark: '/assets/logo/mark-dark.png', // sadece makas ikonu — açık zemin
  markLight: '/assets/logo/mark-light.png', // sadece makas ikonu — koyu zemin
  ibaDark: '/assets/logo/iba-dark.png', // İBA rozeti — açık zemin
  ibaLight: '/assets/logo/iba-light.png', // İBA rozeti — koyu zemin
}

/* ---------- Dilden bağımsız iletişim & sosyal medya ---------- */
const WHATSAPP_NUMBER = '905333212283'

export const contactInfo = {
  address: 'Caddebostan Mah. Ömer Paşa Sok. No:1 Can Apt. Göztepe / İstanbul',
  phoneDisplay: '0216 407 27 77',
  phoneHref: 'tel:+902164072777',
  mapsUrl:
    'https://www.google.com/maps/place/Line+Cadde/@40.9691202,29.0629322,17z/data=!3m1!4b1!4m6!3m5!1s0x14cac79675559a79:0x451f486bb0ee14e3!8m2!3d40.9691162!4d29.0655071!16s%2Fg%2F11j7dc6v55?entry=ttu&g_ep=EgoyMDI2MDcxNS4wIKXMDSoASAFQAw%3D%3D',
}

export const social = {
  instagramUrl: 'https://www.instagram.com/linecadde/',
  instagramHandle: '@linecadde',
  whatsappDisplay: '+90 533 321 22 83',
  whatsappUrl: (message: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
}

/* ---------- İçerik tipleri ---------- */
export type NavLink = { label: string; href: string }

export type ServiceGroup = {
  key: string
  title: string
  description: string
  items: string[]
}

export type WorkCategory = {
  key: string
  label: string
  caption: string
  image: string // Gerçek salon fotoğrafını bu yola koyun
  size: 'tall' | 'wide' | 'square'
}

export type Review = { quote: string; name: string; meta: string }

export type Partner = {
  name: string
  role: string
  story: string
  image: string // Gerçek portreyi bu yola koyun; yoksa baş harfli zarif bir blok gösterilir
}

export type SiteContent = {
  meta: { title: string; description: string }
  nav: {
    left: NavLink[]
    right: NavLink[]
    ariaMain: string
    ariaHome: string
    ariaOpen: string
    ariaClose: string
  }
  ticker: string[]
  hero: {
    number: string
    eyebrow: string
    title: string[]
    subtitle: string
    ctaPrimary: NavLink
    ctaSecondaryLabel: string
    imageAlt: string
    imageMark: string
    reviewCard: { rating: string; count: string }
  }
  about: {
    number: string
    eyebrow: string
    title: string
    copy: string
    imageAlt: string
    imageMark: string
    features: { title: string; text: string }[]
    story: {
      eyebrow: string
      title: string
      intro: string
      partners: Partner[]
    }
  }
  services: { number: string; eyebrow: string; title: string; groups: ServiceGroup[] }
  works: { number: string; eyebrow: string; title: string; categories: WorkCategory[] }
  trust: {
    number: string
    eyebrow: string
    title: string
    stats: { value: number; suffix: string; label: string }[]
    notes: string[]
  }
  reviews: {
    number: string
    eyebrow: string
    title: string
    ariaStars: string
    items: Review[]
  }
  contact: {
    number: string
    eyebrow: string
    title: string
    addressLabel: string
    phoneLabel: string
    instagramLabel: string
    hoursLabel: string
    hours: string
    ctaTitle: string
    whatsappLabel: string
    whatsappHref: string
    callLabel: string
    directionsLabel: string
  }
  footer: {
    sentence: string
    followLabel: string
    addressLabel: string
    contactLabel: string
    menuLabel: string
    copyright: string
    ariaHome: string
    ariaMenu: string
  }
  whatsappFloatAria: string
}

const year = new Date().getFullYear()

/* ============================================================
   TÜRKÇE
   ============================================================ */
const tr: SiteContent = {
  meta: {
    title: 'Line & İba Kuaför | Caddebostan Kadın Kuaförü',
    description:
      'Line & İba Kuaför, Caddebostan’da saç kesimi, renklendirme, gelin başı, tırnak ve makyaj hizmetleri sunan kadın kuaförüdür.',
  },

  nav: {
    left: [
      { label: 'Ana Sayfa', href: '/' },
      { label: 'Hakkımızda', href: '/hakkimizda' },
      { label: 'Hizmetler', href: '/hizmetler' },
    ],
    right: [
      { label: 'Çalışmalar', href: '/calismalar' },
      { label: 'Yorumlar', href: '/yorumlar' },
      { label: 'İletişim', href: '/iletisim' },
    ],
    ariaMain: 'Ana menü',
    ariaHome: 'Line & İba Kuaför — ana sayfa',
    ariaOpen: 'Menüyü aç',
    ariaClose: 'Menüyü kapat',
  },

  ticker: ['Saç Kesimi', 'Renklendirme', 'Gelin Başı', 'Tırnak', 'Makyaj', 'Bakım'],

  hero: {
    number: '01',
    eyebrow: 'Caddebostan · Kadın Kuaförü',
    title: ['Caddebostan’da premium', 'kadın kuaförü deneyimi.'],
    subtitle:
      'Line & İba Kuaför; saç kesimi, renklendirme, gelin başı, tırnak ve makyaj hizmetlerini modern, şık ve profesyonel bir salon atmosferinde sunar.',
    ctaPrimary: { label: 'Hizmetleri İncele', href: '/hizmetler' },
    ctaSecondaryLabel: 'Yol Tarifi Al',
    imageAlt: 'Line & İba Kuaför salonundan bir kare',
    imageMark: 'Est. Caddebostan',
    reviewCard: { rating: '4.9', count: '283 değerlendirme' },
  },

  about: {
    number: '02',
    eyebrow: 'Hakkımızda',
    title: 'Modern, özenli ve premium salon deneyimi.',
    copy: 'Line & İba Kuaför; saç kesimi, renklendirme, gelin başı, tırnak ve makyaj hizmetlerini aynı salonda sunar. Profesyonel ekip, temiz salon düzeni ve kişiye özel hizmet yaklaşımıyla günlük bakım ihtiyaçlarından özel gün hazırlıklarına kadar kapsamlı bir kuaför deneyimi sağlar.',
    imageAlt: 'Line & İba Kuaför salon içi',
    imageMark: 'Caddebostan / İstanbul',
    features: [
      {
        title: 'Kişiye Özel Hizmet',
        text: 'Her misafirin saç yapısına ve tarzına uygun, kişiye özel uygulama.',
      },
      {
        title: 'Profesyonel Salon Ekibi',
        text: 'Deneyimli ekip ve titiz bir hizmet anlayışıyla özenli bakım.',
      },
      {
        title: 'Caddebostan Lokasyonu',
        text: 'Göztepe’ye komşu, ulaşımı kolay merkezi Caddebostan konumu.',
      },
    ],
    // Üç ortağın hikayesi — ortaklardan metinler geldikçe story alanlarını
    // ve isim/rolleri kendi anlatımlarıyla değiştirin. Portreler için:
    // public/assets/team/ altına ortak-1.jpg, ortak-2.jpg, ortak-3.jpg koyun.
    story: {
      eyebrow: 'Hikayemiz',
      title: 'Üç usta, tek salon.',
      intro:
        'Line & İba; üç ortağın ayrı ayrı yürüdüğü yolların Caddebostan’da birleşmesiyle doğdu. Her biri kendi alanında yıllarını vermiş üç usta, aynı titizlik ve aynı hizmet anlayışında buluştu. Aşağıda her ortak kendi yolculuğunu kendi sözleriyle anlatıyor.',
      partners: [
        {
          name: 'Ahmet Yılmaz',
          role: 'Kurucu Ortak',
          story:
            'Nerede başladı, hangi salonlarda ustalaştı, Line & İba’ya uzanan yol nasıl şekillendi — Ahmet, hikayesini burada kendi sözleriyle anlatacak.',
          image: '/assets/team/ortak-1.jpg',
        },
        {
          name: 'Ergün Sarıca',
          role: 'Kurucu Ortak',
          story:
            'Ergün’ün yolculuğu: ilk adımları, ustalık yılları ve üç yolun kesişme anı. Metin, kendi anlatımıyla bu alana eklenecek.',
          image: '/assets/team/ortak-2.jpg',
        },
        {
          name: 'İbrahim Yılmaz',
          role: 'Kurucu Ortak',
          story:
            'İbrahim’in hikayesi: mesleğe başlangıcı, deneyimleri ve birleşme kararı. Metin, kendi anlatımıyla bu alana eklenecek.',
          image: '/assets/team/ortak-3.jpg',
        },
      ],
    },
  },

  // Müşteri talebi: bölümler az ve öz — kesim, renklendirme, gelin başı, tırnak.
  services: {
    number: '03',
    eyebrow: 'Hizmetler',
    title: 'Az ve öz: dört ana hizmet.',
    groups: [
      {
        key: 'kesim',
        title: 'Kesim & Stil',
        description: 'Yüz hattına şekil veren kesim, fön ve şekillendirme.',
        items: ['Saç Kesimi', 'Fön', 'Kırık Fön', 'Maşa', 'Topuz', 'Örgü'],
      },
      {
        key: 'renklendirme',
        title: 'Renklendirme',
        description: 'Doğal tonlardan iddialı geçişlere profesyonel renk uygulamaları.',
        items: ['Saç Boyama', 'Dip Boyama', 'Balyaj', 'Ombre', 'Röfle ve Gölge'],
      },
      {
        key: 'gelin',
        title: 'Gelin Başı & Özel Gün',
        description: 'Büyük gününüz için saçta ve makyajda kusursuz hazırlık.',
        items: ['Gelin Başı', 'Nişan Saçı', 'Gelin Makyajı', 'Gece Makyajı', 'Özel Gün Topuzu'],
      },
      {
        key: 'tirnak',
        title: 'Tırnak',
        description: 'El ve ayak bakımından kalıcı uygulamalara özenli tırnak hizmetleri.',
        items: ['Manikür', 'Pedikür', 'Kalıcı Oje', 'Jel Tırnak', 'Protez Tırnak', 'Kirpik'],
      },
    ],
  },

  works: {
    number: '04',
    eyebrow: 'Çalışmalar',
    title: 'Salonumuzdan seçilmiş çalışmalar.',
    // NOT: Aşağıdaki görselleri public/assets/gallery/ altındaki gerçek salon
    // fotoğraflarıyla değiştirin. Görsel yoksa zarif degrade bloklar gösterilir.
    categories: [
      { key: 'kesim', label: 'Kesim & Stil', caption: 'Şekil veren kesimler', image: '/assets/gallery/kesim-1.jpg', size: 'tall' },
      { key: 'renk', label: 'Renk & Işık', caption: 'Balyaj, ombre, röfle', image: '/assets/gallery/renk-1.jpg', size: 'wide' },
      { key: 'gelin', label: 'Gelin Başı', caption: 'Özel gün hazırlığı', image: '/assets/gallery/gelin-1.jpg', size: 'square' },
      { key: 'tirnak', label: 'Tırnak', caption: 'Manikür ve kalıcı oje', image: '/assets/gallery/tirnak-1.jpg', size: 'square' },
      { key: 'makyaj', label: 'Makyaj', caption: 'Gündüz ve gece makyajı', image: '/assets/gallery/makyaj-1.jpg', size: 'wide' },
      { key: 'salon', label: 'Salon', caption: 'Caddebostan atmosferi', image: '/assets/gallery/salon-1.jpg', size: 'tall' },
    ],
  },

  trust: {
    number: '05',
    eyebrow: 'Deneyim',
    title: 'Misafirlerimizin güvendiği bir salon.',
    stats: [
      { value: 4.9, suffix: '/5', label: 'Müşteri değerlendirmesi' },
      { value: 283, suffix: '', label: 'Yorum' },
      { value: 901, suffix: '', label: 'Ziyaretçi puanı' },
    ],
    notes: ['Kadın kuaförü hizmetleri', 'Her gün 09:00 – 19:30'],
  },

  reviews: {
    number: '06',
    eyebrow: 'Yorumlar',
    title: 'Misafirlerimiz ne diyor?',
    ariaStars: '5 üzerinden 5 yıldız',
    items: [
      { quote: 'Harika hizmet.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
      { quote: 'Kesim harika.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
      { quote: 'Her zamanki gibi memnun ayrıldım.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
      { quote: 'İlgili ve profesyonel bir ekip.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
      { quote: 'Salon çok temiz ve şık.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
      { quote: 'Renk tam istediğim gibi oldu.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
    ],
  },

  contact: {
    number: '07',
    eyebrow: 'İletişim',
    title: 'Bize ulaşın veya yol tarifi alın.',
    addressLabel: 'Adres',
    phoneLabel: 'Telefon',
    instagramLabel: 'Instagram',
    hoursLabel: 'Çalışma Saatleri',
    hours: 'Her gün 09:00 - 19:30',
    ctaTitle: 'Randevu için WhatsApp’tan yazın veya bizi arayın.',
    whatsappLabel: 'WhatsApp’tan Yazın',
    whatsappHref: social.whatsappUrl('Merhaba, randevu almak istiyorum.'),
    callLabel: 'Telefonla Ara',
    directionsLabel: 'Yol Tarifi Al',
  },

  footer: {
    sentence:
      'Line & İba Kuaför, Caddebostan’da kadın kuaförü hizmetlerini modern salon deneyimiyle sunar.',
    followLabel: 'Bizi Takip Edin',
    addressLabel: 'Adres',
    contactLabel: 'İletişim',
    menuLabel: 'Menü',
    copyright: `© ${year} Line & İba Kuaför. Tüm hakları saklıdır.`,
    ariaHome: 'Line & İba Kuaför — ana sayfa',
    ariaMenu: 'Alt menü',
  },

  whatsappFloatAria: 'WhatsApp’tan yazın',
}

/* ============================================================
   ENGLISH
   ============================================================ */
const en: SiteContent = {
  meta: {
    title: 'Line & İba Kuaför | Women’s Hair Salon in Caddebostan, Istanbul',
    description:
      'Line & İba is a women’s hair salon in Caddebostan, Istanbul, offering haircuts, colour, bridal hair, nails and makeup.',
  },

  nav: {
    left: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/hakkimizda' },
      { label: 'Services', href: '/hizmetler' },
    ],
    right: [
      { label: 'Works', href: '/calismalar' },
      { label: 'Reviews', href: '/yorumlar' },
      { label: 'Contact', href: '/iletisim' },
    ],
    ariaMain: 'Main menu',
    ariaHome: 'Line & İba Kuaför — home',
    ariaOpen: 'Open menu',
    ariaClose: 'Close menu',
  },

  ticker: ['Haircut', 'Colour', 'Bridal Hair', 'Nails', 'Makeup', 'Care'],

  hero: {
    number: '01',
    eyebrow: 'Caddebostan · Women’s Hair Salon',
    title: ['A premium women’s salon', 'experience in Caddebostan.'],
    subtitle:
      'Line & İba offers haircuts, colour, bridal hair, nails and makeup in a modern, elegant and professional salon atmosphere.',
    ctaPrimary: { label: 'Explore Services', href: '/hizmetler' },
    ctaSecondaryLabel: 'Get Directions',
    imageAlt: 'A view from the Line & İba salon',
    imageMark: 'Est. Caddebostan',
    reviewCard: { rating: '4.9', count: '283 reviews' },
  },

  about: {
    number: '02',
    eyebrow: 'About',
    title: 'A modern, attentive, premium salon experience.',
    copy: 'Line & İba brings haircuts, colour, bridal hair, nails and makeup together under one roof. With a professional team, an immaculate salon and a personal approach, we cover everything from everyday care to special-day preparation.',
    imageAlt: 'Inside the Line & İba salon',
    imageMark: 'Caddebostan / Istanbul',
    features: [
      {
        title: 'Personal Service',
        text: 'Every treatment is tailored to each guest’s hair and personal style.',
      },
      {
        title: 'Professional Salon Team',
        text: 'An experienced team with a meticulous approach to care.',
      },
      {
        title: 'Caddebostan Location',
        text: 'A central, easy-to-reach spot in Caddebostan, next to Göztepe.',
      },
    ],
    story: {
      eyebrow: 'Our Story',
      title: 'Three masters, one salon.',
      intro:
        'Line & İba was born when three separate paths met in Caddebostan. Three masters, each with years of craft in their own field, came together around the same care and the same standard of service. Below, each partner tells their own journey in their own words.',
      partners: [
        {
          name: 'Ahmet Yılmaz',
          role: 'Co-Founder',
          story:
            'Where it began, the salons where he honed his craft, and the road that led to Line & İba — Ahmet will tell his story here in his own words.',
          image: '/assets/team/ortak-1.jpg',
        },
        {
          name: 'Ergün Sarıca',
          role: 'Co-Founder',
          story:
            'Ergün’s journey: first steps, years of mastery, and the moment three paths crossed. His story will be added here in his own words.',
          image: '/assets/team/ortak-2.jpg',
        },
        {
          name: 'İbrahim Yılmaz',
          role: 'Co-Founder',
          story:
            'İbrahim’s story: how the craft began, the experience gathered, and the decision to join forces. His story will be added here in his own words.',
          image: '/assets/team/ortak-3.jpg',
        },
      ],
    },
  },

  services: {
    number: '03',
    eyebrow: 'Services',
    title: 'Four essentials, done well.',
    groups: [
      {
        key: 'kesim',
        title: 'Cut & Style',
        description: 'Cuts, blowouts and styling shaped to frame your features.',
        items: ['Haircut', 'Blowout', 'Waves & Curls', 'Updo', 'Braids'],
      },
      {
        key: 'renklendirme',
        title: 'Colour',
        description: 'Professional colour, from natural tones to bold transformations.',
        items: ['Hair Colouring', 'Root Touch-Up', 'Balayage', 'Ombré', 'Highlights & Lowlights'],
      },
      {
        key: 'gelin',
        title: 'Bridal & Special Occasion',
        description: 'Flawless hair and makeup preparation for your big day.',
        items: ['Bridal Hair', 'Engagement Hair', 'Bridal Makeup', 'Evening Makeup', 'Occasion Updo'],
      },
      {
        key: 'tirnak',
        title: 'Nails',
        description: 'Attentive nail care, from manicures to long-lasting finishes.',
        items: ['Manicure', 'Pedicure', 'Gel Polish', 'Gel Nails', 'Nail Extensions', 'Lashes'],
      },
    ],
  },

  works: {
    number: '04',
    eyebrow: 'Works',
    title: 'Selected work from our salon.',
    categories: [
      { key: 'kesim', label: 'Cut & Style', caption: 'Cuts that shape', image: '/assets/gallery/kesim-1.jpg', size: 'tall' },
      { key: 'renk', label: 'Colour & Light', caption: 'Balayage, ombré, highlights', image: '/assets/gallery/renk-1.jpg', size: 'wide' },
      { key: 'gelin', label: 'Bridal', caption: 'Special-day preparation', image: '/assets/gallery/gelin-1.jpg', size: 'square' },
      { key: 'tirnak', label: 'Nails', caption: 'Manicure and gel polish', image: '/assets/gallery/tirnak-1.jpg', size: 'square' },
      { key: 'makyaj', label: 'Makeup', caption: 'Day and evening looks', image: '/assets/gallery/makyaj-1.jpg', size: 'wide' },
      { key: 'salon', label: 'The Salon', caption: 'The Caddebostan atmosphere', image: '/assets/gallery/salon-1.jpg', size: 'tall' },
    ],
  },

  trust: {
    number: '05',
    eyebrow: 'Experience',
    title: 'A salon our guests trust.',
    stats: [
      { value: 4.9, suffix: '/5', label: 'Customer rating' },
      { value: 283, suffix: '', label: 'Reviews' },
      { value: 901, suffix: '', label: 'Visitor score' },
    ],
    notes: ['Women’s hair salon services', 'Open daily 09:00 – 19:30'],
  },

  reviews: {
    number: '06',
    eyebrow: 'Reviews',
    title: 'What our guests say',
    ariaStars: '5 out of 5 stars',
    items: [
      { quote: 'Wonderful service.', name: 'Google Review', meta: 'Verified visit' },
      { quote: 'The haircut is fantastic.', name: 'Google Review', meta: 'Verified visit' },
      { quote: 'Left happy, as always.', name: 'Google Review', meta: 'Verified visit' },
      { quote: 'A caring, professional team.', name: 'Google Review', meta: 'Verified visit' },
      { quote: 'The salon is spotless and stylish.', name: 'Google Review', meta: 'Verified visit' },
      { quote: 'The colour turned out exactly as I wanted.', name: 'Google Review', meta: 'Verified visit' },
    ],
  },

  contact: {
    number: '07',
    eyebrow: 'Contact',
    title: 'Reach us or get directions.',
    addressLabel: 'Address',
    phoneLabel: 'Phone',
    instagramLabel: 'Instagram',
    hoursLabel: 'Opening Hours',
    hours: 'Open daily 09:00 - 19:30',
    ctaTitle: 'Message us on WhatsApp to book, or give us a call.',
    whatsappLabel: 'Chat on WhatsApp',
    whatsappHref: social.whatsappUrl('Hello, I would like to book an appointment.'),
    callLabel: 'Call Us',
    directionsLabel: 'Get Directions',
  },

  footer: {
    sentence:
      'Line & İba is a women’s hair salon in Caddebostan, Istanbul, offering a modern salon experience.',
    followLabel: 'Follow Us',
    addressLabel: 'Address',
    contactLabel: 'Contact',
    menuLabel: 'Menu',
    copyright: `© ${year} Line & İba Kuaför. All rights reserved.`,
    ariaHome: 'Line & İba Kuaför — home',
    ariaMenu: 'Footer menu',
  },

  whatsappFloatAria: 'Chat on WhatsApp',
}

export const content: Record<Lang, SiteContent> = { tr, en }
