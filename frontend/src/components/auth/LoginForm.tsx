import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AlertCircle, Eye, EyeOff, Lock, Mail, X } from 'lucide-react'

const inputCls = 'w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:border-blue-600/60 focus:outline-none transition-colors'

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send the reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#161b27] border border-white/5 rounded-xl p-6 shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Reset Password</h2>
          <button type="button" onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {sent ? (
          <div className="text-sm text-gray-300">
            If an account exists for <span className="text-blue-400">{email}</span>, Supabase has sent a password reset link.
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4">Enter the email address associated with your account.</p>
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className={inputCls} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg text-sm font-semibold text-white">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export const LoginForm: React.FC<{ role: 'admin' | 'user' }> = ({ role }) => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  useEffect(() => {
    setError('')
  }, [role])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const user = await login(email, password, role)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Sign in failed. Please try again.')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className={inputCls} required />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-gray-400">Password</label>
            <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-blue-400 hover:text-blue-300">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" className={`${inputCls} pr-10`} required />
            <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
          {isLoading ? 'Signing in…' : `Sign In as ${role === 'admin' ? 'Admin' : 'User'}`}
        </button>
        <button type="button" onClick={() => navigate('/')} className="w-full py-2.5 border border-white/10 hover:border-blue-500/40 text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors">
          ← Go Back
        </button>
      </form>
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  )
}
