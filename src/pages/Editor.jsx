import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Editor() {
  const { user, publish } = useApp()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  // 没登录先去登录（路由守卫的最简形态）
  if (!user) {
    return (
      <div className="empty">
        <p>✍️ 写文章前请先登录</p>
        <Link to="/login" className="btn btn-primary">
          去登录
        </Link>
      </div>
    )
  }

  const handleSubmit = e => {
    e.preventDefault()

    if (!title.trim()) return setError('标题不能为空')
    if (content.trim().length < 20) return setError('正文至少写 20 个字吧')
    setError('')

    const post = publish({
      title: title.trim(),
      tags: tags.split(/[,，]/),
      content: content.trim(),
    })
    navigate(`/article/${post.id}`)
  }

  return (
    <div className="editor">
      <h1>发布新文章</h1>
      <p className="muted">发布后保存在你的浏览器里，刷新不会丢失</p>

      <form onSubmit={handleSubmit} className="editor-form">
        <label>
          标题
          <input
            type="text"
            placeholder="一句话说清文章主题"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </label>

        <label>
          标签（用逗号分隔）
          <input
            type="text"
            placeholder="例如：React, 入门"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </label>

        <label>
          正文（空行分段，## 开头会渲染成小标题）
          <textarea
            rows={14}
            placeholder="写下你的第一篇博客…"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </label>

        {error && <p className="form-error">⚠️ {error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            发布
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            取消
          </button>
        </div>
      </form>
    </div>
  )
}
