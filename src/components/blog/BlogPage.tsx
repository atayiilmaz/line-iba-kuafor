import { useEffect, useMemo, useState } from 'react'
import type { Lang } from '../../data/site'
import { getPublishedPost, getPublishedPosts, sanitizeBlogHtml, type BlogPost } from '../../lib/blog'
import { getSupabaseClient } from '../../lib/supabaseClient'
import './BlogPage.css'

type NavHandler = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => void

const copy = {
  tr: {
    eyebrow: 'Line & İba Notları', title: 'Saçın dilini konuşan notlar.',
    intro: 'Bakım ritüelleri, renk rehberleri ve salon profesyonellerinden zamansız öneriler.',
    all: 'Tüm Yazılar', read: 'Yazıyı Oku', minutes: 'dk okuma', empty: 'Henüz yayınlanmış bir yazı bulunmuyor.',
    error: 'Yazılar şu anda yüklenemiyor.', back: 'Tüm yazılara dön', notFound: 'Bu yazı bulunamadı.',
    share: 'Bu rehberi paylaş', appointment: 'Saçınız için kişisel bir plan oluşturalım.', book: 'Randevu Al',
  },
  en: {
    eyebrow: 'Line & İba Journal', title: 'Notes that speak the language of hair.',
    intro: 'Care rituals, colour guides and timeless advice from salon professionals.',
    all: 'All Stories', read: 'Read Story', minutes: 'min read', empty: 'There are no published stories yet.',
    error: 'Stories cannot be loaded right now.', back: 'Back to all stories', notFound: 'This story could not be found.',
    share: 'Share this guide', appointment: 'Let us create a personal plan for your hair.', book: 'Book Now',
  },
} as const

export function BlogPage({ lang, nav }: { lang: Lang; nav: NavHandler }) {
  const t = copy[lang]
  const client = useMemo(() => getSupabaseClient(), [])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => applyMeta({
    title: lang === 'tr' ? 'Saç Bakımı ve Stil Rehberi | Line & İba Blog' : 'Hair Care & Style Journal | Line & İba',
    description: lang === 'tr' ? 'Saç bakımı, kesim, renklendirme ve stil hakkında Line & İba Kuaför profesyonellerinden güncel rehberler ve uzman önerileri.' : 'Current guides and professional advice on hair care, cuts, colour and styling from Line & İba.',
    canonical: 'https://www.lineiba.com/blog',
    type: 'website',
  }), [lang])

  useEffect(() => {
    let active = true
    if (!client) { setLoading(false); setError(true); return }
    setLoading(true); setError(false)
    void getPublishedPosts(client, lang).then((items) => {
      if (active) setPosts(items)
    }).catch(() => {
      if (active) setError(true)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [client, lang])

  const featured = posts.find((post) => post.is_featured) ?? posts[0]
  const remaining = posts.filter((post) => post.id !== featured?.id)

  return <div className="blog-page">
    <section className="blog-masthead">
      <div className="container">
        <p className="eyebrow js-page-in">{t.eyebrow}</p>
        <h1 className="js-page-in">{t.title}</h1>
        <p className="blog-masthead__intro js-page-in">{t.intro}</p>
      </div>
    </section>

    <section className="blog-feed section-pad" aria-labelledby="blog-feed-title">
      <div className="container">
        <div className="blog-feed__head js-reveal">
          <h2 id="blog-feed-title">{t.all}</h2>
          <span>{String(posts.length).padStart(2, '0')}</span>
        </div>
        {loading && <BlogSkeleton />}
        {!loading && error && <p className="blog-state" role="alert">{t.error}</p>}
        {!loading && !error && !featured && <p className="blog-state">{t.empty}</p>}
        {featured && <article className="blog-feature blog-data-in">
          <BlogImage post={featured} />
          <div className="blog-feature__copy">
            <PostMeta post={featured} lang={lang} minutesLabel={t.minutes} />
            <h2>{featured.title}</h2>
            <p>{featured.excerpt}</p>
            <a className="blog-link" href={`/blog/${featured.slug}`} onClick={nav(`/blog/${featured.slug}`)}>{t.read}<span>↗</span></a>
          </div>
        </article>}
        {remaining.length > 0 && <div className="blog-grid">
          {remaining.map((post, index) => <article className="blog-card blog-data-in" key={post.id}>
            <a className="blog-card__image" href={`/blog/${post.slug}`} onClick={nav(`/blog/${post.slug}`)}><BlogImage post={post} /></a>
            <div className="blog-card__index">{String(index + 2).padStart(2, '0')}</div>
            <PostMeta post={post} lang={lang} minutesLabel={t.minutes} />
            <h3><a href={`/blog/${post.slug}`} onClick={nav(`/blog/${post.slug}`)}>{post.title}</a></h3>
            <p>{post.excerpt}</p>
            <a className="blog-link" href={`/blog/${post.slug}`} onClick={nav(`/blog/${post.slug}`)}>{t.read}<span>↗</span></a>
          </article>)}
        </div>}
      </div>
    </section>
  </div>
}

export function BlogDetailPage({ slug, lang, nav }: { slug: string; lang: Lang; nav: NavHandler }) {
  const t = copy[lang]
  const client = useMemo(() => getSupabaseClient(), [])
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    if (!client) { setLoading(false); setError(true); return }
    setLoading(true); setError(false)
    void getPublishedPost(client, slug).then((item) => {
      if (active) setPost(item)
    }).catch(() => {
      if (active) setError(true)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [client, slug])

  useBlogMeta(post)

  if (loading) return <div className="blog-detail-state"><BlogSkeleton /></div>
  if (error || !post) return <section className="blog-detail-state"><p className="eyebrow">404 / Blog</p><h1>{error ? t.error : t.notFound}</h1><a className="button button--dark" href="/blog" onClick={nav('/blog')}>{t.back}</a></section>

  const canonical = post.canonical_url || `https://www.lineiba.com/blog/${post.slug}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: post.title, description: post.meta_description || post.excerpt,
    image: post.og_image_url || post.cover_image_url || undefined,
    datePublished: post.published_at, dateModified: post.updated_at,
    author: { '@type': 'Person', name: post.author_name },
    publisher: { '@type': 'Organization', name: 'Line & İba Kuaför', logo: { '@type': 'ImageObject', url: 'https://www.lineiba.com/assets/logo/logo-dark-optimized.webp' } },
    mainEntityOfPage: canonical, inLanguage: post.language === 'tr' ? 'tr-TR' : 'en',
  }

  return <article className="blog-article">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <header className="blog-article__header">
      <div className="container">
        <a className="blog-back blog-data-in" href="/blog" onClick={nav('/blog')}>← {t.back}</a>
        <PostMeta post={post} lang={lang} minutesLabel={t.minutes} />
        <h1 className="blog-data-in">{post.title}</h1>
        <p className="blog-article__lead blog-data-in">{post.excerpt}</p>
      </div>
    </header>
    {post.cover_image_url && <figure className="blog-article__cover blog-data-in"><img src={post.cover_image_url} alt={post.cover_image_alt || post.title} width="1600" height="900" fetchPriority="high" /></figure>}
    <div className="blog-article__layout container">
      <aside className="blog-article__aside blog-data-in"><span>{post.author_name}</span><time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at, lang)}</time><button type="button" onClick={() => void sharePost(post)}>{t.share} ↗</button></aside>
      <div className="blog-prose blog-data-in" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }} />
    </div>
    <section className="blog-article__cta blog-data-in"><p className="eyebrow">Line &amp; İba</p><h2>{t.appointment}</h2><a className="button button--light" href="/randevu" onClick={nav('/randevu')}>{t.book}</a></section>
  </article>
}

function useBlogMeta(post: BlogPost | null) {
  useEffect(() => {
    if (!post) return
    const title = post.meta_title || `${post.title} | Line & İba`
    const description = post.meta_description || post.excerpt
    const canonical = post.canonical_url || `https://www.lineiba.com/blog/${post.slug}`
    return applyMeta({ title, description, canonical, type: 'article', image: post.og_image_url || post.cover_image_url || undefined })
  }, [post])
}

function applyMeta(values: { title: string; description: string; canonical: string; type: string; image?: string }) {
  const selectors = ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="og:type"]', 'meta[property="og:image"]']
  const previousTitle = document.title
  const canonicalNode = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  const previousCanonical = canonicalNode?.href
  const previous = new Map(selectors.map((selector) => [selector, document.querySelector<HTMLMetaElement>(selector)?.content]))
  document.title = values.title
  const set = (selector: string, value: string | undefined) => {
    const node = document.querySelector<HTMLMetaElement>(selector)
    if (node && value) node.content = value
  }
  set(selectors[0], values.description); set(selectors[1], values.title); set(selectors[2], values.description)
  set(selectors[3], values.canonical); set(selectors[4], values.type); set(selectors[5], values.image)
  canonicalNode?.setAttribute('href', values.canonical)
  return () => {
    document.title = previousTitle
    for (const selector of selectors) {
      const value = previous.get(selector)
      const node = document.querySelector<HTMLMetaElement>(selector)
      if (node && value !== undefined) node.content = value
    }
    if (previousCanonical) canonicalNode?.setAttribute('href', previousCanonical)
  }
}

function BlogImage({ post }: { post: BlogPost }) {
  return post.cover_image_url
    ? <img src={post.cover_image_url} alt={post.cover_image_alt || post.title} width="1200" height="760" loading="lazy" decoding="async" />
    : <div className="blog-image-placeholder"><span>Line &amp; İba</span><b>{post.category}</b></div>
}

function PostMeta({ post, lang, minutesLabel }: { post: BlogPost; lang: Lang; minutesLabel: string }) {
  const words = post.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.ceil(words / 220))
  return <div className="blog-meta"><span>{post.category}</span><time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at, lang)}</time><span>{minutes} {minutesLabel}</span></div>
}

function formatDate(value: string | null, lang: Lang) {
  if (!value) return ''
  return new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value))
}

async function sharePost(post: BlogPost) {
  const url = `${window.location.origin}/blog/${post.slug}`
  if (navigator.share) await navigator.share({ title: post.title, text: post.excerpt, url })
  else await navigator.clipboard.writeText(url)
}

function BlogSkeleton() {
  return <div className="blog-skeleton" aria-busy="true" aria-label="Yükleniyor"><i /><div><i /><i /><i /></div></div>
}
