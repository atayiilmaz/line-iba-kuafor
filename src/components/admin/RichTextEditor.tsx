import { forwardRef, useImperativeHandle, useState } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

export type RichTextEditorHandle = {
  getHTML: () => string
}

type RichTextEditorProps = {
  initialContent: string
  language: 'tr' | 'en'
  onChange: (html: string) => void
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor(
  { initialContent, language, onChange },
  ref,
) {
  const [wordCount, setWordCount] = useState(() => countWords(initialContent))
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Placeholder.configure({ placeholder: 'Yazınızı buraya yazmaya başlayın…' }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-editor__document',
        dir: 'ltr',
        lang: language,
        spellcheck: 'true',
        'aria-label': 'Blog yazısı içeriği',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML()
      setWordCount(countWords(currentEditor.getText()))
      onChange(html)
    },
  })

  useImperativeHandle(ref, () => ({
    getHTML: () => editor?.getHTML() ?? initialContent,
  }), [editor, initialContent])

  const active = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      paragraph: currentEditor?.isActive('paragraph') ?? false,
      heading2: currentEditor?.isActive('heading', { level: 2 }) ?? false,
      heading3: currentEditor?.isActive('heading', { level: 3 }) ?? false,
      bold: currentEditor?.isActive('bold') ?? false,
      italic: currentEditor?.isActive('italic') ?? false,
      bulletList: currentEditor?.isActive('bulletList') ?? false,
      orderedList: currentEditor?.isActive('orderedList') ?? false,
      blockquote: currentEditor?.isActive('blockquote') ?? false,
      link: currentEditor?.isActive('link') ?? false,
    }),
  })

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Bağlantı adresi (https://…)', previousUrl ?? 'https://')
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run()
  }

  if (!editor) return <div className="rich-editor__loading">Editör hazırlanıyor…</div>

  return <div className="rich-editor">
    <div className="rich-editor__top">
      <span>Yazı İçeriği</span>
      <small>{wordCount} kelime · yaklaşık {Math.max(1, Math.ceil(wordCount / 220))} dk</small>
    </div>
    <div className="rich-editor__toolbar" role="toolbar" aria-label="Metin biçimlendirme">
      <ToolbarButton label="Paragraf" active={active?.paragraph} onClick={() => editor.chain().focus().setParagraph().run()} />
      <ToolbarButton label="H2" active={active?.heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton label="H3" active={active?.heading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <ToolbarButton label="B" title="Kalın" active={active?.bold} onClick={() => editor.chain().focus().toggleBold().run()} className="is-bold" />
      <ToolbarButton label="I" title="İtalik" active={active?.italic} onClick={() => editor.chain().focus().toggleItalic().run()} className="is-italic" />
      <ToolbarButton label="• Liste" active={active?.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton label="1. Liste" active={active?.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton label="Alıntı" active={active?.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton label={active?.link ? 'Bağlantıyı Düzenle' : 'Bağlantı'} active={active?.link} onClick={setLink} />
      <ToolbarButton label="Temizle" title="Biçimlendirmeyi temizle" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
      <span className="rich-editor__toolbar-spacer" />
      <ToolbarButton label="↶" title="Geri al" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
      <ToolbarButton label="↷" title="Yinele" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
    </div>
    <EditorContent className="rich-editor__canvas" editor={editor} />
  </div>
})

function ToolbarButton({ label, title, active = false, disabled = false, className = '', onClick }: { label: string; title?: string; active?: boolean; disabled?: boolean; className?: string; onClick: () => void }) {
  return <button
    type="button"
    className={`${className}${active ? ' is-active' : ''}`}
    title={title ?? label}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
  >{label}</button>
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length
}
