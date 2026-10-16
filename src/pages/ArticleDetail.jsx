import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getArticle, isLiked, likeCount, toggleLike, user, remove } = useApp()

  const article = getArticle(id)

  if (!article) {
    return (
      <div className="empty">
        <p>😳 文章不存在或已被删除</p>
        <Link to="/" className="btn btn-primary">
          返回首页
        </Link>
      </div>
    )
  }

  const liked = isLiked(article.id)
  const isMine = user && article.author === user.name
  const blocks = article.content.split('\n\n')
  const readMinutes = Math.max(1, Math.round(article.content.replace(/\s/g, '').length / 400))

  const handleDelete = () => {
    if (window.confirm(`确定删除《${article.title}》吗？`)) {
      remove(article.id)
      navigate('/')
    }
  }

  return (
    <article className="detail">
      <Link to="/" className="back-link">
        ← 返回首页
      </Link>

      <h1 className="detail-title">{article.title}</h1>

      <div className="detail-meta">
        <span className="avatar">{article.author.charAt(0)}</span>
        <div>
          <div className="author-name">{article.author}</div>
          <div className="muted">
            {article.createdAt} · 约 {readMinutes} 分钟阅读
          </div>
        </div>

        {isMine && (
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            删除
          </button>
        )}
      </div>

      <div className="tag-row">
        {article.tags.map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="detail-content">
        {blocks.map((block, i) =>
          block.startsWith('## ') ? (
            <h2 key={i}>{block.slice(3)}</h2>
          ) : (
            <p key={i}>{block}</p>
          )
        )}
      </div>

      <div className="detail-like">
        <button
          className={`like-btn like-btn-lg ${liked ? 'liked' : ''}`}
          onClick={() => toggleLike(article.id)}
        >
          {liked ? '❤️ 已赞' : '🤍 点赞'} · {likeCount(article)}
        </button>
      </div>
    </article>
  )
}
