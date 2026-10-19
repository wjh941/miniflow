import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { exportPostMarkdown } from '../lib/store'
import { IconEdit, IconTrash, IconDownload } from '../components/icons'

/** 正文渲染:## 开头渲染为小标题,空行分段,保留换行 */
function renderBody(content) {
  const blocks = String(content || '').split(/\n\n+/)
  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (/^##\s/.test(trimmed)) {
      return <h2 key={i}>{trimmed.replace(/^##\s+/, '')}</h2>
    }
    if (trimmed === '---') return <hr key={i} />
    return (
      <p key={i}>
        {trimmed.split('\n').map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    )
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
