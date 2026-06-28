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

const response = await fetch(`${url}/rest/v1/users`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Test Insert',
    email: `test.insert.${Date.now()}@example.com`,
    password: '$argon2id$v=19$m=65536,t=3,p=4$abc$abc',
    role: 'user',
    status: 'registered',
    registered_date: new Date().toISOString().slice(0, 10),
  }),
})

console.log('status:', response.status)
console.log(await response.text())
