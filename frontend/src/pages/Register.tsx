import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Activity, Camera, Fingerprint, Shield, UserPlus, Eye, EyeOff } from 'lucide-react'

const inputCls = "w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-600/60"

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await register(name, email, password)
      if (data.needsEmailConfirmation) {
        navigate('/verify-email', { state: { registeredEmail: data.email } })
      } else {
        navigate('/user/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    }

  }


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080d18] px-4 py-5 text-white sm:px-6 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(37,99,235,0.2),transparent_38%),radial-gradient(ellipse_at_85%_80%,rgba(14,165,233,0.1),transparent_34%)]" />

      <main className="relative grid w-full max-w-6xl items-stretch gap-5 lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <section className="relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl shadow-black/30 sm:min-h-[360px] sm:p-8 lg:min-h-[680px] lg:p-10">
          <img
            src="/signup-living-room.png"
            alt="Bright, modern living room"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/20 via-slate-950/20 to-slate-950/80" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
              <Shield size={20} className="text-blue-200" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Sentinel-Edge AI</p>
              <p className="text-[10px] leading-tight text-slate-300">Smart Security System</p>
            </div>
          </div>

          <div className="relative mt-8 max-w-lg">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-blue-300/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur">
              <Activity size={13} />
              Security that stays in sight
            </span>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              A safer space
              <br />
              starts here.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
              Bring cameras, access activity, and security alerts together in one clear view.
            </p>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/35 px-3 py-2 text-xs text-slate-100 backdrop-blur-md">
              <Camera size={14} className="text-blue-200" />
              Camera monitoring
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-slate-950/35 px-3 py-2 text-xs text-slate-100 backdrop-blur-md">
              <Fingerprint size={14} className="text-cyan-200" />
              Access insights
            </span>
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <div className="rounded-3xl border border-white/10 bg-[#111a29]/85 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="mb-1 flex items-center gap-2">
              <UserPlus size={18} className="text-blue-300" />
              <h1 className="text-xl font-bold text-white">Create Account</h1>
            </div>
            <p className="mb-6 text-xs text-slate-400">Sign up to access your security dashboard</p>

            {error && (
              <div role="alert" className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="mb-1.5 block text-xs text-slate-300">Full Name</label>
                <input
                  id="register-name"
                  type="text"
                  placeholder="Your Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className={inputCls}
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-email" className="mb-1.5 block text-xs text-slate-300">Email Address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label htmlFor="register-password" className="mb-1.5 block text-xs text-slate-300">Password</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputCls + ' pr-10'}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {isLoading
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <><UserPlus size={15} /> Create Account</>
                }
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-300 hover:text-blue-200">
                Login
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            © 2025 Sentinel-Edge AI. All rights reserved.
          </p>
        </section>
      </main>
    </div>
  )
}
