import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { exportPostMarkdown } from '../lib/store'
import { IconEdit, IconTrash, IconDownload } from '../components/icons'

/** 正文渲染:## 开头渲染为小标题,![alt](src) 渲染为图片,空行分段,保留换行 */
function renderBody(content) {
  const blocks = String(content || '').split(/\n\n+/)
  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (/^##\s/.test(trimmed)) {
      return <h2 key={i}>{trimmed.replace(/^##\s+/, '')}</h2>
    }
    if (trimmed === '---') return <hr key={i} />
    // 代码块:```lang ... ```
    if (trimmed.startsWith('```')) {
      const code = trimmed.replace(/^```\w*\n?/, '').replace(/\n?```$/, '')
      return (
        <pre key={i} className="code-block"><code>{code}</code></pre>
      )
    }
    // 提示框:> 💡 或 > ⚠ 或 > ✅
    const callout = trimmed.match(/^>\s*(💡|⚠️?|✅|❌)\s*(.*)$/s)
    if (callout) {
      const icons = { '💡': '💡', '⚠': '⚠️', '⚠️': '⚠️', '✅': '✅', '❌': '❌' }
      const tone = callout[1] === '⚠' || callout[1] === '⚠️' ? 'warn' : callout[1] === '❌' ? 'bad' : 'tip'
      return (
        <div key={i} className={`callout callout-${tone}`}>
          <span className="callout-icon">{icons[callout[1]] || '💡'}</span>
          <span>{renderInline(callout[2])}</span>
        </div>
      )
    }
    // 无序列表:- 开头(连续多行)
    if (/^[-•]\s/m.test(trimmed) && trimmed.split('\n').every(l => /^[-•]\s/.test(l.trim()))) {
      const items = trimmed.split('\n').map(l => l.replace(/^[-•]\s+/, '').trim())
      return (
        <div key={i} className="bullet-list">
          {items.map((item, j) => <div key={j} className="bullet-item">{renderInline(item)}</div>)}
        </div>
      )
    }
    // 有序列表:1. 开头
    if (/^\d+\.\s/m.test(trimmed) && trimmed.split('\n').every(l => /^\d+\.\s/.test(l.trim()))) {
      const items = trimmed.split('\n').map(l => l.replace(/^\d+\.\s+/, '').trim())
      return (
        <div key={i} className="numbered-list">
          {items.map((item, j) => (
            <div key={j} className="numbered-item">
              <span className="num-badge">{j + 1}</span>
              {renderInline(item)}
            </div>
          ))}
        </div>
      )
    }
    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (img) {
      return (
        <p key={i} style={{ textAlign: 'center', margin: '14px 0' }}>
          <img
            src={img[2]}
            alt={img[1]}
            style={{ maxWidth: '100%', borderRadius: 'var(--radius)', border: '0.5px solid var(--sep)' }}
            loading="lazy"
          />
        </p>
      )
    }
    return (
      <p key={i}>
        {renderInline(trimmed).map((el, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {el}
          </span>
        ))}
      </p>
    )
  })
}

/** 内联格式:**文字** 加粗 + `代码` 高亮 */
function renderInline(text) {
  return String(text || '').split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="inline-code">{part.slice(1, -1)}</code>
    return part
  })
}

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { posts, remove } = useApp()
  const post = posts.find((p) => p.id === id)
  const [confirming, setConfirming] = useState(false)

  if (!post) {
    return (
      <div className="content reader">
        <div className="empty-state">
          <div className="icon">🫥</div>
          <div className="t">这篇笔记不存在或已删除</div>
        </div>
      </div>
    )
  }

  const doDelete = () => {
    remove(post.id)
    navigate('/')
  }

  return (
    <div className="content reader">
      <h1>{post.title}</h1>
      <div className="meta">
        {post.createdAt}
        {post.updatedAt && post.updatedAt !== post.createdAt && ' · 已编辑'}
      </div>
      <div className="body">{renderBody(post.content)}</div>
      {post.tags?.length > 0 && (
        <div className="tags">{post.tags.map((t) => <span key={t}>#{t}</span>)}</div>
      )}
      <div className="reader-actions">
        <button className="btn small plain" onClick={() => navigate(`/editor?id=${post.id}`)}>
          <IconEdit /> 编辑
        </button>
        <button className="btn small plain" onClick={() => exportPostMarkdown(post)}>
          <IconDownload /> 导出 .md
        </button>
        <button className="btn small danger" onClick={() => setConfirming(true)}>
          <IconTrash /> 删除
        </button>
      </div>

      {confirming && (
        <div className="sheet-mask" onClick={() => setConfirming(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button className="sheet-row danger" onClick={doDelete}>确认删除「{post.title.slice(0, 12)}{post.title.length > 12 ? '…' : ''}」？</button>
            <button className="sheet-row sheet-cancel" onClick={() => setConfirming(false)}>取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
