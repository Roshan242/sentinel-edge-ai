import React, { useEffect, useMemo, useState } from 'react'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { FileText, Search, Download, RefreshCw } from 'lucide-react'
import apiClient from '@/services/api'

type AccessLogRow = {
  id: number
  userId: number
  name: string
  email: string
  action: string
  status: 'success' | 'failed' | string
  timestamp: string
}


const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-[#161b27] border border-white/5 rounded-xl ${className}`}>{children}</div>
)

export const UserLogs: React.FC = () => {
  const [search, setSearch] = useState('')
  const [logs, setLogs] = useState<AccessLogRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/my-access-logs')
      const rows = Array.isArray(res.data) ? (res.data as any[]) : []
      const normalized: AccessLogRow[] = rows.map((r: any) => ({
        id: Number(r.id),
        userId: Number(r.userId ?? r.user_id),
        name: String(r.name ?? ''),
        email: String(r.email ?? ''),
        action: String(r.action ?? ''),
        status: String(r.status ?? ''),
        timestamp: String(r.timestamp ?? r.created_at ?? r.createdAt ?? ''),
      }))

      setLogs(normalized)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!mounted) return
      await loadLogs()
    })()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((l) => {
      const hay = [l.action, l.status, l.name, l.email].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [logs, search])

  const exportCsv = () => {
    const header = ['id', 'userId', 'name', 'email', 'action', 'status', 'timestamp']
    const rows = filtered.map((log) => [log.id, log.userId, log.name, log.email, log.action, log.status, log.timestamp])
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'my-access-logs.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const successCount = useMemo(() => logs.filter((l) => String(l.status).toLowerCase() === 'success').length, [logs])
  const failedCount = useMemo(() => logs.filter((l) => String(l.status).toLowerCase() === 'failed').length, [logs])

  return (
    <GlobalLayout>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Access Logs</h1>
        <p className="text-xs text-gray-400">Your personal access history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Events', value: logs.length.toString(), color: 'text-white' },
          { label: 'Successful', value: successCount.toString(), color: 'text-green-400' },
          { label: 'Failed', value: failedCount.toString(), color: 'text-red-400' },
        ].map(({ label, value, color }, i) => (
          <Card key={i} className="p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <FileText size={15} className="text-gray-300" /> My Access Logs
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-[#0d1117] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-600/50 w-40"
              />
            </div>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#0d1117] border border-white/10 px-3 py-1.5 rounded-lg hover:border-blue-600/50 disabled:opacity-50"
              disabled={filtered.length === 0}
            >
              <Download size={12} /> Export
            </button>

            <button
              onClick={() => loadLogs()}
              className="flex items-center justify-center p-1.5 text-xs text-gray-400 bg-[#0d1117] border border-white/10 rounded-lg hover:border-blue-600/50 disabled:opacity-50"
              disabled={loading}
              aria-label="Refresh logs"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-white/5">
              {['#','Action','Result','Time','User'].map((h) => (
                <th key={h} className="text-left pb-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? null : filtered.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-xs text-gray-500" colSpan={5}>
                  No access logs available yet.
                </td>
              </tr>
            ) : (
              filtered.map((log, i) => {
                const failed = String(log.status).toLowerCase() !== 'success'
                return (
                  <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                    <td className="py-2.5 text-gray-500">{i + 1}</td>
                    <td className="py-2.5 text-gray-300">{log.action}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${failed ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'}`}
                      >
                        {failed ? 'Failed' : 'Success'}
                      </span>
                    </td>
                    <td className="py-2.5 text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</td>
                    <td className="py-2.5 text-gray-400">{log.name || '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Card>


      <p className="text-center text-xs text-gray-600 mt-6 pb-2">
        © 2025 Sentinel-Edge AI. All rights reserved.
      </p>
    </GlobalLayout>
  )
}
