import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ArticleDetail from './pages/ArticleDetail'
import Editor from './pages/Editor'
import Login from './pages/Login'

export default function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<div className="empty">🧭 页面不存在</div>} />
        </Routes>
      </main>

      <footer className="footer">
        MiniFlow MVP · 用 React + Vite 构建 · 数据保存在浏览器 localStorage
      </footer>
    </div>
  )
}
