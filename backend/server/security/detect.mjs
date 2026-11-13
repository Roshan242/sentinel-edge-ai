// server/security/detect.mjs
// Intrusion Detection + Anomaly Detection (heuristics + optional ML)
//
// IMPORTANT:
// - This file must never throw uncaught errors; callers should wrap.
// - Provide safe fallback behavior: return empty results if ML libraries are unavailable.
// - Keep logic isolated from auth/router/UI.

import { getAccessLogsWindowForAnalysis } from './source-access-logs.mjs'

// --- Heuristic feature extraction ---
const countByStatus = (events, keyFn) => {
  const m = new Map()
  for (const e of events) {
    const k = keyFn(e)
    m.set(k, (m.get(k) || 0) + 1)
  }
  return m
}

const toUserId = (e) => {
  // accessLogs utils map fields into { userId, ... }
  const n = e?.userId ?? e?.user_id
  const num = n === undefined || n === null ? null : Number(n)
  return Number.isFinite(num) ? num : null
}

const getEventTypeSignals = (log) => {
  // Normalize into known signals.
  // access_logs.action examples (per existing code):
  // - 'Login Success'
  // - 'Login Failure'
  // - 'Logout Success'
  // - 'User Registration'
  const action = String(log?.action ?? '')
  const status = String(log?.status ?? '')

  const isLoginFailure = /login failure/i.test(action) || status.toLowerCase() === 'failed'
  const isLoginSuccess = /login success/i.test(action) || status.toLowerCase() === 'success'

  // We still keep some generic suspiciousness flags.
  return {
    action,
    status,
    isLoginFailure,
    isLoginSuccess,
  }
}

const hourOfDay = (ts) => {
  if (!ts) return null
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return null
  return d.getHours() // 0-23 local server time
}

const isOutsideNormalHours = (hour) => {
  // Default: consider normal hours 06:00 - 22:00
  if (hour === null) return false
  return hour < 6 || hour >= 22
}

// --- Detection rules ---
// Each rule yields one or more security-events.

const buildEvent = ({ userId, event_type, severity, anomaly_score, description }) => {
  return {
    user_id: userId ?? null,
    event_type,
    severity: String(severity ?? 'low'),
    anomaly_score: Number(anomaly_score ?? 0),
    description: String(description ?? ''),
    // created_at is handled by DB default or migration defaults.
  }
}

export const detectSecurityEvents = async ({
  // analysis window (used for multiple rules)
  windowMinutes = 60,

  // Phase 1: multiple failed logins
  // Requirement: If >= 3 failed logins within 5 minutes, create a security_event.
  failedLoginThreshold = 3,
  failedLoginWindowMinutes = 5,

  // thresholds (safe defaults)
  accessAttemptsThreshold = 30,
  activitySpikeMultiplier = 2.5,
  activityCompareWindowMinutes = 60,
  maxEvents = 200,
} = {}) => {
  const logs = await getAccessLogsWindowForAnalysis({ windowMinutes })

  // Logs shape from utils/accessLogs.mjs:
  // { id, userId, name, email, action, status, timestamp }
  if (!Array.isArray(logs) || logs.length === 0) {
    return { events: [], anomalyScore: 0 }
  }

  const now = Date.now()
  const recentCutoff = now - windowMinutes * 60 * 1000
  const recent = logs.filter((l) => {
    const t = l?.timestamp ? new Date(l.timestamp).getTime() : NaN
    return Number.isFinite(t) && t >= recentCutoff
  })

  if (recent.length === 0) {
    return { events: [], anomalyScore: 0 }
  }

  // Baseline / compare window.
  const compare = await getAccessLogsWindowForAnalysis({
    windowMinutes: activityCompareWindowMinutes,
    offsetMinutes: windowMinutes,
  }).catch(() => [])

  const totalRecent = recent.length
  const totalCompare = Array.isArray(compare) ? compare.length : 0

  const events = []
  let maxScore = 0

  // 1) Multiple failed login attempts (per user)
  // Requirement: >=3 failed logins within 5 minutes.
  // Implement by analyzing a dedicated sub-window irrespective of `windowMinutes`.
  const failedLoginCutoff = now - failedLoginWindowMinutes * 60 * 1000
  const failedLoginsRecentWindow = logs.filter((l) => {
    if (!getEventTypeSignals(l).isLoginFailure) return false
    const t = l?.timestamp ? new Date(l.timestamp).getTime() : NaN
    return Number.isFinite(t) && t >= failedLoginCutoff
  })

  const failedByUser = countByStatus(failedLoginsRecentWindow, toUserId)

  const anomalyScoreToSeverity = (score1to100) => {
    const s = Number(score1to100)
    if (Number.isNaN(s)) return 'Low'
    if (s <= 30) return 'Low'
    if (s <= 60) return 'Medium'
    if (s <= 80) return 'High'
    return 'Critical'
  }

  for (const [u, count] of failedByUser.entries()) {
    if (!u) continue
    if (count >= failedLoginThreshold) {
      // Scale to 1..100 (Phase 1 requirement uses score bands).
      // count=3 => ~30..35; higher counts increase toward 100.
      const normalized = count / Math.max(1, failedLoginThreshold) // >=1
      const score = Math.min(100, Math.round(1 + (normalized * 0.9) * 90))

      maxScore = Math.max(maxScore, score)
      events.push(buildEvent({
        userId: u,
        event_type: 'failed_login_attempts',
        severity: anomalyScoreToSeverity(score),
        anomaly_score: score,
        description: `Multiple failed login attempts detected for user_id=${u}: ${count} failures within ${failedLoginWindowMinutes} minutes.`,
      }))
    }
  }

  const scaleScore01To100 = (score01) => {
    const s = Math.max(0, Math.min(1, Number(score01)))
    return Math.min(100, Math.max(1, Math.round(s * 100)))
  }

  // 2) Excessive access attempts (overall)
  if (totalRecent >= accessAttemptsThreshold) {
    const score01 = Math.min(1, (totalRecent / Math.max(1, accessAttemptsThreshold)) * 0.8)
    const score = scaleScore01To100(score01)
    maxScore = Math.max(maxScore, score)
    events.push(buildEvent({
      userId: null,
      event_type: 'excessive_access_attempts',
      severity: anomalyScoreToSeverity(score),
      anomaly_score: score,
      description: `Excessive access attempts: ${totalRecent} events within ${windowMinutes} minutes (threshold=${accessAttemptsThreshold}).`,
    }))
  }

  // 3) Access outside normal hours (per user)
  const outside = recent.filter((l) => isOutsideNormalHours(hourOfDay(l.timestamp)))
  const outsideByUser = countByStatus(outside, toUserId)
  for (const [u, count] of outsideByUser.entries()) {
    if (!u) continue
    if (count >= Math.max(2, Math.floor(windowMinutes / 30))) {
      const score01 = Math.min(1, (count / Math.max(1, failedLoginThreshold)) * 0.7 + 0.15)
      const score = scaleScore01To100(score01)
      maxScore = Math.max(maxScore, score)
      events.push(buildEvent({
        userId: u,
        event_type: 'outside_normal_hours',
        severity: anomalyScoreToSeverity(score),
        anomaly_score: score,
        description: `Access outside normal hours for user_id=${u}: ${count} events between 22:00-06:00 (server time).`,
      }))
    }
  }


  // 4) Activity spikes (recent vs compare)
  if (totalCompare >= 1) {
    const multiplier = totalRecent / totalCompare
    if (multiplier >= activitySpikeMultiplier) {
      const score01 = Math.min(1, 0.35 + (multiplier / activitySpikeMultiplier) * 0.65)
      const score = scaleScore01To100(score01)
      maxScore = Math.max(maxScore, score)
      events.push(buildEvent({
        userId: null,
        event_type: 'activity_spike',
        severity: anomalyScoreToSeverity(score),
        anomaly_score: score,
        description: `Activity spike detected: ${totalRecent} events in last ${windowMinutes} minutes vs ${totalCompare} in preceding ${activityCompareWindowMinutes} minutes (x${multiplier.toFixed(2)}).`,
      }))
    }
  } else {
    // If baseline is empty, be conservative: only flag if recent is very large.
    if (totalRecent >= accessAttemptsThreshold * 2) {
      const score01 = 0.6
      const score = scaleScore01To100(score01)
      maxScore = Math.max(maxScore, score)
      events.push(buildEvent({
        userId: null,
        event_type: 'activity_spike',
        severity: anomalyScoreToSeverity(score),
        anomaly_score: score,
        description: `Activity spike suspected due to low baseline: ${totalRecent} events in last ${windowMinutes} minutes while baseline is near-zero.`,
      }))
    }
  }

  // 5) Suspicious/anomalous behavior (mix rule)
  // Combine signals: failures + outside-hours + high attempt count.
  const outsideFailures = outside.filter((l) => getEventTypeSignals(l).isLoginFailure)
  if (outsideFailures.length >= Math.max(2, Math.floor(failedLoginThreshold / 2))) {
    const score01 = Math.min(1, 0.25 + (outsideFailures.length / Math.max(1, failedLoginThreshold)) * 0.75)
    const score = scaleScore01To100(score01)
    maxScore = Math.max(maxScore, score)
    events.push(buildEvent({
      userId: null,
      event_type: 'suspicious_behavior',
      severity: anomalyScoreToSeverity(score),
      anomaly_score: score,
      description: `Suspicious behavior detected: ${outsideFailures.length} failed login events occurred outside normal hours within ${windowMinutes} minutes.`,
    }))
  }


  // Cap event count for safety.
  const trimmed = events.slice(0, maxEvents)

  // Phase 1+2 requirement: expose anomaly_score as 1..100.
  // Ensure we never return 0 when events exist.
  const finalScore = Number(trimmed.length > 0 ? maxScore : 0)
  return { events: trimmed, anomalyScore: finalScore }

}

// Optional ML placeholder.
// This repo must not crash if ML libs are missing.
export const tryOptionalMLScore = async ({ logs } = {}) => {
  try {
    // TODO: Replace with real ML model inference if/when provided.
    // Keep in try/catch.
    // If you add an ML dependency, wrap import and inference.
    return null
  } catch {
    return null
  }
}

