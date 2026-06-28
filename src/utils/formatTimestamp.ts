export type TimestampInput = string | number | Date | null | undefined

const pad2 = (n: number) => String(n).padStart(2, '0')

const toDate = (input: TimestampInput): Date | null => {
  if (input === null || input === undefined) return null
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}

/**
 * Formats timestamps for dashboard display using the user's local timezone.
 * Rules:
 * - < 1 minute: "Just now"
 * - < 60 minutes: "X minutes ago"
 * - < 24 hours: "X hours ago"
 * - older: "DD MMM YYYY, hh:mm AM/PM"
 */
export function formatTimestamp(input: TimestampInput): string {
  const d = toDate(input)
  if (!d) return '—'

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()

  // If timestamp is in the future (clock skew), clamp to "Just now".
  if (diffMs < 60_000) return 'Just now'

  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 60) return `${diffMin} minutes ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const day = pad2(d.getDate())
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()

  const hours24 = d.getHours()
  const minutes = pad2(d.getMinutes())
  const ampm = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12

  return `${day} ${month} ${year}, ${pad2(hours12)}:${minutes} ${ampm}`
}

