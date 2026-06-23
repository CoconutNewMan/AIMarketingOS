import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FilePage from './pages/FilePage'
import Analysis from './pages/Analysis'
import Copy from './pages/Copy'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Billing from './pages/Billing'
import PaymentSuccess from './pages/PaymentSuccess'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
        <Route path="/billing" element={<AuthGuard><Billing /></AuthGuard>} />
        <Route path="/file/:id" element={<AuthGuard><FilePage /></AuthGuard>} />
        <Route path="/file/:id/analysis" element={<AuthGuard><Analysis /></AuthGuard>} />
        <Route path="/file/:id/copy" element={<AuthGuard><Copy /></AuthGuard>} />
        <Route path="/file/:id/landing" element={<AuthGuard><Landing /></AuthGuard>} />
        <Route path="/admin" element={<AuthGuard><AdminGuard><Admin /></AdminGuard></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
