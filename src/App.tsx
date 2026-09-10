import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { LanguageProvider, useLang } from './lib/i18n'
import { brand, contactInfo, social, type Lang } from './data/site'
import { BookingPage } from './components/booking/BookingPage'
import { BlogDetailPage, BlogPage } from './components/blog/BlogPage'

const AdminPage = lazy(() => import('./components/admin/AdminPage').then((module) => ({ default: module.AdminPage })))

type RouteKey = 'home' | 'services' | 'about' | 'partner' | 'gallery' | 'blog' | 'blogPost' | 'contact' | 'booking' | 'privacy' | 'admin'
type PartnerKey = 'ahmet' | 'ergun' | 'ibrahim'

type Partner = {
  key: PartnerKey
  slug: string
  name: string
  detailTitle?: string
  role: string
  image: string
  intro: string
  bio?: string[]
  bioHeadings?: { at: number; title: string }[]
  experience: string[]
  quote?: string
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
    parking?: string
    benefitsLabel: string
    detailLink: string
    care: { title: string; body: string; benefits: string[] }
    items: {
      title: string
      body: string
      benefits: string[]
      collection?: { lead: string; label: string; suffix: string; href: string }
    }[]
    featuredTitle: string
    featuredBody: string
    faqTitle: string
    faq: { question: string; answer: string }[]
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
    sectionTitle: string
    intro: string
    purpose: string
    context: string
    servicesLead: string
    servicesLink: string
    bookingLead: string
    bookingLink: string
    detailsSuffix: string
    homeLink: string
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
    area: string
    areaDetail: string
    address: string
    addressDetail: string
    phone: string
    hoursLabel: string
    hours: string
    whatsapp: string
    directions: string
    infoTitle: string
    questionLabel: string
    answerLabel: string
    locationQuestion: string
    locationAnswer: string
    branchesQuestion: string
    branchesAnswer: string
    parkingQuestion: string
    parkingAnswer: string
    hygieneQuestion: string
    hygieneAnswer: string
    phoneWhatsapp: string
    ratingIntro: string
    ratingValue: string
    homeBookingLink: string
  }
  footer: {
    copyright: string
  }
  partners: Partner[]
}

const images = {
  hero: '/assets/photos/home-hero.webp',
  philosophyMain: '/assets/photos/philosophy-main.webp',
  philosophyMini: [
    '/assets/photos/philosophy-red-hair-small.webp',
    '/assets/photos/philosophy-salon-small.webp',
    '/assets/photos/philosophy-blonde-small.webp',
  ],
  servicesHero: '/assets/photos/services-hero.webp',
  servicesFeatured: '/assets/photos/color-blonde.webp',
  aboutHero: '/assets/photos/about-hero.webp',
  collectionHero: '/assets/photos/hero-bridal.webp',
  contactHero: '/assets/videos/2026/contact-hero-poster.webp',
  ahmet: '/assets/photos/ahmet-yilmaz.webp',
  ergun: '/assets/photos/ergun-sarica.webp',
  ibrahim: '/assets/photos/ibrahim-yilmaz.webp',
}

const galleryVideos = [
  {
    src: '/assets/videos/2026/salon-finish-01.mp4',
    poster: '/assets/videos/2026/salon-finish-01-poster.webp',
  },
  {
    src: '/assets/videos/2026/archive-02.mp4',
    poster: '/assets/videos/2026/salon-02-poster.webp',
  },
  {
    src: '/assets/videos/2026/salon-finish-02.mp4',
    poster: '/assets/videos/2026/salon-finish-02-poster.webp',
  },
  {
    src: '/assets/videos/2026/archive-03.mp4',
    poster: '/assets/videos/2026/salon-03-poster.webp',
  },
  {
    src: '/assets/videos/2026/collection-hero.mp4',
    poster: '/assets/videos/2026/collection-hero-poster.webp',
  },
  {
    src: '/assets/videos/2026/archive-04.mp4',
    poster: '/assets/videos/2026/salon-04-poster.webp',
  },
  {
    src: '/assets/videos/2026/salon-finish-03.mp4',
    poster: '/assets/videos/2026/salon-finish-03-poster.webp',
  },
  {
    src: '/assets/videos/2026/archive-05.mp4',
    poster: '/assets/videos/2026/salon-05-poster.webp',
  },
  {
    src: '/assets/videos/2026/contact-hero.mp4',
    poster: '/assets/videos/2026/contact-hero-poster.webp',
  },
  {
    src: '/assets/videos/2026/archive-01.mp4',
    poster: '/assets/videos/2026/home-feature-poster.webp',
  },
]

const serviceAnchors = ['kesim-stil', 'renklendirme', 'gelin-basi', 'tirnak-makyaj'] as const

const copy: Record<Lang, Copy> = {
  tr: {
    nav: {
      home: 'Ana Sayfa',
      services: 'Hizmetler',
      about: 'Hakkımızda',
      partner: 'Ortaklar',
      gallery: 'Koleksiyon',
      blog: 'Blog',
      blogPost: 'Blog Yazısı',
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
        'Line & İba, Caddebostan’da saç kesimi, renklendirme, gelin başı, tırnak ve makyaj hizmetleri sunar.',
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
        'Line & İba, saç bakımı ve düzleştirme, kesim ve stil, renklendirme, gelin başı ile tırnak ve makyaj hizmetlerini tek ekranda özetler, salonda detaylandırır; her işlem öncesi saç analizi yapar.',
      parking: 'Salonun kendi otoparkı yoktur, yakınında otopark bulunur.',
      benefitsLabel: 'Verilen Hizmetler',
      detailLink: 'Hizmet detayını inceleyin',
      care: {
        title: 'Saç Bakımı & Düzleştirme',
        body:
          'Line & İba Kuaför, yıpranmış ve dalgalı saçlar için saçın mevcut durumuna göre planlanan bakım ve şekillendirme hizmetleri sunar. Salonumuzda Davines, Aveda ve Screen ürünleri profesyonel saç bakımı ve şekillendirme uygulamalarında kullanılır.',
        benefits: ['Keratin bakımı', 'Saç botoksu', 'Mikro kaynak', 'Kalıcı fön / düzleştirme'],
      },
      items: [
        {
          title: 'Kesim & Stil',
          body:
            "Line & İba'da form, yüz hattı ve günlük kullanım rutini üzerinden planlanan kesim sunulur — kıvırcık ve dalgalı saçların doğal dokusunu koruyan özel teknikler dahil.",
          benefits: ['Kadın saç kesimi', 'Fön ve maşa', 'Topuz ve özel gün stili'],
        },
        {
          title: 'Renklendirme',
          body:
            'Line & İba, renklendirmede ışıltı, tonlama ve doğal geçişleri kontrollü teknikle uygular; hedef, gündelik ışıkta iyi görünen bir renktir.',
          benefits: ['Boya', 'Ombre / sombre', 'Bakım destekli açma'],
        },
        {
          title: 'Gelin Başı',
          body: "Line & İba'da gelin başı hizmeti; gelin saçı provası, gelin topuzu, gelin makyajı ve makyaj uyumunu tek pakette kapsar.",
          benefits: ['Prova planı', 'Gelin topuzu', 'Gelin makyajı', 'Makyaj uyumu'],
          collection: {
            lead: 'Gelin başı çalışmalarımızdan örnekleri ',
            label: 'koleksiyonumuzda',
            suffix: ' izleyebilirsiniz.',
            href: 'https://lineiba.com/koleksiyon',
          },
        },
        {
          title: 'Tırnak & Makyaj',
          body:
            'Line & İba, manikür, pedikür ve kalıcı oje uygular; özel gün makyajını ve kirpik uygulamasını tamamlayıcı servis olarak sunar.',
          benefits: ['Manikür', 'Pedikür', 'Kalıcı oje', 'Profesyonel makyaj', 'Kirpik'],
        },
      ],
      featuredTitle: 'Öne çıkan işlem: renk tasarımı',
      featuredBody:
        'Doğal ışıltı, yumuşak geçiş ve saç sağlığını koruyan planlama. Renk uygulamasında hedefimiz fotoğraf için değil, gündelik ışıkta iyi görünen saçtır.',
      faqTitle: 'Sıkça sorulan sorular',
      faq: [
        {
          question: 'En iyi saç kesimi ve stil önerilerini nerede bulabilirim?',
          answer: "Line & İba'da kesimler yüz hattınıza ve saç formunuza göre planlanır. Uygulamadan önce kısa bir saç analizi yapılır.",
        },
        {
          question: "Kadıköy'de kıvırcık saçın doğal dalgasını bozmadan kesen bir kuaför var mı?",
          answer: 'Line & İba kıvırcık ve dalgalı saçlarda doğal dokuyu koruyan kesim teknikleri uygular.',
        },
        {
          question: "Caddebostan'da kıvırcık saç kesimini iyi yapan bir kuaför var mı?",
          answer: "Line & İba Caddebostan'da tek salonda hizmet verir ve kesimleri yüz hattına göre planlar.",
        },
        {
          question: 'Saç rengimi değiştirmek istiyorum, hangi renklendirme teknikleri en iyi sonucu verir?',
          answer: "Line & İba'da renklendirme kontrollü tonlama tekniğiyle uygulanır; hedef doğal ışıltıdır.",
        },
        {
          question: "Göztepe'de gelin saçı provası nerede yaptırılır?",
          answer: "Line & İba'da gelin başı hizmeti prova planıyla başlar ve makyaj uyumunu da kapsar.",
        },
        {
          question: "Kadıköy'de tırnak süsleme ve nail art yapan salonlar hangileri?",
          answer: 'Line & İba tırnak ve makyaj hizmeti sunar; kalıcı oje uygulaması dahildir.',
        },
        {
          question: "Saçım yıprandı, Kadıköy'de bakım yapan bir kuaför var mı?",
          answer: 'Line & İba yıpranmış saçlar için bakım planlar; keratin ve saç botoksu uygular.',
        },
        {
          question: "Kadıköy'de hijyenik kuaför öneriniz var mı?",
          answer:
            "Line & İba'da tek kullanımlık malzeme seçenekleri bulunur; havlular özel olarak yıkanıp paketlenerek salona gelir. Keratin uygulamaları salon içinde değil, bahçedeki ayrı uygulama alanında yapılır ve işlemlerde seçkin profesyonel markalar kullanılır.",
        },
        {
          question: "Bağdat Caddesi'nde en iyi sarı saç röfle yapan kuaför salonları hangileri?",
          answer:
            "Line & İba'da renklendirme kontrollü tonlama tekniğiyle uygulanır. Röfle gibi tekniklerin size uygunluğu randevuda belirlenir.",
        },
        {
          question: "Bağdat Caddesi'nde jel manikür yapan kuaförler hangileri?",
          answer:
            'Line & İba tırnak ve makyaj hizmeti sunar. Tekniğinizi randevuda birlikte netleştirebilirsiniz.',
        },
        {
          question: "Kadıköy'de curtain bangs (perçem) kesen kuaförler hangileri?",
          answer:
            "Line & İba'da kesimler yüz hattınıza göre planlanır. Perçem dahil model tercihleri kesim öncesi konuşulur.",
        },
      ],
    },
    about: {
      title: 'Üç ortağın aynı salonda buluşan ustalığı.',
      partnersTitle: 'Üç Ortağın Hikâyesi',
      partnersIntro: [
        "Line & İba, Ahmet Yılmaz ve Ergün Sarıca'nın kurduğu bir Caddebostan kuaför salonudur. Sonradan İbrahim Yılmaz üçüncü ortak olarak katılmıştır. Marka, yaratıcılığı ve estetik anlayışı merkeze alan bir hizmet sunar.",
        'Bu vizyon, 2024 yılında İBA markasının kurucusu İbrahim Yılmaz’ın üçüncü ortak olarak aramıza katılmasıyla daha da güçlendi. Farklı deneyimlerimizi, uzmanlık alanlarımızı ve sanatsal bakış açılarımızı bir araya getirerek, misafirlerimize her zaman en yenilikçi ve en kaliteli hizmeti sunmayı hedefledik.',
        'Bugün LİNE&İBA, yalnızca bir kuaför salonu değil; saç sanatına yön veren, trendleri yakından takip eden ve kendi çizgisini oluşturan, sektörde tanınan ve güven duyulan bir marka olarak hizmet vermeye devam etmektedir.',
      ],
      detailCta: 'Deneyimlerine Bak',
    },
    gallery: {
      eyebrow: 'Koleksiyon',
      title: 'Salonumuzdan gerçek anlar.',
      sectionTitle: 'Caddebostan salonundan çalışma örnekleri',
      intro:
        'Line & İba, Caddebostan’daki salonunda uyguladığı saç kesimi, renklendirme, gelin başı ve tırnak-makyaj çalışmalarından seçilmiş kısa videoları bu sayfada paylaşır.',
      purpose:
        'Line & İba, bu galeriyi randevu öncesi çalışma tarzını görmek isteyen misafirler için hazırlar. Kesim, renklendirme, gelin başı ve tırnak-makyaj örnekleri düzenli güncellenir.',
      context:
        'Galerideki videolar, salonda uygulanan farklı kesim, renk, stil ve özel gün hazırlıklarını randevu öncesinde daha yakından ve bir arada incelemenize yardımcı olur.',
      servicesLead: 'Hizmet detayları için',
      servicesLink: 'hizmetler sayfasını',
      bookingLead: 'ziyaret edebilirsiniz. Randevu için',
      bookingLink: 'randevu sayfasına',
      detailsSuffix: 'geçebilirsiniz.',
      homeLink: 'Galeriyi görüntüleyin',
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
        "Line & İba Kuaför Caddebostan'da tek salonda hizmet verir; Bağdat Caddesi, Göztepe ve Kadıköy çevresinden gelen misafirler aynı adrese gelir.",
      area: 'Semt',
      areaDetail: 'Bağdat Caddesi / Caddebostan, Göztepe–Kadıköy hattı',
      address: 'Adres',
      addressDetail: 'Caddebostan Mah. Ömer Paşa Sok. No:1 Can Apt.',
      phone: 'Telefon',
      hoursLabel: 'Çalışma saatleri',
      hours: 'Her gün 09:00–19:30',
      whatsapp: 'WhatsApp / randevu',
      directions: 'Yol Tarifi',
      infoTitle: 'Konum ve randevu bilgileri',
      questionLabel: 'Soru',
      answerLabel: 'Cevap',
      locationQuestion: "Kadıköy'de mi, Göztepe'de mi, Bağdat Caddesi'nde mi?",
      locationAnswer: "Caddebostan'da tek salon — üçü de aynı adrese kısa mesafede",
      branchesQuestion: 'Kaç şube var?',
      branchesAnswer: 'Tek salon, şube yok',
      parkingQuestion: 'Otopark var mı?',
      parkingAnswer: 'İşletmenin kendi otoparkı yok; yakınında otopark bulunur',
      hygieneQuestion: 'Hijyen uygulamalarınız nelerdir?',
      hygieneAnswer:
        'Tek kullanımlık malzeme seçenekleri bulunur; havlular özel olarak yıkanıp paketlenerek gelir. Keratin uygulamaları bahçedeki ayrı alanda yapılır',
      phoneWhatsapp: 'Telefon / WhatsApp',
      ratingIntro: 'Line & İba, Google değerlendirmelerinde misafir memnuniyetini yansıtan bir puana sahiptir.',
      ratingValue: 'Puan: 4,9 · Yorum sayısı: 283',
      homeBookingLink: 'Online randevu alın',
    },
    footer: { copyright: 'Tüm hakları saklıdır.' },
    partners: [
      {
        key: 'ahmet',
        slug: 'ahmet-yilmaz',
        name: 'Ahmet Yılmaz',
        role: 'Kurucu Ortak',
        image: images.ahmet,
        intro:
          'Çocukluk tutkusunu mesleki eğitim, 12 yıllık Erdem Kıramer deneyimi ve Avrupa’daki eğitimlerle geliştiren LINE&İBA kurucu ortağı.',
        bio: [
          'Çocukluk yıllarımdan beri büyük bir ilgi ve merak duyduğum kuaförlük mesleği, bugün hayatımın en büyük tutkusu haline geldi. Bu tutkumu profesyonel bir kariyere dönüştürmek için kuaförlük meslek lisesinde eğitim aldım ve 2006 yılında mezun oldum.',
          'Mezuniyetimin ardından, sektöre değer katan isimlerden Erdem Kıramer ekibine katılarak profesyonel meslek hayatıma başladım. Burada geçirdiğim 12 yıl boyunca yalnızca teknik bilgi ve deneyim kazanmakla kalmadım; müşteri memnuniyeti, kalite anlayışı ve mesleki disiplin konusunda da kendimi geliştirme fırsatı buldum.',
          'Kendi hayalimi gerçekleştirmek ve misafirlerime kendi bakış açımı yansıtan bir deneyim sunabilmek için 2018 yılında kendi salonumu kurdum. O günden bu yana, sekiz yıldır aynı tutku ve özenle misafirlerime hizmet vermeye devam ediyorum. Mesleğimde gelişimin hiçbir zaman sona ermediğine inanıyorum. Bu nedenle Avrupa’nın birçok farklı ülkesinde eğitimlere katılarak yeni teknikleri, trendleri ve farklı bakış açılarını yakından takip etmeye devam ettim. Yenilikleri öğrenmek ve bunları kendi yorumumla harmanlamak, mesleğime olan bağlılığımı her geçen gün daha da güçlendiriyor.',
          'Benim için kuaförlük yalnızca saç tasarlamak değildir. Her müşterinin tarzını, karakterini ve kendini ifade etme biçimini ortaya çıkaran yaratıcı bir sanat dalıdır. Her dokunuşun bir anlam taşıdığına, her saçın kendine özgü bir hikâyesi olduğuna inanıyorum.',
          'Bugün de aynı heyecan ve tutkuyla, gelişime açık bakış açımı günümüz modasıyla birleştirerek her misafirimin kendisini en iyi hissedeceği görünümü oluşturmayı hedefliyorum. Çünkü benim için salonum yalnızca çalıştığım bir yer değil; tutkumu, sanatımı ve yılların birikimini özgürce yansıttığım bir sahnedir.',
        ],
        bioHeadings: [
          { at: 0, title: 'Kariyer Yolculuğu' },
          { at: 2, title: 'Uzmanlık ve Yaklaşım' },
        ],
        experience: [
          '2006 · Kuaförlük meslek lisesi mezuniyeti',
          '2006–2018 · Erdem Kıramer ekibi',
          '2018 · Kendi salonunun kuruluşu',
          'Avrupa · İleri teknik ve trend eğitimleri',
        ],
      },
      {
        key: 'ergun',
        slug: 'ergun-sarica',
        name: 'Ergün Sarıca',
        role: 'Kurucu Ortak',
        image: images.ergun,
        intro:
          '1989’dan bu yana kuaförlük mesleğini usta-çırak geleneği, uluslararası eğitimler ve işletmecilik deneyimiyle sürdüren LINE&İBA kurucu ortağı.',
        bio: [
          '1976 yılında Tokat’ta doğdum. İlköğrenimimi Heybeliada’da tamamladım. Kuaförlük mesleğine 1989 yılında Heybeliada’da başladım. Usta-çırak geleneğinin disiplinli ve köklü eğitim anlayışı içerisinde yetişerek mesleğin tüm inceliklerini, çalışma disiplinini, müşteri ilişkilerini ve profesyonel etik değerlerini en temelinden öğrenme fırsatı buldum. Bu sağlam temel, yıllar içinde edindiğim deneyim ve eğitimlerle birleşerek kariyerimin en önemli yapı taşını oluşturdu.',
          'Mesleki gelişimim kapsamında L’Oréal ve Wella gibi dünyanın önde gelen markalarının işletme, kesim ve renklendirme eğitimlerine katıldım. Ayrıca yurt dışında ileri seviye saç kesimi ve renklendirme eğitimleri alarak uluslararası trend ve teknikler konusunda uzmanlaştım.',
          '1999–2006 yılları arasında Ali Gür bünyesinde görev aldım. Bu süreçte salon kaptanlığı yaparak ekip yönetimi, operasyon ve müşteri memnuniyeti konularında önemli deneyimler kazandım.',
          '2006 yılında ilk işletmem olan Pera Kuaförü’nü kurdum. 2009 yılında ise kendi adımı taşıyan ilk salonumu açarak profesyonel kariyerimde yeni bir döneme adım attım.',
          '2016 yılında Ali Gür Caddebostan franchise salonunu iki ortaklı bir yapıyla hayata geçirdik. 2018 yılında eğitim ve demonstrasyon amacıyla katıldığım Balkan Festivali’nde Ahmet Yılmaz ile yollarımız kesişti. Ortak vizyonumuz ve mesleğe bakış açımızın örtüşmesiyle, kurucusu olduğum salon bünyesinde yeni bir ortaklık yapısı oluşturarak birlikte üretmeye ve oluşturduğumuz markayı daha da ileri taşımaya başladık.',
          '2020 yılında Ahmet Yılmaz ile LINE CADDE markasını hayata geçirdik. 2024 yılında ise markamıza değer katan, sanatına ve mesleki vizyonuna inandığımız İbrahim Yılmaz’ın İBA markasıyla gerçekleşen birleşme sonucunda salonumuz LINE&İBA adını aldı.',
          'Bugün, mesleğe ve saç sanatına değer katan vizyonumuz doğrultusunda üç ortak olarak LINE&İBA çatısı altında hizmet vermeye; yenilikçi bakış açımız ve eğitim odaklı anlayışımızla sektöre katkı sağlamaya devam ediyoruz.',
        ],
        bioHeadings: [
          { at: 0, title: 'Kariyer Başlangıcı ve Eğitim' },
          { at: 2, title: 'Salon Kaptanlığı ve İlk İşletmeler' },
          { at: 4, title: 'LINE&İBA’nın Kuruluşu' },
        ],
        experience: [
          '1989 · Heybeliada’da mesleğe başlangıç',
          'L’Oréal ve Wella kesim, renk ve işletme eğitimleri',
          '1999–2006 · Ali Gür / Salon kaptanlığı',
          '2006 · Pera Kuaförü’nün kuruluşu',
          '2009 · Ergün Sarıca markalı ilk salon',
          '2016 · Ali Gür Caddebostan franchise salonu',
          '2018 · Ahmet Yılmaz ile ortaklık',
          '2020 · LINE CADDE’nin kuruluşu',
          '2024 · LINE&İBA marka birleşmesi',
        ],
      },
      {
        key: 'ibrahim',
        slug: 'ibrahim-yilmaz',
        name: 'İbrahim Yılmaz',
        detailTitle: 'Makasın İzinde 34 Yıl: İbrahim Yılmaz',
        role: 'Kurucu Ortak',
        image: images.ibrahim,
        intro:
          '1992 yılında Bağdat Caddesi Çiftehavuzlar’da başlayan yolculuğunu, kişiye özel kesimler ve 34 yıllık deneyimiyle Line İBA Bağdat Caddesi çatısı altında sürdürüyor.',
        bio: [
          '1992 yılında Bağdat Caddesi Çiftehavuzlar’da, alanında çok değerli ustaların yanında başlayan bu yolculuk, benim için ilk günden beri saça şekil vermekten çok daha fazlası oldu. 2001 yılında Göztepe’de kurduğum İBA markasıyla uzun yıllar boyunca heyecanla sürdürdüğüm bir yolculuk yürüttüm.',
          'Salonumuza adım atan her misafirimiz için renklendirmeden şekillendirmeye kadar saç tasarımının her alanında en doğru dokunuşu yapmaya özen gösterdim. Ancak zaman içinde, yüz anatomisine uygun ve zamansız dokunuşlarla hazırladığım kişiye özel kesimler benim asıl imzam ve tutkum haline geldi. Beni tercih eden misafirlerim de genelde bu kesim tarzımla bilir ve koltuğuma ağırlıklı olarak bu güvenle otururlar. Günün sonunda koltuğumdan kalkan birinin aynaya bakıp gülümsediğini görmek ise benim bu meslekteki en büyük motivasyonum ve mutluluğum.',
          'Bu tutkuyu sadece salon duvarları arasında tutmayıp; yurt içi ve yurt dışındaki sayısız sahne şovunda yer alarak, İBA markasıyla meslektaşlarıma eğitimler vererek ve sektöre yeni yetenekler kazandırarak kendimi her zaman dinamik tutmaya çalıştım.',
          'Senelerin getirdiği bu birikimi, bugün değerli dostlarım Ergün Sarıca ve Ahmet Yılmaz ile birlikte gerçekleştirdiğimiz güçlü bir marka ortaklığıyla Line İBA Bağdat Caddesi çatısı altında birleştirdik. Sizleri de bu yeni hikayemizde ağırlamaktan mutluluk duyuyorum.',
        ],
        bioHeadings: [
          { at: 0, title: '34 Yıllık Kariyer' },
          { at: 2, title: 'Eğitmenlik ve Line İBA Ortaklığı' },
        ],
        experience: [],
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
      blog: 'Journal',
      blogPost: 'Journal Story',
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
        'Line & Iba offers haircuts, colour, bridal hair, nails and makeup services in Caddebostan.',
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
        'Line & Iba summarises hair care and smoothing, cut and style, colour, bridal hair, nails and makeup services on one page and discusses them in detail at the salon; every treatment begins with a hair analysis.',
      parking: 'The salon does not have its own car park; parking is available nearby.',
      benefitsLabel: 'Services Provided',
      detailLink: 'View service details',
      care: {
        title: 'Hair Care & Smoothing',
        body:
          'Line & Iba provides hair care and styling services planned around the current condition of damaged, wavy or textured hair. Davines, Aveda and Screen products are used in our salon for professional hair care and styling.',
        benefits: ['Keratin care', 'Hair botox', 'Micro extensions', 'Permanent blow-dry / smoothing'],
      },
      items: [
        {
          title: 'Cut & Style',
          body:
            'Line & Iba offers haircuts planned around form, facial structure and daily styling habits, including techniques that preserve the natural texture of curly and wavy hair.',
          benefits: ['Women’s haircut', 'Blow dry and waves', 'Updo and event styling'],
        },
        {
          title: 'Color',
          body:
            'Line & Iba uses controlled techniques for dimension, toning and natural transitions in colour services; the goal is colour that looks good in everyday light.',
          benefits: ['Color', 'Ombre / sombre', 'Care-supported lightening'],
        },
        {
          title: 'Bridal Hair',
          body: 'The Line & Iba bridal package includes a bridal hair trial, bridal updo, bridal makeup and coordination between the hair and makeup look.',
          benefits: ['Trial planning', 'Bridal updo', 'Bridal makeup', 'Makeup harmony'],
        },
        {
          title: 'Nails & Makeup',
          body:
            'Line & Iba offers manicure, pedicure and permanent polish, with special-event makeup and lash applications available as complementary services.',
          benefits: ['Manicure', 'Pedicure', 'Permanent polish', 'Professional makeup', 'Lashes'],
        },
      ],
      featuredTitle: 'Featured service: color design',
      featuredBody:
        'Natural light, soft transitions and planning that protects hair health. The goal is hair that works in real daylight, not only in photographs.',
      faqTitle: 'Frequently asked questions',
      faq: [
        {
          question: 'Where can I find the best haircut and styling advice?',
          answer: 'At Line & Iba, haircuts are planned around your facial features and hair shape. A short hair analysis is carried out before the service.',
        },
        {
          question: 'Is there a salon in Kadıköy that cuts curly hair without disrupting its natural wave?',
          answer: 'Line & Iba uses cutting techniques that preserve the natural texture of curly and wavy hair.',
        },
        {
          question: 'Where can I get a good curly haircut in Caddebostan?',
          answer: 'Line & Iba operates from one salon in Caddebostan and plans each haircut around the guest’s facial features.',
        },
        {
          question: 'I want to change my hair color. Which coloring techniques give the best result?',
          answer: 'Coloring at Line & Iba uses controlled toning techniques with the aim of creating natural-looking dimension.',
        },
        {
          question: 'Where can I book a bridal hair trial near Göztepe?',
          answer: 'Bridal hair at Line & Iba begins with trial planning and also covers coordination with the makeup look.',
        },
        {
          question: 'Which salons in Kadıköy offer nail decoration and nail art?',
          answer: 'Line & Iba offers nail and makeup services, including permanent polish.',
        },
        {
          question: 'My hair is damaged. Is there a salon in Kadıköy that offers hair treatments?',
          answer: 'Line & Iba plans treatments for damaged hair and offers keratin care and hair botox.',
        },
        {
          question: 'Can you recommend a hygienic hair salon in Kadıköy?',
          answer:
            'Line & Iba offers single-use material options, and its towels arrive at the salon professionally laundered and individually packaged. Keratin treatments take place in a separate garden area rather than inside the salon, and selected professional brands are used for treatments.',
        },
        {
          question: 'Which salons on Bağdat Avenue are best for blonde highlights?',
          answer:
            'At Line & Iba, coloring is applied with controlled toning techniques. Whether techniques such as highlights suit you is determined during your appointment.',
        },
        {
          question: 'Which hair salons on Bağdat Avenue offer gel manicures?',
          answer:
            'Line & Iba offers nail and makeup services. You can confirm the right technique together during your appointment.',
        },
        {
          question: 'Which hair salons in Kadıköy cut curtain bangs?',
          answer:
            'At Line & Iba, cuts are planned around your face shape. Style preferences, including bangs, are discussed before the cut.',
        },
      ],
    },
    about: {
      title: 'Three partners, one shared craft.',
      partnersTitle: 'The Story of Three Partners',
      partnersIntro: [
        'Line & Iba is a Caddebostan hair salon founded by Ahmet Yılmaz and Ergün Sarıca. İbrahim Yılmaz later joined as the third partner. The brand offers a service centred on creativity and an aesthetic approach.',
        'This vision grew even stronger in 2024, when İbrahim Yılmaz, founder of the İBA brand, joined us as our third partner. By bringing together our different experiences, areas of expertise and artistic perspectives, we set out to offer our guests the most innovative and highest-quality service at all times.',
        'Today, LINE&IBA is more than a hair salon. It continues to serve as a recognised and trusted brand in the industry—one that helps shape the art of hair, follows trends closely and creates a distinctive style of its own.',
      ],
      detailCta: 'View Experience',
    },
    gallery: {
      eyebrow: 'Collection',
      title: 'Real moments from our salon.',
      sectionTitle: 'Work from our Caddebostan salon',
      intro:
        'Line & Iba shares selected short videos of haircuts, colour, bridal hair, nail and makeup work carried out at its Caddebostan salon.',
      purpose:
        'Line & Iba prepares this gallery for guests who want to see its working style before booking. Examples of cuts, colour, bridal hair, nails and makeup are updated regularly.',
      context:
        'The gallery videos help you review different cuts, colour, styling and special-occasion preparations from the salon together and in greater detail before booking.',
      servicesLead: 'For service details, visit the',
      servicesLink: 'services page',
      bookingLead: 'for more information. To make an appointment, continue to the',
      bookingLink: 'booking page',
      detailsSuffix: 'to continue.',
      homeLink: 'View the gallery',
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
        'Line & Iba operates from one salon in Caddebostan; guests arriving from Bağdat Avenue, Göztepe and Kadıköy all visit the same address.',
      area: 'Area',
      areaDetail: 'Bağdat Avenue / Caddebostan, on the Göztepe–Kadıköy line',
      address: 'Address',
      addressDetail: 'Caddebostan Mah. Ömer Paşa Sok. No:1 Can Apt.',
      phone: 'Phone',
      hoursLabel: 'Opening hours',
      hours: 'Daily 09:00–19:30',
      whatsapp: 'WhatsApp / booking',
      directions: 'Directions',
      infoTitle: 'Location and booking information',
      questionLabel: 'Question',
      answerLabel: 'Answer',
      locationQuestion: 'Is it in Kadıköy, Göztepe or on Bağdat Avenue?',
      locationAnswer: 'One salon in Caddebostan — a short distance from all three',
      branchesQuestion: 'How many branches are there?',
      branchesAnswer: 'One salon, no branches',
      parkingQuestion: 'Is parking available?',
      parkingAnswer: 'The salon has no private car park; parking is available nearby',
      hygieneQuestion: 'What hygiene practices do you follow?',
      hygieneAnswer:
        'Single-use material options are available, and towels arrive professionally laundered and packaged. Keratin treatments take place in a separate garden area',
      phoneWhatsapp: 'Phone / WhatsApp',
      ratingIntro: 'Line & Iba has a Google rating that reflects guest satisfaction.',
      ratingValue: 'Rating: 4.9 · Review count: 283',
      homeBookingLink: 'Book online',
    },
    footer: { copyright: 'All rights reserved.' },
    partners: [
      {
        key: 'ahmet',
        slug: 'ahmet-yilmaz',
        name: 'Ahmet Yılmaz',
        role: 'Founding Partner',
        image: images.ahmet,
        intro:
          'A founding partner of LINE&IBA who developed a childhood passion through vocational education, 12 years with the Erdem Kıramer team and training across Europe.',
        bio: [
          'Hairdressing, a profession I have approached with great interest and curiosity since childhood, has become the greatest passion of my life. To turn that passion into a professional career, I studied at a vocational high school for hairdressing and graduated in 2006.',
          'After graduating, I began my professional career by joining the team of Erdem Kıramer, one of the names who has brought lasting value to the industry. During the 12 years I spent there, I gained more than technical knowledge and experience; I also had the opportunity to develop my understanding of client satisfaction, quality and professional discipline.',
          'In 2018, I founded my own salon to realise my dream and offer guests an experience shaped by my own perspective. For the past eight years, I have continued to serve my guests with the same passion and care. I believe development in this profession never ends. That is why I attended training programmes in many European countries, continuing to follow new techniques, trends and different perspectives closely. Learning new ideas and blending them with my own interpretation strengthens my dedication to the profession every day.',
          'For me, hairdressing is not simply about designing hair. It is a creative art form that reveals each client’s style, character and way of expressing themselves. I believe every touch carries meaning and every head of hair has a unique story.',
          'Today, with the same excitement and passion, I combine an open-minded approach to development with contemporary fashion to create the look in which every guest feels their best. To me, my salon is not merely a workplace; it is a stage where I can freely express my passion, my art and the experience I have accumulated over the years.',
        ],
        bioHeadings: [
          { at: 0, title: 'Career Journey' },
          { at: 2, title: 'Expertise and Approach' },
        ],
        experience: [
          '2006 · Graduated from vocational high school for hairdressing',
          '2006–2018 · Erdem Kıramer team',
          '2018 · Founded his own salon',
          'Europe · Advanced technique and trend training',
        ],
      },
      {
        key: 'ergun',
        slug: 'ergun-sarica',
        name: 'Ergün Sarıca',
        role: 'Founding Partner',
        image: images.ergun,
        intro:
          'A founding partner of LINE&IBA who has practised hairdressing since 1989, combining the master-apprentice tradition with international education and salon management experience.',
        bio: [
          'I was born in Tokat in 1976 and completed my primary education in Heybeliada. I began my career in hairdressing in Heybeliada in 1989. Trained within the disciplined and deeply rooted master-apprentice tradition, I had the opportunity to learn every aspect of the craft—from professional discipline and client relations to ethical standards—at its foundation. Combined with the experience and education I gained over the years, this strong foundation became the most important building block of my career.',
          'As part of my professional development, I attended business management, cutting and colouring programmes offered by leading global brands such as L’Oréal and Wella. I also completed advanced haircutting and colouring training abroad, developing expertise in international trends and techniques.',
          'Between 1999 and 2006, I worked at Ali Gür. During this period, I served as salon captain and gained significant experience in team management, operations and client satisfaction.',
          'In 2006, I founded my first business, Pera Kuaförü. In 2009, I opened the first salon carrying my own name and entered a new chapter in my professional career.',
          'In 2016, we launched the Ali Gür Caddebostan franchise salon as a two-partner venture. In 2018, I met Ahmet Yılmaz at the Balkan Festival, where I was taking part for education and demonstration purposes. As our shared vision and outlook on the profession aligned, we formed a new partnership within the salon I had founded and began creating together, taking the brand we built to the next level.',
          'In 2020, Ahmet Yılmaz and I launched the LINE CADDE brand. In 2024, following the union with İbrahim Yılmaz’s İBA brand—whose artistry and professional vision we deeply value—our salon took the name LINE&IBA.',
          'Today, as three partners under the LINE&IBA name, we continue to serve with a vision that adds value to the profession and the art of hair, while contributing to the industry through our innovative perspective and education-focused approach.',
        ],
        bioHeadings: [
          { at: 0, title: 'Career Beginnings and Education' },
          { at: 2, title: 'Salon Leadership and First Businesses' },
          { at: 4, title: 'The Founding of LINE&IBA' },
        ],
        experience: [
          '1989 · Began his career in Heybeliada',
          'L’Oréal and Wella cutting, colour and business training',
          '1999–2006 · Ali Gür / Salon captain',
          '2006 · Founded Pera Kuaförü',
          '2009 · First salon under the Ergün Sarıca name',
          '2016 · Ali Gür Caddebostan franchise salon',
          '2018 · Partnership with Ahmet Yılmaz',
          '2020 · Launch of LINE CADDE',
          '2024 · LINE&IBA brand union',
        ],
      },
      {
        key: 'ibrahim',
        slug: 'ibrahim-yilmaz',
        name: 'İbrahim Yılmaz',
        detailTitle: '34 Years Following the Scissors: İbrahim Yılmaz',
        role: 'Founding Partner',
        image: images.ibrahim,
        intro:
          'He continues the journey he began in Çiftehavuzlar on Bağdat Avenue in 1992 under the Line İBA Bağdat Avenue roof, bringing 34 years of experience and a signature approach to bespoke haircuts.',
        bio: [
          'This journey began in 1992 in Çiftehavuzlar on Bağdat Avenue, alongside highly respected masters of the craft. From the very first day, it has meant far more to me than simply shaping hair. In 2001, I founded the İBA brand in Göztepe and pursued this journey with excitement for many years.',
          'For every guest who stepped into our salon, I took care to make the right choice across every area of hair design, from colouring to styling. Over time, however, bespoke cuts shaped with timeless touches and tailored to facial anatomy became my true signature and passion. The guests who choose me generally know me for this cutting style and sit in my chair with that trust above all. At the end of the day, seeing someone leave my chair, look in the mirror and smile is my greatest motivation and joy in this profession.',
          'I have worked to keep this passion alive beyond the salon walls by taking part in countless stage shows in Türkiye and abroad, training fellow professionals under the İBA brand and bringing new talent into the industry.',
          'Today, I have brought together the experience accumulated over the years under the Line İBA Bağdat Avenue roof through a strong brand partnership with my dear friends Ergün Sarıca and Ahmet Yılmaz. I am delighted to welcome you into this new chapter of our story.',
        ],
        bioHeadings: [
          { at: 0, title: 'A 34-Year Career' },
          { at: 2, title: 'Education and the Line İBA Partnership' },
        ],
        experience: [],
      },
    ],
  },
}

const routeOrder: RouteKey[] = ['home', 'services', 'about', 'gallery', 'blog', 'contact', 'booking', 'privacy', 'admin']

function App({ initialPath }: { initialPath?: string }) {
  return (
    <LanguageProvider>
      <LineIbaSite initialPath={initialPath} />
    </LanguageProvider>
  )
}

function LineIbaSite({ initialPath }: { initialPath?: string }) {
  const { lang, setLang } = useLang()
  const t = copy[lang]
  const [path, setPath] = useState(() => initialPath ?? (typeof window === 'undefined' ? '/' : window.location.pathname))
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
        {route.key === 'services' && <ServicesPage t={t} lang={lang} nav={nav} />}
        {route.key === 'about' && <AboutPage t={t} nav={nav} />}
        {route.key === 'partner' && <PartnerPage t={t} partner={route.partner} nav={nav} />}
        {route.key === 'gallery' && <GalleryPage t={t} nav={nav} />}
        {route.key === 'blog' && <BlogPage lang={lang} nav={nav} />}
        {route.key === 'blogPost' && <BlogDetailPage slug={route.slug} lang={lang} nav={nav} />}
        {route.key === 'contact' && <ContactPage t={t} nav={nav} />}
        {route.key === 'booking' && <BookingPage lang={lang} navigate={nav} />}
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
    ['/blog', t.nav.blog],
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
          <img
            className="brand-logo"
            src={brand.logoDark}
            width="409"
            height="512"
            decoding="async"
            alt="Line & İba Kuaför"
          />
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
        <img
          className="hero__image js-page-in"
          src={images.hero}
          width="1242"
          height="1249"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          alt=""
        />
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
          <img
            className="hero__mark-logo"
            src={brand.logoLight}
            width="409"
            height="512"
            decoding="async"
            alt=""
          />
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
              <img
                className="portrait-main"
                src={images.philosophyMain}
                width="1200"
                height="1600"
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="mini-row">
              {images.philosophyMini.map((image) => (
                <img
                  src={image}
                  width="480"
                  height="640"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  key={image}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesStrip t={t} nav={nav} />
      <GalleryTeaser t={t} nav={nav} />
      <InstagramFollowBanner t={t} />
      <CtaBand t={t} nav={nav} showInternalLink />
    </>
  )
}

function ServicesStrip({
  t,
  nav,
  showCare = false,
}: {
  t: Copy
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
  showCare?: boolean
}) {
  return (
    <section className="services-strip section-pad">
      <div className="container">
        <div className="section-heading js-reveal">
          <p className="eyebrow">{t.services.eyebrow}</p>
          <h2>{t.services.title}</h2>
          <p>
            {t.services.intro}
            {showCare && t.services.parking && <> {t.services.parking}</>}
          </p>
        </div>
        {showCare && (
          <article className="care-service js-reveal">
            <div>
              <p className="eyebrow">Line & İba Care</p>
              <h3>{t.services.care.title}</h3>
            </div>
            <p>{t.services.care.body}</p>
            <ol>
              {t.services.care.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ol>
          </article>
        )}
        <div className="service-grid">
          {t.services.items.map((item, index) => (
            <article
              className="service-card js-reveal"
              id={showCare ? serviceAnchors[index] : undefined}
              key={item.title}
            >
              <h3>{item.title}</h3>
              <p>
                {item.body}
                {showCare && item.collection && (
                  <>{' '}{item.collection.lead}<a className="service-card__link" href={item.collection.href} onClick={nav('/koleksiyon')}>
                    {item.collection.label}
                  </a>{item.collection.suffix}</>
                )}
                {!showCare && (
                  <>{' '}<a className="service-card__link" href={`/hizmetler#${serviceAnchors[index]}`}>
                    {t.services.detailLink}
                  </a></>
                )}
              </p>
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

function ServicesPage({
  t,
  lang,
  nav,
}: {
  t: Copy
  lang: Lang
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Renklendirme',
        serviceType: 'Saç Renklendirme',
        provider: { '@id': 'https://www.lineiba.com/#hairsalon' },
        areaServed: 'Caddebostan, Kadıköy',
        description: 'Işıltı, tonlama ve doğal geçişleri kontrollü teknikle uygulayan renklendirme hizmeti.',
      },
      {
        '@type': 'Service',
        name: 'Gelin Başı',
        serviceType: 'Gelin Saçı ve Makyajı',
        provider: { '@id': 'https://www.lineiba.com/#hairsalon' },
        areaServed: 'Caddebostan, Kadıköy',
        description: 'Gelin saçı provası, gelin topuzu, gelin makyajı ve makyaj uyumunu tek pakette kapsayan hizmet.',
      },
      {
        '@type': 'Service',
        name: 'Tırnak & Makyaj',
        serviceType: 'Manikür Pedikür',
        provider: { '@id': 'https://www.lineiba.com/#hairsalon' },
        areaServed: 'Caddebostan, Kadıköy',
        description: 'Manikür, pedikür ve kalıcı oje; özel gün makyajı ve kirpik uygulaması tamamlayıcı servis olarak sunulur.',
      },
      {
        '@type': 'Service',
        name: 'Saç Bakımı & Düzleştirme',
        serviceType: 'Saç Bakımı',
        provider: { '@id': 'https://www.lineiba.com/#hairsalon' },
        areaServed: 'Caddebostan, Kadıköy',
        description: 'Yıpranmış ve dalgalı saçlar için saçın mevcut durumuna göre planlanan bakım ve şekillendirme hizmeti.',
      },
      {
        '@type': 'Service',
        name: 'Kesim & Stil',
        serviceType: 'Saç Kesimi',
        provider: { '@id': 'https://www.lineiba.com/#hairsalon' },
        areaServed: 'Caddebostan, Kadıköy',
        description: 'Form, yüz hattı ve günlük kullanım rutini üzerinden planlanan, kıvırcık ve dalgalı saçların doğal dokusunu koruyan kesim hizmeti.',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <PageHero title={t.services.title} image={images.servicesHero} />
      <ServicesStrip t={t} nav={nav} showCare />
      <section className="featured-service section-pad">
        <div className="container feature-box js-reveal">
          <img
            src={images.servicesFeatured}
            width="1200"
            height="1800"
            alt=""
            loading="lazy"
            decoding="async"
          />
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
      <FaqSection t={t} lang={lang} />
      <CtaBand t={t} nav={nav} />
    </>
  )
}

function FaqSection({ t, lang }: { t: Copy; lang: Lang }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang === 'tr' ? 'tr-TR' : 'en',
    mainEntity: t.services.faq.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }

  return (
    <section className="services-faq section-pad" aria-labelledby="services-faq-title">
      <div className="container services-faq__layout">
        <div className="services-faq__heading js-reveal">
          <p className="eyebrow">Line &amp; İba</p>
          <h3 id="services-faq-title">{t.services.faqTitle}</h3>
        </div>
        <div className="services-faq__list">
          {t.services.faq.map((item, index) => (
            <article className="services-faq__item js-reveal" key={item.question}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h4>{item.question}</h4>
                <p>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </section>
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
                  <img
                    src={partner.image}
                    width="1200"
                    height="1600"
                    alt={partner.name}
                    loading="lazy"
                    decoding="async"
                  />
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
    <section className={`partner-detail${partner.bio ? ' partner-detail--biography' : ''}`}>
      <div className="partner-detail__media js-page-in">
        <img
          src={partner.image}
          width="1200"
          height="1600"
          alt={partner.name}
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="partner-detail__copy">
        <h1 className="js-page-in">{partner.detailTitle ?? partner.name}</h1>
        <p className="partner-role js-page-in">{partner.role}</p>
        {partner.bio
          ? <div className="partner-biography js-page-in">{partner.bio.map((paragraph, index) => {
              const heading = partner.bioHeadings?.find((item) => item.at === index)
              return (
                <div className="partner-biography__entry" key={paragraph}>
                  {heading && <h2>{heading.title}</h2>}
                  <p>{paragraph}</p>
                </div>
              )
            })}</div>
          : <p className="lead js-page-in">{partner.intro}</p>}
        {partner.quote && <blockquote className="js-page-in">{partner.quote}</blockquote>}
        {partner.experience.length > 0 && (
          <ul className="experience-list js-reveal">
            {partner.experience.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <a className="button button--dark js-reveal" href="/hakkimizda" onClick={nav('/hakkimizda')}>
          {t.nav.about}
        </a>
      </div>
    </section>
  )
}

function GalleryPage({
  t,
  nav,
}: {
  t: Copy
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  return (
    <>
      <PageHero title={t.gallery.title} image={images.collectionHero} />
      <GalleryTeaser t={t} nav={nav} isGalleryPage />
      <InstagramFollowBanner t={t} />
    </>
  )
}

function GalleryTeaser({
  t,
  nav,
  isGalleryPage = false,
}: {
  t: Copy
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
  isGalleryPage?: boolean
}) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const videos = Array.from(gridRef.current?.querySelectorAll('video') ?? [])
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const hydrateVideo = (video: HTMLVideoElement, includeSource: boolean) => {
      const poster = video.dataset.poster
      if (poster && !video.poster) video.poster = poster

      const src = video.dataset.src
      if (includeSource && src && !video.getAttribute('src')) {
        video.src = src
        video.load()
      }
    }

    const playVideo = (video: HTMLVideoElement) => {
      hydrateVideo(video, true)
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
          if (entry.isIntersecting) {
            hydrateVideo(video, !reducedMotion)
            if (!reducedMotion) playVideo(video)
          }
          else video.pause()
        })
      },
      { rootMargin: '300px 0px', threshold: 0.01 },
    )

    const handleCanPlay = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement
      const rect = video.getBoundingClientRect()
      if (rect.bottom >= -120 && rect.top <= window.innerHeight + 120) playVideo(video)
    }

    const resumeVisibleVideos = () => {
      if (reducedMotion || document.visibilityState !== 'visible') return
      videos.forEach((video) => {
        const rect = video.getBoundingClientRect()
        if (rect.bottom >= -300 && rect.top <= window.innerHeight + 300) playVideo(video)
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
          <h2>{t.gallery.sectionTitle}</h2>
          <p>{t.gallery.intro}</p>
          {isGalleryPage ? (
            <>
              <p>{t.gallery.purpose}</p>
              <p>{t.gallery.context}</p>
              <p>
                {t.gallery.servicesLead}{' '}
                <a className="section-heading__link" href="/hizmetler" onClick={nav('/hizmetler')}>
                  {t.gallery.servicesLink}
                </a>{' '}
                {t.gallery.bookingLead}{' '}
                <a className="section-heading__link" href="/randevu" onClick={nav('/randevu')}>
                  {t.gallery.bookingLink}
                </a>{' '}
                {t.gallery.detailsSuffix}
              </p>
            </>
          ) : (
            <p>
              <a className="section-heading__link" href="/koleksiyon" onClick={nav('/koleksiyon')}>
                {t.gallery.homeLink}
              </a>
            </p>
          )}
        </div>
        <div className="insta-grid" ref={gridRef}>
          {galleryVideos.map((video, index) => (
            <figure className="video-tile" key={video.src}>
              <video
                data-src={video.src}
                data-poster={video.poster}
                muted
                loop
                playsInline
                preload="none"
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
          <div className="contact-table-wrap js-reveal">
            <h3>{t.contact.infoTitle}</h3>
            <table className="contact-table">
              <thead>
                <tr>
                  <th scope="col">{t.contact.questionLabel}</th>
                  <th scope="col">{t.contact.answerLabel}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">{t.contact.locationQuestion}</th>
                  <td>{t.contact.locationAnswer}</td>
                </tr>
                <tr>
                  <th scope="row">{t.contact.branchesQuestion}</th>
                  <td>{t.contact.branchesAnswer}</td>
                </tr>
                <tr>
                  <th scope="row">{t.contact.address}</th>
                  <td>
                    <a href={contactInfo.mapsUrl} target="_blank" rel="noreferrer">
                      {t.contact.addressDetail}
                    </a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">{t.contact.hoursLabel}</th>
                  <td>{t.contact.hours}</td>
                </tr>
                <tr>
                  <th scope="row">{t.contact.parkingQuestion}</th>
                  <td>{t.contact.parkingAnswer}</td>
                </tr>
                <tr>
                  <th scope="row">{t.contact.hygieneQuestion}</th>
                  <td>{t.contact.hygieneAnswer}</td>
                </tr>
                <tr>
                  <th scope="row">{t.contact.phoneWhatsapp}</th>
                  <td className="contact-table__links">
                    <a href={contactInfo.phoneHref}>{contactInfo.phoneDisplay}</a>
                    <span aria-hidden="true">·</span>
                    <a
                      href={social.whatsappUrl('Merhaba, Line & İba Kuaför için randevu almak istiyorum.')}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {social.whatsappDisplay}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="contact-rating">
              <p>{t.contact.ratingIntro}</p>
              <p>{t.contact.ratingValue}</p>
            </div>
            <a className="button button--dark contact-table__booking" href="/randevu" onClick={nav('/randevu')}>
              {t.book}
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
      <img
        className="page-hero__media js-page-in"
        src={image}
        width="1500"
        height="2000"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        alt=""
      />
      <div className="page-hero__copy">
        <h1 className="js-page-in">{title}</h1>
      </div>
    </section>
  )
}

function CtaBand({
  t,
  nav,
  showInternalLink = false,
}: {
  t: Copy
  nav: (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void
  showInternalLink?: boolean
}) {
  return (
    <section className="cta-band js-reveal">
      <p className="eyebrow">{t.contact.eyebrow}</p>
      <h2>{t.contact.title}</h2>
      {showInternalLink && (
        <a className="cta-band__text-link" href="/randevu" onClick={nav('/randevu')}>
          {t.contact.homeBookingLink}
        </a>
      )}
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
          { label: 'Blog', href: '/blog' },
        ]
      : [
          { label: 'Philosophy', href: '/hakkimizda' },
          { label: 'Services', href: '/hizmetler' },
          { label: 'Collection', href: '/koleksiyon' },
          { label: 'Journal', href: '/blog' },
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
        <img
          className="footer-logo__image"
          src={brand.logoDark}
          width="409"
          height="512"
          loading="lazy"
          decoding="async"
          alt="Line & İba Kuaför"
        />
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
        <p>{isTr ? 'Bilgilerinize ilişkin talepleriniz için bize ulaşabilirsiniz.' : 'You can contact us with requests regarding your personal data.'}</p>
        <p>{isTr ? `Telefon: ${contactInfo.phoneDisplay}` : `Phone: ${contactInfo.phoneDisplay}`}</p>
        <p>WhatsApp: {social.whatsappDisplay}</p>
      </div>
    </section>
  )
}

function getRoute(path: string, partners: Partner[]): { key: 'partner'; partner: Partner } | { key: 'blogPost'; slug: string } | { key: Exclude<RouteKey, 'partner' | 'blogPost'> } {
  const clean = path.replace(/\/$/, '') || '/'
  const partner = partners.find((item) => clean === `/hakkimizda/${item.slug}`)
  if (partner) return { key: 'partner', partner }
  if (clean === '/hizmetler') return { key: 'services' }
  if (clean === '/hakkimizda') return { key: 'about' }
  if (clean === '/koleksiyon') return { key: 'gallery' }
  if (clean === '/blog') return { key: 'blog' }
  if (clean.startsWith('/blog/') && clean.slice(6)) return { key: 'blogPost', slug: clean.slice(6) }
  if (clean === '/iletisim') return { key: 'contact' }
  if (clean === '/randevu') return { key: 'booking' }
  if (clean === '/kvkk') return { key: 'privacy' }
  if (clean === '/yonetim' || clean === '/yonetim/randevular' || clean === '/yonetim/blog') return { key: 'admin' }
  if (!routeOrder.includes(clean.slice(1) as RouteKey)) return { key: 'home' }
  return { key: 'home' }
}

export default App
