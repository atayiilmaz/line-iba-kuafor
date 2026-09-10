import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import {
  deleteBlogPost, getAdminPosts, sanitizeBlogHtml, saveBlogPost, slugify, uploadBlogImage,
  type BlogDraft, type BlogPost, type BlogStatus,
} from '../../lib/blog'
import './BlogManager.css'
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor'

const emptyDraft: BlogDraft = {
  title: '', slug: '', excerpt: '', content: '<p></p>', cover_image_url: null, cover_image_alt: null,
  author_name: 'Line & İba', category: 'Saç Rehberi', tags: [], language: 'tr', status: 'draft',
  is_featured: false, meta_title: null, meta_description: null, canonical_url: null, og_image_url: null,
}

export function BlogManager({ client, session }: { client: SupabaseClient; session: Session }) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BlogDraft>(emptyDraft)
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const editorRef = useRef<RichTextEditorHandle>(null)
  const editorHtmlRef = useRef(emptyDraft.content)

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try { setPosts(await getAdminPosts(client)) }
    catch { setError('Blog yazıları yüklenemedi. Yönetici yetkisini ve bağlantıyı kontrol edin.') }
    finally { setLoading(false) }
  }, [client])

  useEffect(() => { void refresh() }, [refresh])

  const choosePost = (post: BlogPost) => {
    editorHtmlRef.current = post.content
    setSelectedId(post.id)
    setDraft({
      title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
      cover_image_url: post.cover_image_url, cover_image_alt: post.cover_image_alt,
      author_name: post.author_name, category: post.category, tags: post.tags, language: post.language,
      status: post.status, is_featured: post.is_featured, meta_title: post.meta_title,
      meta_description: post.meta_description, canonical_url: post.canonical_url, og_image_url: post.og_image_url,
    })
    setSlugTouched(true); setMessage(''); setError(''); setPreview(false)
  }

  const createNew = () => {
    editorHtmlRef.current = emptyDraft.content
    setSelectedId(null); setDraft(emptyDraft); setSlugTouched(false); setMessage(''); setError(''); setPreview(false)
  }

  const update = <K extends keyof BlogDraft>(key: K, value: BlogDraft[K]) => setDraft((current) => ({ ...current, [key]: value }))

  const updateTitle = (title: string) => {
    setDraft((current) => ({ ...current, title, slug: slugTouched ? current.slug : slugify(title), meta_title: current.meta_title || null }))
  }

  const save = async (status: BlogStatus = draft.status) => {
    setMessage(''); setError('')
    const editorContent = editorRef.current?.getHTML() ?? editorHtmlRef.current ?? draft.content
    const clean = { ...draft, status, slug: slugify(draft.slug), content: sanitizeBlogHtml(editorContent), title: draft.title.trim(), excerpt: draft.excerpt.trim() }
    if (clean.title.length < 3 || !clean.slug || !clean.excerpt || clean.content.replace(/<[^>]+>/g, '').trim().length < 20) {
      setError('Başlık, URL, özet ve en az 20 karakterlik yazı içeriği zorunludur.'); return
    }
    if (status === 'published' && !clean.cover_image_url) {
      setError('Yayınlamadan önce bir kapak görseli ekleyin.'); return
    }
    setBusy(true)
    try {
      const saved = await saveBlogPost(client, session.user.id, selectedId, clean)
      editorHtmlRef.current = clean.content
      setSelectedId(saved.id); setDraft({ ...clean }); setMessage(status === 'published' ? 'Yazı yayınlandı.' : 'Taslak kaydedildi.')
      await refresh()
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : ''
      setError(detail.includes('duplicate') ? 'Bu URL adresi başka bir yazıda kullanılıyor.' : 'Yazı kaydedilemedi. Alanları ve bağlantıyı kontrol edin.')
    } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!selectedId || !window.confirm('Bu blog yazısı kalıcı olarak silinsin mi?')) return
    setBusy(true); setError('')
    try {
      const savedPost = posts.find((post) => post.id === selectedId)
      await deleteBlogPost(client, selectedId, [
        savedPost?.cover_image_url,
        savedPost?.og_image_url,
        draft.cover_image_url,
        draft.og_image_url,
      ])
      createNew()
      await refresh()
    } catch { setError('Yazı ve medya silme işlemi tamamlanamadı. Listeyi yenileyip tekrar deneyin.') }
    finally { setBusy(false) }
  }

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('JPG, PNG, WebP veya AVIF biçiminde, en fazla 8 MB görsel seçin.'); return
    }
    setUploading(true); setError('')
    try { update('cover_image_url', await uploadBlogImage(client, session.user.id, file)) }
    catch { setError('Görsel yüklenemedi.') }
    finally { setUploading(false); event.target.value = '' }
  }

  const togglePreview = () => {
    if (!preview) {
      const content = editorRef.current?.getHTML() ?? editorHtmlRef.current
      editorHtmlRef.current = content
      setDraft((current) => ({ ...current, content }))
    }
    setPreview((value) => !value)
  }

  return <section className="blog-admin">
    <aside className="blog-admin__sidebar">
      <div className="blog-admin__sidebar-head"><div><p className="eyebrow">İçerik</p><h2>Yazılar</h2></div><button type="button" onClick={createNew}>+ Yeni</button></div>
      <div className="blog-admin__filters"><span>{posts.length} yazı</span><span>{posts.filter((post) => post.status === 'published').length} yayında</span></div>
      {loading && <p className="blog-admin__empty">Yazılar yükleniyor…</p>}
      {!loading && posts.length === 0 && <p className="blog-admin__empty">İlk blog yazınızı oluşturun.</p>}
      <div className="blog-admin__posts">
        {posts.map((post) => <button className={selectedId === post.id ? 'is-active' : ''} type="button" key={post.id} onClick={() => choosePost(post)}>
          <span className={`is-${post.status}`}>{post.status === 'published' ? 'Yayında' : 'Taslak'}</span>
          <strong>{post.title}</strong><small>{post.category} · {new Intl.DateTimeFormat('tr-TR').format(new Date(post.updated_at))}</small>
        </button>)}
      </div>
    </aside>

    <div className="blog-editor">
      <header className="blog-editor__head">
        <div><p className="eyebrow">{selectedId ? 'Yazıyı Düzenle' : 'Yeni Yazı'}</p><h2>{draft.title || 'İsimsiz taslak'}</h2></div>
        <div className="blog-editor__actions">
          {selectedId && <button type="button" className="is-danger" onClick={() => void remove()} disabled={busy}>Sil</button>}
          <button type="button" onClick={togglePreview}>{preview ? 'Editöre Dön' : 'Önizle'}</button>
          <button type="button" onClick={() => void save('draft')} disabled={busy}>{busy ? 'Kaydediliyor…' : 'Taslak Kaydet'}</button>
          <button className="button button--dark" type="button" onClick={() => void save('published')} disabled={busy}>{busy ? 'Kaydediliyor…' : draft.status === 'published' ? 'Güncelle' : 'Yayınla'}</button>
        </div>
      </header>
      {error && <div className="admin-alert" role="alert">{error}</div>}
      {message && <div className="blog-admin__success" role="status">{message}</div>}

      {preview ? <div className="blog-preview">
        {draft.cover_image_url && <img src={draft.cover_image_url} alt={draft.cover_image_alt || ''} />}
        <p className="eyebrow">{draft.category}</p><h1>{draft.title || 'Yazı başlığı'}</h1><p className="lead">{draft.excerpt}</p>
        <div className="blog-prose" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(draft.content) }} />
      </div> : <div className="blog-editor__form">
        <section className="blog-editor__main">
          <label className="admin-field"><span>Yazı Başlığı</span><input value={draft.title} maxLength={180} onChange={(event) => updateTitle(event.target.value)} placeholder="Okurun aradığı net ve güçlü bir başlık" /></label>
          <div className="blog-slug"><span>lineiba.com/blog/</span><input aria-label="Yazı URL adresi" value={draft.slug} onChange={(event) => { setSlugTouched(true); update('slug', slugify(event.target.value)) }} /></div>
          <label className="admin-field"><span>Kısa Özet <b>{draft.excerpt.length}/500</b></span><textarea rows={3} maxLength={500} value={draft.excerpt} onChange={(event) => update('excerpt', event.target.value)} placeholder="Liste görünümünde ve arama sonuçlarında yazıyı özetleyin." /></label>
          <RichTextEditor
            key={selectedId ?? 'new'}
            ref={editorRef}
            initialContent={draft.content}
            language={draft.language}
            onChange={(html) => { editorHtmlRef.current = html }}
          />
        </section>

        <aside className="blog-editor__settings">
          <EditorPanel title="Yayın Ayarları">
            <label className="admin-field"><span>Dil</span><select value={draft.language} onChange={(event) => update('language', event.target.value as 'tr' | 'en')}><option value="tr">Türkçe</option><option value="en">English</option></select></label>
            <label className="admin-field"><span>Kategori</span><input maxLength={80} value={draft.category} onChange={(event) => update('category', event.target.value)} /></label>
            <label className="admin-field"><span>Yazar</span><input value={draft.author_name} onChange={(event) => update('author_name', event.target.value)} /></label>
            <label className="admin-field"><span>Etiketler</span><input value={draft.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="bakım, renk, trend" /></label>
            <label className="blog-check"><input type="checkbox" checked={draft.is_featured} onChange={(event) => update('is_featured', event.target.checked)} /><span>Blog sayfasında öne çıkar</span></label>
          </EditorPanel>
          <EditorPanel title="Kapak Görseli">
            {draft.cover_image_url ? <div className="blog-cover-preview"><img src={draft.cover_image_url} alt="Kapak önizleme" /><button type="button" onClick={() => update('cover_image_url', null)}>Kaldır</button></div> : <label className="blog-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void upload(event)} disabled={uploading} /><span>{uploading ? 'Yükleniyor…' : 'Görsel Yükle'}</span><small>JPG, PNG, WebP veya AVIF · en fazla 8 MB</small></label>}
            <label className="admin-field"><span>Görsel Alt Metni</span><input maxLength={180} value={draft.cover_image_alt ?? ''} onChange={(event) => update('cover_image_alt', event.target.value || null)} placeholder="Görseli erişilebilir biçimde anlatın" /></label>
          </EditorPanel>
          <EditorPanel title="Google Önizlemesi">
            <div className="seo-preview"><span>lineiba.com › blog › {draft.slug || 'yazi-urlsi'}</span><strong>{draft.meta_title || draft.title || 'SEO başlığı'}</strong><p>{draft.meta_description || draft.excerpt || 'Arama sonuçlarında gösterilecek açıklama.'}</p></div>
            <label className="admin-field"><span>SEO Başlığı <b>{(draft.meta_title ?? '').length}/70</b></span><input maxLength={70} value={draft.meta_title ?? ''} onChange={(event) => update('meta_title', event.target.value || null)} /></label>
            <label className="admin-field"><span>Meta Açıklama <b>{(draft.meta_description ?? '').length}/170</b></span><textarea rows={3} maxLength={170} value={draft.meta_description ?? ''} onChange={(event) => update('meta_description', event.target.value || null)} /></label>
            <label className="admin-field"><span>Canonical URL</span><input type="url" value={draft.canonical_url ?? ''} onChange={(event) => update('canonical_url', event.target.value || null)} placeholder="Boşsa yazının kendi adresi kullanılır" /></label>
            <label className="admin-field"><span>Sosyal Paylaşım Görseli URL</span><input type="url" value={draft.og_image_url ?? ''} onChange={(event) => update('og_image_url', event.target.value || null)} placeholder="Boşsa kapak görseli kullanılır" /></label>
          </EditorPanel>
        </aside>
      </div>}
    </div>
  </section>
}

function EditorPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="editor-panel"><h3>{title}</h3>{children}</section>
}
