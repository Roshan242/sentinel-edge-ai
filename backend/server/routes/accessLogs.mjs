import { readBody, send } from '../utils/http.mjs'
import { requireAdmin, requireAuth } from '../middleware/auth.mjs'
import { createAccessLog, getAccessLogsNewestFirst } from '../utils/accessLogs.mjs'



export const handleAccessLogRoutes = async ({ req, res, method, path }) => {
  // POST /access-logs (admin-only)
  if (method === 'POST' && path === '/access-logs') {
    await requireAdmin(req)
    const body = await readBody(req)

    const entry = await createAccessLog(body)
    if (!entry) return send(res, 400, { message: 'Invalid access log payload or unknown user' })

    return send(res, 201, entry)
  }

  // GET /access-logs (auth/admin)
  if (method === 'GET' && path === '/access-logs') {
    await requireAdmin(req)
    const logs = await getAccessLogsNewestFirst()
    return send(res, 200, logs)
  }

  // GET /my-access-logs (auth/user)
  if (method === 'GET' && path === '/my-access-logs') {
    const me = await requireAuth(req)
    const logs = await getAccessLogsNewestFirst({ userId: me.id, email: me.email })
    return send(res, 200, logs)
  }



  return false
}

