import apiClient from './api'

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string) =>
    apiClient.post('/auth/register', { name, email, password }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
}

export const dashboardService = {
  getAdminDashboard: () =>
    apiClient.get('/dashboard/admin'),
  
  getUserDashboard: () =>
    apiClient.get('/dashboard/user'),
}

export const alertService = {
  getAlerts: async (limit = 50) => {
    const response = await apiClient.get('/alerts', { params: { limit } })
    return response.data
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.put(`/alerts/${id}/read`)
    return response.data
  },

  dismissAlert: async (id: string) => {
    const response = await apiClient.delete(`/alerts/${id}`)
    return response.data
  },
}

export const logsService = {
  getAccessLogs: (filters?: Record<string, any>) =>
    apiClient.get('/logs/access', { params: filters }),
  
  exportLogs: (format: 'csv' | 'json') =>
    apiClient.get(`/logs/export`, { params: { format }, responseType: 'blob' }),
}

export const cameraService = {
  getCameras: () =>
    apiClient.get('/cameras'),
  
  getCameraFeed: (cameraId: string) =>
    apiClient.get(`/cameras/${cameraId}/feed`),
}

export const systemService = {
  getSystemStatus: () =>
    apiClient.get('/system/status'),
  
  getSystemHealth: () =>
    apiClient.get('/system/health'),
}

export const userService = {
  // Backend routes are under /admin/users
  getUsers: () => apiClient.get('/admin/users'),

  createUser: (userData: Record<string, any>) => apiClient.post('/admin/users', userData),

  updateUser: (id: string, userData: Record<string, any>) =>
    apiClient.put(`/admin/users/${id}`, userData),

  deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
}
