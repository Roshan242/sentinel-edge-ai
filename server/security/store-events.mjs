// server/security/store-events.mjs
// Persist detected security events in Supabase `security_events`.

import { supabaseRequest } from '../data/users.mjs'

const securityEventsTable = process.env.SUPABASE_SECURITY_EVENTS_TABLE || 'security_events'

export const upsertSecurityEvents = async ({ events } = {}) => {
  if (!Array.isArray(events) || events.length === 0) return 0

  // Insert only; table has its own id serial/uuid.
  const rows = await supabaseRequest(securityEventsTable, {
    method: 'POST',
    query: { select: '*' },
    prefer: 'return=representation',
    body: events,
  })

  return Array.isArray(rows) ? rows.length : 0
}

export const getSecurityEventsNewestFirst = async ({ limit = 100 } = {}) => {
  const rows = await supabaseRequest(securityEventsTable, {
    query: {
      select: '*',
      order: 'created_at.desc',
      limit: String(limit),
    },
  })

  return Array.isArray(rows) ? rows : []
}

