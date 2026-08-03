import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
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
    description: "Caddebostan'da saç kesimi, renklendirme, gelin başı, manikür, pedikür ve profesyonel makyaj hizmetlerini inceleyin.",
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
    path: '/iletisim',
    title: 'İletişim | Line & İba Kuaför',
    description: "Caddebostan'daki Line & İba Kuaför'e telefon, WhatsApp veya yol tarifi üzerinden ulaşın; adres ve çalışma saatlerini görüntüleyin.",
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

const templatePath = resolve('dist/index.html')
const template = await readFile(templatePath, 'utf8')

function escapeAttribute(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function withMeta(html, route) {
  const canonical = `${canonicalOrigin}${route.path === '/' ? '/' : route.path}`
  return html
    .replace(/<title>.*?<\/title>/s, `<title>${route.title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/s, `<meta name="description" content="${escapeAttribute(route.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeAttribute(route.title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s, `<meta property="og:description" content="${escapeAttribute(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
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

console.log(`Pre-rendered ${routes.length} public routes.`)
