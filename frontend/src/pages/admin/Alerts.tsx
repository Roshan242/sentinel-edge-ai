import React, { useEffect, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Trash2 } from 'lucide-react'

import { deleteAlert, getAlerts, AlertItem } from '@/services/adminService'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { AlertDetailsModal } from './AlertDetailsModal'

export const AdminAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)


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
      const data = await getAlerts()
      setAlerts(data)
    }
    loadAlerts()
  }, [])

  return (
    <GlobalLayout>
      <AlertDetailsModal
        open={detailsOpen}
        alert={selectedAlert}
        onClose={() => setDetailsOpen(false)}
        onDismiss={async () => {
          if (!selectedAlert) return
          await deleteAlert(selectedAlert.id)
          setAlerts((prev) => prev.filter((a) => a.id !== selectedAlert.id))
          setDetailsOpen(false)
        }}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">Alerts</h1>
            <p className="text-gray-400">System alerts and notifications</p>
          </div>

          <div className="flex items-center gap-4"></div>

        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  setSelectedAlert(alert)
                  setDetailsOpen(true)
                }}

                className={`w-full text-left p-4 border-b border-dark-800 last:border-b-0 flex items-center justify-between cursor-pointer ${getSeverityColor(
                  alert.severity
                )} hover:bg-white/[0.03] transition-colors`}
              >
                <div className="flex-1">

                  <h3 className="font-semibold">{alert.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mt-1">
                    <span>{alert.location}</span>
                    <span>{formatTimestamp(alert.timestamp)}</span>
                  </div>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    void (async () => {
                      await deleteAlert(alert.id)
                      setAlerts((prev) => prev.filter((item) => item.id !== alert.id))
                    })()
                  }}
                  role="button"
                  tabIndex={0}
                  className="p-2 hover:bg-black/20 rounded-lg transition-colors"
                  aria-label={`Remove alert ${alert.title}`}
                >
                  <Trash2 size={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlobalLayout>
  )
}