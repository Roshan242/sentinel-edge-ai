import { existsSync, readFileSync } from 'node:fs'

if (existsSync('.env')) {
  const envFile = readFileSync('.env', 'utf8')
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/)
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].trim()
    }
  }
}

const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const usersTable = process.env.SUPABASE_USERS_TABLE || 'users'

const assertSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY in .env')
    error.statusCode = 500
    throw error
  }
}

export const supabaseRequest = async (table, { method = 'GET', query = {}, body, prefer } = {}) => {
  assertSupabaseConfig()

  const search = new URLSearchParams(query)
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${search.toString()}`, {
    method,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || `Supabase request failed with ${response.status}`)
    error.statusCode = response.status
    throw error
  }

  if (response.status === 204) return null

  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const getSupabaseAuthUser = async (accessToken) => {
  assertSupabaseConfig()
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 401 || response.status === 403) return null
  if (!response.ok) {
    const error = new Error(`Supabase Auth validation failed with status ${response.status}`)
    error.statusCode = 503
    throw error
  }
  return response.json()
}

const supabaseAuthAdminRequest = async (path, { method = 'GET', body } = {}) => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const error = new Error('Supabase Auth administration requires SUPABASE_SERVICE_ROLE_KEY')
    error.statusCode = 500
    throw error
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/${path}`, {
    method,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || `Supabase Auth administration failed with status ${response.status}`)
    error.statusCode = response.status
    throw error
  }
  if (response.status === 204) return null
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export const createSupabaseAuthUser = ({ name, email, password }) =>
  supabaseAuthAdminRequest('users', {
    method: 'POST',
    body: {
      email: normalizeEmail(email),
      password,
      email_confirm: true,
      user_metadata: { name },
    },
  })

export const updateSupabaseAuthUser = (authUserId, updates) =>
  supabaseAuthAdminRequest(`users/${encodeURIComponent(authUserId)}`, {
    method: 'PUT',
    body: {
      ...(updates.email !== undefined ? { email: normalizeEmail(updates.email), email_confirm: true } : {}),
      ...(updates.name !== undefined ? { user_metadata: { name: updates.name } } : {}),
    },
  })

export const deleteSupabaseAuthUser = async (authUserId) => {
  try {
    await supabaseAuthAdminRequest(`users/${encodeURIComponent(authUserId)}`, { method: 'DELETE' })
  } catch (error) {
    if (error.statusCode === 404) return
    throw error
  }
}

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '')

const userFromRow = (row) => ({
  id: Number(row.id),
  authUserId: row.auth_user_id || null,
  name: row.name,
  email: normalizeEmail(row.email),
  password: row.password,
  role: row.role,
  status: row.status,
  registeredDate: row.registered_date,
})

export const publicUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
})

export const adminUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  status: user.status,
  registeredDate: user.registeredDate,
})

export const initializeUserStore = async () => {
  assertSupabaseConfig()
}

export const findUserById = async (id) => {
  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', id: `eq.${id}`, limit: '1' },
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const findUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return null

  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', email: `eq.${normalizedEmail}`, limit: '1' },
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const findUserByAuthId = async (authUserId) => {
  if (!authUserId) return null
  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', auth_user_id: `eq.${authUserId}`, limit: '1' },
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const attachAuthUserId = async (userId, authUserId) => {
  const rows = await supabaseRequest(usersTable, {
    method: 'PATCH',
    query: { id: `eq.${userId}`, select: '*' },
    prefer: 'return=representation',
    body: { auth_user_id: authUserId },
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const createUser = async ({ name, email, role = 'user', status = 'registered', authUserId = null }) => {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    throw new Error('Email is required')
  }

  const registeredDate = new Date().toISOString().slice(0, 10)
  try {
    const rows = await supabaseRequest(usersTable, {
      method: 'POST',
      query: { select: '*' },
      prefer: 'return=representation',
      body: {
        auth_user_id: authUserId,
        name,
        email: normalizedEmail,
        role: role === 'admin' ? 'admin' : 'user',
        status: status === 'pending' ? 'pending' : 'registered',
        registered_date: registeredDate,
      },
    })
    return userFromRow(rows[0])
  } catch (err) {
    const message = String(err?.message || err)
    if (message.includes('23505') || message.includes('duplicate key value')) {
      const duplicateAuthIdentity = message.includes('auth_user_id')
      const error = new Error(duplicateAuthIdentity ? 'Supabase identity already linked' : 'Email already registered')
      error.code = duplicateAuthIdentity ? 'DUPLICATE_AUTH_USER' : 'DUPLICATE_EMAIL'
      throw error
    }
    throw err
  }
}

export const listUsers = async () => {
  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', order: 'id.asc' },
  })
  return rows.map(userFromRow)
}

export const updateUser = async (id, updates) => {
  const existing = await findUserById(id)
  if (!existing) return null
  const authIdentityChanged = existing.authUserId && (updates.email !== undefined || updates.name !== undefined)
  if (authIdentityChanged) {
    await updateSupabaseAuthUser(existing.authUserId, updates)
  }

  const body = {}
  if (updates.name !== undefined) body.name = updates.name
  if (updates.email !== undefined) body.email = normalizeEmail(updates.email)
  if (updates.status !== undefined) body.status = updates.status
  if (updates.role !== undefined) body.role = updates.role

  try {
    const rows = await supabaseRequest(usersTable, {
      method: 'PATCH',
      query: { id: `eq.${id}`, select: '*' },
      prefer: 'return=representation',
      body,
    })
    if (rows[0]) return userFromRow(rows[0])

    if (authIdentityChanged) {
      await updateSupabaseAuthUser(existing.authUserId, { email: existing.email, name: existing.name })
    }
    return null
  } catch (error) {
    if (authIdentityChanged) {
      try {
        await updateSupabaseAuthUser(existing.authUserId, { email: existing.email, name: existing.name })
      } catch (rollbackError) {
        console.error('[auth] failed to roll back Supabase Auth after profile update failed:', rollbackError)
      }
    }
    throw error
  }
}

export const deleteUser = async (id) => {
  const existing = await findUserById(id)
  if (!existing) return false
  if (existing.authUserId) await deleteSupabaseAuthUser(existing.authUserId)

  const rows = await supabaseRequest(usersTable, {
    method: 'DELETE',
    query: { id: `eq.${id}`, select: 'id' },
    prefer: 'return=representation',
  })
  return rows.length > 0
}

export const countRegisteredUsers = async () => {
  const rows = await supabaseRequest(usersTable, {
    query: { select: 'id', status: 'eq.registered' },
  })
  return rows.length
}
