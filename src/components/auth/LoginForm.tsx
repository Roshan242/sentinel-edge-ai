import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Mail, Lock, AlertCircle, Eye, EyeOff, X, CheckCircle } from 'lucide-react'

const inputCls = "w-full pl-10 pr-4 py-2.5 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:border-blue-600/60 focus:outline-none transition-colors"

// ── Forgot Password Modal ────────────────────────────────────────────────────
const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#161b27] border border-white/5 rounded-xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white">Reset Password</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        {!sent ? (
          <>
            <p className="text-xs text-gray-400 mb-4">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className={inputCls} required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2">
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">Check your email</p>
            <p className="text-xs text-gray-400 mb-4">
              We sent a reset link to<br />
              <span className="text-blue-400 font-medium">{email}</span>
            </p>
            <button onClick={onClose}
              className="w-full py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-gray-300 hover:border-blue-600/50 transition-colors">
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Login Form ───────────────────────────────────────────────────────────────
export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login, requestOtp, verifyOtp, isLoading } = useAuth()
  const { state } = (useLocation() as unknown as { state?: any }) || {}
  const demoRole = state?.role as 'admin' | 'user' | undefined
  const otpAfterRegister = !!state?.otpAfterRegister
  const registeredEmail = state?.registeredEmail as string | undefined

  // If the user just registered, skip password login and go straight to OTP step.
  // This also prevents `otpAfterRegister` from being an unused variable.
  const [didAutoOtpRequest, setDidAutoOtpRequest] = useState(false)

  const [email, setEmail] = useState(
    registeredEmail
      ? registeredEmail
      : demoRole === 'admin'
        ? 'admin@sentinel.com'
        : 'user@sentinel.com'
  )
  const [password, setPassword] = useState('password123')

  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState('')
  const [showForgot, setShowForgot] = useState(false)

  const [step, setStep] = useState<1 | 2>(1)
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const auto = async () => {
      if (!otpAfterRegister) return
      if (didAutoOtpRequest) return

      const targetEmail = registeredEmail || email
      if (!targetEmail) return

      setDidAutoOtpRequest(true)
      try {
        const res = await requestOtp(targetEmail)
        if (cancelled) return
        setOtpToken(res.otpToken)
        setStep(2)
        setOtp('')
      } catch {
        if (cancelled) return
        setError('OTP request failed. Please login normally.')
      }
    }

    auto()

    return () => {
      cancelled = true
    }
  }, [otpAfterRegister, didAutoOtpRequest, registeredEmail, email, requestOtp])

  const goToRoleDashboard = () => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return
    const u = JSON.parse(storedUser) as { role: string }
    navigate(u.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
  }

  const finalizeRegistrationIfPending = () => {
    // If user came from Register page, backend already returned {token,user}.
    // UX: don't show dashboard until OTP is verified.
    const pendingToken = localStorage.getItem('pendingAuthToken')
    const pendingUserRaw = localStorage.getItem('pendingAuthUser')
    if (!pendingToken || !pendingUserRaw) return

    localStorage.setItem('token', pendingToken)
    localStorage.setItem('user', pendingUserRaw)

    // cleanup
    localStorage.removeItem('pendingAuthToken')
    localStorage.removeItem('pendingAuthUser')
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return

    try {
      const loginResult = await login(email, password)

      if (loginResult && 'requiresOtp' in loginResult && loginResult.requiresOtp) {
        const res = await requestOtp(email)
        setOtpToken(res.otpToken)
        setStep(2)
        setOtp('')
        return
      }

      // If registration flow stored pending token/user, block navigation.
      // OTP verification will create a real session and navigate.
      if (localStorage.getItem('pendingAuthToken') || localStorage.getItem('pendingAuthUser')) {
        setStep(1)
        return
      }

      goToRoleDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    }

  }


  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !otpToken) return
    if (!otp || otp.length < 6) return

    try {
      await verifyOtp(email, otpToken, otp)

      // finalize pending registration if any
      if (localStorage.getItem('pendingAuthToken') || localStorage.getItem('pendingAuthUser')) {
        finalizeRegistrationIfPending()
      }

      goToRoleDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    }

  }

  return (
    <>
      <div className="w-full max-w-md">
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-400">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls + ' pr-10'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 border border-white/10 hover:border-blue-500/40 text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ← Go Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div>
              <div className="text-xs text-gray-400 mb-1.5">Enter verification code</div>
              <div className="text-sm text-white font-semibold mb-1">Sent to</div>
              <div className="text-xs text-blue-400">{email}</div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">OTP</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className={inputCls + ' pl-10'}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify & Login'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1)
                setOtp('')
                setOtpToken(null)
                setError('')
              }}
              className="w-full py-2.5 border border-white/10 hover:border-blue-500/40 text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </>
  )
}

