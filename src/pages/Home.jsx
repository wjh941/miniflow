import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { IconSearch, IconChevron } from '../components/icons'

/** 根据标题生成稳定的渐变色索引 */
function gradientFor(title) {
  const palettes = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#ff9a9e', '#fecfef'],
    ['#ffecd2', '#fcb69f'],
    ['#a8edea', '#fed6e3'],
    ['#96fbc4', '#f9f586'],
  ]
  let hash = 0
  for (const ch of title) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  const [from, to] = palettes[Math.abs(hash) % palettes.length]
  return `linear-gradient(135deg, ${from}, ${to})`
}

/** 估算阅读时长(中文约 400 字/分钟) */
function readTime(text) {
  const len = (text || '').replace(/\s/g, '').length
  return Math.max(1, Math.ceil(len / 400))
}

export default function Home() {
  const { posts } = useApp()
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('全部')
  const navigate = useNavigate()

  const allTags = useMemo(() => {
    const set = new Set()
    posts.forEach((p) => p.tags?.forEach((t) => set.add(t)))
    return ['全部', ...[...set]]
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const okTag = tag === '全部' || p.tags?.includes(tag)
      const okQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.content || '').toLowerCase().includes(q)
      return okTag && okQ
    })
  }, [posts, query, tag])

  // 按月分组
  const groups = useMemo(() => {
    const map = new Map()
    for (const p of filtered) {
      const month = (p.createdAt || '').slice(0, 7) || '未知'
      if (!map.has(month)) map.set(month, [])
      map.get(month).push(p)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  return (
    <>
      <div className="large-title-wrap">
        <div className="large-title">笔记</div>
      </div>
      <div className="content">
        <div className="search">
          <span className="icon"><IconSearch /></span>
          <input
            placeholder="搜索标题或正文…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {allTags.length > 2 && (
          <div className="segmented">
            {allTags.map((t) => (
              <button key={t} className={t === tag ? 'on' : ''} onClick={() => setTag(t)}>
                {t}
              </button>
            ))}
          </div>
        )}

        {groups.length === 0 && (
          <div className="empty-state">
            <div className="icon">📝</div>
            <div className="t">{posts.length === 0 ? '还没有写过笔记' : '没有匹配的笔记'}</div>
            <div className="s">{posts.length === 0 ? '点下方「写作」记录第一篇' : '换个关键词或标签试试'}</div>
          </div>
        )}

        {groups.map(([month, list]) => (
          <div key={month}>
            <div className="group-header">{monthLabel(month)} · {list.length} 篇</div>
            <div className="card-grid">
              {list.map((p, i) => (
                <ArticleCard key={p.id} post={p} index={i} onClick={() => navigate(`/article/${p.id}`)} />
              ))}
            </div>
          </div>
        ))}

        {posts.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 16 }}>
            共 {posts.length} 篇 · 保存在本机浏览器
          </p>
        )}
      </div>
    </>
  )
}

function monthLabel(ym) {
  if (ym === '未知') return ym
  const [y, m] = ym.split('-')
  return `${y} 年 ${Number(m)} 月`
}

function ArticleCard({ post, onClick, index }) {
  const gradient = gradientFor(post.title || '')
  const excerpt = (post.content || '').replace(/##\s?/g, '').replace(/\n/g, ' ').trim().slice(0, 72)
  const minutes = readTime(post.content)
  return (
    <div className="article-card" onClick={onClick} style={{ animationDelay: `${index * 0.04}s` }}>
      <div className="card-gradient" style={{ background: gradient }}>
        <span className="card-date">{post.createdAt}</span>
        <span className="card-read">{minutes} min</span>
      </div>
      <div className="card-body">
        <div className="card-title">{post.title}</div>
        <div className="card-excerpt">{excerpt}{excerpt.length >= 72 ? '…' : ''}</div>
        {post.tags?.length > 0 && (
          <div className="card-tags">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="card-tag">{t}</span>
            ))}
          </div>
        )}
      </div>
      <div className="card-chevron"><IconChevron /></div>
    </div>
  )
}

// readTime 定义在文件顶部(L27),此处不重复声明