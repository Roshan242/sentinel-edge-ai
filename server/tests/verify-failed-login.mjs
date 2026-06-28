// server/tests/verify-failed-login.mjs
// Simple script to POST a failed login and then fetch admin alerts.

const base = process.env.BASE_URL || 'http://localhost:5000/api'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function run() {
  try {
    console.log('Posting failed login...')
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent-test@example.com', password: 'wrongpass' }),
    })
    console.log('Login status:', loginRes.status)
    try {
      const body = await loginRes.text()
      console.log('Login response:', body)
    } catch {}

    // wait a bit for async notify/persist to complete
    await wait(800)

    // Login as seeded user to fetch alerts (requires auth)
    console.log('Logging in as seeded user to fetch alerts...')
    const authRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@sentinel.com', password: 'password123' }),
    })
    console.log('Auth status:', authRes.status)
    let token = null
    try {
      const authBody = await authRes.json()
      console.log('Auth response:', authBody)
      token = authBody?.token
    } catch {}

    if (!token) {
      console.log('No token obtained; cannot query /alerts. Ensure fallback users are seeded or Supabase configured.')
      return
    }

    console.log('Fetching public alerts with token...')
    const alertsRes = await fetch(`${base}/alerts`, { headers: { Authorization: `Bearer ${token}` } })
    console.log('Alerts status:', alertsRes.status)
    try {
      const alerts = await alertsRes.json()
      console.log('Recent alerts (up to 5):', Array.isArray(alerts) ? alerts.slice(0, 5) : alerts)
    } catch (err) {
      console.error('Failed to parse alerts response', err?.message || err)
    }
  } catch (err) {
    console.error('Test script error:', err?.message || err)
    process.exitCode = 2
  }
}

run()
