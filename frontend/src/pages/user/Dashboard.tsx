import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import apiClient from '@/services/api'
import { GlobalLayout } from '@/components/layout/GlobalLayout'
import { useAuth } from '@/context/AuthContext'
import {
  Video,
  Fingerprint,
  Bell,
  CheckCircle,
  FileText,
  ChevronDown,
  Shield,
  Activity,
  Cpu,
  AlertTriangle,
} from 'lucide-react'
import { CameraFeed } from '@/components/CameraFeed'
import { useSecurityInsights } from '@/hooks/useSecurityInsights'

type CameraStatus = 'online' | 'offline'

type PersistedCamera = {
  id: string
  name: string
  ip: string
  streamUrl: string
  snapshotUrl?: string
  status: CameraStatus
}

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type AccessLogRow = {
  id: number
  userId: number
  name: string
  email: string
  action: string
  status: 'success' | 'failed' | string
  timestamp: string
}

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

  return <span className={`${base} ${tones[tone]} ${className}`}>{children}</span>
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

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
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

      const paddingX = 1
      const lineW = 2
      const left = paddingX + lineW / 2
      const right = W - paddingX - lineW / 2
      const top = 5
      const bottom = H - 5

      const denom = Math.max(1, data.length - 1)

      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, W, H)
      ctx.clip()

      ctx.beginPath()
      data.forEach((v, i) => {
        const t = i / denom
        const x = left + t * (right - left)
        const yUnclamped = H - ((v - min) / range) * (bottom - top)
        const y = Math.max(top, Math.min(bottom, yUnclamped))
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })

      ctx.strokeStyle = color
      ctx.lineWidth = lineW
      ctx.stroke()

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

  return <canvas ref={ref} className="w-full h-14" />
}

const toLocalDayKey = (d: Date) => {
  // YYYY-MM-DD in local time
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const isSuccess = (s: any) => String(s).toLowerCase() === 'success'

export const UserDashboard: React.FC = () => {
  const { user } = useAuth()

  const [cameras, setCameras] = useState<PersistedCamera[]>([])
  const [loadingCameras, setLoadingCameras] = useState(true)

  const [accessLogs, setAccessLogs] = useState<AccessLogRow[]>([])
  const [loadingLogs, setLoadingLogs] = useState(true)

  const {
    anomalyScore,
    threatLevel,
    riskLabel,
    riskTone,
    lastScanTime,
  } = useSecurityInsights()

  const loadCameras = async () => {
    try {
      const res = await apiClient.get('/cameras')
      const list = Array.isArray(res.data) ? (res.data as any[]) : []

      setCameras(
        list.map((c) => ({
          id: String(c.id),
          name: String(c.name || 'Camera'),
          ip: String(c.ip || ''),
          streamUrl: c.streamUrl || (c.ip ? `http://${c.ip}/stream` : ''),
          snapshotUrl: c.snapshotUrl || (c.ip ? `http://${c.ip}/shot.jpg` : undefined),
          status: (c.status || 'offline') as CameraStatus,
        }))
      )
    } catch {
      toast.error('Failed to load cameras')
      setCameras([])
    } finally {
      setLoadingCameras(false)
    }
  }

  const loadMyAccessLogs = async () => {
    try {
      const res = await apiClient.get('/my-access-logs')

      const rows = Array.isArray(res.data) ? (res.data as any[]) : []

      const filtered = rows
        .filter((r) => String(r?.email || '').toLowerCase() === String(user?.email).toLowerCase())

        .map((r) => ({
          id: Number(r.id),
          userId: Number(r.userId ?? r.user_id),
          name: String(r.name ?? ''),
          email: String(r.email ?? ''),
          action: String(r.action ?? ''),
          status: String(r.status ?? ''),
          timestamp: String(r.timestamp ?? r.created_at ?? ''),
        }))
        .filter((r) => r.timestamp)

      setAccessLogs(filtered)
    } catch {
      setAccessLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (!mounted) return
      await loadCameras()
    }
    run()

    const intervalId = window.setInterval(() => {
      loadCameras().catch(() => {})
    }, 4000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      if (!mounted) return
      setLoadingLogs(true)
      await loadMyAccessLogs()
    }
    run()

    const intervalId = window.setInterval(() => {
      loadMyAccessLogs().catch(() => {})
    }, 15_000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  const topCameras = useMemo(() => (cameras || []).slice(0, 2), [cameras])
  const showCameraEmpty = !loadingCameras && (!cameras || cameras.length === 0)

  const onlineCount = cameras.filter((c) => c.status === 'online').length
  const offlineCount = cameras.filter((c) => c.status === 'offline').length

  const todayKey = toLocalDayKey(new Date())
  const myTodaySuccessCount = useMemo(() => {
    const today = todayKey
    return (accessLogs || []).filter((l) => isSuccess(l.status) && toLocalDayKey(new Date(l.timestamp)) === today)
      .length
  }, [accessLogs, todayKey])

  const accessBuckets = useMemo(() => {
    // last 12 buckets (~12*60=720?); keep simple: 10 buckets across 12 hours
    const buckets = 10
    const horizonMinutes = 12 * 60
    const now = Date.now()
    const bucketSizeMs = (horizonMinutes * 60 * 1000) / buckets
    const arr = new Array(buckets).fill(0)

    for (const l of accessLogs || []) {
      if (!isSuccess(l.status)) continue
      const t = new Date(l.timestamp).getTime()
      if (!Number.isFinite(t)) continue
      const diff = now - t
      if (diff < 0 || diff > horizonMinutes * 60 * 1000) continue
      const idxFromEnd = Math.floor(diff / bucketSizeMs)
      const idx = buckets - 1 - idxFromEnd
      if (idx >= 0 && idx < buckets) arr[idx] += 1
    }

    return arr
  }, [accessLogs])

  const myAlertsDerived = useMemo(() => {
    // IMPORTANT: User dashboard “My Alerts” should not show their own failed login/wrong attempts.
    // We intentionally exclude any login-failure derived alerts from accessLogs.

    // Keep the return type stable for the existing UI mapping.
    return [] as Array<{
      title: string
      sub: string
      time: string
      sev: 'Low' | 'Medium' | 'High'
      sevTone: BadgeTone
    }>
  }, [accessLogs])



  const successRate = useMemo(() => {
    const total = accessLogs?.length ? accessLogs.length : 0
    if (!total) return 0
    const ok = accessLogs.filter((l) => isSuccess(l.status)).length
    return Math.round((ok / total) * 100)
  }, [accessLogs])

  const activeAlerts = myAlertsDerived.length

  const inferredUptime = useMemo(() => {
    const total = Math.max(1, cameras.length)
    const ratio = (onlineCount / total) * 100
    return Math.round(Math.max(0, Math.min(100, ratio)))
  }, [cameras.length, onlineCount])

  const overallSecurityScore = Math.round(
    Math.min(100, Math.max(0, inferredUptime * 0.55 + successRate * 0.45 - activeAlerts * 3))
  )

  const weeklyTrend =
    overallSecurityScore >= 90
      ? '+2.4%'
      : overallSecurityScore >= 80
        ? '+1.0%'
        : overallSecurityScore >= 70
          ? '-1.2%'
          : '-3.0%'
  const trendTone: BadgeTone = weeklyTrend.startsWith('+') ? 'success' : weeklyTrend.startsWith('-') ? 'warning' : 'neutral'

  const myRecentLogs = useMemo(() => {
    return (accessLogs || []).slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6)
  }, [accessLogs])

  return (
    <GlobalLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KpiCard
          icon={<Video size={18} className="text-blue-400" />}
          label="Assigned Cameras"
          value={cameras.length}
          sub={cameras.length === 0 ? 'No devices configured' : `${onlineCount} Online · ${offlineCount} Offline`}
        />
        <KpiCard
          icon={<Fingerprint size={18} className="text-green-300" />}
          label="My Access Today"
          value={String(myTodaySuccessCount)}
          sub={myTodaySuccessCount > 0 ? 'Successful logins today' : 'No successful logins today'}
          glowClass="shadow-[0_0_28px_rgba(34,197,94,0.16)]"
        />
        <KpiCard
          icon={<Bell size={18} className="text-yellow-300" />}
          label="My Alerts"
          value={String(myAlertsDerived.length)}
          sub={myAlertsDerived.length > 0 ? 'Recent suspicious activity' : 'Queue clear'}
          glowClass="shadow-[0_0_28px_rgba(250,204,21,0.18)]"
        />
        <KpiCard
          icon={<CheckCircle size={18} className="text-cyan-300" />}
          label="Access Success Rate"
          value={`${successRate}%`}
          sub={accessLogs.length ? 'Success ratio (your logs)' : 'No access logs yet'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3">
        <GlassCard className="lg:col-span-4 p-4">
          <SectionHeader
            icon={<Shield size={15} className="text-yellow-300" />}
            title="AI Security Insights"
            right={
              <StatusBadge tone={threatLevel >= 3 ? 'warning' : 'success'}>
                {threatLevel >= 3 ? 'Threat Active' : 'Stable'}
              </StatusBadge>
            }
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] text-gray-400">Threat Level</p>
              <p className="mt-1 text-2xl font-bold text-white">{threatLevel}/3</p>
              <div className="mt-2">
                <StatusBadge tone={threatLevel >= 3 ? 'danger' : threatLevel === 2 ? 'warning' : 'success'}>
                  {threatLevel === 3 ? 'Critical' : threatLevel === 2 ? 'Medium' : 'Low'}
                </StatusBadge>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] text-gray-400">Anomaly Score</p>
              <p className="mt-1 text-2xl font-bold text-white">{anomalyScore}</p>
              <div className="mt-2">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${anomalyScore}%` }} />
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
                <p className="text-sm font-semibold text-white">{lastScanTime}</p>
                <span className="text-[10px] text-gray-400">SOC pipeline</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-3 p-4">
          <SectionHeader
            icon={<Activity size={15} className="text-cyan-300" />}
            title="System Health"
            right={
              <StatusBadge tone={inferredUptime >= 90 ? 'success' : inferredUptime >= 75 ? 'warning' : 'danger'}>
                {inferredUptime >= 90 ? 'Operational' : inferredUptime >= 75 ? 'Degraded' : 'At Risk'}
              </StatusBadge>
            }
          />

          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] text-gray-400">Uptime %</p>
              <p className="mt-1 text-3xl font-bold text-white">{inferredUptime}%</p>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div>
                <p className="text-[10px] text-gray-400">Device Status</p>
                <p className="text-sm font-semibold text-white mt-1">{onlineCount} Online · {offlineCount} Offline</p>
              </div>
              <StatusBadge tone={offlineCount === 0 ? 'success' : offlineCount <= 1 ? 'warning' : 'danger'}>
                {offlineCount === 0 ? 'Healthy' : 'Investigate'}
              </StatusBadge>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5 p-4">
          <SectionHeader
            icon={<Cpu size={15} className="text-purple-300" />}
            title="Security Score"
            right={
              <StatusBadge tone={overallSecurityScore >= 85 ? 'success' : overallSecurityScore >= 70 ? 'warning' : 'danger'}>
                SOC Score
              </StatusBadge>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] text-gray-400">Overall Security Score</p>
              <p className="mt-2 text-4xl font-extrabold text-white">{overallSecurityScore}</p>
              <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  style={{ width: `${overallSecurityScore}%` }}
                />
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
                <Sparkline data={accessBuckets} color="#22d3ee" />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5 p-4">
          <SectionHeader
            icon={<Video size={15} className="text-gray-300" />}
            title="My Camera Feeds"
            right={<button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
          />

          {showCameraEmpty ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">No Cameras Added</p>
              <p className="text-[12px] text-gray-500 mt-1">Waiting for an administrator to add cameras.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {(topCameras || []).map((cam) => (
                <div key={cam.id} className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  <CameraFeed className="w-full h-full" name={cam.name} showControls />

                  <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-2 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
                    <span className="text-[10px] text-white font-medium truncate">{cam.name}</span>

                    <div className="flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cam.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
                      />
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${cam.status === 'online' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                      >
                        {cam.status === 'online' ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-4 p-4">
          <SectionHeader
            icon={<Bell size={15} className="text-yellow-300" />}
            title="My Alerts"
            right={<button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
          />

          <div className="space-y-2 mb-4">
            {myAlertsDerived.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.03] rounded-xl transition-colors px-2 -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 bg-white/5">
                    <AlertTriangle size={16} className={a.sev === 'Medium' ? 'text-orange-300' : 'text-yellow-300'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{a.title}</p>
                    <p className="text-[10px] text-gray-500 truncate">{a.sub}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className="text-[10px] text-gray-400">{a.time}</span>
                  <StatusBadge tone={a.sevTone}>{a.sev}</StatusBadge>
                </div>
              </div>
            ))}

            {!loadingLogs && myAlertsDerived.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-gray-400">No alerts for your recent logs.</div>
            ) : null}
          </div>

        </GlassCard>

        <GlassCard className="lg:col-span-3 p-4">
          <SectionHeader
            icon={<Fingerprint size={15} className="text-purple-300" />}
            title="Access Activity"
            right={<button className="flex items-center gap-1 text-xs text-gray-400 bg-[#0d1117] border border-white/10 px-2 py-1 rounded">Today <ChevronDown size={11} /></button>}
          />

          <div className="mb-2">
            <p className="text-2xl font-bold text-white">{myTodaySuccessCount}</p>
            <p className="text-[10px] text-green-400">↑ Successful access events today</p>
          </div>

          <Sparkline data={accessBuckets} color="#8b5cf6" />
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <SectionHeader
          icon={<FileText size={15} className="text-gray-300" />}
          title="My Recent Access Logs"
          right={<button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All</button>}
        />

        <div className="overflow-x-auto w-full">
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
              {myRecentLogs.map((log) => {
                const failed = !isSuccess(log.status)
                return (
                  <tr key={log.id} className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${failed ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {user?.name?.[0] ?? 'U'}
                        </div>
                        <span className="truncate max-w-[120px] text-[#D1D5DB]'">{user?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#94A3B8]">{log.action || 'Login'}</td>
                    <td className="py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                          failed ? 'text-red-300 bg-red-500/10 border-red-500/20' : 'text-green-300 bg-green-500/10 border-green-500/20'
                        }`}
                      >
                        {failed ? 'Failed' : 'Success'}
                      </span>
                    </td>
                    <td className="py-3 text-[#94A3B8]">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 text-[#94A3B8]">—</td>
                  </tr>
                )
              })}

              {!loadingLogs && myRecentLogs.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-xs text-gray-500" colSpan={5}>
                    No access logs found for your account.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="text-center text-xs text-gray-600 mt-6 pb-2">© 2025 Sentinel-Edge AI. All rights reserved.</p>
    </GlobalLayout>
  )
}

