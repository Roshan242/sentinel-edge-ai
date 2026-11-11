// server/security/notify-admins.mjs
// Notify registered admins when security events are detected.
// Must never throw uncaught errors (scheduler calls this).

import { sendAlertEmail } from '../utils/email.mjs'
import { supabaseRequest, listUsers } from '../data/users.mjs'

const alertsTable = process.env.SUPABASE_ALERTS_TABLE || 'alerts'

const safeString = (v) => {
  try {
    return String(v ?? '')
  } catch {
    return ''
  }
}

const buildAlertPayloadFromSecurityEvent = (event) => {
  // security_events fields: user_id, event_type, severity, anomaly_score, description
  const eventType = safeString(event?.event_type)
  const severity = safeString(event?.severity || 'warning')
  const userId = event?.user_id ?? null
  const description = safeString(event?.description)

  const titleByType = {
    failed_login_attempts: 'Multiple Failed Login Attempts',
    excessive_access_attempts: 'Excessive Access Attempts',
    outside_normal_hours: 'Access Outside Normal Hours',
    activity_spike: 'Activity Spike Detected',
    suspicious_behavior: 'Suspicious Behavior Detected',
  }

  const title =
    titleByType[eventType] ||
    (eventType
      ? `Security Alert: ${eventType}`
      : 'Security Alert')

  const location = userId ? `user_id=${userId}` : 'system'

  return {
    title,
    severity: severity === 'critical' ? 'critical' : severity === 'high' ? 'critical' : severity === 'error' ? 'error' : 'warning',
    location,
    timestamp: new Date().toISOString(),
    read: false,
    // Optional fields (if DB has them) should be ignored by Supabase.
    // We keep core schema compatible with existing alerts UI.
    message: description || undefined,
    description: description || undefined,
    event_type: eventType || undefined,
  }
}

const dedupKeyForEvent = (event) => {
  // Prevent spamming for the same event fingerprint across scheduler runs.
  // We include event_type + user_id.
  const eventType = safeString(event?.event_type)
  const userId = event?.user_id ?? null
  return `${eventType}:${userId ?? 'none'}`
}

const getRegisteredAdmins = async () => {
  // Prefer listing via existing helper.
  // listUsers returns admin/public user rows. It calls Supabase when configured.
  const users = await listUsers()
  return (Array.isArray(users) ? users : []).filter((u) => u?.role === 'admin' && (u?.status === 'registered' || !u?.status || u.status === 'registered'))
}

export const notifyAdminsForSecurityEvents = async ({
  events,
  // scheduler fingerprint already dedups globally, but we also dedup per event-type
  // within a runtime window via in-memory set.
  dedupStore,
} = {}) => {
  try {
    if (!Array.isArray(events) || events.length === 0) return

    const notifyTypes = new Set([
      'failed_login_attempts',
      // Keep room for future; notification can be enabled/expanded.
      'excessive_access_attempts',
      'outside_normal_hours',
      'activity_spike',
      'suspicious_behavior',
    ])

    const recipientOverride = process.env.ADMIN_ALERT_RECIPIENT_EMAIL

    // Determine recipients.
    let admins = []
    if (recipientOverride) {
      admins = [{ email: recipientOverride, id: 'override', name: 'Admin (override)' }]
    } else {
      try {
        admins = await getRegisteredAdmins()
      } catch (err) {
        console.warn('[notify-admins] could not resolve admin accounts:', err?.message || err)
      }
    }

    if (!admins || admins.length === 0) {
      console.warn('[notify-admins] no admin email recipients configured')
    }

    // Initialize dedup store.
    if (!dedupStore) {
      // eslint-disable-next-line no-param-reassign
      dedupStore = new Set()
    }

    for (const event of events) {
      const eventType = safeString(event?.event_type)
      if (!notifyTypes.has(eventType)) continue

      const key = dedupKeyForEvent(event)
      if (dedupStore.has(key)) continue
      dedupStore.add(key)

      const alert = buildAlertPayloadFromSecurityEvent(event)

      // 1) Persist alert row
      try {
        await supabaseRequest(alertsTable, {
          method: 'POST',
          query: { select: '*' },
          prefer: 'return=representation',
          body: {
            title: alert.title,
            severity: alert.severity,
            location: alert.location,
            timestamp: alert.timestamp,
            read: alert.read,
            // keep extra fields out of core UI schema; if DB supports JSON columns,
            // they can be added later.
          },
        })
      } catch (err) {
        console.log('[notify-admins] supabase insert failed, falling back to in-memory:', err?.message || err)
        try {
          const { alerts: _alerts, nextId } = await import('../data/store.mjs')
          const id = nextId(_alerts)
          _alerts.unshift({ id, title: alert.title, severity: alert.severity, location: alert.location, timestamp: alert.timestamp, read: alert.read })
          console.log('[notify-admins] inserted alert into in-memory fallback', { id, title: alert.title, location: alert.location })
        } catch (e) {
          console.error('[notify-admins] in-memory fallback insert failed:', e?.message || e)
        }
      }

      // 2) Email admins (best-effort)
      const subject = `[Sentinel] ${alert.title}`
      const body = `${alert.title}\n\nSeverity: ${alert.severity}\nLocation: ${alert.location}\nTime: ${alert.timestamp}\n\nDetails:\n${alert.message || event?.description || ''}`

      const emailResults = await Promise.allSettled(
        admins
          .map((a) => a?.email)
          .filter(Boolean)
          .map((email) => sendAlertEmail({ subject, body }, email))
      )
      emailResults.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn('[notify-admins] email delivery failed:', result.reason?.message || result.reason)
        }
      })
    }
  } catch (error) {
    console.error('[notify-admins] security notification failed:', error?.message || error)
  }
}
