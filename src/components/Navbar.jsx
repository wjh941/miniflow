import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="logo">
          <span className="logo-mark">⚡</span> MiniFlow
        </Link>

        <div className="navbar-right">
          <Link to="/editor" className="btn btn-primary btn-sm">
            ✏️ 写文章
          </Link>

          {user ? (
            <>
              <span className="avatar" title={user.name}>
                {user.name.charAt(0)}
              </span>
              <span className="username">{user.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
