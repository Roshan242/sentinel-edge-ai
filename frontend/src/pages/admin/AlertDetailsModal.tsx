import React from 'react'

import { X } from 'lucide-react'

import type { AlertItem } from '@/services/adminService'
import { formatTimestamp } from '@/utils/formatTimestamp'

export type AlertDetailsModalProps = {
  open: boolean
  alert: AlertItem | null
  onClose: () => void
  onDismiss: () => void
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ open, alert, onClose, onDismiss }) => {
  if (!open || !alert) return null

  const severityTone = alert.severity === 'critical' || alert.severity === 'error'
    ? 'bg-red-500/10 border-red-500/30 text-red-300'
    : alert.severity === 'warning'
      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-[92vw] max-w-lg rounded-2xl border border-white/10 bg-[#0b1224]/90 backdrop-blur p-5 shadow-[0_0_60px_rgba(59,130,246,0.20)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full border ${severityTone} text-[11px] font-semibold`}> 
                {alert.severity.toUpperCase()}
              </div>
            </div>
            <h2 className="mt-3 text-lg font-semibold text-white truncate">{alert.title}</h2>
            <div className="mt-2 text-xs text-gray-500">Why this alert happened</div>
            <p className="mt-1 text-sm text-gray-400 break-words">{alert.location}</p>
            <p className="mt-1 text-xs text-gray-500">{formatTimestamp(alert.timestamp)}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="text-sm text-gray-300 whitespace-pre-wrap">
            {(() => {
              const detail =
                alert.reason ||
                (alert as any)?.message ||
                (alert as any)?.description ||
                (alert as any)?.event_type

              return detail ? String(detail) : 'No additional details available for this alert.'
            })()}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 hover:bg-red-500/20 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

