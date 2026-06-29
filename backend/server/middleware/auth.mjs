import { sessions } from '../data/store.mjs'
import { findUserById } from '../data/users.mjs'

export const getToken = (req) => {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

export const getSessionUser = async (req) => {
  const token = getToken(req)
  const userId = token ? sessions.get(token) : null
  return userId ? findUserById(userId) : null
}

export const requireAuth = async (req) => {
  const header = req.headers?.authorization || ''
  if (!header) {
    console.warn('[auth] Unauthorized: missing Authorization header')
    const error = new Error('Unauthorized')
    error.statusCode = 401
    throw error
  }

  if (!header.startsWith('Bearer ')) {
    console.warn('[auth] Unauthorized: Authorization header is not Bearer', { header: String(header).slice(0, 80) })
    const error = new Error('Unauthorized')
    error.statusCode = 401
    throw error
  }

  const user = await getSessionUser(req)
  if (!user) {
    const token = getToken(req)
    const hasToken = !!token
    console.warn('[auth] Unauthorized: token not found in sessions', { hasToken })
    const error = new Error('Unauthorized')
    error.statusCode = 401
    throw error
  }
  return user
}


export const requireAdmin = async (req) => {
  const user = await requireAuth(req)
  if (user.role !== 'admin') {
    const error = new Error('Forbidden')
    error.statusCode = 403
    throw error
  }
  return user
}
