import { useAuth } from '../hooks/useAuth'

export default function TokenBadge() {
  const { dbUser } = useAuth()
  if (!dbUser) return null
  const pct = Math.min(100, (dbUser.token_balance / 5000) * 100)
  const color = pct > 50 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span>{dbUser.token_balance.toLocaleString()} tokens</span>
    </div>
  )
}
