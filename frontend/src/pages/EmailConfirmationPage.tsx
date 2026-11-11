import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

type LocationState = { registeredEmail?: string }

export const EmailConfirmationPage: React.FC = () => {
  const location = useLocation()
  const { resendSignupConfirmation } = useAuth()
  const state = (location.state || {}) as LocationState
  const [email, setEmail] = useState(state.registeredEmail || '')
  const [sent, setSent] = useState(!!state.registeredEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await resendSignupConfirmation(email)
      setSent(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not resend the confirmation email.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161b27] border border-white/5 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center">
            {sent ? <CheckCircle size={22} className="text-white" /> : <Mail size={22} className="text-white" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{sent ? 'Check your email' : 'Confirm your email'}</h1>
            <p className="text-xs text-gray-400">Email confirmation is managed by Supabase Auth</p>
          </div>
        </div>

        {sent && (
          <p className="text-sm text-gray-300 mb-5">
            Follow the confirmation link sent to <span className="text-blue-400">{email}</span>. The link will return you to Sentinel-Edge AI.
          </p>
        )}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleResend} className="space-y-4">
          {!sent && <label className="block text-xs text-gray-400">Enter the email address you registered with</label>}
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-600/60"
            required
          />
          <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg text-sm font-semibold text-white">
            {isLoading ? 'Sending…' : 'Resend confirmation email'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
