import { useEffect, useMemo, useState } from 'react'
import apiClient from '@/services/api'
import { computeSecurityEventInsights } from '@/utils/securityInsights'



export type SecurityEventsResponse = Array<any>

export type AnomalyScoreResponse = {
  anomaly_score?: number
  window_minutes?: number
  events_detected?: number
}

export type SecurityInsightsState = {
  anomalyScore: number
  threatLevel: 1 | 2 | 3
  riskLabel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskTone: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  lastScanTime: string
  securityEventCount: number
  loading: boolean
  error: string | null
}

const safeLastScan = (d: unknown): string => {
  if (!d) return '—'
  try {
    const dt = new Date(String(d))
    if (Number.isNaN(dt.getTime())) return '—'
    return dt.toISOString()
  } catch {
    return '—'
  }
}

export const useSecurityInsights = (opts?: {
  windowMinutes?: number
  eventsLimit?: number
}) => {
  const windowMinutes = opts?.windowMinutes ?? 60
  const eventsLimit = opts?.eventsLimit ?? 20

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [anomalyScoreRaw, setAnomalyScoreRaw] = useState<number>(0)
  const [eventCount, setEventCount] = useState<number>(0)
  const [lastScanTimeRaw, setLastScanTimeRaw] = useState<string>('—')

  useEffect(() => {
    let mounted = true

    const run = async () => {
      setLoading(true)
      setError(null)

      try {
        const [eventsRes, anomalyRes] = await Promise.all([
          apiClient.get<SecurityEventsResponse>('/security-events', {
            params: { windowMinutes, limit: eventsLimit },
          }),
          apiClient.get<AnomalyScoreResponse>('/anomaly-score', {
            params: { windowMinutes },
          }),
        ])

        if (!mounted) return

        const events = Array.isArray(eventsRes.data) ? eventsRes.data : []
        const anomaly = anomalyRes.data || {}

        // Determine last scan time: prefer first row created_at, else fall back.
        const newest = events[0]
        const createdAt = newest?.created_at ?? newest?.timestamp ?? newest?.createdAt

        setEventCount(events.length)
        setLastScanTimeRaw(safeLastScan(createdAt))
        setAnomalyScoreRaw(Number(anomaly.anomaly_score ?? 0))

        // minimal console logging as requested
        console.log('[SecurityInsights] anomaly-score response:', anomaly)
        console.log('[SecurityInsights] security-events response length:', events.length)
      } catch (e: any) {
        if (!mounted) return
        console.error('[SecurityInsights] fetch failed:', e?.message || e)
        setError(e?.message ? String(e.message) : 'Failed to load security insights')
        setAnomalyScoreRaw(0)
        setEventCount(0)
        setLastScanTimeRaw('—')
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    run()

    // auto refresh to keep dashboards lively
    const intervalId = window.setInterval(() => {
      run().catch(() => {})
    }, 15_000)

    return () => {
      mounted = false
      window.clearInterval(intervalId)
    }
  }, [windowMinutes, eventsLimit])

  const computed = useMemo(() => {
    return computeSecurityEventInsights({ anomalyScore: anomalyScoreRaw })
  }, [anomalyScoreRaw])

  return useMemo<SecurityInsightsState>(
    () => ({
      anomalyScore: computed.anomalyScore,
      threatLevel: computed.threatLevel,
      riskLabel: computed.riskLevel.label,
      riskTone: computed.riskLevel.tone,
      lastScanTime: lastScanTimeRaw,
      securityEventCount: eventCount,
      loading,
      error,
    }),
    [computed, lastScanTimeRaw, eventCount, loading, error]
  )
}

