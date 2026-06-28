import { existsSync, readFileSync } from 'node:fs'
import argon2 from 'argon2'

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
const usersTable = process.env.SUPABASE_USERS_TABLE || 'users'

// --- Local/dev fallback mode ---
// This repo historically used Supabase for user storage. If SUPABASE_* envs
// are missing, we fall back to a simple local store so the API can boot.
//
// NOTE: Despite the UI/backend naming saying “MySQL”, the current code path is
// Supabase REST. This fallback is purely to keep the app working.
let fallbackMode = false
const fallbackUsers = new Map() // id -> user
const fallbackEmailIndex = new Map() // email -> id
let fallbackNextId = 1

const maybeEnableFallbackMode = () => {
  if (!supabaseUrl || !supabaseKey) {
    fallbackMode = true
    console.warn('[Sentinel Edge API] Supabase config missing; using local in-memory user store (dev fallback).')
    return true
  }
  return false
}

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

const userFromRow = (row) => ({
  id: Number(row.id),
  name: row.name,
  email: row.email,
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
  // If Supabase isn't configured, enable fallback and seed demo users locally.
  if (maybeEnableFallbackMode()) {
    // Seed demo users for immediate usability
    // IMPORTANT: store Argon2id hashes only.
    const seed = [
      { name: 'Admin', email: 'admin@sentinel.com', password: 'password123', role: 'admin', status: 'registered', registered_date: '2024-01-15' },
      { name: 'Rohit Kumar', email: 'user@sentinel.com', password: 'password123', role: 'user', status: 'registered', registered_date: '2024-01-20' },
    ]

    for (const u of seed) {
      const id = fallbackNextId++
      const passwordHash = await hashPasswordArgon2id(u.password)
      const user = userFromRow({
        id,
        name: u.name,
        email: u.email,
        password: passwordHash,
        role: u.role,
        status: u.status,
        registered_date: u.registered_date,
      })
      fallbackUsers.set(id, user)
      fallbackEmailIndex.set(user.email, id)
    }

    return
  }

  assertSupabaseConfig()
  await seedDemoUsers()
}

const seedDemoUsers = async () => {
  // Seed demo users with Argon2id hashes only.
  const adminHash = await hashPasswordArgon2id('password123')
  const userHash = await hashPasswordArgon2id('password123')

  await supabaseRequest(usersTable, {
    method: 'POST',
    query: { on_conflict: 'email' },
    prefer: 'resolution=merge-duplicates',
    body: [
      { name: 'Admin', email: 'admin@sentinel.com', password: adminHash, role: 'admin', status: 'registered', registered_date: '2024-01-15' },
      { name: 'Rohit Kumar', email: 'user@sentinel.com', password: userHash, role: 'user', status: 'registered', registered_date: '2024-01-20' },
    ],
  })
}

// Detects whether the stored `password` field is an Argon2 hash.
// Argon2 PHC strings typically look like: $argon2id$v=19$m=...
const isArgon2Hash = (value) => typeof value === 'string' && value.startsWith('$argon2id$')

// Hash passwords using Argon2id.
const hashPasswordArgon2id = async (password) => {
  // Argon2id mode (argon2 package uses argon2.argon2id)
  return argon2.hash(password, { type: argon2.argon2id })
}

// Find a user by email and verify their password.
// Backward compatibility:
// - If stored `password` is legacy plaintext, compare once.
// - On successful legacy login, migrate to Argon2id hash and persist.
export const findUserByCredentials = async (email, password) => {
  const user = await findUserByEmail(email)
  if (!user) return null

  const stored = user.password
  if (!stored) return null

  // New path: stored Argon2id hash
  if (isArgon2Hash(stored)) {
    const ok = await argon2.verify(stored, password)
    return ok ? user : null
  }

  // Legacy path: stored plaintext password
  if (stored !== password) return null

  // Migration on successful login
  const newHash = await hashPasswordArgon2id(password)

  if (fallbackMode) {
    user.password = newHash
    fallbackUsers.set(user.id, user)
    return user
  }

  try {
    await supabaseRequest(usersTable, {
      method: 'PATCH',
      query: { id: `eq.${user.id}` },
      prefer: 'return=representation',
      body: { password: newHash },
    })
  } catch (err) {
    // Login should still succeed even if migration fails.
    // Avoid leaking sensitive info.
    console.error('[Auth] Password migration failed:', err?.message || err)
  }

  user.password = newHash
  return user
}

export const findUserById = async (id) => {
  if (fallbackMode) {
    const user = fallbackUsers.get(Number(id))
    return user || null
  }

  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', id: `eq.${id}`, limit: '1' },
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const findUserByEmail = async (email) => {
  if (fallbackMode) {
    const id = fallbackEmailIndex.get(email)
    if (!id) return null
    return fallbackUsers.get(id) || null
  }

  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', email: `eq.${email}`, limit: '1' },
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const createUser = async ({ name, email, password, role = 'user', status = 'registered' }) => {
  if (fallbackMode) {
    const existingId = fallbackEmailIndex.get(email)
    if (existingId) {
      const error = new Error('Email already registered')
      error.code = 'DUPLICATE_EMAIL'
      throw error
    }

    const id = fallbackNextId++

    const passwordHash = await hashPasswordArgon2id(password)

    const user = {
      id,
      name,
      email,
      password: passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      status: status === 'pending' ? 'pending' : 'registered',
      registeredDate: new Date().toISOString().slice(0, 10),
      // keep internal password for auth matching
      registered_date: undefined,
    }

    // match shape of userFromRow output
    const normalized = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status,
      registeredDate: user.registeredDate,
    }

    fallbackUsers.set(id, normalized)
    fallbackEmailIndex.set(email, id)
    return normalized
  }

  const registeredDate = new Date().toISOString().slice(0, 10)
  const passwordHash = await hashPasswordArgon2id(password)
  try {
    const rows = await supabaseRequest(usersTable, {
      method: 'POST',
      query: { select: '*' },
      prefer: 'return=representation',
      body: {
        name,
        email,
        password: passwordHash,
        role: role === 'admin' ? 'admin' : 'user',
        status: status === 'pending' ? 'pending' : 'registered',
        registered_date: registeredDate,
      },
    })
    return userFromRow(rows[0])
  } catch (err) {
    const message = String(err?.message || err)
    // Supabase/Postgres unique constraint violation on users.email
    if (message.includes('23505') || message.includes('users_email_key') || message.includes('duplicate key value')) {
      const error = new Error('Email already registered')
      error.code = 'DUPLICATE_EMAIL'
      throw error
    }
    throw err
  }
}

export const listUsers = async () => {
  if (fallbackMode) {
    return Array.from(fallbackUsers.values()).map((u) => ({
      ...u,
      registeredDate: u.registeredDate,
    }))
  }

  const rows = await supabaseRequest(usersTable, {
    query: { select: '*', order: 'id.asc' },
  })
  return rows.map(userFromRow)
}

export const updateUser = async (id, updates) => {
  if (fallbackMode) {
    const existing = fallbackUsers.get(Number(id))
    if (!existing) return null

    if (updates.name !== undefined) existing.name = updates.name
    if (updates.email !== undefined) {
      fallbackEmailIndex.delete(existing.email)
      existing.email = updates.email
      fallbackEmailIndex.set(existing.email, existing.id)
    }
    if (updates.status !== undefined) existing.status = updates.status
    if (updates.role !== undefined) existing.role = updates.role

    fallbackUsers.set(existing.id, existing)
    return existing
  }

  const body = {}
  if (updates.name !== undefined) body.name = updates.name
  if (updates.email !== undefined) body.email = updates.email
  if (updates.status !== undefined) body.status = updates.status
  if (updates.role !== undefined) body.role = updates.role

  const rows = await supabaseRequest(usersTable, {
    method: 'PATCH',
    query: { id: `eq.${id}`, select: '*' },
    prefer: 'return=representation',
    body,
  })
  return rows[0] ? userFromRow(rows[0]) : null
}

export const deleteUser = async (id) => {
  if (fallbackMode) {
    const existing = fallbackUsers.get(Number(id))
    if (!existing) return false
    fallbackUsers.delete(Number(id))
    fallbackEmailIndex.delete(existing.email)
    return true
  }

  const rows = await supabaseRequest(usersTable, {
    method: 'DELETE',
    query: { id: `eq.${id}`, select: 'id' },
    prefer: 'return=representation',
  })
  return rows.length > 0
}

export const countRegisteredUsers = async () => {
  if (fallbackMode) {
    return Array.from(fallbackUsers.values()).filter((u) => u.status === 'registered').length
  }

  const rows = await supabaseRequest(usersTable, {
    query: { select: 'id', status: 'eq.registered' },
  })
  return rows.length
}

