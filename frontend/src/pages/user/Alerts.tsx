import React, { useEffect, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Trash2 } from 'lucide-react'
import { alertService } from '@/services/index'
import { formatTimestamp } from '@/utils/formatTimestamp'

type AlertItem = {
  id: number
  title: string
  severity: 'critical' | 'warning' | 'error'
  timestamp: string
  location: string
  read?: boolean
}

export const UserAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      case 'error':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400'
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    }
  }

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await alertService.getAlerts()
        setAlerts(Array.isArray(data) ? data : [])
      } catch (err) {
        setAlerts([])
        setError('Unable to load alerts. Please try again later.')
        console.error('UserAlerts load failed:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
  }, [])

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Alerts</h1>
            <p className="text-gray-400">Your system notifications</p>
          </div>

          <div className="flex items-center gap-4"></div>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
          <div className="space-y-2 p-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading alerts...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-400">{error}</div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No alerts found.</div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-b border-dark-800 last:border-b-0 flex items-center justify-between ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{alert.title}</h3>
                      <span
                        className={`text-[10px] uppercase tracking-[0.15em] font-semibold px-2 py-1 rounded-full ${
                          alert.read === true
                            ? 'bg-white/5 text-gray-400'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {alert.read === true ? 'Read' : 'New'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                      <span>{alert.location}</span>
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.read !== true && (
                      <button
                        onClick={async () => {
                          try {
await alertService.markAsRead(String(alert.id))

                            setAlerts((prev) =>
                              prev.map((item) =>
                                item.id === alert.id ? { ...item, read: true } : item
                              )
                            )
                          } catch {
                            // ignore mark read failures for now
                          }
                        }}
                        className="text-sm text-cyan-300 hover:text-cyan-100 transition-colors"
                        aria-label={`Mark alert ${alert.title} as read`}
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        try {
await alertService.dismissAlert(String(alert.id))

                          setAlerts((prev) => prev.filter((item) => item.id !== alert.id))
                        } catch {
                          // ignore for now
                        }
                      }}
                      className="p-2 hover:bg-black/20 rounded-lg transition-colors"
                      aria-label={`Remove alert ${alert.title}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
}

