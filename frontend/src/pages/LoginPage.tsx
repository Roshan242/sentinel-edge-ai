import React from 'react'
import { useLocation } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shield, ArrowRight, User } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const location = useLocation()
  const state = (location.state || {}) as { role?: string; demo?: boolean }
  const role = state.role ?? 'admin'
  const isAdmin = role === 'admin'
  const demo = !!state.demo

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left — Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              {isAdmin ? <Shield size={24} className="text-white" /> : <User size={24} className="text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-white">SENTINEL-EDGE AI</h1>
          </div>

          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isAdmin ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
              {isAdmin ? <Shield size={12} /> : <User size={12} />}
              {isAdmin ? 'Admin Access' : 'User Access'}
            </div>
            <h2 className="text-2xl font-semibold text-white">
              AI-Powered Security,<br />
              Edge Intelligence,<br />
              Total Protection
            </h2>
            <p className="text-gray-400 text-sm">
              Advanced surveillance and biometric management system with real-time threat detection.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Real-time threat detection',
              'Biometric authentication',
              'Advanced analytics dashboard',
              '24/7 monitoring capabilities',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-gray-300 text-sm">
                <ArrowRight size={14} className="text-blue-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="bg-[#161b27] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-2 mb-1">
            {isAdmin
              ? <Shield size={18} className="text-blue-400" />
              : <User size={18} className="text-green-400" />}
            <h3 className="text-xl font-bold text-white">
              {isAdmin ? 'Admin Login' : 'User Login'}
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            {isAdmin ? 'Sign in with your admin credentials' : 'Sign in with your user credentials'}
          </p>

          {import.meta.env.DEV && (
            <div className="mb-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200">
              <strong className="block font-semibold text-yellow-300 mb-1">Demo credentials</strong>
          {demo && isAdmin
                ? <><code className="text-yellow-400">admin@sentinel.com</code> / <code className="text-yellow-400">password123</code></>
                : demo && !isAdmin
                ? <><code className="text-yellow-400">user@sentinel.com</code> / <code className="text-yellow-400">password123</code></>
                : isAdmin
                ? <><code className="text-yellow-400">admin@sentinel.com</code> / <code className="text-yellow-400">password123</code></>
                : <><code className="text-yellow-400">user@sentinel.com</code> / <code className="text-yellow-400">password123</code></>
              }
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
