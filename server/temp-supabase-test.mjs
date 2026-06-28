import { readFileSync } from 'node:fs'

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const vars = Object.fromEntries(
  env.split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => {
      const idx = line.indexOf('=')
      if (idx === -1) return null
      return [line.slice(0, idx), line.slice(idx + 1)]
    })
    .filter(Boolean)
)

const url = vars.SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '')
const key = vars.SUPABASE_SERVICE_ROLE_KEY || vars.SUPABASE_KEY
if (!key) {
  throw new Error('Supabase key not found in .env')
}

const tokenParts = key.split('.')
if (tokenParts.length === 3) {
  const payload = JSON.parse(Buffer.from(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
  console.log('decoded service role payload:', payload)
}

const response = await fetch(`${url}/rest/v1/users?select=*&limit=1`, {
  method: 'GET',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
})

console.log('status:', response.status)
console.log('body:', await response.text())
