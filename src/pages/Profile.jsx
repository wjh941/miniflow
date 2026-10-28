import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

/** 读取跨产品共享测试结果 */
function readSharedResults() {
  try {
    return JSON.parse(localStorage.getItem('testlab_shared_results') || '[]')
  } catch { return [] }
}

/** 生成渐变色（由产品名+测试名哈希） */
function gradientFor(product, test) {
  const palettes = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
    ['#ff9a9e', '#fecfef'],
  ]
  let hash = 0
  for (const ch of (product + test)) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  const [from, to] = palettes[Math.abs(hash) % palettes.length]
  return `linear-gradient(135deg, ${from}, ${to})`
}

/** 生成分析 prompt */
function buildPrompt(results) {
  const scene = { love: '恋爱雷区演练', hr: 'HR 面试演练', rental: '租房避坑演练', tony: 'Tony 摊牌演练', boss: '老板沟通演练' }
  const lines = results.map(r => {
    const name = r.result && r.result !== 'completed'
      ? r.result
      : (scene[r.test] ? `完成${scene[r.test]}(未记录具体评分)` : '完成测评(未记录具体评分)')
    return `- [${r.product}] ${r.test}：${name}${r.match > 0 ? `（匹配度 ${r.match}%）` : ''}`
  }).join('\n')
  return `你是一位专业的心理分析师。用户在你的多款心理测评产品中完成了以下测试，结果如下：

${lines}

请生成一段 250-350 字的个性化分析，结构如下：
1. **综合人格画像**（结合所有测评结果的共性，用 2-3 个关键词概括）
2. **跨测评洞察**（不同测试之间有什么有趣的关联或反差）
3. **一条具体行动建议**（基于分析结果给出可操作的建议）

风格：温和、有洞察力、不说教。像一位懂心理学的朋友在跟你聊天。直接输出分析内容，不要加"以下是分析"之类的引导语。`
}

export default function Profile() {
  const [results, setResults] = useState([])
  const [analysis, setAnalysis] = useState(() => {
    try { return localStorage.getItem('miniflow_profile_analysis') || '' } catch { return '' }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiKey, setApiKey] = useState(() => {
    try { return localStorage.getItem('miniflow_llm_key') || '' } catch { return '' }
  })
  const [baseUrl, setBaseUrl] = useState(() => {
    try { return localStorage.getItem('miniflow_llm_url') || 'https://api.deepseek.com/v1' } catch { return 'https://api.deepseek.com/v1' }
  })
  const [model, setModel] = useState(() => {
    try { return localStorage.getItem('miniflow_llm_model') || 'deepseek-chat' } catch { return 'deepseek-chat' }
  })

  useEffect(() => {
    setResults(readSharedResults())
  }, [])

  const generate = async () => {
    if (!results.length) { setError('没有测试结果可以分析'); return }
    if (!apiKey.trim()) { setError('请先在上方填入 API Key'); return }
    setLoading(true)
    setError('')
    try {
      const prompt = buildPrompt(results)
      const res = await fetch(baseUrl.replace(/\/+$/, '') + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 800,
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 120)}`)
      }
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ''
      setAnalysis(content)
      try { localStorage.setItem('miniflow_profile_analysis', content) } catch { /* ignore */ }
    } catch (e) {
      setError(e.message || '请求失败')
    } finally {
      setLoading(false)
    }
  }

  const productLabel = { mythos: '神话人格', whoyouare: '三合一测评', 'seven-sanctum': '七宗罪×七美德', 'survival-guide': '求生指南', whoami: 'SOUL ATLAS' }

  /** 测试结果展示文案:completed 这类占位结果转成友好描述 */
  function resultLabel(r) {
    if (r.result && r.result !== 'completed') return r.result
    const scene = { love: '恋爱雷区演练', hr: 'HR 面试演练', rental: '租房避坑演练', tony: 'Tony 摊牌演练', boss: '老板沟通演练' }
    const sceneName = r.test && scene[r.test] ? scene[r.test] : ''
    return sceneName ? `完成「${sceneName}」` : '完成测评'
  }

  return (
    <>
      <div className="large-title-wrap">
        <div className="large-title">我的画像</div>
      </div>
      <div className="content">
        {/* 测试结果列表 */}
        {results.length > 0 && (
          <div className="group">
            <div className="group-header">测试档案 · {results.length} 条</div>
            {results.map((r, i) => (
              <div key={i} className="profile-result-card">
                <div className="prc-gradient" style={{ background: gradientFor(r.product, r.test) }} />
                <div className="prc-body">
                  <div className="prc-product">{productLabel[r.product] || r.product}</div>
                  <div className="prc-result">{resultLabel(r)}</div>
                  <div className="prc-meta">{r.date}{r.match > 0 && ` · 匹配度 ${r.match}%`}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && (
          <div className="empty-state">
            <div className="icon">📊</div>
            <div className="t">还没有测试结果</div>
            <div className="s">去完成一个测评，结果会自动出现在这里</div>
          </div>
        )}

        {/* AI 分析区域 */}
        <div className="group">
          <div className="group-header">AI 个性化分析</div>
          <div className="profile-settings">
            <div className="field" style={{ marginBottom: 10 }}>
              <label>LLM API Key（仅存本机浏览器）</label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={e => {
                  setApiKey(e.target.value)
                  try { localStorage.setItem('miniflow_llm_key', e.target.value) } catch { /* ignore */ }
                }}
              />
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>API Base URL</label>
              <input
                placeholder="https://api.deepseek.com/v1"
                value={baseUrl}
                onChange={e => {
                  setBaseUrl(e.target.value)
                  try { localStorage.setItem('miniflow_llm_url', e.target.value) } catch { /* ignore */ }
                }}
              />
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>模型名称</label>
              <input
                placeholder="deepseek-chat"
                value={model}
                onChange={e => {
                  setModel(e.target.value)
                  try { localStorage.setItem('miniflow_llm_model', e.target.value) } catch { /* ignore */ }
                }}
              />
            </div>
          </div>
          <div style={{ padding: '0 16px 14px' }}>
            <button
              className="btn"
              onClick={generate}
              disabled={loading || !results.length}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  分析中…
                </span>
              ) : '✨ 生成 AI 画像分析'}
            </button>
          </div>
          {error && (
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{
                background: 'rgba(255, 59, 48, 0.08)', borderLeft: '3px solid var(--red)',
                borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--red)',
              }}>
                ⚠️ {error}
              </div>
            </div>
          )}
          {analysis && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{
                background: 'rgba(52, 199, 89, 0.08)', borderLeft: '3px solid var(--green)',
                borderRadius: 10, overflow: 'hidden',
              }}>
                <div style={{ fontWeight: 600, fontSize: 14, padding: '12px 14px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🔮</span> 你的画像分析
                </div>
                <div className="analysis-block" style={{ padding: '8px 14px 14px' }}>{analysis}</div>
              </div>
              <button
                className="text-btn"
                style={{ marginTop: 8, fontSize: 13 }}
                onClick={() => {
                  try { localStorage.removeItem('miniflow_profile_analysis'); setAnalysis('') } catch { /* ignore */ }
                }}
              >
                清除分析结果
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
