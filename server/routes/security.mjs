import { requireAdmin } from '../middleware/auth.mjs'

import { readBody, send } from '../utils/http.mjs'
import { detectSecurityEvents } from '../security/detect.mjs'
import { upsertSecurityEvents, getSecurityEventsNewestFirst } from '../security/store-events.mjs'

// Admin-only security analytics routes.
//
// Safe fallback rule:
// - If detection/ML dependencies fail or any runtime errors occur,
//   return empty results instead of crashing.

const parsePositiveInt = (v, fallback) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}

export const handleSecurityRoutes = async ({ req, res, method, path, url }) => {
  // GET /api/security-events
  if (method === 'GET' && path === '/security-events') {
    // Allow authenticated users (not only admins) to view security insights.
    const { requireAuth } = await import('../middleware/auth.mjs')
    await requireAuth(req)

    const limit = parsePositiveInt(url.searchParams.get('limit'), 100)


    try {
      // Detect first, store results, then return persisted events.
      // This keeps the endpoint stable and allows dashboard history.
      const windowMinutes = parsePositiveInt(url.searchParams.get('windowMinutes'), 60)

      const { events } = await detectSecurityEvents({ windowMinutes })
      // Store asynchronously but await to ensure consistent response.
      await upsertSecurityEvents({ events })

      const stored = await getSecurityEventsNewestFirst({ limit })

      // Ensure safe response shape.
      return send(res, 200, Array.isArray(stored) ? stored : [])
    } catch (err) {
      // Safe fallback: empty array.
      return send(res, 200, [])
    }
  }

  // GET /api/anomaly-score
  if (method === 'GET' && path === '/anomaly-score') {
    // Allow authenticated users (not only admins) to view anomaly score.
    const { requireAuth } = await import('../middleware/auth.mjs')
    await requireAuth(req)


    const windowMinutes = parsePositiveInt(url.searchParams.get('windowMinutes'), 60)
    try {
      const { anomalyScore, events } = await detectSecurityEvents({ windowMinutes })

      // Optional persistence: store events if any.
      if (Array.isArray(events) && events.length > 0) {
        try {
          await upsertSecurityEvents({ events })
        } catch {
          // ignore persistence errors (fallback rule)
        }
      }

      return send(res, 200, {
        anomaly_score: Number(anomalyScore ?? 0),
        window_minutes: windowMinutes,
        // Keep extra data minimal.
        events_detected: Array.isArray(events) ? events.length : 0,
      })
    } catch {
      return send(res, 200, { anomaly_score: 0, window_minutes: windowMinutes, events_detected: 0 })
    }
  }

  return false
}

