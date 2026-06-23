import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => setCountdown(c => c - 1), 1000)
    const redirect = setTimeout(() => navigate('/dashboard'), 5000)
    return () => { clearInterval(timer); clearTimeout(redirect) }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-2">Your account has been upgraded. Tokens have been added to your balance.</p>
        <p className="text-sm text-gray-500 mb-8">Redirecting to dashboard in {countdown} seconds...</p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
          Go to Dashboard Now
        </button>
      </div>
    </div>
  )
}
