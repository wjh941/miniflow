import { Route, Routes } from 'react-router-dom'
import { useApp } from './context/AppContext'
import TabBar from './components/TabBar'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import Editor from './pages/Editor'
import Settings from './pages/Settings'
import Lock from './pages/Lock'
import { IconLock } from './components/icons'

export default function App() {
  const { locked } = useApp()

  if (locked) return <Lock />

  return (
    <div className="app">
      <Routes>
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
      {!locked && <TabBar />}
      {locked && (
        <div style={{ position: 'fixed', bottom: 'calc(20px + env(safe-area-inset-bottom))', left: 0, right: 0, textAlign: 'center', color: 'var(--text-3)', fontSize: 12, display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center' }}>
          <IconLock size={13} /> MiniFlow 已加密锁定
        </div>
      )}
    </div>
  )
}
