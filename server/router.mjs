import { URL } from 'node:url'
import { handleAdminRoutes } from './routes/admin.mjs'
import { handleAuthRoutes } from './routes/auth.mjs'
import { handleAlertRoutes } from './routes/alerts.mjs'
import { handleCoreRoutes } from './routes/core.mjs'
import { handleAccessLogRoutes } from './routes/accessLogs.mjs'
import { handleSecurityRoutes } from './routes/security.mjs'
import { notFound, send } from './utils/http.mjs'



const normalizePath = (pathname) => pathname.replace(/^\/api(?=\/|$)/, '') || '/'

export const routeRequest = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const method = req.method || 'GET'
  const path = normalizePath(url.pathname)

  if (method === 'OPTIONS') return send(res, 204, '')

  const routeContext = { req, res, method, path, url }
  if (await handleAuthRoutes(routeContext)) return
  if (await handleAdminRoutes(routeContext)) return
  if (await handleAccessLogRoutes(routeContext)) return
  if (await handleAlertRoutes(routeContext)) return
  if (await handleSecurityRoutes(routeContext)) return
  if (await handleCoreRoutes(routeContext)) return



  notFound(method, path)
}

