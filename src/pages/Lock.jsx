import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { IconLock } from '../components/icons'

export default function Lock() {
  const { unlock } = useApp()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  const submit = async () => {
    if (!passcode || busy) return
    setBusy(true)
    setError('')
    try {
      await unlock(passcode)
      sessionStorage.removeItem('miniflow_session_pc')
      // unlock 成功后 AppContext 的 locked 变 false,自动进入主页
    } catch (e) {
      setError(e.message || '口令不正确')
      setPasscode('')
      inputRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="lockscreen">
      <div className="lock-icon"><IconLock size={30} /></div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>MiniFlow 已加密</div>
      <div style={{ fontSize: 14, color: 'var(--text-2)', textAlign: 'center' }}>
        输入口令解锁你的笔记<br />
        <span style={{ fontSize: 12 }}>数据以 AES-GCM 加密存储在本机</span>
      </div>
      <input
        ref={inputRef}
        type="password"
        inputMode="text"
        autoFocus
        placeholder="口令"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <div className="err">{error}</div>
      <button className="btn" style={{ maxWidth: 300 }} onClick={submit} disabled={busy || !passcode}>
        {busy ? '解锁中…' : '解锁'}
      </button>
    </div>
  )
}
