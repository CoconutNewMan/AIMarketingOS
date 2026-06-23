import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callFunction } from '../lib/api'

const PLANS = [
  { key: 'starter', name: 'Starter', price: '$19/mo', tokens: '50,000 tokens', videos: '5 videos', files: '3 files' },
  { key: 'pro', name: 'Pro', price: '$49/mo', tokens: '200,000 tokens', videos: '20 videos', files: '10 files', popular: true },
]

const TOKEN_PACKS = [
  { key: 'token_small', name: 'Small Pack', price: '$9', tokens: '20,000 tokens' },
  { key: 'token_medium', name: 'Medium Pack', price: '$19', tokens: '50,000 tokens' },
  { key: 'token_large', name: 'Large Pack', price: '$39', tokens: '120,000 tokens' },
]

export default function Billing() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function checkout(product: string) {
    if (!session) return
    setLoading(product)
    setError('')
    try {
      const { url } = await callFunction<{ url: string }>('create-checkout', { product }, session.access_token)
      window.location.href = url
    } catch {
      setError('Payment failed to initialize. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-600 hover:text-blue-800 mb-2 block">← 返回仪表板</button>
          <h1 className="text-2xl font-bold text-gray-900">套餐与充值</h1>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">月度套餐</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map(plan => (
              <div key={plan.key} className={`bg-white rounded-2xl p-6 border-2 ${plan.popular ? 'border-blue-500' : 'border-gray-100'}`}>
                {plan.popular && <div className="text-xs font-bold text-blue-600 mb-2">⭐ 最受欢迎</div>}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="text-3xl font-extrabold text-gray-900 my-3">{plan.price}</div>
                <ul className="space-y-2 text-sm text-gray-600 mb-6">
                  <li>✓ {plan.tokens}</li>
                  <li>✓ {plan.videos}</li>
                  <li>✓ {plan.files}</li>
                </ul>
                <button
                  onClick={() => checkout(plan.key)}
                  disabled={!!loading}
                  className={`w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-50 ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  {loading === plan.key ? '跳转中...' : '立即订阅'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Token 充值包</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TOKEN_PACKS.map(pack => (
              <div key={pack.key} className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900">{pack.name}</h3>
                <div className="text-2xl font-extrabold text-blue-600 my-2">{pack.price}</div>
                <p className="text-sm text-gray-600 mb-4">{pack.tokens}</p>
                <button
                  onClick={() => checkout(pack.key)}
                  disabled={!!loading}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading === pack.key ? '跳转中...' : '立即购买'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
