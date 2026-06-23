import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callFunction } from '../lib/api'
import { supabase } from '../lib/supabase'
import { type FileData, type AnalysisContent } from '../types'

export default function Analysis() {
  const { id: fileId } = useParams<{ id: string }>()
  const { session, dbUser } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'url' | 'manual'>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<FileData[]>([])
  const [selected, setSelected] = useState<FileData | null>(null)

  useEffect(() => {
    supabase
      .from('file_data')
      .select('*')
      .eq('file_id', fileId!)
      .eq('data_type', 'page_analysis')
      .order('created_at', { ascending: false })
      .then(({ data }) => setHistory(data ?? []))
  }, [fileId])

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let inputText = text
      let source: 'url' | 'manual' = mode

      if (mode === 'url') {
        const scrapeRes = await callFunction<{ text: string; fallback: boolean; error?: string }>(
          'scrape-page',
          { url },
          session!.access_token
        )
        if (scrapeRes.fallback) {
          setError(scrapeRes.error ?? '无法抓取，请手动粘贴内容')
          setMode('manual')
          setLoading(false)
          return
        }
        inputText = scrapeRes.text
      }

      const result = await callFunction<AnalysisContent & { id: string }>(
        'analyze-page',
        { file_id: fileId, text: inputText, source, input_url: mode === 'url' ? url : undefined },
        session!.access_token
      )

      const newEntry: FileData = {
        id: result.id,
        file_id: fileId!,
        data_type: 'page_analysis',
        content: result,
        created_at: new Date().toISOString(),
      }
      setHistory((prev) => [newEntry, ...prev])
      setSelected(newEntry)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '分析失败')
    } finally {
      setLoading(false)
    }
  }

  const content = selected?.content as AnalysisContent | undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(`/file/${fileId}`)} className="text-gray-400 hover:text-gray-600 text-sm">← 返回</button>
        <h1 className="text-lg font-bold">Page 分析</h1>
        <span className="text-sm text-gray-400 ml-auto">{dbUser?.token_balance.toLocaleString()} tokens 余额</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Input form */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex gap-2 mb-4">
            {(['url', 'manual'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${mode === m ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {m === 'url' ? '网址抓取' : '手动输入'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAnalyze} className="space-y-3">
            {mode === 'url' ? (
              <input
                type="url"
                placeholder="https://www.facebook.com/pagename"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <textarea
                placeholder="粘贴竞品的帖子文案、简介或任何营销内容..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '分析中...' : '开始分析 (-2000 tokens)'}
            </button>
          </form>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">历史分析</h2>
            <div className="space-y-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${selected?.id === item.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                >
                  {new Date(item.created_at).toLocaleString('zh-CN')} — {(item.content as AnalysisContent).source === 'url' ? '网址抓取' : '手动输入'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {content && (
          <div className="bg-white rounded-xl border p-5 space-y-5">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">分析摘要</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{content.analysis}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">SWOT 分析</h3>
              <div className="grid grid-cols-2 gap-3">
                {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((key) => {
                  const labels = { strengths: '💪 优势', weaknesses: '⚠️ 劣势', opportunities: '🌱 机会', threats: '⚡ 威胁' }
                  const colors = { strengths: 'bg-green-50 border-green-200', weaknesses: 'bg-red-50 border-red-200', opportunities: 'bg-blue-50 border-blue-200', threats: 'bg-amber-50 border-amber-200' }
                  return (
                    <div key={key} className={`rounded-lg border p-3 ${colors[key]}`}>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">{labels[key]}</h4>
                      <ul className="space-y-1">
                        {(content.swot[key] ?? []).map((item, i) => (
                          <li key={i} className="text-xs text-gray-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
            <button
              onClick={() => navigate(`/file/${fileId}/copy`)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              用此分析生成文案 →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
