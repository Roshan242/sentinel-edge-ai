import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useUIStore } from '@/store/uiStore'
import { Bell, Search, ChevronDown, Menu, Calendar, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { alerts, toggleSidebar } = useUIStore()
  const unreadAlerts = alerts.filter((a) => !a.read).length
  const [now, setNow] = useState(new Date())
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAdminMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'User'
  const avatarName = encodeURIComponent(user?.name ?? 'User')

  const handleLogout = () => {
    setShowAdminMenu(false)
    logout()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117] border-b border-white/5">
      {/* Main row */}
      <div className="flex items-center h-16 px-4 gap-4">
        {/* Logo - fixed width matches sidebar */}
        <div className="flex items-center gap-2.5 w-52 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z" stroke="white" strokeWidth="1.5" fill="none" />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Sentinel-Edge AI</p>
            <p className="text-[10px] text-gray-400 leading-tight">Smart Security System</p>
          </div>
        </div>

        {/* Hamburger + Page Title */}
        <div className="flex items-center gap-3 flex-1">
          <button
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400"
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Dashboard Overview</h1>
            <p className="text-xs text-gray-400 leading-tight">Real-time security monitoring and system overview</p>
          </div>
        </div>

        {/* Search */}
        <div className="w-64 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-[#161b27] border border-white/10 rounded-lg pl-8 pr-14 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-600/50"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-[#0d1117] border border-white/10 px-1.5 py-0.5 rounded">
              Ctrl K
            </span>
          </div>
        </div>

        {/* Bell */}
        <button
          onClick={() => {
            if (user?.role === 'admin') navigate('/admin/alerts')
            else navigate('/user/alerts')
          }}
          className="relative p-2 hover:bg-white/5 rounded-lg text-gray-400 shrink-0"
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">
              {unreadAlerts}
            </span>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1"
            onClick={() => setShowAdminMenu((v) => !v)}
            role="button"
            tabIndex={0}
            aria-expanded={showAdminMenu}
            aria-haspopup="menu"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setShowAdminMenu((v) => !v)
            }}
          >
            <div className="w-8 h-8 bg-gray-500 rounded-full overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${avatarName}&background=6b7280&color=fff&size=32`}
                alt={user?.name ?? 'User'}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">{user?.name ?? 'User'}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{roleLabel}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${showAdminMenu ? 'rotate-180' : ''}`}
            />
          </div>

          {/* Dropdown menu */}
          {showAdminMenu && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1 w-48 bg-[#161b27] border border-white/10 rounded-lg shadow-xl py-1 z-50"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                role="menuitem"
                onClick={() => {
                  setShowAdminMenu(false)
                  navigate(user?.role === 'admin' ? '/admin/settings' : '/user/account')
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors"
              >
                <User size={14} className="text-gray-400" />
                Profile
              </button>
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date/time sub-row */}
      <div className="flex justify-end items-center gap-1.5 px-4 pb-1.5 text-xs text-gray-400">
        <Calendar size={12} />
        <span>{dateStr}</span>
        <span className="ml-2">{timeStr}</span>
      </div>
    </nav>
  )
}
