import React, { useEffect, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { Download } from 'lucide-react'
import apiClient from '@/services/api'
import { formatTimestamp } from '@/utils/formatTimestamp'


export interface LogItem {
  id: number
  userId: number
  name: string
  email: string
  action: string
  status: 'success' | 'failed'
  timestamp: string
}

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([])
  const normalizedLogs = Array.isArray(logs) ? logs : []

  useEffect(() => {

    const loadLogs = async () => {
      try {
        const response = await apiClient.get('/access-logs')

        console.log('ACCESS LOGS RESPONSE:', response.data)


        const data = response?.data
        console.log('LOGS RECEIVED:', data)

        // Normalize possible response shapes into ONE array, then map once.
        // A) data = [...]
        // B) data = { logs: [...] }
        // C) data = { success: true, data: [...] }
        const rawLogs: any[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.logs)
            ? (data as any).logs
            : Array.isArray((data as any)?.data)
              ? (data as any).data
              : []

        const normalized: LogItem[] = rawLogs.map((r: any) => ({
          id: Number(r.id),
          userId: Number(r.userId ?? r.user_id),
          name: String(r.name ?? ''),
          email: String(r.email ?? ''),
          action: String(r.action ?? ''),
          status:
            r.status === 'success' || r.status === 'failed'
              ? r.status
              : String(r.status ?? '').toLowerCase() === 'failed'
                ? 'failed'
                : 'success',
          timestamp: String(r.timestamp ?? r.created_at ?? r.createdAt ?? ''),
        }))

        setLogs(normalized)


      } catch (e) {
        console.error('Failed to load logs:', e)
        setLogs([])
      }
    }

    loadLogs()
  }, [])


  const exportCsv = () => {
    const header = ['id', 'userId', 'name', 'email', 'action', 'status', 'timestamp']
    const rows = normalizedLogs.map((log) => [log.id, log.userId, log.name, log.email, log.action, log.status, log.timestamp])


    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'access-logs.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <GlobalLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Access Logs</h1>
            <p className="text-gray-400">User activity and access history</p>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            disabled={normalizedLogs.length === 0}

          >
            <Download size={18} />
            Export CSV
          </button>
        </div>

        <div className="bg-dark-900 border border-dark-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto w-full max-h-[520px] overflow-y-auto">

          {normalizedLogs.length === 0 ? (

            <div className="px-6 py-10 text-center text-gray-400">No Access Logs Available</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-800 bg-dark-800/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {normalizedLogs.map((log) => (

                  <tr key={log.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                    <td className="px-6 py-3 text-sm">
                      <div className="font-medium text-white">{log.name}</div>
                      <div className="text-[11px] text-gray-500">{log.email}</div>
                    </td>
                    <td className="px-6 py-3 text-sm">{log.action}</td>
                    <td className="px-6 py-3 text-sm text-gray-400">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          </div>
        </div>

      </div>
    </GlobalLayout>
  )
}

