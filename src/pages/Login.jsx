import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (!name.trim()) return setError('给自己起个昵称吧')
    login(name.trim())
    navigate('/')
  }

  return (
    <div className="login">
      <h1>登录 MiniFlow</h1>
      <p className="muted">
        MVP 版本使用模拟登录：输入昵称即可，身份信息只保存在你自己的浏览器里。
      </p>

      <form onSubmit={handleSubmit} className="editor-form">
        <label>
          昵称
          <input
            type="text"
            placeholder="例如：前端练习生"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>

        {error && <p className="form-error">⚠️ {error}</p>}

        <button type="submit" className="btn btn-primary btn-block">
          进入社区
        </button>
      </form>
    </div>
  )
}
