import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFiles } from '../hooks/useFiles'
import FileCard from '../components/FileCard'
import TokenBadge from '../components/TokenBadge'

export default function Dashboard() {
  const { dbUser, logout } = useAuth()
  const { files, loading, createFile, deleteFile } = useFiles(dbUser?.id)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [direction, setDirection] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const canCreate = files.length < (dbUser?.max_files ?? 2)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      await createFile(name, industry, direction)
      setShowForm(false)
      setName(''); setIndustry(''); setDirection('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-900">AI Marketing OS</h1>
        <div className="flex items-center gap-4">
          <TokenBadge />
          {dbUser?.is_admin && (
            <button onClick={() => navigate('/admin')} className="text-sm text-purple-600 hover:underline">
              管理后台
            </button>
          )}
          <span className="text-sm text-gray-500">{dbUser?.email}</span>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">登出</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">我的 Files</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/billing')} className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              💳 升级套餐
            </button>
          <button
            onClick={() => setShowForm(true)}
            disabled={!canCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + 新建 File
          </button>
          </div>
        </div>

        {!canCreate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-4">
            免费版最多 {dbUser?.max_files} 个 File。升级 Pro 可建更多。
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border p-5 mb-4 space-y-3">
            <h3 className="font-medium text-gray-900">新建 File</h3>
            <input
              placeholder="File 名称（例：品牌A）"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="行业（例：餐饮、电商）"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="方向/定位（例：高端路线）"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {creating ? '创建中...' : '创建'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100">
                取消
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">加载中...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">还没有 File，点击「新建 File」开始</p>
        ) : (
          <div className="space-y-3">
            {files.map((f) => (
              <FileCard key={f.id} file={f} onDelete={deleteFile} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
