import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, role: User['role']) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<{ email: string; needsEmailConfirmation: boolean }>
  resendSignupConfirmation: (email: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshUser: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api'

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const getApiError = async (response: Response) => {
  const data = await response.json().catch(() => null) as { message?: string; error?: string } | null
  return data?.message || data?.error || `Authentication request failed (${response.status})`
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loginInProgress = useRef(false)
  const ignoredAuthSession = useRef<string | null>(null)

  const fetchProfile = useCallback(async (session: Session | null): Promise<User | null> => {
    if (!session) return null
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (!response.ok) throw new Error(await getApiError(response))
    const data = await response.json() as { user: User }
    return data.user
  }, [])

  const loadProfile = useCallback(async (session: Session | null): Promise<User | null> => {
    setToken(session?.access_token ?? null)
    const profile = await fetchProfile(session)
    setUser(profile)
    return profile
  }, [fetchProfile])

  const refreshUser = useCallback(async () => {
    const { data, error } = await requireSupabase().auth.getSession()
    if (error) throw error
    const profile = await loadProfile(data.session)
    if (!profile) throw new Error('No confirmed account session was returned. The confirmation link may have expired.')
  }, [loadProfile])

  useEffect(() => {
    let active = true
    let revision = 0
    const client = supabase

    if (!client) {
      setIsLoading(false)
      return
    }

    const synchronize = async (session: Session | null) => {
      const currentRevision = ++revision
      setToken(session?.access_token ?? null)
      try {
        const profile = await fetchProfile(session)
        if (active && currentRevision === revision) setUser(profile)
      } catch (error) {
        console.error('[auth] Could not load the authenticated profile:', error)
        if (active && currentRevision === revision) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (active && currentRevision === revision) setIsLoading(false)
      }
    }

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (loginInProgress.current) {
        ignoredAuthSession.current = session?.access_token ?? null
        return
      }
      if (session?.access_token && session.access_token === ignoredAuthSession.current) return
      if (!session) ignoredAuthSession.current = null
      void synchronize(session)
    })

    void client.auth.getSession().then(({ data, error }) => {
      if (error) throw error
      return synchronize(data.session)
    }).catch((error: unknown) => {
      console.error('[auth] Could not restore the Supabase session:', error)
      if (active) {
        setToken(null)
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const login = useCallback(async (email: string, password: string, role: User['role']) => {
    const client = requireSupabase()
    loginInProgress.current = true
    setIsLoading(true)
    let session: Session | null = null
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      })
      if (error) throw error
      session = data.session
      if (!session) throw new Error('Sign-in did not return an authenticated session.')

      const profile = await fetchProfile(session)
      if (!profile) throw new Error('Could not load your account profile.')
      if (profile.role !== role) {
        throw new Error(`This account is registered as a ${profile.role}. Choose ${profile.role} sign-in.`)
      }

      ignoredAuthSession.current = null
      setToken(session.access_token)
      setUser(profile)
      return profile
    } catch (error) {
      if (session) {
        ignoredAuthSession.current = session.access_token
        const { error: signOutError } = await client.auth.signOut()
        if (signOutError) {
          console.error('[auth] Could not clear a rejected sign-in session:', signOutError)
          throw new Error('Sign-in could not be completed and the session could not be cleared. Please reload and try again.')
        }
        setToken(null)
        setUser(null)
      }
      throw error
    } finally {
      loginInProgress.current = false
      setIsLoading(false)
    }
  }, [fetchProfile])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const normalizedEmail = normalizeEmail(email)
      const { data, error } = await requireSupabase().auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      if (data.session) await loadProfile(data.session)
      return { email: normalizedEmail, needsEmailConfirmation: !data.session }
    } finally {
      setIsLoading(false)
    }
  }, [loadProfile])

  const resendSignupConfirmation = useCallback(async (email: string) => {
    const { error } = await requireSupabase().auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw error
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await requireSupabase().auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await requireSupabase().auth.updateUser({ password })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    const { error } = await requireSupabase().auth.signOut()
    if (error) throw error
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    resendSignupConfirmation,
    requestPasswordReset,
    updatePassword,
    refreshUser,
    logout,
  }), [
    user, token, isLoading, login, register, resendSignupConfirmation,
    requestPasswordReset, updatePassword, refreshUser, logout,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
