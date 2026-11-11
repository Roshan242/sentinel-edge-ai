import {
  attachAuthUserId,
  createUser,
  findUserByAuthId,
  findUserByEmail,
  getSupabaseAuthUser,
} from '../data/users.mjs'

export const getToken = (req) => {
  const header = req.headers?.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

const authError = (message, statusCode = 401) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const isEmailVerified = (authUser) => Boolean(authUser.email_confirmed_at || authUser.confirmed_at)

export const getSessionUser = async (req) => {
  const token = getToken(req)
  if (!token) return null

  const authUser = await getSupabaseAuthUser(token)
  if (!authUser) return null
  if (!authUser.id || !authUser.email || !isEmailVerified(authUser)) {
    throw authError('Confirm your email before accessing the application.', 403)
  }

  const linkedProfile = await findUserByAuthId(authUser.id)
  if (linkedProfile) return linkedProfile

  const existingProfile = await findUserByEmail(authUser.email)
  if (existingProfile) {
    if (existingProfile.role === 'admin') {
      throw authError('This administrator account must be linked to Supabase Auth by an administrator.', 403)
    }

    if (existingProfile.authUserId && existingProfile.authUserId !== authUser.id) {
      throw authError('This profile is already linked to another account.', 403)
    }

    const linked = await attachAuthUserId(existingProfile.id, authUser.id)
    if (!linked) throw authError('Could not link the account profile.', 503)
    return linked
  }

  try {
    return await createUser({
      name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email.split('@')[0],
      email: authUser.email,
      role: 'user',
      status: 'registered',
      authUserId: authUser.id,
    })
  } catch (error) {
    if (error.code !== 'DUPLICATE_EMAIL' && error.code !== 'DUPLICATE_AUTH_USER') throw error
    const createdProfile = await findUserByAuthId(authUser.id)
    if (createdProfile) return createdProfile
    throw error
  }
}

export const requireAuth = async (req) => {
  if (!getToken(req)) throw authError('Unauthorized')
  const user = await getSessionUser(req)
  if (!user) throw authError('Unauthorized')
  if (user.status !== 'registered') {
    throw authError('This account is not active.', 403)
  }
  if (user.role !== 'admin' && user.role !== 'user') {
    throw authError('This account has no valid application role.', 403)
  }
  return user
}

export const requireAdmin = async (req) => {
  const user = await requireAuth(req)
  if (user.role !== 'admin') throw authError('Forbidden', 403)
  return user
}
