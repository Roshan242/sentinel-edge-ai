import { validateIpWithPort, normalizeIpInput } from './ip.mjs'

const withTimeout = (promise, ms) => {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error('Timeout')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}

// Verify the camera is reachable by attempting to GET the stream URL.
// Many camera firmwares will respond quickly for /stream (or at least connect).
export const checkCameraReachable = async (ipInput, { timeoutMs = 2500 } = {}) => {
  const v = validateIpWithPort(ipInput)
  if (!v.valid) {
    return { reachable: false, reason: v.reason }
  }

  const ip = normalizeIpInput(ipInput)
  const streamUrl = `http://${ip}/stream`

  try {
    // Use HEAD to reduce bandwidth; fall back to GET if HEAD isn't supported.
    const res = await withTimeout(
      fetch(streamUrl, { method: 'HEAD' }),
      timeoutMs,
    )

    // Some servers may not implement HEAD properly.
    if (res.ok || (res.status >= 200 && res.status < 500)) {
      return { reachable: true, streamUrl, status: res.status }
    }

    // If HEAD fails with non-ok, try GET (lightweight).
    const res2 = await withTimeout(
      fetch(streamUrl, { method: 'GET' }),
      timeoutMs,
    )
    return { reachable: res2.ok, streamUrl, status: res2.status }
  } catch {
    return { reachable: false, reason: 'Camera not reachable' }
  }
}

