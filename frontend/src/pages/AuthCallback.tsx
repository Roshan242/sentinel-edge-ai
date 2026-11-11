import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { EmailOtpType } from '@supabase/supabase-js'
import { AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const otpTypes: EmailOtpType[] = ['signup', 'email', 'invite', 'magiclink']

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshUser } = useAuth()
  const [error, setError] = useState('')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const completeSignIn = async () => {
      try {
        if (!supabase) throw new Error('Authentication is not configured.')

        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        if (tokenHash && type && otpTypes.includes(type as EmailOtpType)) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          })
          if (verifyError) throw verifyError
        } else if (type === 'recovery') {
          navigate('/reset-password', { replace: true })
          return
        }

        await refreshUser()
        navigate('/', { replace: true })
      } catch (callbackError) {
        setError(callbackError instanceof Error ? callbackError.message : 'The confirmation link is invalid or expired.')
      }
    }

    void completeSignIn()
  }, [navigate, refreshUser, searchParams])

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#161b27] border border-white/5 rounded-xl p-8 text-center">
        <Shield size={32} className="text-blue-400 mx-auto mb-4" />
        {error ? (
          <>
            <div className="flex items-center justify-center gap-2 text-red-400 mb-3">
              <AlertCircle size={17} /> <h1 className="font-semibold">Could not confirm your email</h1>
            </div>
            <p className="text-sm text-gray-400 mb-5">{error}</p>
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">Return to sign in</Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Confirming your account</h1>
            <p className="text-sm text-gray-400">Please wait while we securely verify your session.</p>
          </>
        )}
      </div>
    </div>
  )
}
