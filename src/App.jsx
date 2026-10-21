import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from './context/AppContext'
import TabBar from './components/TabBar'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import Editor from './pages/Editor'
import Settings from './pages/Settings'
import Lock from './pages/Lock'
import { IconLock } from './components/icons'

/** 路由深度表:用于推断导航方向(push=从右滑入, pop=从左滑出) */
const DEPTH = { '/': 0, '/editor': 1, '/settings': 1 }

function routeDepth(pathname) {
  if (pathname.startsWith('/article/')) return 1
  return DEPTH[pathname] ?? 0
}

export default function App() {
  const { locked } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const prevPath = useRef(location.pathname)
  const direction = useRef('push')

  // 推断导航方向:深度增加 = push(从右入), 深度减少 = pop(从左入)
  useEffect(() => {
    const prev = prevPath.current
    const curr = location.pathname
    if (prev !== curr) {
      direction.current = routeDepth(curr) >= routeDepth(prev) ? 'push' : 'pop'
      prevPath.current = curr
    }
  }, [location.pathname])

  // 切页时回到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  if (locked) return <Lock />

  const pageClass = `page page-${direction.current}`

  return (
    <div className="app">
      {/* 路由出口:pathname 变化时触发重新挂载,播放过渡动画 */}
      <div key={location.pathname} className={pageClass}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <div className="empty-state">
                <div className="icon">🧭</div>
                <div className="t">页面不存在</div>
              </div>
            }
          />
        </Routes>
      </div>
      <TabBar />
      {locked && (
        <div
          style={{
            position: 'fixed', bottom: 'calc(20px + env(safe-area-inset-bottom))',
            left: 0, right: 0, textAlign: 'center', color: 'var(--text-3)',
            fontSize: 12, display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center',
          }}
        >
          <IconLock size={13} /> MiniFlow 已加密锁定
        </div>
      )}
    </div>
  )
}

/** 暴露导航函数给子组件(可选) */
export { useNavigate }
