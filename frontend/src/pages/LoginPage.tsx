import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LoginForm } from '@/components/auth/LoginForm'
import { Shield, ArrowRight, UserRound, X } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedRole = searchParams.get('role')
  const role = requestedRole === 'admin' || requestedRole === 'user' ? requestedRole : null
  const [showRolePicker, setShowRolePicker] = useState(!role)

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left — Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">SENTINEL-EDGE AI</h1>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Shield size={12} />
              Secure Account Access
            </div>
            <h2 className="text-2xl font-semibold text-white">
              Sign in to Sentinel-Edge AI
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
            {role === 'admin'
              ? <Shield size={18} className="text-blue-400" />
              : <UserRound size={18} className="text-blue-400" />}
            <h3 className="text-xl font-bold text-white">{role === 'admin' ? 'Admin Sign In' : 'User Sign In'}</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Sign in with your {role ?? 'selected'} account. Access is determined by the role assigned to your account.
          </p>

          {role ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setShowRolePicker(true)
                  setSearchParams({})
                }}
                className="mb-5 text-xs text-blue-400 hover:text-blue-300"
              >
                Choose a different sign-in type
              </button>
              <LoginForm role={role} />
            </>
          ) : (
            <div className="h-[270px]" />
          )}
        </div>
      </div>
      {showRolePicker && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sign-in-role-title"
            className="w-full max-w-sm rounded-2xl border border-blue-500/20 bg-[#0d1117] p-6 shadow-2xl shadow-blue-500/10"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 id="sign-in-role-title" className="text-base font-bold text-white">Choose sign-in type</h2>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-5 text-xs text-gray-400">Choose User or Admin to continue.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchParams({ role: 'user' })
                  setShowRolePicker(false)
                }}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-200 transition-colors hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-white"
              >
                <UserRound size={22} className="text-blue-400" />
                User
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchParams({ role: 'admin' })
                  setShowRolePicker(false)
                }}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-gray-200 transition-colors hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-white"
              >
                <Shield size={22} className="text-blue-400" />
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
