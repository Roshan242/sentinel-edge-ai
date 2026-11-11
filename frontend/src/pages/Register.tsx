import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Shield, UserPlus, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white leading-tight">Sentinel-Edge AI</p>
            <p className="text-[10px] text-gray-400 leading-tight">Smart Security System</p>
          </div>
        </div>

        <div className="bg-[#161b27] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={18} className="text-green-400" />
            <h1 className="text-lg font-bold text-white">Create Account</h1>
          </div>
          <p className="text-xs text-gray-400 mb-6">Sign up to access the security dashboard</p>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
              <input
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
              <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls + ' pr-10'}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {isLoading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><UserPlus size={15} /> Create Account</>
              }
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Login
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          © 2025 Sentinel-Edge AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
