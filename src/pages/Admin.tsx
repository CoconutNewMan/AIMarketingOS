import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callAdmin } from '../lib/api'
import { type AdminUser, type File } from '../types'

type Tab = 'stats' | 'users' | 'files' | 'orders'

interface Stats { userCount: number; fileCount: number; callCount: number }
interface Order {
  id: string
  user_id: string
  plan: string
  amount_usd: number
  status: string
  tokens_granted: number
  created_at: string
  users?: { email: string }
}

export default function Admin() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('stats')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [files, setFiles] = useState<(File & { users: { email: string } })[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<AdminUser>>({})

  const token = session!.access_token

  const loadTab = useCallback(async (t: Tab) => {
    setLoading(true)
    try {
      if (t === 'stats') setStats(await callAdmin<Stats>('stats', 'GET', token))
      if (t === 'users') setUsers(await callAdmin<AdminUser[]>('users', 'GET', token))
      if (t === 'files') setFiles(await callAdmin<(File & { users: { email: string } })[]>('files', 'GET', token))
      if (t === 'orders') setOrders(await callAdmin<Order[]>('orders', 'GET', token))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadTab(tab) }, [tab, loadTab])

  async function saveUser(id: string) {
    await callAdmin(`users/${id}`, 'PATCH', token, editValues as Record<string, unknown>)
    setEditingUser(null)
    loadTab('users')
  }

  async function deleteUser(id: string) {
    if (!confirm('确定删除此用户？此操作不可恢复。')) return
    await callAdmin(`users/${id}`, 'DELETE', token)
    loadTab('users')
  }

  async function deleteFile(id: string) {
    if (!confirm('确定删除此 File？')) return
    await callAdmin(`files/${id}`, 'DELETE', token)
    loadTab('files')
  }

  const tierOptions = ['free', 'pro', 'enterprise']

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">← 返回</button>
        <h1 className="text-lg font-bold text-purple-700">管理后台</h1>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex gap-1 mb-6 border-b">
          {(['stats', 'users', 'files', 'orders'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'stats' ? '系统数据' : t === 'users' ? '用户管理' : t === 'files' ? 'File 管理' : '订单管理'}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400 text-sm">加载中...</p>}

        {/* Stats */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '总用户数', value: stats.userCount },
              { label: '总 File 数', value: stats.fileCount },
              { label: 'AI 调用次数', value: stats.callCount },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border p-5 text-center">
                <div className="text-3xl font-bold text-purple-600">{value ?? 0}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['电子邮件', '套餐', 'Tokens', 'Admin', '注册时间', '操作'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{u.email}</td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <select
                          value={editValues.tier ?? u.tier}
                          onChange={(e) => setEditValues((v) => ({ ...v, tier: e.target.value as AdminUser['tier'] }))}
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          {tierOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.tier === 'free' ? 'bg-gray-100 text-gray-600' : u.tier === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {u.tier}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <input
                          type="number"
                          value={editValues.token_balance ?? u.token_balance}
                          onChange={(e) => setEditValues((v) => ({ ...v, token_balance: Number(e.target.value) }))}
                          className="border border-gray-300 rounded px-2 py-1 text-xs w-24"
                        />
                      ) : (
                        u.token_balance.toLocaleString()
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <input
                          type="checkbox"
                          checked={editValues.is_admin ?? u.is_admin}
                          onChange={(e) => setEditValues((v) => ({ ...v, is_admin: e.target.checked }))}
                        />
                      ) : (
                        u.is_admin ? '✓' : '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('zh-CN')}</td>
                    <td className="px-4 py-3">
                      {editingUser === u.id ? (
                        <div className="flex gap-2">
                          <button onClick={() => saveUser(u.id)} className="text-xs text-green-600 hover:underline">保存</button>
                          <button onClick={() => setEditingUser(null)} className="text-xs text-gray-400 hover:underline">取消</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingUser(u.id); setEditValues({}) }} className="text-xs text-blue-600 hover:underline">编辑</button>
                          <button onClick={() => deleteUser(u.id)} className="text-xs text-red-500 hover:underline">删除</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Files */}
        {tab === 'files' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['File 名称', '所有者', '行业', '创建时间', '操作'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{f.name}</td>
                    <td className="px-4 py-3 text-gray-500">{f.users?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{f.industry ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(f.created_at).toLocaleDateString('zh-CN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteFile(f.id)} className="text-xs text-red-500 hover:underline">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">用户</th>
                  <th className="px-4 py-3 text-left">套餐</th>
                  <th className="px-4 py-3 text-left">金额</th>
                  <th className="px-4 py-3 text-left">Tokens</th>
                  <th className="px-4 py-3 text-left">状态</th>
                  <th className="px-4 py-3 text-left">时间</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{order.users?.email || order.user_id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{order.plan}</td>
                    <td className="px-4 py-3 text-gray-700">${(order.amount_usd / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{order.tokens_granted.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'paid' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{new Date(order.created_at).toLocaleDateString('zh-CN')}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">暂无订单</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
