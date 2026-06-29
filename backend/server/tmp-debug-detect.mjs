import dotenv from 'dotenv'
dotenv.config({ path: '../.env', quiet: true })
import { getAccessLogsWindowForAnalysis } from './security/source-access-logs.mjs'
import { detectSecurityEvents } from './security/detect.mjs'

const windowMinutes = 60
const logs = await getAccessLogsWindowForAnalysis({ windowMinutes })
console.log('TOTAL_LOGS', logs.length)
console.log('LATEST_10', logs.slice(0, 10).map((l) => ({ id: l.id, userId: l.userId, action: l.action, status: l.status, timestamp: l.timestamp })))

const now = Date.now()
const failedLoginWindowMinutes = 5
const failedLoginCutoff = now - failedLoginWindowMinutes * 60 * 1000
const failedLoginsRecentWindow = logs.filter((l) => {
  const eventSig = /login failure/i.test(String(l.action || '')) || String(l.status || '').toLowerCase() === 'failed'
  if (!eventSig) return false
  const t = l?.timestamp ? new Date(l.timestamp).getTime() : NaN
  return Number.isFinite(t) && t >= failedLoginCutoff
})
console.log('FAILED_LOGIN_RECENT_WINDOW_COUNT', failedLoginsRecentWindow.length)
console.log('FAILED_LOGIN_RECENT_WINDOW', failedLoginsRecentWindow.map((l) => ({ id: l.id, userId: l.userId, action: l.action, status: l.status, timestamp: l.timestamp })))

const failedByUser = new Map()
for (const l of failedLoginsRecentWindow) {
  const u = l?.userId ?? null
  const num = u === undefined || u === null ? null : Number(u)
  if (!Number.isFinite(num)) continue
  failedByUser.set(num, (failedByUser.get(num) || 0) + 1)
}
console.log('FAILED_BY_USER', Array.from(failedByUser.entries()))

const result = await detectSecurityEvents({ windowMinutes })
console.log('DETECT_RESULT', JSON.stringify(result, null, 2))
