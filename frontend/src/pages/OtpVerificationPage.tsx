import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useLocation, useNavigate } from 'react-router-dom'
import { Shield, Mail, ArrowRight, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const inputCls =
  'w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-600/60 focus:border-blue-600/60'

type LocationState = {
  registeredEmail?: string
  role?: 'admin' | 'user'
  otpAfterRegister?: boolean
  otpToken?: string
}

export const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, requestOtp, isLoading: authLoading, syncAuthFromLocalStorage } = useAuth()


  const state = (location.state || {}) as LocationState
  const registeredEmail = state.registeredEmail
  const otpAfterRegister = !!state.otpAfterRegister

  const fallbackPendingEmail = localStorage.getItem('pendingAuthEmail') || ''
  const fallbackPendingOtpToken = localStorage.getItem('pendingAuthOtpToken')

  const [email, setEmail] = useState<string>(registeredEmail || fallbackPendingEmail)
  const [otpToken, setOtpToken] = useState<string | null>(state.otpToken ?? fallbackPendingOtpToken ?? null)

  const [otpDigits, setOtpDigits] = useState<string[]>(Array.from({ length: 6 }, () => ''))
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const otp = otpDigits.join('')
  const [error, setError] = useState('')

  const [step, setStep] = useState<'requesting' | 'verify'>('verify')

  const [didRequest, setDidRequest] = useState(false)
  const [resentAt, setResentAt] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(Date.now())
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(Date.now())
  }, 1000)

  return () => clearInterval(interval)
}, [])
  const RESEND_COOLDOWN_SEC = 60
  const nowMs = currentTime
  const resendDisabled = !!resentAt && nowMs - resentAt < RESEND_COOLDOWN_SEC * 1000
  const resendRemainingSec = resendDisabled ? Math.ceil((RESEND_COOLDOWN_SEC * 1000 - (nowMs - resentAt)) / 1000) : 0



  const isReady = useMemo(() => !!email, [email])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!isReady) return

      // Register flow uses /auth/register (already generated OTP token).
      // Never call login OTP endpoint in this mode.
      if (otpAfterRegister) return

      if (!otpToken && !didRequest) {
        setDidRequest(true)
        setError('')
        setStep('requesting')
        try {
          const res = await requestOtp(email)


          if (cancelled) return
          setOtpToken(res.otpToken)
          setResentAt(Date.now())
          setStep('verify')
    } catch (e) {

      if (cancelled) return

          
          
          setError(e instanceof Error ? e.message : 'OTP request failed')
          setStep('verify')
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [didRequest, email, isReady, otpToken, requestOtp, otpAfterRegister])


  const finalizeRegistrationIfPending = () => {
    // Backend register returns token/user, but UX: only allow dashboard after OTP.
    const pendingToken = localStorage.getItem('pendingAuthToken')
    const pendingUserRaw = localStorage.getItem('pendingAuthUser')
    if (!pendingToken || !pendingUserRaw) return

    localStorage.setItem('token', pendingToken)
    localStorage.setItem('user', pendingUserRaw)

    localStorage.removeItem('pendingAuthToken')
    localStorage.removeItem('pendingAuthUser')
  }

  const goToRoleDashboard = (fallbackRole?: 'admin' | 'user') => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const u = JSON.parse(storedUser) as { role?: string }
      const role = u.role === 'admin' ? 'admin' : 'user'
      navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true })
      return
    }

    const role = fallbackRole ?? state.role ?? 'user'
    navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true })
  }


  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) return setError('Email is required')
    if (!otpToken) return setError('OTP token missing. Please request OTP again.')
    if (otp.length < 6) return setError('Enter a valid 6-digit OTP')

    try {
      if (otpAfterRegister) {
        const requestPayload = { email, otpToken, otp }


        const response = await fetch('/api/auth/register/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        })


        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error(text || 'Invalid OTP')
        }

        const data = (await response.json()) as { token: string; user: any }


        // Persist auth immediately (registration after OTP).
        ;(localStorage as any).setItem('token', data.token)
        ;(localStorage as any).setItem('user', JSON.stringify(data.user))



        // Update AuthContext state (via localStorage values) and explicitly route.
        const role = (data.user?.role === 'admin' ? 'admin' : 'user')
        // Persist auth already done above; hydrate AuthContext state immediately.

        syncAuthFromLocalStorage()
        // Route to correct protected page.
        navigate(role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true })




      } else {

        await verifyOtp(email, otpToken, otp)

        finalizeRegistrationIfPending()
        goToRoleDashboard(state.role)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    }
  }



  const handleResend = async () => {
    if (!email) return
    setError('')
    setStep('requesting')
    try {
      const res = await requestOtp(email)
      setOtpToken(res.otpToken)
      const cleared = Array.from({ length: 6 }, () => '')
      setOtpDigits(cleared)
      setResentAt(Date.now())
      setStep('verify')
      // Next tick focus to ensure inputs exist.
      setTimeout(() => inputsRef.current[0]?.focus(), 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend OTP')
      setStep('verify')
    }
  }



  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left — Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">OTP Verification</h1>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Mail size={12} /> Email OTP
            </div>
            <p className="text-gray-400 text-sm">
              Enter the one-time code sent to your email to continue.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Secure OTP validation',
              'Auto redirect to dashboard',
              'Rate-limited OTP requests',
              'Works for sign up flow',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                <ArrowRight size={14} className="text-blue-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right — OTP Form */}
        <div className="bg-[#161b27] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-blue-400" />
            <h3 className="text-xl font-bold text-white">Verify OTP</h3>
          </div>

          <p className="text-xs text-gray-400 mb-6">
            {registeredEmail ? 'We sent a code during registration.' : 'We sent a code to your email.'}
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            {!registeredEmail && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                  required
                />
              </div>
            )}

            <div>
              <div className="text-xs text-gray-400 mb-1.5">Enter verification code</div>
              <div className="text-sm text-white font-semibold mb-1">Sent to</div>
              <div className="text-xs text-blue-400">{email || '-'}</div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">OTP</label>
              <div className="flex justify-center gap-4 mb-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      if (!value) {
                        setOtpDigits((prev) => {
                          const next = [...prev]
                          next[index] = ''
                          return next
                        })
                        return
                      }

                      setOtpDigits((prev) => {
                        const next = [...prev]
                        next[index] = value.slice(-1)
                        return next
                      })

                      if (index < 5) {
                        inputsRef.current[index + 1]?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
                        inputsRef.current[index - 1]?.focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-3xl border-2 border-gray-400 rounded-xl focus:border-blue-500 focus:outline-none bg-[#0d1117] text-white"
                  />
                ))}
              </div>
              <p className="text-[11px] text-gray-500 text-center">Enter 6 digits</p>
            </div>


            <button
              type="submit"
              disabled={authLoading || step === 'requesting'}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {authLoading || step === 'requesting' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-gray-300 hover:border-blue-600/50 transition-colors"
              >
                Back to Login
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={!email || step === 'requesting' || resendDisabled}
                className="flex-1 py-2 bg-[#0d1117] border border-white/10 rounded-lg text-sm text-gray-300 hover:border-blue-600/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <RefreshCcw size={16} /> {resendDisabled ? `Resend in ${resendRemainingSec}s` : 'Resend'}
              </button>

            </div>

            {resentAt && (
              <p className="text-[11px] text-gray-500 text-center">
                Resent OTP at {new Date(resentAt).toLocaleTimeString()}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

