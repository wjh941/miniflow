import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { IconSearch, IconChevron } from '../components/icons'

/** 按月份分组的文章列表(iOS 分组列表风格) */
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
            <div className="group-header">{monthLabel(month)}</div>
            <div className="group">
              {list.map((p) => (
                <button key={p.id} className="row article-row" onClick={() => navigate(`/article/${p.id}`)}>
                  <span className="grow">
                    <span className="a-title">{p.title}</span>
                    <span className="a-excerpt">{(p.content || '').slice(0, 60) || '(空)'}</span>
                    <span className="a-meta">
                      <span>{p.createdAt}</span>
                      {p.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="a-tag">{t}</span>
                      ))}
                      {p.updatedAt && p.updatedAt !== p.createdAt && <span>已编辑</span>}
                    </span>
                  </span>
                  <span className="chevron"><IconChevron /></span>
                </button>
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
