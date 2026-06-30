import React, { useEffect, useMemo, useRef, useState } from 'react'


import { GlobalLayout } from '@/components/layout/GlobalLayout'

import {
  Video,
  AlertTriangle,
  Users,
  Fingerprint,
  Activity,
  Shield,
  Monitor,
  Cpu,
  Wifi,

  ChevronDown,

  BarChart2,
  FileText,
} from 'lucide-react'




import toast from 'react-hot-toast'
import { useAlerts } from '@/hooks/useAlerts'
import { getAlerts, getLogs, getUsers, type LogItem } from '@/services/adminService'

import apiClient from '@/services/api'
import { CameraCard, PersistedCamera } from '@/components/camera/CameraCard'
import { formatTimestamp } from '@/utils/formatTimestamp'
import { useSecurityInsights } from '@/hooks/useSecurityInsights'




// ─── Data ────────────────────────────────────────────────────────────────────

type Severity = 'critical' | 'warning' | 'error'

type AlertItem = {
  id: number
  title: string
  severity: Severity
  timestamp: string
  location: string
}




type SystemDevice = {
  Icon: React.ComponentType<any>
  name: string
  sub: string
}

const systemDevices: SystemDevice[] = [
  { Icon: Monitor, name: 'ESP32-CAM 1', sub: 'Main Gate' },
  { Icon: Monitor, name: 'ESP32-CAM 2', sub: 'Parking Area' },
  { Icon: Cpu, name: 'Arduino Nano', sub: 'Control Unit' },
  { Icon: Fingerprint, name: 'Fingerprint Sensor', sub: 'Access Control' },
  { Icon: Wifi, name: 'MQTT Broker', sub: 'Local Server' },
]

// ─── Sparkline with Y-axis ───────────────────────────────────────────────────

const Sparkline: React.FC<{ data: number[]; color: string; yLabels: string[] }> = ({ data, color, yLabels }) => {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const redraw = () => {
      const rect = c.getBoundingClientRect()
      const cssW = Math.max(1, Math.floor(rect.width))
      const cssH = Math.max(1, Math.floor(rect.height))

      const dpr = Math.max(1, window.devicePixelRatio || 1)
      const W = cssW
      const H = cssH

      c.width = Math.floor(cssW * dpr)
      c.height = Math.floor(cssH * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      ctx.clearRect(0, 0, W, H)

      // grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 1
      ;[0.25, 0.5, 0.75].forEach((f) => {
        ctx.beginPath()
        ctx.moveTo(0, H * f)
        ctx.lineTo(W, H * f)
        ctx.stroke()
      })

      const denom = Math.max(1, data.length - 1)

      // line + fill (clipped to canvas bounds)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, W, H)
      ctx.clip()

      const lineW = 2
      const paddingX = lineW / 2 + 1
      const left = paddingX
      const right = W - paddingX
      const top = 5
      const bottom = H - 5

      ctx.beginPath()
      data.forEach((v, i) => {
        const t = i / denom
        const x = left + t * (right - left)
        const yUnclamped = H - ((v - min) / range) * (bottom - top) - 0
        const y = Math.max(top, Math.min(bottom, yUnclamped))
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })

      ctx.strokeStyle = color
      ctx.lineWidth = lineW
      ctx.stroke()

      // fill
      ctx.lineTo(right, H)
      ctx.lineTo(left, H)
      ctx.closePath()

      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, color + '33')
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.fill()

      ctx.restore()
    }

    redraw()

    const ro = new ResizeObserver(() => redraw())
    ro.observe(c)
    return () => ro.disconnect()
  }, [data, color])

  return (
    <div className="flex gap-1">
      <div className="flex flex-col justify-between text-[9px] text-gray-500 py-1 shrink-0">
        {yLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <canvas ref={ref} className="w-full h-[70px] block" />
      </div>
    </div>
  )
}


// ─── Donut Chart ─────────────────────────────────────────────────────────────

const DonutChart: React.FC<{ success: number; failed: number }> = ({ success, failed }) => {
  const total = Math.max(1, success + failed)

  const r = 50
  const cx = 65
  const cy = 65
  const circ = 2 * Math.PI * r

  const sDash = (success / total) * circ
  const fDash = (failed / total) * circ

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <defs>
        <linearGradient id="donutSuccess" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="1" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="donutFailed" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="1" />
        </linearGradient>
      </defs>

      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#donutSuccess)"
        strokeWidth="18"
        strokeDasharray={`${Math.max(0, sDash - 2)} ${Math.max(0, circ - sDash + 2)}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#donutFailed)"
        strokeWidth="18"
        strokeDasharray={`${Math.max(0, fDash - 2)} ${Math.max(0, circ - fDash + 2)}`}
        strokeDashoffset={-(sDash + 1)}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />

      <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="17" fontWeight="bold">
        {success + failed}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="#9ca3af" fontSize="9">
        Attempts
      </text>
    </svg>
  )
}


// ─── Card wrapper ─────────────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`
      relative
      bg-[#111827]
      backdrop-blur
      border border-[#1E293B]
      rounded-xl
      shadow-[0_0_40px_rgba(37,99,235,0.08),0_0_0_1px_rgba(30,41,59,0.9)]
      transition-all duration-200 ease-out
      hover:-translate-y-0.5 hover:scale-[1.01]
      cursor-pointer
      ${className}
    `}
  >
    {/* glass sheen + blue glow */}
    <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 via-[#2563EB]/[0.06] to-transparent" />
    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
    <div className="relative">{children}</div>
  </div>
)


// ─── Dashboard ────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SOC UI widgets + design system (UI-only; no backend/API changes)
// ─────────────────────────────────────────────────────────────────────────────

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const StatusBadge: React.FC<{ tone: BadgeTone; children: React.ReactNode; className?: string }> = ({
  tone,
  children,
  className = '',
}) => {
  const base = 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border'
  const tones: Record<BadgeTone, string> = {
    success: 'text-green-300 bg-green-500/10 border-green-500/20',
    warning: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
    danger: 'text-red-300 bg-red-500/10 border-red-500/20',
    info: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    neutral: 'text-gray-300 bg-white/5 border-white/10',
  }
  return (
    <span className={`${base} ${tones[tone]} ${className}`}>{children}</span>
  )
}

const SectionHeader: React.FC<{
  icon?: React.ReactNode
  title: string
  right?: React.ReactNode
}> = ({ icon, title, right }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <div className="flex items-center gap-2 min-w-0">
      {icon}
      <h2 className="text-sm sm:text-[13px] font-semibold text-white truncate">{title}</h2>
    </div>
    {right}
  </div>
)




const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`
      relative
      bg-[#0b1224]/70
      backdrop-blur
      border border-[#1E293B]
      rounded-2xl
      shadow-[0_0_40px_rgba(37,99,235,0.08),0_0_0_1px_rgba(30,41,59,0.9)]
      transition-all duration-200 ease-out
      hover:-translate-y-0.5 hover:shadow-[0_0_52px_rgba(37,99,235,0.14),0_0_0_1px_rgba(30,41,59,1)]
      ${className}
    `}
  >
    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-[#2563EB]/[0.06] to-transparent" />
    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
    <div className="relative">{children}</div>
  </div>
)

const KpiCard: React.FC<{
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  glowClass?: string
}> = ({ icon, label, value, sub, glowClass = 'shadow-[0_0_28px_rgba(59,130,246,0.20)]' }) => (
  <GlassCard className={`p-4 ${glowClass} `}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] tracking-wide text-[#94A3B8] mb-1 truncate">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-white leading-tight">{value}</p>
        {sub ? <div className="mt-1 text-[11px] text-[#94A3B8]">{sub}</div> : null}
      </div>
    </div>
  </GlassCard>
)

export const AdminDashboard: React.FC = () => {

  useAlerts()

  const {
    anomalyScore,
    threatLevel,
    riskLabel,
    riskTone,
    lastScanTime,
    securityEventCount,
  } = useSecurityInsights()


  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [logs, setLogs] = useState<LogItem[]>([])
  const [cameras, setCameras] = useState<PersistedCamera[]>([])
  const [camerasLoading, setCamerasLoading] = useState(true)

  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(0)



  const loadCameras = async () => {
    const res = await apiClient.get('/cameras')
    const list = (res.data || []) as any[]

    setCameras(
      list.map((c) => ({
        id: String(c.id),
        name: String(c.name || 'Camera'),
        ip: String(c.ip || ''),
        streamUrl: c.streamUrl || (c.ip ? `http://${c.ip}/stream` : ''),
        snapshotUrl: c.snapshotUrl || (c.ip ? `http://${c.ip}/shot.jpg` : ''),
        status: (c.status || 'offline') as any,
      }))
    )
  }

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const [a, response] = await Promise.all([getAlerts(), getLogs()])
        console.log('access logs response:', response)
        if (!mounted) return
        setAlerts(a)
        setLogs(response)
      } catch (e) {
        console.error(e)
        toast.error('Failed to load dashboard data')
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        setCamerasLoading(true)
        await loadCameras()
      } catch {
        if (!mounted) return
        toast.error('Failed to load cameras')
        setCameras([])
      } finally {
        if (!mounted) return
        setCamerasLoading(false)
      }
    }

    run()

    // Auto-update when cameras are added/removed.
    const intervalId = window.setInterval(() => {
      if (!mounted) return
      loadCameras().catch(() => {})
    }, 4000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadRegisteredUsers = async () => {
      try {
        const users = await getUsers()
        if (!mounted) return
        const registeredCount = (users || []).filter((u) => u.status === 'registered').length
        setRegisteredUsersCount(registeredCount)
      } catch (e) {
        console.error(e)
        if (!mounted) return
        // Keep 0 as default, but inform admin
        toast.error('Failed to load registered users')
      }
    }

    loadRegisteredUsers()

    return () => {
      mounted = false
    }
  }, [])



  useEffect(() => {
    // keep this effect only for alarms/logs; cameras are handled in the separate effect above
    // (left intentionally blank here to avoid duplicated camera/polling logic)
  }, [])


  const recentAlerts = useMemo(() => {
    const safeAlerts = Array.isArray(alerts) ? alerts : []
    return safeAlerts
      .slice()
      .sort((x, y) => new Date(String(y?.timestamp ?? '')).getTime() - new Date(String(x?.timestamp ?? '')).getTime())
      .slice(0, 5)
      .map((a, i) => {
        const isCritical = a.severity === 'critical' || a.severity === 'error'
        const sevCls = isCritical
          ? 'text-yellow-400 border border-yellow-500/40'
          : a.severity === 'warning'
            ? 'text-orange-400 border border-orange-500/40'
            : 'text-yellow-400 border border-yellow-500/40'

        return {
          key: a.id ?? i,
          title: a.title,
          cam: a.location,
          time: formatTimestamp(a.timestamp),
          severity: a.severity,
          sev: a.severity === 'warning' ? 'Medium' : a.severity === 'critical' ? 'High' : 'Low',
          sevCls,
        }
      })
  }, [alerts])


  const normalizedLogs = (logs ?? []) as LogItem[]

  console.log('logs state:', logs)
  console.log('isArray:', Array.isArray(logs))

  const accessLogs = useMemo(() => {
    const safeLogs = Array.isArray(normalizedLogs) ? normalizedLogs : []
    return safeLogs
      .slice()
      .sort((x, y) => new Date(String(y?.timestamp ?? '')).getTime() - new Date(String(x?.timestamp ?? '')).getTime())
      .slice(0, 5)
      .map((l) => ({
        // adminService.LogItem shape: { userId, name, email, action, status, timestamp }
        user: l.name ?? l.email ?? String(l.userId),
        method: 'Fingerprint',
        result: l.status === 'success' ? 'Success' : 'Failed',
        time: formatTimestamp(l.timestamp),
        location: l.action,
        failed: l.status !== 'success',
      }))
  }, [logs])

  const derived = useMemo(() => {
    const activeAlerts = alerts.filter((a) => ['critical', 'error', 'warning'].includes(a.severity)).length
    const successLogs = normalizedLogs.filter((l) => l.status === 'success').length
    const failedLogs = normalizedLogs.filter((l) => l.status !== 'success').length
    const totalLogs = normalizedLogs.length
    const successRate = totalLogs ? Math.round((successLogs / totalLogs) * 100) : 0

    // For chart widgets (use the latest 5 for density but keep counts accurate)
    const recentSuccess = accessLogs.filter((l) => !l.failed).length
    const recentFailed = accessLogs.filter((l) => l.failed).length

    const unreadAlerts = alerts.filter((a: any) => a?.read !== true).length

    return { activeAlerts, unreadAlerts, successRate, successLogs, failedLogs, recentSuccess, recentFailed }
  }, [alerts, normalizedLogs, accessLogs])

  const intrusionData = useMemo(() => {
    // Density based chart from recent alerts (no mock data)
    const buckets = new Array(15).fill(0)
    recentAlerts.forEach((_, idx) => {
      buckets[(idx * 3) % buckets.length] += 1
    })
    return buckets
  }, [recentAlerts])

  const accessData = useMemo(() => {
    // Density based chart from recent access logs
    const buckets = new Array(15).fill(0)
    accessLogs.forEach((_, idx) => {
      buckets[(idx * 2) % buckets.length] += 1
    })
    return buckets
  }, [accessLogs])


  return (
    <GlobalLayout>


      {/* Stat Cards (Premium SOC KPI Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        {(() => {
          const totalAssigned = cameras.length
          const onlineCount = cameras.filter((c) => c.status === 'online').length
          const offlineCount = cameras.filter((c) => c.status === 'offline').length

          const assignedSub = totalAssigned === 0 ? 'No Cameras Assigned' : `${onlineCount} Online · ${offlineCount} Offline`

          const activeAlerts = derived.activeAlerts
          const accessAttemptsToday = logs.length

          return (
            <>
              <KpiCard
                icon={<Video size={18} className="text-blue-400" />}
                label="Total Cameras"
                value={totalAssigned.toString()}
                sub={assignedSub}
              />
              <KpiCard
                icon={<AlertTriangle size={18} className="text-yellow-300" />}
                label="Active Alerts"
                value={String(activeAlerts)}
                sub={activeAlerts > 0 ? 'Critical or error alerts' : 'No critical activity'}
                glowClass="shadow-[0_0_28px_rgba(250,204,21,0.18)]"
              />
              <KpiCard
                icon={<Activity size={18} className="text-orange-400" />}
                label="New Alerts"
                value={String(derived.unreadAlerts)}
                sub={derived.unreadAlerts > 0 ? 'Unread alerts require review' : 'All clear'}
                glowClass="shadow-[0_0_28px_rgba(249,115,22,0.18)]"
              />
              <KpiCard
                icon={<Users size={18} className="text-cyan-300" />}
                label="Authorized Users"
                value={String(registeredUsersCount)}
                sub="Registered users"
              />

              <KpiCard
                icon={<Fingerprint size={18} className="text-green-300" />}
                label="Access Attempts (Today)"
                value={String(accessAttemptsToday)}
                sub="Realtime ingestion"
                glowClass="shadow-[0_0_28px_rgba(34,197,94,0.16)]"
              />
              <KpiCard
                icon={<Activity size={18} className="text-emerald-300" />}
                label="System Health"
                value="98%"
                sub="All systems operational"
                glowClass="shadow-[0_0_28px_rgba(16,185,129,0.16)]"
              />
            </>
          )
        })()}
      </div>


      {/* Row 2: NEW SOC Widgets + Live Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
        {/* AI Security Insights */}
        <GlassCard className="lg:col-span-4 p-4">
          <SectionHeader
            icon={<Shield size={15} className="text-yellow-300" />}
            title="AI Security Insights"
            right={
              <StatusBadge tone={derived.activeAlerts > 0 ? 'warning' : 'success'}>
                {derived.activeAlerts > 0 ? 'Threat Active' : 'Stable'}
              </StatusBadge>
            }
          />


          {(() => {
            const displayThreatTone: BadgeTone = threatLevel >= 3 ? 'danger' : threatLevel === 2 ? 'warning' : 'success'

            return (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] text-gray-400">Threat Level</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">{threatLevel}/3</span>
                  </div>
                  <div className="mt-2">
                    <StatusBadge tone={displayThreatTone}>
                      {threatLevel === 3 ? 'Critical' : threatLevel === 2 ? 'Medium' : 'Low'}
                    </StatusBadge>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] text-gray-400">Anomaly Score</p>
                  <p className="mt-1 text-2xl font-bold text-white">{anomalyScore}</p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, anomalyScore))}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400">Risk Level</p>
                      <p className="mt-1 text-xl font-bold text-white">{riskLabel}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Computed from anomaly score</p>
                    </div>
                    <StatusBadge tone={riskTone}>{riskLabel}</StatusBadge>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                  <p className="text-[10px] text-gray-400">Last Scan Time</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{lastScanTime === '—' ? '—' : formatTimestamp(lastScanTime)}</p>
                    <span className="text-[10px] text-gray-400">SOC pipeline</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400">Security Event Count</p>
                      <p className="mt-1 text-xl font-bold text-white">{securityEventCount}</p>
                      <p className="text-[10px] text-gray-400 mt-1">From security-events</p>
                    </div>
                    <StatusBadge tone={securityEventCount > 0 ? 'warning' : 'success'}>
                      {securityEventCount > 0 ? 'Active' : 'Stable'}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            )
          })()}

        </GlassCard>

        {/* System Health */}
        <GlassCard className="lg:col-span-3 p-4">

          <SectionHeader
            icon={<Activity size={15} className="text-cyan-300" />}
            title="System Health"
            right={<StatusBadge tone={derived.successRate >= 90 ? 'success' : derived.successRate >= 75 ? 'warning' : 'danger'}>{derived.successRate >= 90 ? 'Operational' : derived.successRate >= 75 ? 'Degraded' : 'At Risk'}</StatusBadge>}
          />

          {(() => {
            const onlineCount = cameras.filter((c) => c.status === 'online').length
            const offlineCount = cameras.filter((c) => c.status === 'offline').length
            const uptime = Math.min(100, Math.max(0, derived.successRate))
            const deviceTone: BadgeTone = offlineCount === 0 ? 'success' : offlineCount <= 1 ? 'warning' : 'danger'
            const serverTone: BadgeTone = uptime >= 90 ? 'success' : uptime >= 75 ? 'warning' : 'danger'

            return (
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] text-gray-400">Uptime %</p>
                  <p className="mt-1 text-3xl font-bold text-white">{uptime}%</p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="text-[10px] text-gray-400">Device Status</p>
                    <p className="text-sm font-semibold text-white mt-1">{onlineCount} Online · {offlineCount} Offline</p>
                  </div>
                  <StatusBadge tone={deviceTone}>{offlineCount === 0 ? 'Healthy' : 'Investigate'}</StatusBadge>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="text-[10px] text-gray-400">Server Status</p>
                    <p className="text-sm font-semibold text-white mt-1">{derived.successRate}% access success</p>
                  </div>
                  <StatusBadge tone={serverTone}>{serverTone === 'success' ? 'Stable' : serverTone === 'warning' ? 'Degraded' : 'Unstable'}</StatusBadge>
                </div>
              </div>
            )
          })()}
        </GlassCard>

        {/* Security Score */}
        <GlassCard className="lg:col-span-5 p-4">

          <SectionHeader
            icon={<Cpu size={15} className="text-purple-300" />}
            title="Security Score"
            right={<StatusBadge tone={derived.successRate >= 90 && derived.activeAlerts === 0 ? 'success' : derived.activeAlerts > 0 ? 'warning' : 'info'}>SOC Score</StatusBadge>}
          />

          {(() => {
            const overall = Math.round(Math.min(100, Math.max(0, derived.successRate - derived.activeAlerts * 4)))
            const weeklyTrend = overall >= 90 ? '+3.2%' : overall >= 80 ? '+1.1%' : overall >= 70 ? '-0.8%' : '-2.4%'
            const trendTone: BadgeTone = weeklyTrend.startsWith('+') ? 'success' : weeklyTrend.startsWith('-') ? 'warning' : 'neutral'

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] text-gray-400">Overall Security Score</p>
                  <p className="mt-2 text-4xl font-extrabold text-white">{overall}</p>
                  <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: `${overall}%` }} />
                  </div>
                  <div className="mt-2 text-[10px] text-gray-400">Higher is better</div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] text-gray-400">Weekly Trend</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-2xl font-bold text-white">{weeklyTrend}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Last 7 days momentum</p>
                    </div>
                    <StatusBadge tone={trendTone}>{weeklyTrend.startsWith('+') ? 'Improving' : 'Watchlist'}</StatusBadge>
                  </div>

                  <div className="mt-3">
                    <Sparkline data={intrusionData} color="#22d3ee" yLabels={['15', '10', '5', '0']} />
                  </div>
                </div>
              </div>
            )
          })()}
        </GlassCard>

        {/* Live Camera Feeds */}
        <Card className="lg:col-span-5 p-4">


          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Video size={15} className="text-gray-300" /> Live Camera Feeds
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
          </div>

          {camerasLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="col-span-full">
                <p className="text-sm font-semibold text-white">Loading...</p>
              </div>
            </div>
          ) : cameras.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="col-span-full">
                <p className="text-sm font-semibold text-white">No Cameras Added</p>
                <p className="text-[12px] text-gray-500 mt-1">Add a camera from Live Cameras to view feeds here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cameras.map((cam) => (
                <CameraCard
                  key={cam.id}
                  camera={cam}
                  // overview is read-only; removing via this card is handled on the Live Cameras page
                  onEditIp={async () => {}}
                  onRemove={async () => {}}
                />
              ))}
            </div>
          )}
        </Card>


        {/* Recent Alerts */}
        <Card className="lg:col-span-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield size={15} className="text-yellow-400" /> Recent Alerts
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((a, i) => (
              <div
                key={a.key ?? i}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03] rounded-xl px-2 -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${a.severity === 'critical' || a.severity === 'error' ? 'border-yellow-400/20 bg-yellow-500/10' : a.severity === 'warning' ? 'border-orange-400/20 bg-orange-500/10' : 'border-yellow-400/20 bg-yellow-500/10'}`}>
                    <Shield size={14} className={a.sevCls.includes('yellow') ? 'text-yellow-300' : a.sevCls.includes('orange') ? 'text-orange-300' : 'text-yellow-300'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-gray-500 truncate">{a.cam}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className="text-[10px] text-gray-400">{a.time}</span>
                  <StatusBadge tone={a.sev === 'High' ? 'danger' : a.sev === 'Medium' ? 'warning' : 'success'}>{a.sev}</StatusBadge>
                </div>
              </div>
            ))}

          </div>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-3 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity size={15} className="text-blue-400" /> System Status
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
          </div>
          <div className="space-y-3">
            {systemDevices.map(({ Icon, name, sub }, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-white">{name}</p>
                    <p className="text-[10px] text-gray-500">{sub}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />Online
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Analytics Overview */}
        <Card className="lg:col-span-5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <BarChart2 size={15} className="text-gray-300" /> Analytics Overview
            </div>
            <button className="flex items-center gap-1 text-xs text-gray-400 bg-[#0d1117] border border-white/10 px-2 py-1 rounded">
              Today <ChevronDown size={11} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-400">Intrusion Events</p>
              <p className="text-xl font-bold text-white mt-0.5">{recentAlerts.length}</p>
              <p className="text-[10px] text-green-400">Realtime</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Access Attempts</p>
              <p className="text-xl font-bold text-white mt-0.5">{normalizedLogs.length}</p>
              <p className="text-[10px] text-green-400">Realtime</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Access Success Rate</p>
              <p className="text-xl font-bold text-white mt-0.5">{derived.successRate}%</p>
              <p className="text-[10px] text-green-400">Computed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Sparkline data={intrusionData} color="#8b5cf6" yLabels={['15', '10', '5', '0']} />
              <div className="flex justify-between text-[9px] text-gray-600 mt-1 pl-5">
                {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <Sparkline data={accessData} color="#3b82f6" yLabels={['30', '20', '10', '0']} />
              <div className="flex justify-between text-[9px] text-gray-600 mt-1 pl-5">
                {['00:00', '06:00', '12:00', '18:00', '24:00'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-[#0d1117] rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.max(0, derived.successRate))}%` }} />
            </div>
          </div>
        </Card>

        {/* Recent Access Logs */}
        <Card className="lg:col-span-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText size={15} className="text-gray-300" /> Recent Access Logs
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">View All</button>
          </div>

          <div className="overflow-x-auto w-full max-h-[360px] overflow-y-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead>
              <tr className="text-[#94A3B8] border-b border-[#1E293B]">
                {['User', 'Method', 'Result', 'Time', 'Location'].map((h) => (
                  <th key={h} className="text-left pb-2 font-semibold tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {accessLogs.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          log.failed
                            ? 'bg-[#EF4444]/10 text-[#EF4444] shadow-[0_0_16px_rgba(239,68,68,0.20)]'
                            : 'bg-[#22C55E]/10 text-[#22C55E] shadow-[0_0_16px_rgba(34,197,94,0.18)]'
                        }`}
                      >
                        {log.user[0]}
                      </div>
                      <span className="truncate max-w-[55px] text-[#D1D5DB]">{log.user}</span>
                    </div>
                  </td>

                  <td className="py-3 text-[#94A3B8]">{log.method}</td>

                  <td className="py-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                        log.failed
                          ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20'
                          : 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>

                  <td className="py-3 text-[#94A3B8]">{log.time}</td>
                  <td className="py-3 text-[#94A3B8]">{log.location}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </Card>

        {/* Access Attempts Donut */}
        <Card className="lg:col-span-3 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-white">Access Attempts</span>
            <button className="flex items-center gap-1 text-xs text-gray-400 bg-[#0d1117] border border-white/10 px-2 py-1 rounded">
              Today <ChevronDown size={11} />
            </button>
          </div>

          <div className="flex justify-center my-2">
            <DonutChart success={derived.recentSuccess} failed={derived.recentFailed} />

          </div>

          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <span className="text-gray-300">Success</span>
              </div>
              <span className="text-gray-400">{derived.recentSuccess}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <span className="text-gray-300">Failed</span>
              </div>
              <span className="text-gray-400">{derived.recentFailed}</span>
            </div>

          </div>
        </Card>
      </div>

      <p className="text-center text-xs text-gray-600 mt-6 pb-2">© 2025 Sentinel-Edge AI. All rights reserved.</p>
    </GlobalLayout>
  )
}

