import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { exportJSON, exportAllMarkdown, importJSON } from '../lib/store'
import { IconDownload, IconUpload, IconFile } from '../components/icons'

function Row({ icon, label, sub, onClick, children, danger }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="row" onClick={onClick} style={danger ? { color: 'var(--red)' } : undefined}>
      <span className="grow">
        <span className="title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}{label}
        </span>
        {sub && <span className="sub" style={{ display: 'block' }}>{sub}</span>}
      </span>
      {children}
    </Tag>
  )
}

export default function Settings() {
  const { posts, settings, setSettings, lockEnabled, enableLock, lock, disableLock, replaceAll } = useApp()
  const fileRef = useRef(null)
  const [notice, setNotice] = useState('')
  const [pcStep, setPcStep] = useState(null) // null | 'set1' | 'set2'
  const [pc1, setPc1] = useState('')
  const [pc2, setPc2] = useState('')
  const [confirmOff, setConfirmOff] = useState(false)

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 2500)
  }

  const setTheme = (theme) => setSettings((s) => ({ ...s, theme }))

  const doImport = async (file) => {
    try {
      const imported = await importJSON(file)
      if (posts.length && !confirm('本机已有 ' + posts.length + ' 篇笔记,导入将合并(同 id 会覆盖)。继续?')) return
      const existing = new Set(posts.map((p) => p.id))
      const merged = [...imported.filter((p) => !existing.has(p.id)), ...posts]
      await replaceAll(merged)
      flash(`已导入 ${imported.length} 篇`)
    } catch (e) {
      flash('导入失败:' + e.message)
    }
  }

  const submitPasscode = async () => {
    if (pc1.length < 4) return flash('口令至少 4 位')
    if (pc1 !== pc2) return flash('两次输入不一致')
    await enableLock(pc1)
    flash('私密锁已开启')
    setPcStep(null)
    setPc1('')
    setPc2('')
  }

  return (
    <>
      <div className="large-title-wrap">
        <div className="large-title">设置</div>
      </div>
      <div className="content">
        <div className="group-header">外观</div>
        <div className="group">
          <Row label="外观">
            <div className="segmented" style={{ margin: 0, width: 180 }}>
              {[
                ['auto', '自动'],
                ['light', '浅色'],
                ['dark', '深色'],
              ].map(([v, l]) => (
                <button key={v} className={settings.theme === v ? 'on' : ''} onClick={() => setTheme(v)}>
                  {l}
                </button>
              ))}
            </div>
          </Row>
        </div>

        <div className="group-header">私密锁</div>
        <div className="group">
          {pcStep === null && (
            <Row
              icon="🔒"
              label={lockEnabled ? '已开启 · 点击立即锁定' : '口令锁'}
              sub={
                lockEnabled
                  ? '文章以 AES-GCM 加密存储,刷新页面需重新解锁'
                  : '开启后文章加密存储,打开需输入口令'
              }
              onClick={() => {
                if (lockEnabled) lock()
                else setPcStep('set1')
              }}
            >
              <span className="switch">
                <input
                  type="checkbox"
                  checked={lockEnabled}
                  onChange={() => (lockEnabled ? setConfirmOff(true) : setPcStep('set1'))}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="track" />
                <span className="thumb" />
              </span>
            </Row>
          )}

          {pcStep === 'set1' && (
            <>
              <Row label="设置口令(至少 4 位)">
                <input
                  type="password"
                  value={pc1}
                  onChange={(e) => setPc1(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', textAlign: 'right', width: 160, fontSize: 15 }}
                  autoFocus
                />
              </Row>
              <Row label="再输入一次">
                <input
                  type="password"
                  value={pc2}
                  onChange={(e) => setPc2(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', textAlign: 'right', width: 160, fontSize: 15 }}
                />
              </Row>
              <Row
                label="确认开启"
                sub="⚠ 口令不可恢复:忘记 = 无法解密。开启前建议先导出一份明文备份。"
                onClick={submitPasscode}
              >
                <span className="chevron">完成</span>
              </Row>
              <Row label="取消" onClick={() => { setPcStep(null); setPc1(''); setPc2('') }} />
            </>
          )}

          {confirmOff && (
            <>
              <Row
                label="确认关闭私密锁?"
                sub="关闭后文章将以明文存储在本机浏览器。"
                onClick={() => { disableLock(); setConfirmOff(false); flash('私密锁已关闭(明文已保留)') }}
              >
                <span className="chevron" style={{ color: 'var(--red)' }}>确认关闭</span>
              </Row>
              <Row label="取消" onClick={() => setConfirmOff(false)} />
            </>
          )}
        </div>

        <div className="group-header">数据</div>
        <div className="group">
          <Row icon={<IconDownload size={16} color="var(--blue)" />} label="导出备份(JSON)" sub="全部文章 · 换设备/定期备份用" onClick={() => { exportJSON(posts); flash('已导出 JSON 备份') }}>
            <span className="chevron">导出</span>
          </Row>
          <Row icon={<IconFile size={16} color="var(--blue)" />} label="导出全部 Markdown" sub="所有笔记合并为一个 .md 文件" onClick={() => { exportAllMarkdown(posts); flash('已导出 Markdown') }}>
            <span className="chevron">导出</span>
          </Row>
          <Row icon={<IconUpload size={16} color="var(--blue)" />} label="导入备份(JSON)" sub="选择之前导出的备份文件,合并导入" onClick={() => fileRef.current?.click()}>
            <span className="chevron">导入</span>
          </Row>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) doImport(e.target.files[0])
              e.target.value = ''
            }}
          />
        </div>

        <div className="group-header">关于</div>
        <div className="group">
          <Row label="MiniFlow" sub={`v2.0 · 私人笔记博客 · React 18 + PWA${posts.length ? ` · ${posts.length} 篇笔记` : ''}`}>
            <span className="value">本地存储</span>
          </Row>
          <Row label="数据在哪里?" sub="全部数据只保存在你这台设备的浏览器里,没有任何服务器。定期导出备份。">
            <span />
          </Row>
        </div>

        {notice && (
          <div style={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', background: 'var(--card)', color: 'var(--text)', borderRadius: 10, padding: '8px 18px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 200 }}>
            {notice}
          </div>
        )}
      </div>
    </>
  )
}
