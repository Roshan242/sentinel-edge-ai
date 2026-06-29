import { alerts, cameraHost, cameras, logs, settings } from '../data/store.mjs'
import { countRegisteredUsers, supabaseRequest } from '../data/users.mjs'
import { requireAdmin, requireAuth } from '../middleware/auth.mjs'
import { csvEscape, readBody, send } from '../utils/http.mjs'
import { cameraStore } from '../data/cameras.store.mjs'
import { validateIpWithPort } from '../utils/ip.mjs'
import { checkCameraReachable } from '../utils/camerasReachability.mjs'

const alertsTable = process.env.SUPABASE_ALERTS_TABLE || 'alerts'

const normalizeAlertRows = (rows) => {
  if (!Array.isArray(rows)) return []
  return rows.map((row) => ({
    ...row,
    timestamp: row.timestamp || row.created_at || row.createdAt || new Date().toISOString(),
  }))
}

const getPersistedAlerts = async ({ limit = 50, unreadOnly = false } = {}) => {
  const buildQuery = (orderField) => {
    const query = { select: '*', order: `${orderField}.desc`, limit: String(limit) }
    if (unreadOnly) query.read = 'eq.false'
    return query
  }

  const tryFetch = async (query) => {
    const rows = await supabaseRequest(alertsTable, { query })
    if (Array.isArray(rows) && rows.length > 0) {
      return normalizeAlertRows(rows)
    }
    return null
  }

  try {
    const rows = await tryFetch(buildQuery('timestamp'))
    if (rows) return rows
  } catch (err) {
    console.warn('[core] persisted alerts fetch failed with timestamp order, retrying with created_at:', err?.message || err)
  }

  try {
    const rows = await tryFetch(buildQuery('created_at'))
    if (rows) return rows
  } catch (err) {
    console.warn('[core] persisted alerts fetch failed with created_at order, retrying without order:', err?.message || err)
  }

  try {
    const rows = await tryFetch({ select: '*', limit: String(limit) })
    if (rows) {
      console.log('[core] persisted alerts fetch succeeded without ordering, row count:', rows.length)
      return rows
    }
    console.warn('[core] persisted alerts fetch returned empty set, falling back to in-memory alerts')
  } catch (err) {
    console.warn('[core] persisted alerts fetch failed without ordering, falling back to in-memory alerts:', err?.message || err)
  }

  return alerts
    .filter((alert) => !unreadOnly || alert.read === false)
    .slice(0, limit)
    .map((alert) => ({
      ...alert,
      timestamp: alert.timestamp || alert.created_at || alert.createdAt || new Date().toISOString(),
    }))
}


export const handleCoreRoutes = async ({ req, res, method, path, url }) => {
  if (method === 'GET' && path === '/health') {
    return send(res, 200, { ok: true, service: 'sentinel-edge-api', timestamp: new Date().toISOString() })
  }

  if (method === 'GET' && path === '/dashboard/admin') {
    await requireAdmin(req)
    const persistedAlerts = await getPersistedAlerts({ limit: 50, unreadOnly: true })
    return send(res, 200, {
      totalCameras: cameras.length,
      activeAlerts: persistedAlerts.length,
      authorizedUsers: await countRegisteredUsers(),
      accessAttemptsToday: logs.length,
      systemHealth: 98,
    })
  }

  if (method === 'GET' && path === '/dashboard/user') {
    await requireAuth(req)
    const persistedAlerts = await getPersistedAlerts({ limit: 5 })
    return send(res, 200, { cameras: cameras.length, recentLogs: logs.slice(0, 5), alerts: persistedAlerts })
  }

  if (method === 'GET' && path === '/alerts') {
    await requireAuth(req)
    const limit = Number(url.searchParams.get('limit') || 50)
    let persistedAlerts = []
    try {
      persistedAlerts = await getPersistedAlerts({ limit })
      console.log('[core] /alerts persisted fetch count:', Array.isArray(persistedAlerts) ? persistedAlerts.length : 'invalid')
    } catch (err) {
      console.error('[core] fetch alerts failed, falling back to in-memory alerts:', err?.message || err)
    }

    if (!Array.isArray(persistedAlerts) || persistedAlerts.length === 0) {
      console.log('[core] /alerts using in-memory fallback')
      try {
        persistedAlerts = alerts.slice(0, limit)
        console.log('[core] /alerts in-memory fallback count:', persistedAlerts.length)
      } catch (err) {
        console.error('[core] fallback in-memory alerts failed:', err?.message || err)
        persistedAlerts = []
      }
    }

    return send(res, 200, persistedAlerts)
  }

  const alertReadMatch = path.match(/^\/alerts\/(\d+)\/read$/)
  if (method === 'PUT' && alertReadMatch) {
    await requireAuth(req)
    try {
      const rows = await supabaseRequest(alertsTable, {
        method: 'PATCH',
        query: { id: `eq.${alertReadMatch[1]}`, select: '*' },
        prefer: 'return=representation',
        body: { read: true },
      })
      if (!Array.isArray(rows) || rows.length === 0) return send(res, 404, { message: 'Alert not found' })
      return send(res, 200, rows[0])
    } catch (err) {
      console.warn('[core] mark alert read failed via Supabase, falling back to in-memory:', err?.message || err)
      const alertId = alertReadMatch[1]
      const existing = alerts.find((a) => String(a.id) === alertId)
      if (!existing) return send(res, 404, { message: 'Alert not found' })
      existing.read = true
      return send(res, 200, existing)
    }
  }

  if (method === 'GET' && path === '/logs/access') {
    await requireAuth(req)
    return send(res, 200, logs)
  }

  if (method === 'GET' && path === '/logs/export') {
    await requireAuth(req)
    const format = url.searchParams.get('format') || 'csv'
    if (format === 'json') return send(res, 200, logs)
    const rows = logs.map((log) => [log.user, log.action, log.method, log.timestamp, log.status, log.location])
    const csv = [['User', 'Action', 'Method', 'Timestamp', 'Status', 'Location'], ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
    return send(res, 200, csv, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="access-logs.csv"' })
  }

  // ─── Cameras (Persisted) ──────────────────────────────────────────────

  if (method === 'GET' && path === '/cameras') {
    await requireAuth(req)
    // Persisted cameras only. Do not fall back to legacy/in-memory mock data.
    const persisted = cameraStore.getAll()
    return send(res, 200, persisted)
  }


  if (method === 'POST' && path === '/cameras/connect') {
    await requireAuth(req)
    const body = await readBody(req)
    const ipInput = body?.ip

    const v = validateIpWithPort(ipInput)
    if (!v.valid) {
      return send(res, 400, { success: false, message: v.reason })
    }

    // Verify camera reachability before saving.
    const reachable = await checkCameraReachable(ipInput)
    if (!reachable.reachable) {
      return send(res, 400, { success: false, message: reachable.reason || 'Camera not reachable' })
    }

    // Name can come from UI; default if omitted.
    const name = body?.name
    const connected = cameraStore.upsert({ name, ip: ipInput, status: 'online' })

    return send(res, 200, {
      success: true,
      name: connected.name,
      ip: connected.ip,
      streamUrl: connected.streamUrl,
      status: 'online',
    })
  }

  const cameraByIdMatch = path.match(/^\/cameras\/([^/]+)$/)
  if (method === 'PUT' && cameraByIdMatch) {
    await requireAdmin(req)
    const id = cameraByIdMatch[1]
    const body = await readBody(req)

    if (!body?.ip) {
      return send(res, 400, { message: 'ip is required' })
    }

    const v = validateIpWithPort(body.ip)
    if (!v.valid) {
      return send(res, 400, { message: v.reason })
    }

    const reachable = await checkCameraReachable(body.ip)
    if (!reachable.reachable) {
      return send(res, 400, { message: reachable.reason || 'Camera not reachable' })
    }

    const updated = cameraStore.upsert({ name: body?.name, ip: body.ip, status: 'online' })
    // Ensure we return the requested camera.
    const result = updated && String(updated.id) === String(id) ? updated : cameraStore.getById(id)

    return send(res, 200, {
      success: true,
      name: result?.name,
      ip: result?.ip,
      streamUrl: result?.streamUrl,
      status: result?.status,
    })
  }

  if (method === 'DELETE' && cameraByIdMatch) {
    await requireAdmin(req)
    const id = cameraByIdMatch[1]
    const removed = cameraStore.remove(id)
    if (!removed) return send(res, 404, { message: 'Camera not found' })
    return send(res, 204, '')
  }

  const cameraFeedMatch = path.match(/^\/cameras\/([^/]+)\/feed$/)
  if (method === 'GET' && cameraFeedMatch) {
    await requireAuth(req)

    const persisted = cameraStore.getById(cameraFeedMatch[1])
    const camera = persisted || cameras.find((item) => item.id === cameraFeedMatch[1])

    if (!camera) return send(res, 404, { message: 'Camera not found' })
    return send(res, 200, { id: camera.id, streamUrl: camera.streamUrl, snapshotUrl: camera.snapshotUrl })
  }


  if (method === 'GET' && (path === '/system/status' || path === '/system/health')) {
    await requireAuth(req)

    const persisted = cameraStore.getAll() || []

    // Build devices list from persisted cameras status (instead of hardcoded values).
    const devices = [
      ...persisted.map((c) => ({
        name: c.name || 'Camera',
        status: c.status || 'offline',
        lastSeen: c.lastUpdated ? new Date(c.lastUpdated).toLocaleString() : 'Unknown',
      })),
      { name: 'Biometric Scanner', status: 'online', lastSeen: 'Now' },
      { name: 'Access Control', status: 'offline', lastSeen: '2 hours ago' },
    ]

    return send(
      res,
      200,
      {
        status: 'online',
        uptime: process.uptime(),
        serverTime: new Date().toISOString(),
        cameraHost,
        settings,
        devices,
      },
    )
  }


  return false
}
