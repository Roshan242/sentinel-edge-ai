import axios from 'axios'
import { supabase } from '@/lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const shapeSummary = (data: unknown): string => {
  if (Array.isArray(data)) return `array(len=${data.length})`
  if (data && typeof data === 'object') return `object(keys=${Object.keys(data).join(',')})`
  return String(data)
}

apiClient.interceptors.request.use(async config => {
  if (supabase) {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    if (data.session?.access_token) {
      config.headers.Authorization = `Bearer ${data.session.access_token}`
    }
  }

  console.log('[api] request', {
    method: (config.method || 'GET').toUpperCase(),
    url: `${config.baseURL || ''}${config.url || ''}`,
  })
  return config
})

apiClient.interceptors.response.use(
  response => {
    console.log('[api] response', {
      url: `${response.config.baseURL || ''}${response.config.url || ''}`,
      status: response.status,
      dataShape: shapeSummary(response.data),
      dataIsArray: Array.isArray(response.data),
      dataPreview: Array.isArray(response.data) ? response.data.slice(0, 3) : undefined,
    })
    return response
  },
  async error => {
    const status = error.response?.status
    console.log('[api] error response', {
      url: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
      status,
      dataShape: shapeSummary(error.response?.data),
    })

    if (status === 401) {
      try {
        await supabase?.auth.signOut({ scope: 'local' })
      } catch (signOutError) {
        console.warn('[api] Could not clear the expired Supabase session:', signOutError)
      }
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
