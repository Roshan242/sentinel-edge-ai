import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useUIStore } from '@/store/uiStore'
import { LayoutDashboard, Video, Bell, FileText, Cpu, Users, Settings, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const { user, logout } = useAuth()
  const { sidebarOpen } = useUIStore()
  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems

  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'User'
  const avatarName = encodeURIComponent(user?.name ?? 'User')

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out')
    }
  }

  return (
    <aside
      className={`fixed left-0 top-[72px] bottom-0 w-52 z-40 flex flex-col transition-transform duration-300 backdrop-blur supports-[backdrop-filter]:bg-[#0A1224]/60 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-[#0A1224]/90 border-r border-[#1E293B] shadow-[0_0_0_1px_rgba(30,41,59,0.6)]`}
    >
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium overflow-hidden ${
                isActive ? 'text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {/* active indicator */}
              <span
                className={`absolute left-0 top-1 bottom-1 w-1 rounded-r-full transition-all ${
                  isActive
                    ? 'bg-[#06B6D4] shadow-[0_0_18px_rgba(6,182,212,0.35)]'
                    : 'bg-transparent group-hover:bg-white/10'
                }`}
              />
              <span
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isActive ? 'opacity-100' : ''
                } bg-white/5`}
              />

              <span
                className={`relative flex items-center justify-center ${
                  isActive ? 'text-[#3B82F6]' : 'text-[#64748B] group-hover:text-[#94A3B8]'
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="relative">{item.label}</span>
            </button>
          )
        })}
      </nav>


      {/* Profile + Logout */}
      <div className="border-t border-white/5 p-3 space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="relative shrink-0">
            <div className="w-8 h-8 bg-gray-500 rounded-full overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${avatarName}&background=6b7280&color=fff&size=32`}
                alt={user?.name ?? 'User'}
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d1117]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-[10px] text-gray-400">{roleLabel}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-gray-200 text-sm font-medium transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
