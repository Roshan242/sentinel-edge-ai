import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const DATA_DIR = __dirname

const CAMERA_DB_PATH = join(DATA_DIR, 'cameras.json')

const normalizeIp = (value) => String(value || '').trim().replace(/^https?:\/\//i, '')

// id derivation: stable across refresh/edit/remove.
// Use a simple, deterministic id. (No crypto deps.)
const cameraIdFromIp = (ip) => {
  const normalized = normalizeIp(ip).toLowerCase()
  // Make it URL/path safe
  return `cam_${normalized.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}`
}

const defaultCameras = []

const readJsonSafe = () => {
  try {
    if (!existsSync(CAMERA_DB_PATH)) return defaultCameras
    const raw = readFileSync(CAMERA_DB_PATH, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : defaultCameras
  } catch {
    return defaultCameras
  }
}

const writeJsonSafe = (cameras) => {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(CAMERA_DB_PATH, JSON.stringify(cameras, null, 2), 'utf8')
  } catch {
    // Persisting failures shouldn't break API usage in dev.
  }
}

let cameras = readJsonSafe()

export const cameraStore = {
  getAll: () => cameras,

  getById: (id) => cameras.find((c) => String(c.id) === String(id)) || null,

  upsert: ({ name, ip, status = 'offline' }) => {
    const normalizedIp = normalizeIp(ip)
    const id = cameraIdFromIp(normalizedIp)
    const streamUrl = `http://${normalizedIp}/stream`
    const snapshotUrl = `http://${normalizedIp}/shot.jpg`

    const existingIdx = cameras.findIndex((c) => String(c.id) === String(id))

    const next = {
      id,
      name: String(name || '').trim() || `Camera - ${normalizedIp}`,
      ip: normalizedIp,
      streamUrl,
      snapshotUrl,
      status,
      lastUpdated: new Date().toISOString(),
    }

    if (existingIdx >= 0) {
      cameras[existingIdx] = { ...cameras[existingIdx], ...next }
    } else {
      cameras = [next, ...cameras]
    }

    writeJsonSafe(cameras)
    return next
  },

  updateStatus: (id, status) => {
    const idx = cameras.findIndex((c) => String(c.id) === String(id))
    if (idx < 0) return null
    cameras[idx] = { ...cameras[idx], status, lastUpdated: new Date().toISOString() }
    writeJsonSafe(cameras)
    return cameras[idx]
  },

  remove: (id) => {
    const before = cameras.length
    cameras = cameras.filter((c) => String(c.id) !== String(id))
    writeJsonSafe(cameras)
    return cameras.length < before
  },
}

