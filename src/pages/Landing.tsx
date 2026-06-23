import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callFunction } from '../lib/api'
import { supabase } from '../lib/supabase'
import { type FileData, type LandingContent } from '../types'

export default function Landing() {
  const { id: fileId } = useParams<{ id: string }>()
  const { session, dbUser } = useAuth()
  const navigate = useNavigate()

  const [copies, setCopies] = useState<FileData[]>([])
  const [landings, setLandings] = useState<FileData[]>([])
  const [selectedCopy, setSelectedCopy] = useState<string>('')
  const [selectedVersion, setSelectedVersion] = useState<0 | 1>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [selectedLanding, setSelectedLanding] = useState<FileData | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('file_data').select('*').eq('file_id', fileId!).eq('data_type', 'copy').order('created_at', { ascending: false }),
      supabase.from('file_data').select('*').eq('file_id', fileId!).eq('data_type', 'landing_page').order('created_at', { ascending: false }),
    ]).then(([{ data: c }, { data: l }]) => {
      setCopies(c ?? [])
      setLandings(l ?? [])
      if (c && c.length > 0) setSelectedCopy(c[0].id)
      if (l && l.length > 0) {
        setSelectedLanding(l[0])
        setPreviewHtml((l[0].content as LandingContent).html)
      }
    })
  }, [fileId])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await callFunction<{ id: string; html: string }>(
        'generate-landing',
        { file_id: fileId, copy_id: selectedCopy, version: selectedVersion },
        session!.access_token
      )
      const newEntry: FileData = {
        id: result.id,
        file_id: fileId!,
        data_type: 'landing_page',
        content: { copy_id: selectedCopy, html: result.html },
        created_at: new Date().toISOString(),
      }
      setLandings((prev) => [newEntry, ...prev])
      setSelectedLanding(newEntry)
      setPreviewHtml(result.html)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!previewHtml) return
    const blob = new Blob([previewHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'landing-page.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(`/file/${fileId}`)} className="text-gray-400 hover:text-gray-600 text-sm">← 返回</button>
        <h1 className="text-lg font-bold">落地页生成</h1>
        <span className="text-sm text-gray-400 ml-auto">{dbUser?.token_balance.toLocaleString()} tokens 余额</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Generate form */}
        <div className="bg-white rounded-xl border p-5">
          {copies.length === 0 ? (
            <div className="text-sm text-gray-500">
              先去<button onClick={() => navigate(`/file/${fileId}/copy`)} className="text-blue-600 underline">生成文案</button>，再来建落地页
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">选择文案</label>
                <select
                  value={selectedCopy}
                  onChange={(e) => setSelectedCopy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {copies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {new Date(c.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">文案版本</label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(Number(e.target.value) as 0 | 1)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>版本 A（专业）</option>
                  <option value={1}>版本 B（活泼）</option>
                </select>
              </div>
              <div className="flex-1" />
              {error && <p className="text-red-500 text-sm w-full">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成落地页 (-3000 tokens)'}
              </button>
            </form>
          )}
        </div>

        {/* History selector */}
        {landings.length > 0 && (
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-gray-400">历史版本：</span>
            {landings.map((l) => (
              <button
                key={l.id}
                onClick={() => { setSelectedLanding(l); setPreviewHtml((l.content as LandingContent).html) }}
                className={`px-3 py-1 rounded-full border text-xs transition-colors ${selectedLanding?.id === l.id ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'}`}
              >
                {new Date(l.created_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        )}

        {/* Preview + Download */}
        {previewHtml && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-50">
              <span className="text-sm font-medium text-gray-700">预览</span>
              <button
                onClick={handleDownload}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
              >
                下载 HTML
              </button>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full"
              style={{ height: '600px', border: 'none' }}
              sandbox="allow-scripts"
              title="Landing page preview"
            />
          </div>
        )}
      </main>
    </div>
  )
}
