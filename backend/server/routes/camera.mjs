import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'

import { requireAuth } from '../middleware/auth.mjs'
import { readBody, send } from '../utils/http.mjs'

// In-memory registry: id -> { id, url, createdAt }
const streams = new Map()

// Simple per-id ffmpeg spawn throttling
const spawnGuards = new Map() // id -> { lastSpawnAt }

const normalizeStreamUrl = (value) => {
  const url = String(value || '').trim()
  if (!url) return null
  return url
}

const safeId = (value) => {
  const id = String(value || '').trim()
  if (!id) return null
  // keep it simple and avoid weird path chars
  if (!/^[a-zA-Z0-9._-]{1,128}$/.test(id)) return null
  return id
}

const startFfmpegToMjpeg = ({ inputUrl, response, requestId }) => {
  // We aim to output MJPEG frames as a byte stream.
  // - Use mpegts? no: we use image2pipe with mjpeg.
  // - ffmpeg will read RTSP/HTTP(S) sources directly.

  // Note: for some cameras, reconnect options may help; keep it minimal.
  const args = [
    '-hide_banner',
    '-loglevel', 'warning',

    '-i', inputUrl,

    // Convert to JPEG frames.
    '-vf', 'fps=10',
    '-q:v', '4',

    // Output MJPEG to stdout
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    'pipe:1',
  ]

  const ff = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })

  const boundary = `ffmpeg_mjpeg_${requestId}`

  response.writeHead(200, {
    'Content-Type': `multipart/x-mixed-replace; boundary=${boundary}`,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Connection': 'keep-alive',
  })

  const onClose = () => {
    try {
      ff.kill('SIGKILL')
    } catch (error) {
      void error
    }
  }

  // Stop ffmpeg when client disconnects
  response.on('close', onClose)
  response.on('error', onClose)

  let buffer = Buffer.alloc(0)

  // JPEG frames from image2pipe usually start with 0xFFD8 and end with 0xFFD9.

  const findJpegFrames = (data) => {
    // Very small parser: find start/end markers in the stream.
    // Returns { frames: Buffer[], rest: Buffer }
    let start = -1
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xd8) { start = i; break }
    }
    if (start < 0) return { frames: [], rest: data }

    let end = -1
    for (let i = start + 2; i < data.length - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xd9) { end = i + 2; break }
    }
    if (end < 0) return { frames: [], rest: data.slice(start) }

    const frame = data.slice(start, end)
    const rest = data.slice(end)
    return { frames: [frame], rest }
  }

  const writeFrame = (jpeg) => {
    response.write(`--${boundary}\r\n`)
    response.write('Content-Type: image/jpeg\r\n')
    response.write(`Content-Length: ${jpeg.length}\r\n\r\n`)
    response.write(jpeg)
    response.write('\r\n')
  }

  ff.stdout.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk])
    // Attempt to extract frames; keep minimal to avoid CPU spikes.
    // We'll extract at most a few frames per chunk.
    for (let iter = 0; iter < 3; iter++) {
      const { frames, rest } = findJpegFrames(buffer)
      if (frames.length === 0) {
        buffer = rest
        break
      }
      writeFrame(frames[0])
      buffer = rest
      if (buffer.length < 2) break
    }
  })

  ff.stderr.on('data', () => {
    // Keep quiet; ffmpeg warnings are not always relevant.
  })

  ff.on('exit', () => {
    response.end()
    // nothing else
  })
}

export const handleCameraRoutes = async ({ req, res, method, path }) => {
  if (method === 'POST' && path === '/camera/add') {
    await requireAuth(req)

    const body = await readBody(req)
    const id = safeId(body?.id)
    const inputUrl = normalizeStreamUrl(body?.url)

    if (!id || !inputUrl) {
      return send(res, 400, { success: false, message: 'id and url are required (id: a-zA-Z0-9._-).'} )
    }

    streams.set(id, { id, url: inputUrl, createdAt: new Date().toISOString() })

    return send(res, 200, { success: true, id })
  }

  const streamMatch = path.match(/^\/camera\/stream\/([^/]+)$/)
  if (method === 'GET' && streamMatch) {
    await requireAuth(req)

    const id = streamMatch[1]
    const entry = streams.get(id)
    if (!entry) return send(res, 404, { message: 'Camera stream not found. Add it first.' })

    // spawn guard (avoid rapid restarts)
    const now = Date.now()
    const g = spawnGuards.get(id) || { lastSpawnAt: 0 }
    if (now - g.lastSpawnAt < 500) {
      return send(res, 429, { message: 'Too many stream requests; retry shortly.' })
    }
    spawnGuards.set(id, { lastSpawnAt: now })

    const requestId = createHash('sha256').update(`${id}:${entry.createdAt}:${now}`).digest('hex').slice(0, 10)

    try {
      startFfmpegToMjpeg({ inputUrl: entry.url, response: res, requestId })
      return true
    } catch (e) {
      send(res, 500, { message: 'Failed to start stream', error: e?.message || String(e) })
      return true
    }
  }

  return false
}

