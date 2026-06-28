// server/security/source-access-logs.mjs
// Provides read access to the existing access_logs table.

import { supabaseRequest } from '../data/users.mjs'

const accessLogsTable = process.env.SUPABASE_ACCESS_LOGS_TABLE || 'access_logs'

const toIso = (d) => new Date(d).toISOString()

// Fetch access logs from Supabase in a time window.
// Returns an array using the existing canonical shape used by server/utils/accessLogs.mjs.
export const getAccessLogsWindowForAnalysis = async ({
  windowMinutes,
  offsetMinutes = 0,
} = {}) => {
  const now = Date.now()
  const start = now - (offsetMinutes + windowMinutes) * 60 * 1000
  const end = now - offsetMinutes * 60 * 1000

  const startIso = toIso(start)
  const endIso = toIso(end)

  // Diagnostic logs: exact values + ISO validity
  console.log('[security] startIso=', startIso)
  console.log('[security] endIso=', endIso)
  console.log('[security] start valid=', !isNaN(Date.parse(startIso)))
  console.log('[security] end valid=', !isNaN(Date.parse(endIso)))

  // Temporary debug logs
  console.log('[security] window start', startIso)
  console.log('[security] window end', endIso)


  // Diagnostic bypass: temporarily remove DB-side created_at filters.
  // Fetch latest logs and filter in JS to confirm detection + persistence path.
  const search = new URLSearchParams()
  search.set('select', '*')
  search.set('order', 'created_at.desc')
  search.set('limit', '500')


  // Log final URL before execution (best-effort)
  const base = (process.env.SUPABASE_URL || '')
  const normalizedBase = base
    .replace(/\/rest\/v1\/?$/, '')
    .replace(/\/+$/, '')

  const url = `${normalizedBase}/rest/v1/${accessLogsTable}?${search.toString()}`
  console.log('[security] access logs supabase url', url)

  let rows
  try {
    rows = await supabaseRequest(accessLogsTable, {
      query: search,
    })
  } catch (err) {
    // Log exact Supabase error body/message
    console.error('[security] access logs fetch failed', err?.message || err)
    throw err
  }

  console.log('[security] access logs loaded', Array.isArray(rows) ? rows.length : 0)

  const ordered = Array.isArray(rows) ? rows : []
  console.log('[security] sample raw row', ordered[0] ? {
    id: ordered[0].id,
    user_id: ordered[0].user_id ?? null,
    created_at: ordered[0].created_at ?? null,
    createdAt: ordered[0].createdAt ?? null,
    timestamp: ordered[0].timestamp ?? null,
    action: ordered[0].action,
    status: ordered[0].status,
  } : null)

  const mapped = ordered.map((r) => {
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

  // Also log how many survive the JS cutoff that detect.mjs uses.
  // (Keeps DB query diagnostic-bypass intact.)
  const recentCutoff = Date.now() - windowMinutes * 60 * 1000
  const filteredCount = mapped.filter((l) => {
    const t = l?.timestamp ? new Date(l.timestamp).getTime() : NaN
    return Number.isFinite(t) && t >= recentCutoff
  }).length
  console.log('[security] mapped count', mapped.length, 'filtered-js count', filteredCount)

  return mapped
}


