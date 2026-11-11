import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { updatePassword, user, isAuthenticated } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    if (password !== confirmation) return setError('The passwords do not match.')

    setIsLoading(true)
    try {
      await updatePassword(password)
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard', { replace: true })
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update your password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161b27] border border-white/5 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={25} className="text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Choose a new password</h1>
            <p className="text-xs text-gray-400">Your reset link must be active</p>
          </div>
        </div>
        {!isAuthenticated && <p className="text-sm text-gray-400 mb-4">Open this page from the password reset email to continue.</p>}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs text-gray-400">
            New password
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              minLength={8}
              className="mt-1.5 w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-600/60"
              required
            />
          </label>
          <label className="block text-xs text-gray-400">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={event => setConfirmation(event.target.value)}
              minLength={8}
              className="mt-1.5 w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-600/60"
              required
            />
          </label>
          <button type="submit" disabled={!isAuthenticated || isLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg text-sm font-semibold text-white">
            {isLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
