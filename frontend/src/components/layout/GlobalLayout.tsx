import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { useUIStore } from '@/store/uiStore'

export const GlobalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="relative isolate min-h-screen bg-[#080d18] text-gray-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_10%_18%,rgba(59,130,246,0.22),transparent_38%),radial-gradient(ellipse_at_88%_16%,rgba(14,165,233,0.12),transparent_32%),radial-gradient(ellipse_at_60%_100%,rgba(30,64,175,0.12),transparent_42%),linear-gradient(145deg,#0b1220,#080d18_58%,#0b1020)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.12] [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />

      <Navbar />
      <Sidebar />
      <main
        className={`relative z-10 ${sidebarOpen ? 'lg:ml-[4.75rem]' : 'ml-0'} min-h-screen pt-20 transition-all duration-300`}
      >
        <div className="p-4 sm:p-6 lg:p-7">{children}</div>
      </main>
    </div>
  )

}
