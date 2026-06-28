import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  login: (email: string, password: string) => Promise<void | { requiresOtp: boolean; otpToken?: string }>
  requestOtp: (email: string) => Promise<{ otpToken: string; expiresIn: number }>
  verifyOtp: (email: string, otpToken: string, otp: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string, role?: 'admin' | 'user') => Promise<{ otpToken: string; email: string; expiresIn: number }>
  syncAuthFromLocalStorage: () => void
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user')
    return storedUser ? (JSON.parse(storedUser) as User) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  const syncFromLocalStorage = useCallback(() => {
    const nextToken = localStorage.getItem('token')
    const nextUserRaw = localStorage.getItem('user')

    console.log('AUTH HYDRATED: syncFromLocalStorage()')
    setToken(nextToken)
    setUser(nextUserRaw ? (JSON.parse(nextUserRaw) as User) : null)
    console.log('TOKEN STATE:', nextToken)
    console.log('USER STATE:', nextUserRaw ? (JSON.parse(nextUserRaw) as User) : null)
  }, [])

  useEffect(() => {
    syncFromLocalStorage()
  }, [syncFromLocalStorage])

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'


  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || 'Login failed')
      }

      const data = (await response.json()) as
        | { token: string; user: User }
        | { requiresOtp: boolean; message?: string; otpToken?: string }

      if ('requiresOtp' in data && data.requiresOtp) {
        return data
      }

      // password-only login
      if ('token' in data) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [API_BASE_URL])

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('token')
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
        },
      })
    } catch (err) {
      console.warn('Logout request failed:', err)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [API_BASE_URL])

  const register = useCallback(
    async (name: string, email: string, password: string, role: 'admin' | 'user' = 'user') => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role }),
        })

        if (!response.ok) {
          const text = await response.text().catch(() => '')
          throw new Error(text || 'Registration failed')
        }

        const requestPayload = { name, email, password, role }
        console.log('REGISTER REQUEST PAYLOAD (frontend):', requestPayload)

        const data = (await response.json()) as { otpToken: string; email: string; expiresIn: number }
        console.log('REGISTER RESPONSE (frontend):', data)

        localStorage.setItem('pendingAuthEmail', data.email)
        localStorage.setItem('pendingAuthOtpToken', data.otpToken)
        localStorage.setItem('pendingAuthOtpExpiresIn', String(data.expiresIn))
        return data

      } finally {
        setIsLoading(false)
      }
    },
    [API_BASE_URL]
  )





  const requestOtp = useCallback(
    async (email: string) => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login/request-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!response.ok) throw new Error('Failed to request OTP')
        return (await response.json()) as { otpToken: string; expiresIn: number }
      } finally {
        setIsLoading(false)
      }
    },
    [API_BASE_URL]
  )

  const verifyOtp = useCallback(
    async (email: string, otpToken: string, otp: string) => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otpToken, otp }),
        })

        console.log('VERIFY RESPONSE STATUS:', response.status)

        if (!response.ok) throw new Error('Invalid OTP')

        const data = (await response.json()) as { token: string; user: User }
        console.log('VERIFY RESPONSE DATA:', data)

        setToken(data.token)
        setUser(data.user)
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } finally {
        setIsLoading(false)
      }
    },
    [API_BASE_URL]
  )


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,

        login,
        requestOtp,
        verifyOtp,
        logout,
        register,
        syncAuthFromLocalStorage: syncFromLocalStorage,
      }}
    >
      {children}
    </AuthContext.Provider>

  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

