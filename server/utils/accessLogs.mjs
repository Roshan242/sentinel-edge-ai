import { supabaseRequest } from '../data/users.mjs'
import { findUserById } from '../data/users.mjs'

const accessLogsTable = 'access_logs'

// Requirement: use ONLY public.access_logs.
// IMPORTANT: supabaseRequest already targets /rest/v1/<table> and PostgREST resolves schema,
// so we must pass only the table identifier here (no `public.` prefix).
const getAccessLogsTableRef = () => accessLogsTable


const logActionToStatus = {

  'Login Success': 'success',
  'Login Failure': 'failed',
  'Logout Success': 'success',
  'User Registration': 'success',
}

const normalizeStatus = (status) => {
  if (!status) return null
  const s = String(status).toLowerCase()
  if (s === 'success' || s === 'failed') return s
  return null
}

const getTargetUserTable = async () => {
  // Always reference the shared public.access_logs table.
  return getAccessLogsTableRef()
}

export const createAccessLog = async ({ userId, name, email, action, status } = {}) => {

  if (!action) throw new Error('createAccessLog: action is required')

  const finalName = String(name || '')
  const finalEmail = String(email || '')
  if (!finalName || !finalEmail) return null

  const finalStatus = normalizeStatus(status) || logActionToStatus[action] || 'success'

  const body = {
    name: finalName,
    email: finalEmail,
    action: String(action),
    status: String(finalStatus),
  }

  if (userId !== undefined && userId !== null) {
    body.user_id = Number(userId)
  }

  const table = await getTargetUserTable({ userId, email: finalEmail })

  await supabaseRequest(table, {
    method: 'POST',
    query: { select: '*' },
    prefer: 'return=representation',
    body,
  })

  const newest = await getAccessLogsNewestFirst({ limit: 1, userId })
  return newest?.[0] || null

}

export const createAnonymousAccessLog = async ({ name, email, action, status } = {}) => { 

  // Anonymous logs: still store into global access logs table.
  // (Per-user tables require email mapping to create correct partition.)
  if (!action) throw new Error('createAnonymousAccessLog: action is required')

  const finalName = String(name || 'Unknown User')
  const finalEmail = String(email || '')
  if (!finalEmail) return null

  const finalStatus = normalizeStatus(status) || logActionToStatus[action] || 'failed'

  const payload = {
    name: finalName,
    email: finalEmail,
    action: String(action),
    status: String(finalStatus),
  }

  try {
    await supabaseRequest(accessLogsTable, {
      method: 'POST',
      query: { select: '*' },
      prefer: 'return=representation',
      body: payload,
    })
  } catch (err) {
    console.error('Anonymous access log failed:', err?.message || err)
    return null
  }

  const newest = await getAccessLogsNewestFirst({ limit: 1, email: finalEmail })
  return newest?.[0] || null
}

export const getAccessLogsNewestFirst = async ({ limit, userId } = {}) => {
  const table = await getTargetUserTable({ userId })

  const rows = await supabaseRequest(table, {
    query: {
      select: '*',
      ...(limit ? { limit: String(limit) } : {}),
      ...(userId !== undefined && userId !== null ? { user_id: `eq.${Number(userId)}` } : {}),
      order: 'created_at.desc',

    },
  })

  const ordered = Array.isArray(rows) ? rows : []

  return ordered.map((r) => {
    const createdAt = r.created_at ?? r.createdAt ?? r.timestamp
    return {
      id: Number(r.id),
      userId: Number(r.user_id ?? r.userId),
      name: r.name,
      email: r.email,
      action: r.action,
      status: r.status,
      timestamp: createdAt,
    }
  })
}


export const createAccessLogFromLoginResult = async ({ user, success }) => {
  if (!user) return null

  return createAccessLog({
    userId: user.id,
    name: user.name,
    email: user.email,
    action: success ? 'Login Success' : 'Login Failure',
    status: success ? 'success' : 'failed',
  })
}

