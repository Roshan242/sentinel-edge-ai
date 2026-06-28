import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface Alert {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
  timestamp: string // ISO string — Date objects don't survive JSON serialization in persist
  read: boolean
}

interface UIStore {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  alerts: Alert[]
  
  toggleTheme: () => void
  toggleSidebar: () => void
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void
  removeAlert: (id: string) => void
  markAlertAsRead: (id: string) => void
  clearAlerts: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    devtools((set) => ({
      theme: 'dark',
      sidebarOpen: true,
      alerts: [],
      
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      
      toggleSidebar: () =>
        set((state) => ({
          sidebarOpen: !state.sidebarOpen,
        })),
      
      addAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: `alert-${Date.now()}`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.alerts,
          ],
        })),
      
      removeAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        })),
      
      markAlertAsRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, read: true } : a
          ),
        })),
      
      clearAlerts: () =>
        set({
          alerts: [],
        }),
    })),
    {
      name: 'ui-store',
    }
  )
)
