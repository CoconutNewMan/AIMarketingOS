import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { dbUser, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>
  if (!dbUser?.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
