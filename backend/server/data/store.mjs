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

export const cameraHost = (process.env.CAMERA_HOST || process.env.VITE_CAMERA_HOST || 'http://100.94.124.9:8080').replace(/\/+$/, '')

export const sessions = new Map()

// In-memory OTP store (dev-friendly). Keyed by otpToken.
export const otpCodes = new Map()

// Pending registrations until OTP verification
export const pendingRegistrations = new Map()


export const alerts = [
  { id: 1, title: 'Unauthorized Access Attempt', severity: 'critical', timestamp: '2 minutes ago', location: 'Main Entrance', read: false },
  { id: 2, title: 'System Warning', severity: 'warning', timestamp: '5 minutes ago', location: 'Server Room', read: false },
  { id: 3, title: 'Device Offline', severity: 'error', timestamp: '10 minutes ago', location: 'Camera 4', read: true },
]

// Access logs (backing store for API + UI)
// Canonical shape required by the task:
// { id, userId, name, email, action, status, timestamp }
//
// NOTE: This file previously contained mock entries. Those have been removed.
export const logs = []

// Create a stable numeric id for log entries.
export const nextLogId = (items) => (items.length ? Math.max(...items.map((item) => Number(item.id))) + 1 : 1)


// Cameras are now persisted in a JSON-backed store.
// Keep this export for backward compatibility with older parts of the codebase.
// New endpoints should use `server/data/cameras.store.mjs`.
export const cameras = []


export const settings = {
  systemName: 'SENTINEL-EDGE AI',
  location: 'Main Office',
  emailAlerts: true,
  smsNotifications: false,
  suspiciousActivityAlerts: true,
  twoFactorEnabled: false,
}

export const nextId = (items) => (items.length ? Math.max(...items.map((item) => Number(item.id))) + 1 : 1)
