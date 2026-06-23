import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callFunction } from '../lib/api'
import { supabase } from '../lib/supabase'
import { type FileData, type AnalysisContent, type CopyContent } from '../types'

export default function Copy() {
  const { id: fileId } = useParams<{ id: string }>()
  const { session, dbUser } = useAuth()
  const navigate = useNavigate()

  const [analyses, setAnalyses] = useState<FileData[]>([])
  const [copies, setCopies] = useState<FileData[]>([])
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCopy, setSelectedCopy] = useState<FileData | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('file_data').select('*').eq('file_id', fileId!).eq('data_type', 'page_analysis').order('created_at', { ascending: false }),
      supabase.from('file_data').select('*').eq('file_id', fileId!).eq('data_type', 'copy').order('created_at', { ascending: false }),
    ]).then(([{ data: a }, { data: c }]) => {
      setAnalyses(a ?? [])
      setCopies(c ?? [])
      if (a && a.length > 0) setSelectedAnalysis(a[0].id)
      if (c && c.length > 0) setSelectedCopy(c[0])
    })
  }, [fileId])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await callFunction<{ id: string; versions: CopyContent['versions'] }>(
        'generate-copy',
        { file_id: fileId, analysis_id: selectedAnalysis },
        session!.access_token
      )
      const newEntry: FileData = {
        id: result.id,
        file_id: fileId!,
        data_type: 'copy',
        content: { analysis_id: selectedAnalysis, versions: result.versions },
        created_at: new Date().toISOString(),
      }
      setCopies((prev) => [newEntry, ...prev])
      setSelectedCopy(newEntry)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const content = selectedCopy?.content as CopyContent | undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(`/file/${fileId}`)} className="text-gray-400 hover:text-gray-600 text-sm">← 返回</button>
        <h1 className="text-lg font-bold">文案库</h1>
        <span className="text-sm text-gray-400 ml-auto">{dbUser?.token_balance.toLocaleString()} tokens 余额</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Generate form */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-medium text-gray-900 mb-3">生成文案</h2>
          {analyses.length === 0 ? (
            <div className="text-sm text-gray-500">
              先去做 <button onClick={() => navigate(`/file/${fileId}/analysis`)} className="text-blue-600 underline">Page 分析</button>，再来生成文案
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-3">
              <select
                value={selectedAnalysis}
                onChange={(e) => setSelectedAnalysis(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {analyses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {new Date(a.created_at).toLocaleString('zh-CN')} — {(a.content as AnalysisContent).source === 'url' ? '网址抓取' : '手动输入'}
                  </option>
                ))}
              </select>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成文案 (-1500 tokens)'}
              </button>
            </form>
          )}
        </div>

        {/* History */}
        {copies.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">历史文案</h2>
            <div className="flex gap-2 flex-wrap">
              {copies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCopy(c)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${selectedCopy?.id === c.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {new Date(c.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {content && (
          <div className="space-y-4">
            {(['title', 'body', 'cta'] as const).map((field) => {
              const labels = { title: '标题', body: '正文', cta: '行动呼吁' }
              return (
                <div key={field} className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">{labels[field]}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {content.versions[field].map((v, i) => (
                      <div key={i} className="relative border border-gray-200 rounded-lg p-3 group">
                        <span className="text-xs text-gray-400 mb-1 block">版本 {i + 1}</span>
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{v}</p>
                        <button
                          onClick={() => copyToClipboard(v)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded transition-opacity"
                        >
                          复制
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            <button
              onClick={() => navigate(`/file/${fileId}/landing`)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              用此文案生成落地页 →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
