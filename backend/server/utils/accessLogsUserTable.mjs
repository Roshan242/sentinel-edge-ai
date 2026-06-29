// Helper for per-user access log table naming.
// Kept separate for clarity.

import { createHash } from 'node:crypto'

const accessLogsTablePrefix = 'access_logs_user_'

export const userAccessLogsTableName = (email) => {
  const safe = String(email || '').trim().toLowerCase()
  const md5 = createHash('md5').update(safe).digest('hex')
  return `${accessLogsTablePrefix}${md5}`
}

