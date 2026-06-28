import React, { useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { useAuth } from '@/context/AuthContext'
import { User, Shield, Bell, Save } from 'lucide-react'

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#161b27] border border-white/5 rounded-xl ${className}`}>{children}</div>
)

const inputCls = "w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-600/50"

export const UserAccount: React.FC = () => {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email] = useState(user?.email ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <GlobalLayout>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left: Profile + Security */}
        <div className="col-span-7 space-y-4">
          {/* Profile */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
              <User size={15} className="text-blue-400" /> Profile Information
            </div>
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/5">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                {name[0] ?? 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                <p className="text-xs text-gray-400">{email}</p>
                <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full mt-1 inline-block">Active User</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Email Address</label>
                <input value={email} readOnly className={inputCls + ' opacity-60 cursor-not-allowed'} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Role</label>
                <div className={inputCls + ' opacity-60'}>User</div>
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
              <Shield size={15} className="text-purple-400" /> Security
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className={inputCls} />
              </div>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Update Password
              </button>
            </div>
          </Card>
        </div>

        {/* Right: Notifications + Save */}
        <div className="col-span-5 space-y-4">
          {/* Notifications */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold">
              <Bell size={15} className="text-yellow-400" /> Notifications
            </div>
            <div className="space-y-3">
              {[
                { label: 'Access Denied Alerts', desc: 'Notify when access is denied', on: true },
                { label: 'Camera Motion Alerts', desc: 'Notify on motion detection', on: true },
                { label: 'System Notifications', desc: 'General system updates', on: false },
              ].map(({ label, desc, on }, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-white">{label}</p>
                    <p className="text-[10px] text-gray-500">{desc}</p>
                  </div>
                  <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${on ? 'bg-blue-600' : 'bg-gray-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${on ? 'left-4' : 'left-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-5">
            <p className="text-sm font-semibold text-white mb-3">Account Details</p>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Account ID', value: '#USR-0042' },
                { label: 'Member Since', value: 'Jan 2025' },
                { label: 'Last Login', value: 'Today 10:30 AM' },
                { label: 'Access Level', value: 'Standard User' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-300 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-6 pb-2">
        © 2025 Sentinel-Edge AI. All rights reserved.
      </p>
    </GlobalLayout>
  )
}
