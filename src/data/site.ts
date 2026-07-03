/* ============================================================
   Line & İba Kuaför — Editable site content (Turkish)
   Tek marka: Line & İba Kuaför. Tüm metinler buradan düzenlenir.
   ============================================================ */

export const brand = {
  name: 'Line & İba Kuaför',
  tagline: 'Caddebostan Kadın & Erkek Kuaförü',
  sentence:
    'Line & İba Kuaför, Caddebostan’da kadın ve erkek kuaför hizmetlerini premium salon deneyimiyle sunan modern bir kuaförüdür.',
  logoDark: '/assets/logo/logo-dark.png', // koyu logo — açık zeminlerde kullanılır
  logoLight: '/assets/logo/logo-light.png', // beyaz logo — koyu zeminlerde kullanılır
  markDark: '/assets/logo/mark-dark.png', // sadece makas ikonu — açık zemin
  markLight: '/assets/logo/mark-light.png', // sadece makas ikonu — koyu zemin
  ibaDark: '/assets/logo/iba-dark.png', // İBA rozeti — açık zemin
  ibaLight: '/assets/logo/iba-light.png', // İBA rozeti — koyu zemin
}

export type NavLink = { label: string; href: string }

export const nav = {
  left: [
    { label: 'Ana Sayfa', href: '#ana-sayfa' },
    { label: 'Hakkımızda', href: '#hakkimizda' },
    { label: 'Hizmetler', href: '#hizmetler' },
  ] as NavLink[],
  right: [
    { label: 'Çalışmalar', href: '#calismalar' },
    { label: 'Yorumlar', href: '#yorumlar' },
    { label: 'İletişim', href: '#iletisim' },
  ] as NavLink[],
}

export const hero = {
  number: '01',
  eyebrow: 'Caddebostan · Kadın & Erkek Kuaförü',
  title: ['Caddebostan’da kadın ve', 'erkek kuaför deneyimi.'],
  subtitle:
    'Line & İba Kuaför; saç kesimi, renklendirme, bakım, tırnak, makyaj ve ağda hizmetlerini modern, şık ve profesyonel bir salon atmosferinde sunar.',
  badges: ['Kadın & Erkek Kuaförü', 'Caddebostan / Göztepe', 'Saç • Tırnak • Makyaj • Bakım'],
  ctaPrimary: { label: 'Hizmetleri İncele', href: '#hizmetler' },
  ctaSecondary: { label: 'Yol Tarifi Al', href: '' }, // href contact.mapsUrl ile doldurulur
  reviewCard: {
    rating: '4.9',
    count: '283 değerlendirme',
    quote: 'Her zamanki gibi memnun ayrıldım.',
  },
}

export const about = {
  number: '02',
  eyebrow: 'Hakkımızda',
  title: 'Modern, özenli ve premium salon deneyimi.',
  copy: 'Line & İba Kuaför, kadın ve erkek misafirlerine saç kesimi, renklendirme, bakım, tırnak, makyaj ve ağda hizmetlerini aynı salonda sunar. Profesyonel ekip, temiz salon düzeni ve kişiye özel hizmet yaklaşımıyla günlük bakım ihtiyaçlarından özel gün hazırlıklarına kadar kapsamlı bir kuaför deneyimi sağlar.',
  features: [
    {
      title: 'Kadın & Erkek Hizmetleri',
      text: 'Tek çatı altında kadın ve erkek misafirler için eksiksiz kuaför hizmetleri.',
    },
    {
      title: 'Profesyonel Salon Ekibi',
      text: 'Deneyimli ekip ve kişiye özel yaklaşımla titiz bir hizmet anlayışı.',
    },
    {
      title: 'Caddebostan Lokasyonu',
      text: 'Göztepe’ye komşu, ulaşımı kolay merkezi Caddebostan konumu.',
    },
  ],
}

export type ServiceGroup = {
  key: string
  title: string
  description: string
  items: string[]
}

export const services = {
  number: '03',
  eyebrow: 'Hizmetler',
  title: 'Tek salonda eksiksiz kuaför hizmetleri.',
  groups: [
    {
      key: 'kadin-sac',
      title: 'Kadın Saç Hizmetleri',
      description: 'Kesimden şekillendirmeye, özel gün saçlarından günlük bakıma.',
      items: [
        'Saç Kesimi',
        'Fön',
        'Kırık Fön',
        'Maşa',
        'Topuz',
        'Örgü',
        'Gelin Başı',
        'Nişan Saçı',
        'Saç Yıkama',
      ],
    },
    {
      key: 'renklendirme',
      title: 'Renklendirme & Işıklandırma',
      description: 'Doğal tonlardan iddialı renk geçişlerine profesyonel uygulama.',
      items: [
        'Saç Boyama',
        'Saç Dip Boyama',
        'Saç Renk Değişimi',
        'Ombre',
        'Sombre',
        'Balyaj',
        'Röfle ve Gölge',
      ],
    },
    {
      key: 'bakim',
      title: 'Saç Bakım & Doku Hizmetleri',
      description: 'Saçın sağlığını ve dokusunu güçlendiren bakım uygulamaları.',
      items: ['Saç Bakımı', 'Keratin Bakım', 'Brezilya Fönü', 'Perma', 'Saç Kaynağı'],
    },
    {
      key: 'erkek-sac',
      title: 'Erkek Saç Hizmetleri',
      description: 'Bakımlı bir görünüm için modern erkek kuaför hizmetleri.',
      items: [
        'Saç Kesimi',
        'Saç Boyama',
        'Fön',
        'Saç Bakımı',
        'Saç Yıkama',
        'Brezilya Fönü',
      ],
    },
    {
      key: 'tirnak',
      title: 'Tırnak Hizmetleri',
      description: 'El ve ayak bakımından kalıcı uygulamalara geniş tırnak menüsü.',
      items: [
        'Manikür',
        'Pedikür',
        'Bakım Manikürü',
        'Spa Manikür',
        'Spa Pedikür',
        'Kalıcı Oje',
        'Jel Tırnak Full Set',
        'Jel French Full Set',
        'Jel Tırnak Bakım',
        'Protez Tırnak',
        'El Tırnak Şekillendirme',
        'Ayak Tırnak Şekillendirme',
        'Batık Tırnak',
      ],
    },
    {
      key: 'makyaj',
      title: 'Makyaj, Kaş & Kirpik',
      description: 'Gündelik bakımdan özel gün makyajına ışıltılı dokunuşlar.',
      items: [
        'Kaş Alma',
        'Kaş Boyama',
        'Kaş Kontürü',
        'Gündelik Makyaj',
        'Gece Makyajı',
        'Gelin Makyajı',
        'Kirpik Lifting',
        'Kirpik Boyama',
        'Kirpik Perması',
        'İpek Kirpik',
        '3D İpek Kirpik',
        'Dudak Üstü',
      ],
    },
    {
      key: 'agda',
      title: 'Ağda Hizmetleri',
      description: 'Bölgesel ve tüm vücut için hijyenik ağda uygulamaları.',
      items: ['Ağda (Tüm Vücut)', 'Ağda (Bölgesel)'],
    },
  ] as ServiceGroup[],
}

export type WorkCategory = {
  key: string
  label: string
  caption: string
  image: string // Gerçek salon fotoğrafını bu yola koyun
  size: 'tall' | 'wide' | 'square'
}

export const works = {
  number: '04',
  eyebrow: 'Çalışmalar',
  title: 'Salonumuzdan seçilmiş çalışmalar.',
  // NOT: Aşağıdaki görselleri public/assets/gallery/ altındaki gerçek salon
  // fotoğraflarıyla değiştirin. Görsel yoksa zarif degrade bloklar gösterilir.
  categories: [
    { key: 'kesim', label: 'Kesim & Stil', caption: 'Şekil veren kesimler', image: '/assets/gallery/kesim-1.jpg', size: 'tall' },
    { key: 'renk', label: 'Renk & Işık', caption: 'Balyaj, ombre, röfle', image: '/assets/gallery/renk-1.jpg', size: 'wide' },
    { key: 'bakim', label: 'Bakım & Doku', caption: 'Keratin ve bakım', image: '/assets/gallery/bakim-1.jpg', size: 'square' },
    { key: 'tirnak', label: 'Tırnak', caption: 'Manikür ve kalıcı oje', image: '/assets/gallery/tirnak-1.jpg', size: 'square' },
    { key: 'makyaj', label: 'Makyaj', caption: 'Gündüz ve gece makyajı', image: '/assets/gallery/makyaj-1.jpg', size: 'wide' },
    { key: 'erkek-kuafor', label: 'Erkek Kuaför', caption: 'Modern erkek kesimi', image: '/assets/gallery/erkek-kuafor-1.jpg', size: 'tall' },
  ] as WorkCategory[],
}

export const trust = {
  number: '05',
  eyebrow: 'Deneyim',
  title: 'Misafirlerimizin güvendiği bir salon.',
  stats: [
    { value: 4.9, suffix: '/5', label: 'Müşteri değerlendirmesi' },
    { value: 283, suffix: '', label: 'Yorum' },
    { value: 901, suffix: '', label: 'Ziyaretçi puanı' },
  ],
  notes: ['Kadın & erkek kuaför hizmetleri', 'Her gün 09:00 – 19:30'],
}

export type Review = { quote: string; name: string; meta: string }

export const reviews = {
  number: '06',
  eyebrow: 'Yorumlar',
  title: 'Misafirlerimiz ne diyor?',
  items: [
    { quote: 'Harika hizmet.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
    { quote: 'Kesim harika.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
    { quote: 'Her zamanki gibi memnun ayrıldım.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
    { quote: 'İlgili ve profesyonel bir ekip.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
    { quote: 'Salon çok temiz ve şık.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
    { quote: 'Renk tam istediğim gibi oldu.', name: 'Google Yorumu', meta: 'Doğrulanmış ziyaret' },
  ] as Review[],
}

const mapsUrl =
  'https://www.google.com/maps/search/?api=1&query=Line+%26+%C4%B0ba+Kuaf%C3%B6r+Caddebostan+%C3%96mer+Pa%C5%9Fa+Sokak'

export const contact = {
  number: '07',
  eyebrow: 'İletişim',
  title: 'Bize ulaşın veya yol tarifi alın.',
  address: 'Caddebostan Mah. Ömer Paşa Sok. No:1 Can Apt. Göztepe / İstanbul',
  phoneDisplay: '0850 303 68 76',
  phoneHref: 'tel:+908503036876',
  hours: 'Her gün 09:00 - 19:30',
  mapsUrl,
  callLabel: 'Telefonla Ara',
  directionsLabel: 'Yol Tarifi Al',
}

export const footer = {
  sentence:
    'Line & İba Kuaför, Caddebostan’da kadın ve erkek kuaför hizmetlerini modern salon deneyimiyle sunar.',
  copyright: `© ${new Date().getFullYear()} Line & İba Kuaför. Tüm hakları saklıdır.`,
}
