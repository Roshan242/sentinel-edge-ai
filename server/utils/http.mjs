export const send = (res, statusCode, body, headers = {}) => {
  const isText = typeof body === 'string'
  const payload = isText ? body : JSON.stringify(body)
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Content-Type': isText ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    ...headers,
  })
  res.end(payload)
  return true
}

export const readBody = async (req) => {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}

  try {
    return JSON.parse(raw)
  } catch {
    const error = new Error('Invalid JSON body')
    error.statusCode = 400
    throw error
  }
}

export const notFound = (method, path) => {
  const error = new Error(`No route for ${method} ${path}`)
  error.statusCode = 404
  throw error
}

export const csvEscape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
