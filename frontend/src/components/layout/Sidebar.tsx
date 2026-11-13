import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useUIStore } from '@/store/uiStore'
import { LayoutDashboard, Video, Bell, FileText, Cpu, Users, Settings } from 'lucide-react'

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
  { icon: Video, label: 'Live Cameras', path: '/admin/monitoring' },
  { icon: Bell, label: 'Alerts', path: '/admin/alerts' },
  { icon: FileText, label: 'Access Logs', path: '/admin/logs' },
  { icon: Cpu, label: 'Devices', path: '/admin/system' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
]

const userMenuItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/user/dashboard' },
  { icon: Video, label: 'Live Cameras', path: '/user/monitoring' },
  { icon: Bell, label: 'Alerts', path: '/user/alerts' },
  { icon: FileText, label: 'Access Logs', path: '/user/logs' },
  { icon: Settings, label: 'Settings', path: '/user/account' },
]

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { sidebarOpen } = useUIStore()
  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

  return (
    <aside
      aria-label="Main navigation"
      className={`fixed bottom-4 left-3 top-20 z-40 flex w-14 flex-col rounded-2xl border border-white/10 bg-[#0b1220]/75 py-3 shadow-[0_16px_48px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-20'
      }`}
    >
      <nav className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              title={item.label}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
