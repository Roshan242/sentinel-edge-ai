import apiClient from './api'

export interface UserItem {
  id: number
  name: string
  email: string
  status: 'registered' | 'pending'
  registeredDate: string
}

export interface AlertItem {
  id: number
  title: string
  severity: 'critical' | 'warning' | 'error'
  timestamp: string
  location: string
  read?: boolean
  /** Optional additional info (reason/message/metadata) */
  message?: string
  description?: string
  event_type?: string
  reason?: string
}

export interface LogItem {
  id: number
  userId: number
  name: string
  email: string
  action: string
  status: 'success' | 'failed'
  timestamp: string
}

export const getAccessLogs = async (): Promise<LogItem[]> => {
  const response = await apiClient.get<LogItem[]>('/access-logs')
  return response.data
}


export interface SettingsData {

  systemName: string
  location: string
  emailAlerts: boolean
  smsNotifications: boolean
  suspiciousActivityAlerts: boolean
  twoFactorEnabled: boolean
}

export const getUsers = async (): Promise<UserItem[]> => {
  const response = await apiClient.get<UserItem[]>('/admin/users')
  return response.data
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  status: 'registered' | 'pending'
}

export const addUser = async (user: CreateUserPayload): Promise<UserItem> => {
  const response = await apiClient.post<UserItem>('/admin/users', user)
  return response.data
}

export const updateUser = async (user: UserItem): Promise<UserItem> => {
  const response = await apiClient.put<UserItem>(`/admin/users/${user.id}`, user)
  return response.data
}

export const deleteUser = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/users/${id}`)
}

const normalizeArrayResponse = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[]

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>

    // common shapes: { alerts: [] }, { logs: [] }, { data: [] }
    const maybeAlerts = obj.alerts
    if (Array.isArray(maybeAlerts)) return maybeAlerts as T[]

    const maybeLogs = obj.logs
    if (Array.isArray(maybeLogs)) return maybeLogs as T[]

    const maybeData = obj.data
    if (Array.isArray(maybeData)) return maybeData as T[]
  }

  return []
}

export const getAlerts = async (): Promise<AlertItem[]> => {
  const response = await apiClient.get<unknown>('/admin/alerts')
  return normalizeArrayResponse<AlertItem>(response.data)
}


export const deleteAlert = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/alerts/${id}`)
}

export const getLogs = async (): Promise<LogItem[]> => {
  const response = await apiClient.get<unknown>('/admin/logs')
  return normalizeArrayResponse<LogItem>(response.data)
}


export const getSettings = async (): Promise<SettingsData> => {
  const response = await apiClient.get<SettingsData>('/admin/settings')
  return response.data
}

export const saveSettings = async (settings: SettingsData): Promise<SettingsData> => {
  const response = await apiClient.put<SettingsData>('/admin/settings', settings)
  return response.data
}
