// server/security/scheduler.mjs
// Automatic anomaly detection scheduler (admin-free, internal trigger).
//
// Requirements from task:
// - Run detectSecurityEvents() automatically on server startup.
// - Create scheduler (setInterval) that runs every 60 seconds.
// - After detection, automatically call upsertSecurityEvents() to persist newly detected events.
// - Prevent duplicate event insertion.
// - Add startup log: [security] anomaly detection scheduler started
// - Add runtime log: [security] detection run complete: events=X score=Y

import { detectSecurityEvents } from './detect.mjs'
import { upsertSecurityEvents } from './store-events.mjs'
import { notifyAdminsForSecurityEvents } from './notify-admins.mjs'

const DEFAULT_INTERVAL_MS = 60_000
const DEFAULT_WINDOW_MINUTES = 60

let started = false
let lastRunFingerprint = null
// Dedup per event type/user within current server runtime to avoid email spam.
const runtimeEventDedup = new Set()


const stableStringify = (obj) => {
  try {
    return JSON.stringify(obj, Object.keys(obj).sort())
  } catch {
    return null
  }
}

const fingerprintEvents = (events, anomalyScore, windowMinutes) => {
  // Dedup strategy: fingerprint the detected event types + user_id + scores + descriptions.
  // If the detector keeps returning the exact same event set each interval,
  // we avoid re-inserting.
  const normalized = (Array.isArray(events) ? events : []).map((e) => ({
    user_id: e?.user_id ?? null,
    event_type: e?.event_type,
    severity: e?.severity,
    anomaly_score: e?.anomaly_score,
    description: e?.description,
  }))

  return stableStringify({
    windowMinutes,
    anomalyScore: Number(anomalyScore ?? 0),
    events: normalized,
  })
}

export const startSecurityAnomalyScheduler = ({
  intervalMs = Number(process.env.ANOMALY_DETECTION_INTERVAL_MS || DEFAULT_INTERVAL_MS),
  windowMinutes = Number(process.env.ANOMALY_DETECTION_WINDOW_MINUTES || DEFAULT_WINDOW_MINUTES),
} = {}) => {
  if (started) return
  started = true

  console.log('[security] anomaly detection scheduler started')

  const run = async () => {
    try {
      // detectSecurityEvents uses created_at time filtering; log window for debugging
      console.log(`[security] detection run started: windowMinutes=${windowMinutes}`)
      const { events, anomalyScore } = await detectSecurityEvents({ windowMinutes })



      const fingerprint = fingerprintEvents(events, anomalyScore, windowMinutes)
      const shouldPersist = Array.isArray(events) && events.length > 0 && fingerprint && fingerprint !== lastRunFingerprint

      if (shouldPersist) {
        await upsertSecurityEvents({ events })
        lastRunFingerprint = fingerprint

        // Notify admins (best-effort)
        await notifyAdminsForSecurityEvents({ events, dedupStore: runtimeEventDedup })
      }

      console.log(
        `[security] detection run complete: events=${Array.isArray(events) ? events.length : 0} score=${Number(anomalyScore ?? 0)}`
      )

    } catch (err) {
      // Scheduler must never crash the server.
      console.error('[security] detection run failed:', err?.message || err)
    }
  }

  // Run once at startup.
  run().catch(() => {})

  // Then schedule.
  setInterval(() => {
    run().catch(() => {})
  }, intervalMs)
}

