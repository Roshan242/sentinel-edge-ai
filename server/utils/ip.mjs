export const normalizeIpInput = (value) => String(value || '').trim().replace(/^https?:\/\//i, '')

// Accept formats like: 192.168.1.100:81
// Also accept hostnames: example.com:8080
// Ports are 1..65535
export const validateIpWithPort = (value) => {
  const ip = normalizeIpInput(value)

  const ipv4Port = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?::(\d{1,5}))$/
  const hostnamePort = /^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}(?::(\d{1,5}))$/

  const m1 = ip.match(ipv4Port)
  const m2 = ip.match(hostnamePort)

  const portStr = (m1 && m1[1]) || (m2 && m2[1])
  if (!portStr) return { valid: false, reason: 'Invalid IP format' }
  const port = Number(portStr)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { valid: false, reason: 'Port must be between 1 and 65535' }
  }

  return { valid: true, ip, port }
}

