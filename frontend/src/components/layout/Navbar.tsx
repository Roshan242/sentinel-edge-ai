import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useUIStore } from '@/store/uiStore'
import { Bell, Search, ChevronDown, Menu, Calendar, LogOut, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Overview',
  '/admin/monitoring': 'Live Cameras',
  '/admin/alerts': 'Alerts',
  '/admin/logs': 'Access Logs',
  '/admin/system': 'Devices',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
  '/user/dashboard': 'Overview',
  '/user/monitoring': 'Live Cameras',
  '/user/alerts': 'Alerts',
  '/user/logs': 'Access Logs',
  '/user/account': 'Account',
}

export const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { alerts, sidebarOpen, toggleSidebar } = useUIStore()
  const unreadAlerts = alerts.filter((a) => !a.read).length
  const [now, setNow] = useState(new Date())
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const roleLabel = user?.role === 'admin' ? 'Administrator' : 'User'
  const avatarName = encodeURIComponent(user?.name ?? 'User')
  const pageTitle = pageTitles[location.pathname] ?? 'Security'

  const handleLogout = async () => {
    setShowAdminMenu(false)
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not sign out')
    }
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#0b1220]/70 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="flex h-16 items-center gap-3 px-3 sm:px-5 lg:px-7">
        <button
          type="button"
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
          onClick={toggleSidebar}
        >
          <Menu size={19} />
        </button>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-300/20 bg-gradient-to-br from-blue-400 to-blue-700 shadow-lg shadow-blue-950/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5C7 5 3 12 3 12s4 7 9 7 9-7 9-7-4-7-9-7z" stroke="white" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight tracking-wide text-white">Sentinel-Edge</p>
            <p className="text-[10px] leading-tight text-slate-400">AI Security</p>
          </div>
        </div>

        <div className="ml-1 hidden h-8 w-px bg-white/10 sm:block" />
        <div className="hidden min-w-24 sm:block">
          <p className="text-sm font-semibold leading-tight text-white">{pageTitle}</p>
          <p className="text-[10px] leading-tight text-slate-400">Security workspace</p>
        </div>

        <div className="relative mx-auto w-full max-w-xl flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Search"
            placeholder="Search cameras, alerts..."
            className="w-full rounded-full border border-white/10 bg-white/[0.07] py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-blue-300/40 focus:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-blue-400/20"
          />
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-slate-300 lg:flex">
          <Calendar size={13} className="text-blue-300" />
          <span>{dateStr}</span>
          <span className="text-slate-500">·</span>
          <span className="tabular-nums">{timeStr}</span>
        </div>

        <button
          type="button"
          onClick={() => navigate(user?.role === 'admin' ? '/admin/alerts' : '/user/alerts')}
          className="relative shrink-0 rounded-full border border-white/10 bg-white/[0.06] p-2.5 text-slate-300 transition hover:bg-white/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label={unreadAlerts > 0 ? `Notifications, ${unreadAlerts} unread` : 'Notifications'}
        >
          <Bell size={17} />
          {unreadAlerts > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-[#0b1220] bg-amber-400" />
          )}
        </button>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] py-1.5 pl-1.5 pr-2.5 transition hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            onClick={() => setShowAdminMenu((visible) => !visible)}
            aria-expanded={showAdminMenu}
            aria-haspopup="menu"
          >
            <img
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
              src={`https://ui-avatars.com/api/?name=${avatarName}&background=334155&color=fff&size=32`}
              alt=""
            />
            <span className="hidden text-left sm:block">
              <span className="block max-w-28 truncate text-xs font-semibold leading-tight text-white">{user?.name ?? 'User'}</span>
              <span className="block text-[10px] leading-tight text-slate-400">{roleLabel}</span>
            </span>
            <ChevronDown
              size={13}
              className={`hidden text-slate-400 transition-transform duration-200 sm:block ${showAdminMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {showAdminMenu && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#111b2b]/95 py-1 shadow-2xl shadow-black/40 backdrop-blur-2xl"
            >
              <div className="border-b border-white/10 px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setShowAdminMenu(false)
                  navigate(user?.role === 'admin' ? '/admin/settings' : '/user/account')
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/[0.08]"
              >
                <User size={15} className="text-slate-400" />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-rose-300 transition hover:bg-rose-500/10"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
