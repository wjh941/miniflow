import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Editor() {
  const [params] = useSearchParams()
  const editId = params.get('id')
  const navigate = useNavigate()
  const { posts, publish, update } = useApp()
  const existing = editId ? posts.find((p) => p.id === editId) : null

  const [title, setTitle] = useState(existing?.title || '')
  const [tags, setTags] = useState((existing?.tags || []).join(', '))
  const [content, setContent] = useState(existing?.content || '')
  const [saving, setSaving] = useState(false)
  const draftKey = useMemo(() => `miniflow_draft_${editId || 'new'}`, [editId])
  const restored = useRef(false)

  // 草稿自动保存(本地,发布/取消后清除)
  useEffect(() => {
    if (existing) return // 编辑已有文章不需要草稿
    try {
      const draft = localStorage.getItem(draftKey)
      if (draft && !restored.current) {
        const d = JSON.parse(draft)
        setTitle(d.title || '')
        setTags(d.tags || '')
        setContent(d.content || '')
        restored.current = true
      }
    } catch { /* ignore */ }
  }, [draftKey, existing])

  useEffect(() => {
    if (existing) return
    const timer = setTimeout(() => {
      if (title || content) localStorage.setItem(draftKey, JSON.stringify({ title, tags, content }))
    }, 500)
    return () => clearTimeout(timer)
  }, [title, tags, content, draftKey, existing])

  const clearDraft = () => localStorage.removeItem(draftKey)

  const submit = async () => {
    if (!title.trim() && !content.trim()) return
    setSaving(true)
    const tagList = tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
    if (existing) {
      await update(existing.id, { title: title.trim() || '无标题', tags: tagList, content })
    } else {
      await publish({ title, tags: tagList, content })
      clearDraft()
    }
    setSaving(false)
    navigate(existing ? `/article/${existing.id}` : '/')
  }

  const words = content.replace(/\s/g, '').length

  return (
    <>
      <div className="topbar">
        <div className="topbar-row">
          <button className="text-btn" onClick={() => { clearDraft(); navigate(-1) }}>取消</button>
          <span className="topbar-title">{existing ? '编辑笔记' : '新笔记'}</span>
          <button className="text-btn" onClick={submit} disabled={saving || (!title.trim() && !content.trim())}>
            {saving ? '保存中…' : '完成'}
          </button>
        </div>
      </div>
      <div className="content" style={{ paddingTop: 16 }}>
        <div className="field">
          <input
            placeholder="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: 22, fontWeight: 700, border: 'none', padding: '0 2px', background: 'none' }}
            maxLength={80}
          />
        </div>
        <div className="field">
          <input
            placeholder="标签(用逗号分隔,可留空)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{ fontSize: 14, background: 'none', border: 'none', padding: '0 2px', color: 'var(--blue)' }}
            maxLength={60}
          />
        </div>
        <div className="field">
          <textarea
            placeholder="写点什么…(空行分段,## 开头渲染为小标题)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="count">{words} 字 · 自动保存草稿</div>
        </div>
      </div>
    </>
  )
}
