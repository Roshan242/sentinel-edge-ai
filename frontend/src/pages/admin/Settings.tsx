import React, { useEffect, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Bell, Lock, Eye } from 'lucide-react'
import { getSettings, saveSettings, SettingsData } from '@/services/adminService'
import { useAuth } from '@/context/AuthContext'

export const AdminSettings: React.FC = () => {
  const [systemName, setSystemName] = useState('SENTINEL-EDGE AI')
  const [location, setLocation] = useState('Main Office')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [suspiciousActivityAlerts, setSuspiciousActivityAlerts] = useState(true)
  const [statusMessage, setStatusMessage] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { updatePassword } = useAuth()

  const handleSave = async () => {
    const settings: SettingsData = {
      systemName,
      location,
      emailAlerts,
      smsNotifications,
      suspiciousActivityAlerts,
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
      setStatusMessage('Changes canceled.')
    }
  }

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatusMessage('')
    if (newPassword.length < 8) {
      setStatusMessage('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage('The new passwords do not match.')
      return
    }
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setStatusMessage('Password updated successfully.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Could not update the password.')
    }
  }

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings()
      setSystemName(settings.systemName)
      setLocation(settings.location)
      setEmailAlerts(settings.emailAlerts)
      setSmsNotifications(settings.smsNotifications)
      setSuspiciousActivityAlerts(settings.suspiciousActivityAlerts)
      setInitialSettings(settings)
    }

    loadSettings()
  }, [])

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
              <form onSubmit={handleChangePassword} className="space-y-3">
                <label className="block text-sm">
                  New password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={8}
                    required
                    className="mt-2 w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </label>
                <label className="block text-sm">
                  Confirm new password
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    required
                    className="mt-2 w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </label>
                <button type="submit" className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors">
                  Update Password
                </button>
              </form>
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
