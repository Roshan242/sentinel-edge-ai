import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const shapeSummary = (data: any): string => {
  if (Array.isArray(data)) return `array(len=${data.length})`
  if (data && typeof data === 'object') {
    const keys = Object.keys(data)
    return `object(keys=${keys.join(',')})`
  }
  return String(data)
}

// Request logging + token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  const url = `${config.baseURL || ''}${config.url || ''}`
  console.log('[api] request', {
    method: (config.method || 'GET').toUpperCase(),
    url,
  })

  return config
})

// Handle responses + response logging
apiClient.interceptors.response.use(
  (response) => {
    const url = `${response.config.baseURL || ''}${response.config.url || ''}`
    console.log('[api] response', {
      url,
      status: response.status,
      dataShape: shapeSummary(response.data),
      dataIsArray: Array.isArray(response.data),
      // Avoid dumping large payloads
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dataPreview: Array.isArray(response.data) ? response.data.slice(0, 3) : undefined,
    })
    return response
  },
  (error) => {
    const url = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`
    const status = error.response?.status
    console.log('[api] error response', {
      url,
      status,
      dataShape: shapeSummary(error.response?.data),
    })

    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient

