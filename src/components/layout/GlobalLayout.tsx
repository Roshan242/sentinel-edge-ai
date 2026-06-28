import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/store/uiStore'

export const GlobalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen text-gray-100 bg-[#070a14]">
      {/* premium dark backdrop */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.22),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(34,197,94,0.12),_transparent_55%)]" />
      <div className="fixed inset-0 -z-10 opacity-[0.18] pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px]" />

      <Navbar />
      <Sidebar />
      <main
        className={`${sidebarOpen ? 'lg:ml-52' : 'ml-0'} pt-[72px] min-h-screen transition-all duration-300`}
      >
        <div className="p-5 sm:p-6 lg:p-7">{children}</div>
      </main>
    </div>
  )

}
