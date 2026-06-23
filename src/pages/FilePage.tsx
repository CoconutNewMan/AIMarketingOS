import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { type File } from '../types'
import ToolCard from '../components/ToolCard'
import TokenBadge from '../components/TokenBadge'

export default function FilePage() {
  const { id } = useParams<{ id: string }>()
  const [file, setFile] = useState<File | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('files').select('*').eq('id', id!).single().then(({ data }) => setFile(data))
  }, [id])

  if (!file) return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">← 返回</button>
          <h1 className="text-lg font-bold text-gray-900">{file.name}</h1>
          {file.industry && <span className="text-sm text-gray-400">{file.industry}</span>}
        </div>
        <TokenBadge />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">选择工具</h2>
        <div className="grid grid-cols-2 gap-4">
          <ToolCard
            icon="🔍"
            title="Page 分析"
            description="分析竞品 Facebook Page，生成 SWOT"
            href={`/file/${id}/analysis`}
          />
          <ToolCard
            icon="✍️"
            title="文案库"
            description="AI 生成标题、正文、CTA 各两版"
            href={`/file/${id}/copy`}
          />
          <ToolCard
            icon="🚀"
            title="落地页"
            description="AI 生成完整 HTML 落地页"
            href={`/file/${id}/landing`}
          />
          <ToolCard
            icon="🖼️"
            title="图片生成"
            description="AI 生成营销图片"
            href=""
            comingSoon
          />
        </div>
      </main>
    </div>
  )
}
