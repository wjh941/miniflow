import { useMemo, useState } from 'react'
import ArticleCard from '../components/ArticleCard'
import { useApp } from '../context/AppContext'

export default function Home() {
  const { articles } = useApp()
  const [keyword, setKeyword] = useState('')
  const [activeTag, setActiveTag] = useState('全部')

  // 从所有文章里收集不重复的标签
  const tags = useMemo(
    () => ['全部', ...new Set(articles.flatMap(a => a.tags))],
    [articles]
  )

  const filtered = articles.filter(a => {
    const hitTag = activeTag === '全部' || a.tags.includes(activeTag)
    const kw = keyword.trim().toLowerCase()
    const hitKeyword =
      !kw ||
      a.title.toLowerCase().includes(kw) ||
      a.content.toLowerCase().includes(kw)
    return hitTag && hitKeyword
  })

  return (
    <div>
      <section className="hero">
        <h1>MiniFlow 轻博客</h1>
        <p>一个用 React 构建的迷你博客社区 —— 这就是你将要学会做的东西</p>
      </section>

      <div className="toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="搜索文章标题或内容…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>

      <div className="tag-filter">
        {tags.map(tag => (
          <button
            key={tag}
            className={`chip ${activeTag === tag ? 'chip-active' : ''}`}
            onClick={() => setActiveTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="article-list">
        {filtered.map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty">
          <p>😱 没有找到匹配的文章</p>
          <p className="muted">换个关键词或标签试试</p>
        </div>
      )}
    </div>
  )
}
