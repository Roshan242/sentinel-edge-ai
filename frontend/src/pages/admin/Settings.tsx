import React, { useEffect, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Bell, Lock, Eye } from 'lucide-react'
import { getSettings, saveSettings, SettingsData } from '@/services/adminService'

export const AdminSettings: React.FC = () => {
  const [systemName, setSystemName] = useState('SENTINEL-EDGE AI')
  const [location, setLocation] = useState('Main Office')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [suspiciousActivityAlerts, setSuspiciousActivityAlerts] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleSave = async () => {
    const settings: SettingsData = {
      systemName,
      location,
      emailAlerts,
      smsNotifications,
      suspiciousActivityAlerts,
      twoFactorEnabled,
    }
    await saveSettings(settings)
    setInitialSettings(settings)
    setStatusMessage('Settings saved locally.')
  }

  const [initialSettings, setInitialSettings] = useState<SettingsData | null>(null)

  const handleCancel = () => {
    if (initialSettings) {
      setSystemName(initialSettings.systemName)
      setLocation(initialSettings.location)
      setEmailAlerts(initialSettings.emailAlerts)
      setSmsNotifications(initialSettings.smsNotifications)
      setSuspiciousActivityAlerts(initialSettings.suspiciousActivityAlerts)
      setTwoFactorEnabled(initialSettings.twoFactorEnabled)
      setStatusMessage('Changes canceled.')
    }
  }

  const handleChangePassword = () => {
    setStatusMessage('Password change is not available in mock mode.')
  }

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings()
      setSystemName(settings.systemName)
      setLocation(settings.location)
      setEmailAlerts(settings.emailAlerts)
      setSmsNotifications(settings.smsNotifications)
      setSuspiciousActivityAlerts(settings.suspiciousActivityAlerts)
      setTwoFactorEnabled(settings.twoFactorEnabled)
      setInitialSettings(settings)
    }

    loadSettings()
  }, [])

  const handleToggleTwoFactor = () => {
    const nextValue = !twoFactorEnabled
    setTwoFactorEnabled(nextValue)
    setStatusMessage(`Two-factor authentication ${nextValue ? 'enabled' : 'disabled'} locally.`)
  }

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-400">Manage system configuration</p>
        </div>

        <div className="max-w-2xl space-y-6">
          {statusMessage && (
            <div className="rounded-lg border border-primary-600/30 bg-primary-500/10 p-4 text-sm text-primary-100">
              {statusMessage}
            </div>
          )}
          {/* General Settings */}
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Eye size={20} /> General Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">System Name</label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bell size={20} /> Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-primary-600"
                />
                <span className="text-sm">Email alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-primary-600"
                />
                <span className="text-sm">SMS notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={suspiciousActivityAlerts}
                  onChange={(e) => setSuspiciousActivityAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-primary-600"
                />
                <span className="text-sm">Alert on suspicious activity</span>
              </label>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-dark-900 border border-dark-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Lock size={20} /> Security
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
              >
                Change Password
              </button>
              <button
                onClick={handleToggleTwoFactor}
                className="w-full px-4 py-2 border border-primary-600 hover:bg-primary-600/10 rounded-lg font-medium transition-colors"
              >
                {twoFactorEnabled ? 'Disable Two-Factor Authentication' : 'Enable Two-Factor Authentication'}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-dark-700 hover:border-dark-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
}
