import type { SupabaseClient } from '@supabase/supabase-js'

export type BlogStatus = 'draft' | 'published'
export type BlogLanguage = 'tr' | 'en'

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  cover_image_alt: string | null
  author_name: string
  category: string
  tags: string[]
  language: BlogLanguage
  status: BlogStatus
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  og_image_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export type BlogDraft = Pick<BlogPost,
  'title' | 'slug' | 'excerpt' | 'content' | 'cover_image_url' | 'cover_image_alt' |
  'author_name' | 'category' | 'tags' | 'language' | 'status' | 'is_featured' |
  'meta_title' | 'meta_description' | 'canonical_url' | 'og_image_url'
>

const postColumns = 'id,title,slug,excerpt,content,cover_image_url,cover_image_alt,author_name,category,tags,language,status,is_featured,meta_title,meta_description,canonical_url,og_image_url,created_by,created_at,updated_at,published_at'

export function slugify(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replaceAll('ı', 'i').replaceAll('ğ', 'g').replaceAll('ü', 'u')
    .replaceAll('ş', 's').replaceAll('ö', 'o').replaceAll('ç', 'c')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

export async function getPublishedPosts(client: SupabaseClient, language: BlogLanguage) {
  const { data, error } = await client
    .from('blogs')
    .select(postColumns)
    .eq('status', 'published')
    .eq('language', language)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as BlogPost[]
}

export async function getPublishedPost(client: SupabaseClient, slug: string) {
  const { data, error } = await client
    .from('blogs')
    .select(postColumns)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) throw error
  return data as unknown as BlogPost | null
}

export async function getAdminPosts(client: SupabaseClient) {
  const { data, error } = await client.from('blogs').select(postColumns).order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as BlogPost[]
}

export async function saveBlogPost(client: SupabaseClient, userId: string, id: string | null, draft: BlogDraft) {
  if (id) {
    const { data, error } = await client.from('blogs').update(draft).eq('id', id).select(postColumns).single()
    if (error) throw error
    return data as unknown as BlogPost
  }
  const { data, error } = await client.from('blogs').insert({ ...draft, created_by: userId }).select(postColumns).single()
  if (error) throw error
  return data as unknown as BlogPost
}

export async function deleteBlogPost(client: SupabaseClient, id: string) {
  const { error } = await client.from('blogs').delete().eq('id', id)
  if (error) throw error
}

export async function uploadBlogImage(client: SupabaseClient, userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'webp'
  const path = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await client.storage.from('blog-media').upload(path, file, { cacheControl: '31536000' })
  if (error) throw error
  return client.storage.from('blog-media').getPublicUrl(path).data.publicUrl
}

export function sanitizeBlogHtml(html: string) {
  if (typeof document === 'undefined') return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  const allowed = new Set(['P', 'BR', 'H2', 'H3', 'H4', 'STRONG', 'EM', 'U', 'S', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A'])
  for (const element of Array.from(parsed.body.querySelectorAll('*'))) {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      continue
    }
    const href = element.tagName === 'A' ? element.getAttribute('href') : null
    for (const attribute of Array.from(element.attributes)) element.removeAttribute(attribute.name)
    if (element.tagName === 'A' && href && /^(https?:|mailto:|tel:|\/)/i.test(href)) {
      element.setAttribute('href', href)
      if (/^https?:/i.test(href)) {
        element.setAttribute('target', '_blank')
        element.setAttribute('rel', 'noopener noreferrer')
      }
    }
  }
  return parsed.body.innerHTML
}

export function plainTextFromHtml(html: string) {
  if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, ' ')
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  return parsed.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
}
