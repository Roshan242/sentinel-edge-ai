import { alerts, logs, settings } from '../data/store.mjs'

import {
  adminUser,
  createSupabaseAuthUser,
  createUser,
  deleteSupabaseAuthUser,
  deleteUser,
  listUsers,
  updateUser,
} from '../data/users.mjs'
import { requireAdmin } from '../middleware/auth.mjs'
import { readBody, send } from '../utils/http.mjs'
import { sendAlertEmail } from '../utils/email.mjs'

// ✅ Supabase helper reuse (users.mjs me bana hua hai)
import { supabaseRequest } from '../data/users.mjs'
const alertsTable = process.env.SUPABASE_ALERTS_TABLE || 'alerts'

const notifyAdminRecipients = async (alert) => {
  if (!settings.emailAlerts) return
  let recipients
  if (process.env.ALERT_RECIPIENT_EMAIL) {
    recipients = [process.env.ALERT_RECIPIENT_EMAIL]
  } else {
    try {
      recipients = (await listUsers()).filter((user) => user.role === 'admin').map((user) => user.email)
    } catch (error) {
      console.warn('[admin] could not resolve admin alert recipients:', error?.message || error)
      return
    }
  }

  if (recipients.length === 0) {
    console.warn('[admin] no admin email recipients configured for alert notifications')
    return
  }

  const results = await Promise.allSettled(recipients.map((email) => sendAlertEmail(alert, email)))
  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.warn('[admin] alert email delivery failed:', result.reason?.message || result.reason)
    }
  })
}

export const handleAdminRoutes = async ({ req, res, method, path }) => {
  // --- USERS ---
  if (method === 'GET' && path === '/admin/users') {
    await requireAdmin(req)
    const users = await listUsers()
    return send(res, 200, users.map(adminUser))
  }

  if (method === 'POST' && path === '/admin/users') {
    await requireAdmin(req)
    const body = await readBody(req)
    if (!body.name || !body.email || !body.password) {
      return send(res, 400, { message: 'Name, email, and password are required' })
    }
    if (String(body.password).length < 8) {
      return send(res, 400, { message: 'Password must be at least 8 characters' })
    }

    const existingUser = await findUserByEmail(body.email)
    if (existingUser) {
      return send(res, 409, { message: 'Email already registered' })
    }

    const authUser = await createSupabaseAuthUser({
      name: body.name,
      email: body.email,
      password: body.password,
    })
    let user
    try {
      user = await createUser({
        name: body.name,
        email: body.email,
        role: body.role,
        status: body.status,
        authUserId: authUser.id,
      })
    } catch (error) {
      try {
        await deleteSupabaseAuthUser(authUser.id)
      } catch (cleanupError) {
        console.error('[admin] failed to roll back Supabase Auth user after profile creation failed:', cleanupError)
      }
      throw error
    }
    return send(res, 201, adminUser(user))
  }

  const userMatch = path.match(/^\/admin\/users\/(\d+)$/)
  if (userMatch && method === 'PUT') {
    await requireAdmin(req)
    const body = await readBody(req)
    const user = await updateUser(Number(userMatch[1]), body)
    if (!user) return send(res, 404, { message: 'User not found' })
    return send(res, 200, adminUser(user))
  }

  if (userMatch && method === 'DELETE') {
    await requireAdmin(req)
    const deleted = await deleteUser(Number(userMatch[1]))
    if (!deleted) return send(res, 404, { message: 'User not found' })
    return send(res, 204, '')
  }

  // --- ALERTS ---
  if (method === 'GET' && path === '/admin/alerts') {
    await requireAdmin(req)
    try {
      const rows = await supabaseRequest(alertsTable, { query: { select: '*' } })
      if (Array.isArray(rows) && rows.length > 0) {
        return send(res, 200, rows)
      }
      console.warn('[admin] /admin/alerts supabase returned no rows, falling back to in-memory alerts')
    } catch (err) {
      console.warn('[admin] /admin/alerts supabase failed, falling back to in-memory alerts:', err?.message || err)
    }
    return send(res, 200, alerts)
  }

  if (method === 'POST' && path === '/admin/alerts') {
    await requireAdmin(req)
    const body = await readBody(req)
    if (!body.title || !body.severity || !body.location) {
      return send(res, 400, { message: 'title, severity, and location are required' })
    }

    const alert = {
      title: body.title,
      severity: body.severity,
      location: body.location,
      timestamp: new Date().toISOString(),
      read: false,
      // Optional fields (if Supabase table has them)
      message: body.message,
      description: body.description,
      event_type: body.event_type,
      reason: body.reason,
    }

    try {
      const rows = await supabaseRequest(alertsTable, {
        method: 'POST',
        query: { select: '*' },
        prefer: 'return=representation',
        body: alert,
      })

      void notifyAdminRecipients(alert)

      // ✅ Log entry
      logs.unshift({
        id: Date.now(),
        user: 'System',
        action: 'Alert Created',
        method: 'API',
        timestamp: new Date().toLocaleString(),
        status: 'success',
        result: alert.title,
        location: alert.location,
      })

      return send(res, 201, rows[0])
    } catch (err) {
      console.warn('[admin] create alert failed, falling back to in-memory store:', err?.message || err)
      const id = alerts.length ? Math.max(...alerts.map((a) => Number(a.id))) + 1 : 1
      const fallbackAlert = { id, ...alert }
      alerts.unshift(fallbackAlert)

      void notifyAdminRecipients(alert)

      logs.unshift({
        id: Date.now(),
        user: 'System',
        action: 'Alert Created',
        method: 'API',
        timestamp: new Date().toLocaleString(),
        status: 'success',
        result: alert.title,
        location: alert.location,
      })

      return send(res, 201, fallbackAlert)
    }
  }

  const alertDeleteMatch = path.match(/^\/admin\/alerts\/(\d+)$/)
  if (method === 'DELETE' && alertDeleteMatch) {
    await requireAdmin(req)
    try {
      const rows = await supabaseRequest(alertsTable, {
        method: 'DELETE',
        query: { id: `eq.${alertDeleteMatch[1]}`, select: 'id' },
        prefer: 'return=representation',
      })
      return rows.length > 0 ? send(res, 204, '') : send(res, 404, { message: 'Alert not found' })
    } catch (err) {
      console.warn('[admin] delete alert failed, falling back to in-memory remove:', err?.message || err)
      const idString = alertDeleteMatch[1]
      const idx = alerts.findIndex((a) => String(a.id) === idString)
      if (idx >= 0) {
        alerts.splice(idx, 1)
        return send(res, 204, '')
      }
      return send(res, 404, { message: 'Alert not found' })
    }
  }

  // --- LOGS (deprecated) ---
  // Admin UI now uses GET /access-logs.
  if (method === 'GET' && path === '/admin/logs') {
    await requireAdmin(req)
    const { getAccessLogsNewestFirst } = await import('../utils/accessLogs.mjs')
    const logs = await getAccessLogsNewestFirst()
    return send(res, 200, logs)
  }


  // --- SETTINGS ---
  if (method === 'GET' && path === '/admin/settings') {
    await requireAdmin(req)
    return send(res, 200, settings)
  }

  if (method === 'PUT' && path === '/admin/settings') {
    await requireAdmin(req)
    Object.assign(settings, await readBody(req))
    return send(res, 200, settings)
  }

  return false
}