import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { loadEnv } from 'vite'
import { render } from '../.prerender/entry-server.js'

const canonicalOrigin = 'https://www.lineiba.com'
const routes = [
  {
    path: '/',
    title: 'Line & İba Kuaför | Caddebostan Kadın Kuaförü',
    description: "Line & İba Kuaför, Caddebostan'da saç kesimi, renklendirme, gelin başı, tırnak ve makyaj hizmetleri sunan kadın kuaförüdür.",
  },
  {
    path: '/hizmetler',
    title: 'Hizmetler | Line & İba Kuaför',
    description: "Caddebostan'da saç kesimi, renklendirme, keratin bakımı, saç botoksu, mikro kaynak, kalıcı fön, gelin başı ve makyaj hizmetlerini inceleyin.",
  },
  {
    path: '/hakkimizda',
    title: 'Hakkımızda | Line & İba Kuaför',
    description: "Line & İba Kuaför'ün hikâyesini ve kurucu ortakları Ahmet Yılmaz, Ergün Sarıca ve İbrahim Yılmaz'ı tanıyın.",
  },
  {
    path: '/hakkimizda/ahmet-yilmaz',
    title: 'Ahmet Yılmaz | Line & İba Kuaför',
    description: "Line & İba Kuaför kurucu ortağı Ahmet Yılmaz'ın mesleki deneyimini ve saç tasarımına yaklaşımını keşfedin.",
  },
  {
    path: '/hakkimizda/ergun-sarica',
    title: 'Ergün Sarıca | Line & İba Kuaför',
    description: "Line & İba Kuaför kurucu ortağı Ergün Sarıca'nın mesleki deneyimini ve saç sanatındaki yolculuğunu keşfedin.",
  },
  {
    path: '/hakkimizda/ibrahim-yilmaz',
    title: 'İbrahim Yılmaz | Line & İba Kuaför',
    description: "Line & İba Kuaför kurucu ortağı İbrahim Yılmaz'ın mesleki deneyimini ve kişiye özel kesim yaklaşımını keşfedin.",
  },
  {
    path: '/koleksiyon',
    title: 'Koleksiyon | Line & İba Kuaför',
    description: "Line & İba Kuaför salonundaki saç uygulamalarından, renklendirmelerden ve final görünümlerinden seçilmiş çalışmaları inceleyin.",
  },
  {
    path: '/blog',
    title: 'Saç Bakımı ve Stil Rehberi | Line & İba Blog',
    description: 'Saç bakımı, kesim, renklendirme ve stil hakkında Line & İba Kuaför profesyonellerinden güncel rehberler ve uzman önerileri.',
  },
  {
    path: '/iletisim',
    title: 'İletişim | Line & İba Kuaför',
    description: "Bağdat Caddesi, Caddebostan ve Göztepe–Kadıköy hattındaki Line & İba Kuaför'ün adres, çalışma saatleri, telefon ve WhatsApp bilgilerini görüntüleyin.",
  },
  {
    path: '/randevu',
    title: 'Randevu | Line & İba Kuaför',
    description: "Line & İba Kuaför'de saç, renklendirme, bakım, tırnak veya makyaj hizmeti için online randevu oluşturun.",
  },
  {
    path: '/kvkk',
    title: 'KVKK Aydınlatma Metni | Line & İba Kuaför',
    description: "Line & İba Kuaför online randevu sisteminde kişisel verilerin işlenmesi, saklanması ve korunmasına ilişkin bilgilendirme.",
  },
]

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '')
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY
let publishedBlogs = []

if (supabaseUrl && supabaseKey) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/blogs?select=slug,title,excerpt,meta_title,meta_description,canonical_url,og_image_url,cover_image_url,updated_at&status=eq.published&order=published_at.desc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    publishedBlogs = await response.json()
    for (const post of publishedBlogs) {
      routes.push({
        path: `/blog/${post.slug}`,
        title: post.meta_title || `${post.title} | Line & İba`,
        description: post.meta_description || post.excerpt,
        canonical: post.canonical_url,
        image: post.og_image_url || post.cover_image_url,
        type: 'article',
      })
    }
  } catch (error) {
    console.warn(`Published blog metadata could not be loaded: ${error instanceof Error ? error.message : error}`)
  }
}

const templatePath = resolve('dist/index.html')
const template = await readFile(templatePath, 'utf8')

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeHtml(value) {
  return escapeAttribute(value).replaceAll("'", '&#39;')
}

function withMeta(html, route) {
  const canonical = route.canonical || `${canonicalOrigin}${route.path === '/' ? '/' : route.path}`
  const escapedCanonical = escapeAttribute(canonical)
  return html
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${escapeAttribute(route.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${escapedCanonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeAttribute(route.title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${escapeAttribute(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${escapedCanonical}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${route.type || 'website'}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeAttribute(route.image || `${canonicalOrigin}/assets/photos/home-hero.webp`)}" />`)
}

for (const route of routes) {
  const appHtml = render(route.path)
  const html = withMeta(template, route).replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered-path="${route.path}">${appHtml}</div>`,
  )
  const outputPath = route.path === '/'
    ? templatePath
    : resolve('dist', route.path.slice(1), 'index.html')
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html)
}

await rm(resolve('.prerender'), { recursive: true, force: true })

if (publishedBlogs.length) {
  const sitemapPath = resolve('dist/sitemap.xml')
  const sitemap = await readFile(sitemapPath, 'utf8')
  const dynamicUrls = publishedBlogs.map((post) => `  <url>\n    <loc>${canonicalOrigin}/blog/${post.slug}</loc>\n    <lastmod>${post.updated_at.slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n')
  await writeFile(sitemapPath, sitemap.replace('</urlset>', `${dynamicUrls}\n</urlset>`))
}

console.log(`Pre-rendered ${routes.length} public routes (${publishedBlogs.length} blog posts).`)
