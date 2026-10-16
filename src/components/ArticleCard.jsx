import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function ArticleCard({ article }) {
  const { isLiked, likeCount, toggleLike } = useApp()
  const liked = isLiked(article.id)
  const excerpt = article.content.replace(/[#\n]/g, ' ').trim().slice(0, 90)

  return (
    <article className="card article-card">
      <div className="card-body">
        <Link to={`/article/${article.id}`} className="card-title">
          {article.title}
        </Link>
        <p className="excerpt">{excerpt}…</p>
        <div className="tag-row">
          {article.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <div className="author-info">
          <span className="avatar avatar-sm">{article.author.charAt(0)}</span>
          <span>{article.author}</span>
          <span className="dot">·</span>
          <span>{formatDate(article.createdAt)}</span>
        </div>

        <button
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={() => toggleLike(article.id)}
          title={liked ? '取消点赞' : '点赞'}
        >
          {liked ? '❤️' : '🤍'} {likeCount(article)}
        </button>
      </div>
    </article>
  )
}
