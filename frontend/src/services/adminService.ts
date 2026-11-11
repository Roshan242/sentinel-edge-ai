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

const unwrapArray = <T,>(payload: any): T[] => {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === 'object') {
    // { success: true, data: [...] }
    if (Array.isArray(payload.data)) return payload.data as T[]
    // { data: [...] } or { alerts: [...] } / { logs: [...] }
    if (Array.isArray((payload as any).alerts)) return (payload as any).alerts as T[]
    if (Array.isArray((payload as any).logs)) return (payload as any).logs as T[]
  }
  return []
}

export const getAccessLogs = async (): Promise<LogItem[]> => {
  const response = await apiClient.get<any>('/access-logs')
  return unwrapArray<LogItem>(response.data)
}



export interface SettingsData {

  systemName: string
  location: string
  emailAlerts: boolean
  smsNotifications: boolean
  suspiciousActivityAlerts: boolean
}

export const getUsers = async (): Promise<UserItem[]> => {
  const response = await apiClient.get<any>('/admin/users')
  return unwrapArray<UserItem>(response.data)
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
  return unwrapArray<T>(data)
}


export const getAlerts = async (): Promise<AlertItem[]> => {
  const response = await apiClient.get<any>('/admin/alerts')
  return normalizeArrayResponse<AlertItem>(response.data)
}



export const deleteAlert = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/alerts/${id}`)
}

export const getLogs = async (): Promise<LogItem[]> => {
  const response = await apiClient.get<any>('/admin/logs')
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
