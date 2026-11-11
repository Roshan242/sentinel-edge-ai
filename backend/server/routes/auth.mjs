import { publicUser } from '../data/users.mjs'
import { requireAuth } from '../middleware/auth.mjs'
import { send } from '../utils/http.mjs'

export const handleAuthRoutes = async ({ req, res, method, path }) => {
  if (method === 'GET' && path === '/auth/me') {
    const user = await requireAuth(req)
    return send(res, 200, { user: publicUser(user) })
  }

  return false
}
