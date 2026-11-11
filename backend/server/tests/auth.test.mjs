import test from 'node:test'
import assert from 'node:assert/strict'
process.env.SUPABASE_URL = 'https://auth-test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.SUPABASE_USERS_TABLE = 'users'
const { getToken } = await import('../middleware/auth.mjs')

test('getToken extracts a Supabase bearer token', () => {
  assert.equal(getToken({ headers: { authorization: 'Bearer access-token' } }), 'access-token')
})

test('getToken rejects missing or non-bearer authorization headers', () => {
  assert.equal(getToken({ headers: {} }), null)
  assert.equal(getToken({ headers: { authorization: 'Basic credentials' } }), null)
  assert.equal(getToken({}), null)
})

test('new Supabase identities receive a regular profile regardless of user metadata', async (t) => {
  const previousFetch = globalThis.fetch

  const profile = {
    id: 12,
    auth_user_id: 'auth-user-id',
    name: 'Test Admin Metadata',
    email: 'auth-user@example.com',
    role: 'user',
    status: 'registered',
    registered_date: '2026-11-11',
  }
  let createdProfile

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input)
    if (url.endsWith('/auth/v1/user')) {
      return Response.json({
        id: 'auth-user-id',
        email: 'auth-user@example.com',
        email_confirmed_at: '2026-11-11T00:00:00.000Z',
        user_metadata: { name: 'Test Admin Metadata', role: 'admin' },
      })
    }
    if (url.includes('/rest/v1/users') && init.method === 'POST') {
      createdProfile = JSON.parse(init.body)
      return Response.json([profile], { status: 201 })
    }
    if (url.includes('/rest/v1/users')) return Response.json([])
    throw new Error(`Unexpected request: ${url}`)
  }

  t.after(() => {
    globalThis.fetch = previousFetch
  })

  const { getSessionUser } = await import('../middleware/auth.mjs')
  const user = await getSessionUser({ headers: { authorization: 'Bearer test-access-token' } })
  assert.equal(user.role, 'user')
  assert.equal(user.id, 12)
  assert.equal(Object.hasOwn(createdProfile, 'password'), false)
})

test('a verified email cannot automatically claim an unlinked administrator profile', async (t) => {
  const previousFetch = globalThis.fetch
  globalThis.fetch = async (input) => {
    const url = String(input)
    if (url.endsWith('/auth/v1/user')) {
      return Response.json({
        id: 'auth-user-id',
        email: 'owner@example.com',
        email_confirmed_at: '2026-11-11T00:00:00.000Z',
      })
    }
    if (url.includes('/rest/v1/users') && url.includes('auth_user_id')) return Response.json([])
    if (url.includes('/rest/v1/users')) {
      return Response.json([{
        id: 3,
        auth_user_id: null,
        name: 'Owner',
        email: 'owner@example.com',
        role: 'admin',
        status: 'registered',
      }])
    }
    throw new Error(`Unexpected request: ${url}`)
  }
  t.after(() => { globalThis.fetch = previousFetch })

  const { getSessionUser } = await import('../middleware/auth.mjs')
  await assert.rejects(
    getSessionUser({ headers: { authorization: 'Bearer test-access-token' } }),
    (error) => error.statusCode === 403 && /must be linked/.test(error.message),
  )
})
