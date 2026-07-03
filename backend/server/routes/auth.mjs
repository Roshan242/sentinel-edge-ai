import { createHash, randomUUID } from 'node:crypto'
import { logs,nextId,otpCodes,sessions,settings,pendingRegistrations } from '../data/store.mjs'
import { createAccessLog, createAccessLogFromLoginResult } from '../utils/accessLogs.mjs'

import { createUser, findUserByCredentials, findUserByEmail, findUserById, publicUser } from '../data/users.mjs'
import { notifyAdminsForSecurityEvents } from '../security/notify-admins.mjs'

const logLoginFailureForEmail = async (email) => {
  if (!email) return
  try {
    const user = await findUserByEmail(email)
    if (user) {
      await createAccessLogFromLoginResult({ user, success: false })
      // Notify admins about failed login for this user (best-effort)
      try {
        console.log('[auth] failed login for known user, notifying admins:', email)
        await notifyAdminsForSecurityEvents({ events: [{ event_type: 'failed_login_attempts', user_id: user.id, severity: 'warning', description: `Failed login for ${email}` }] })
      } catch (err) { console.error('[auth] notifyAdminsForSecurityEvents error (known user):', err?.message || err) }
    } else {
      await createAccessLog({
        name: 'Unknown User',
        email: String(email),
        action: 'Login Failure',
        status: 'failed',
      })
      // Notify admins about failed login for unknown user (include email)
      try {
        console.log('[auth] failed login for unknown user, notifying admins:', email)
        await notifyAdminsForSecurityEvents({ events: [{ event_type: 'failed_login_attempts', user_id: null, severity: 'warning', description: `Failed login for unknown email ${email}` }] })
      } catch (err) { console.error('[auth] notifyAdminsForSecurityEvents error (unknown user):', err?.message || err) }
    }
  } catch (err) {
    console.error('Failed to write login failure access log for email:', email, err?.message || err)
  }
}

import { getToken, requireAuth } from '../middleware/auth.mjs'
import { readBody, send } from '../utils/http.mjs'
import { sendAlertEmail, sendOtpEmail } from '../utils/email.mjs'

export const buildOtpResponse = ({ otp, otpToken, expiresInSeconds, emailDelivery, nodeEnv = process.env.NODE_ENV || 'development' }) => {
  const response = {
    otpToken,
    expiresIn: expiresInSeconds,
    emailDelivery,
  }

  if (nodeEnv !== 'production') {
    response.debugOtp = otp
  }

  return response
}

export const handleAuthRoutes = async ({ req, res, method, path }) => {
  if (method === 'POST' && path === '/auth/login') {
    const { email, password } = await readBody(req)
    const user = await findUserByCredentials(email, password)
    if (!user) {
      await logLoginFailureForEmail(email)
      return send(res, 401, { message: 'Invalid email or password' })
    }


    // If 2FA is enabled, require OTP verification after password.
    if (settings?.twoFactorEnabled) {
      // Create a one-time OTP request token that frontend passes to verify.
      // We reuse the same endpoint as request-otp so OTP is only created when explicitly requested.
      // For now: force client to call request-otp first.
      return send(res, 200, { requiresOtp: true, message: 'OTP required' })
    }

    const token = randomUUID()
    sessions.set(token, user.id)

    await createAccessLogFromLoginResult({ user, success: true })

    return send(res, 200, { token, user: publicUser(user) })

  }

  if (method === 'POST' && path === '/auth/login/request-otp') {
    const { email } = await readBody(req)

    if (!email) return send(res, 400, { message: 'Email is required' })


    // Ensure user exists
    const user = await findUserByEmail(email)
    if (!user) return send(res, 404, { message: 'User not found' })


    // Simple in-memory rate limiting by email
    // (keeps this dev-only; production should use persistent store + per-IP limits)
    const now = Date.now()
    let lastSentAt = 0
    for (const otp of otpCodes.values()) {
      if (otp.email === email && otp.lastSentAt > lastSentAt) lastSentAt = otp.lastSentAt
    }
    if (now - lastSentAt < 45_000) {
      return send(res, 429, { message: 'OTP requested too frequently. Try again later.' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpToken = randomUUID()
    const expiresInMs = 5 * 60 * 1000
    const expiresAt = now + expiresInMs
    const codeHash = createHash('sha256').update(otp).digest('hex')

    otpCodes.set(otpToken, {
      email,
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    })

    const recipientEmail = email
    const subject = 'Your Sentinel-Edge AI OTP Code'
    const body = `Your one-time password (OTP) is: ${otp}\n\nIt expires in 5 minutes.`

    let emailDelivery = 'sent'
    try {
      const emailResult = await sendAlertEmail({ subject, body }, recipientEmail)
      if (!emailResult?.success) {
        console.warn('[auth][login/request-otp] email delivery failed, using fallback response', {
          to: recipientEmail,
          error: emailResult?.error,
          code: emailResult?.code,
        })
        emailDelivery = 'fallback'
      }
    } catch (err) {
      console.warn('[auth][login/request-otp] email delivery exception, using fallback response', err?.message || err)
      emailDelivery = 'fallback'
    }

    return send(res, 200, buildOtpResponse({
      otp,
      otpToken,
      expiresInSeconds: expiresInMs / 1000,
      emailDelivery,
    }))

  }

  if (method === 'POST' && path === '/auth/login/verify-otp') {

    const { email, otpToken, otp } = await readBody(req)
    if (!email || !otpToken || !otp) return send(res, 400, { message: 'email, otpToken, and otp are required' })

    const record = otpCodes.get(otpToken)
    const logFailedOtpAttempt = async () => {
      try {
        const user = await findUserByEmail(email)
        if (user) {
          await createAccessLogFromLoginResult({ user, success: false })
        }
      } catch {}
    }

    if (!record || record.email !== email) {
      await logFailedOtpAttempt()
      return send(res, 401, { message: 'Invalid OTP' })
    }

    if (Date.now() > record.expiresAt) {
      otpCodes.delete(otpToken)
      await logFailedOtpAttempt()
      return send(res, 401, { message: 'OTP expired' })
    }

    const maxAttempts = 5
    if (record.attempts >= maxAttempts) {
      otpCodes.delete(otpToken)
      await logFailedOtpAttempt()
      return send(res, 401, { message: 'OTP attempts exceeded' })
    }

    const nextAttempts = record.attempts + 1
    const codeHash = createHash('sha256').update(String(otp)).digest('hex')

    if (codeHash !== record.codeHash) {
      record.attempts = nextAttempts
      otpCodes.set(otpToken, record)
      await logFailedOtpAttempt()
      return send(res, 401, { message: 'Invalid OTP' })
    }

    // OTP valid -> create session
    const user = await findUserByEmail(email)
    if (!user) return send(res, 404, { message: 'User not found' })

    otpCodes.delete(otpToken)

    const token = randomUUID()
    sessions.set(token, user.id)

    await createAccessLogFromLoginResult({ user, success: true })

    return send(res, 200, { token, user: publicUser(user) })

  }


  if (method === 'POST' && path === '/auth/register') {
    console.log("REGISTER API CALLED");
    const body = await readBody(req)

    if (!body?.name || !body?.email || !body?.password) {
      return send(res, 400, { message: 'Name, email, and password are required' })
    }

    if (await findUserByEmail(body.email)) {
      return send(res, 409, { message: 'Email already registered' })
    }



    // Save pending registration.
    pendingRegistrations.set(body.email, {
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || 'user',
    })




    // Generate OTP and store it (dev-only, in-memory).
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const otpToken = randomUUID()
    const expiresInMs = 5 * 60 * 1000
    const now = Date.now()
    const expiresAt = now + expiresInMs
    const codeHash = createHash('sha256').update(otp).digest('hex')

    otpCodes.set(otpToken, {
      email: body.email,
      codeHash,
      expiresAt,
      attempts: 0,
      lastSentAt: now,
    })

    const recipientEmail = body.email
    const subject = 'Your Sentinel-Edge AI OTP Code'
    const emailBody = `Your one-time password (OTP) is: ${otp}\n\nIt expires in 5 minutes.`

    let emailDelivery = 'sent'

try {
  await sendOtpEmail(recipientEmail, otp)
  console.log("✅ OTP EMAIL SENT SUCCESSFULLY")
} catch (err) {
  console.error("❌ FULL SMTP ERROR:", err)
  console.error("❌ MESSAGE:", err?.message)
  console.error("❌ CODE:", err?.code)
  console.error("❌ COMMAND:", err?.command)
  console.error("❌ STACK:", err?.stack)

  emailDelivery = 'fallback'
}

    return send(res, 200, {
      otpToken,
      email: body.email,
      expiresIn: expiresInMs / 1000,
      emailDelivery,
      ...(process.env.NODE_ENV !== 'production' ? { debugOtp: otp } : {}),
    })
  }

  if (method === 'POST' && path === '/auth/register/verify-otp') {
    const { email, otpToken, otp } = await readBody(req)

    if (!email || !otpToken || !otp) {

      return send(res, 400, { message: 'email, otpToken, and otp are required' })
    }


    const record = otpCodes.get(otpToken)
    if (!record || record.email !== email) {
      return send(res, 401, { message: 'Invalid OTP' })
    }

    if (Date.now() > record.expiresAt) {
      otpCodes.delete(otpToken)
      return send(res, 401, { message: 'OTP expired' })
    }

    const maxAttempts = 5
    if (record.attempts >= maxAttempts) {
      otpCodes.delete(otpToken)
      return send(res, 401, { message: 'OTP attempts exceeded' })
    }

    const nextAttempts = record.attempts + 1
    const codeHash = createHash('sha256').update(String(otp)).digest('hex')

    if (codeHash !== record.codeHash) {
      record.attempts = nextAttempts
      otpCodes.set(otpToken, record)
      return send(res, 401, { message: 'Invalid OTP' })
    }

    const pendingUser = pendingRegistrations.get(email)


    if (!pendingUser) {
      return send(res, 404, { message: 'Pending registration not found' })
    }

    try {
      const existingUser = await findUserByEmail(email)

      if (existingUser) {
        pendingRegistrations.delete(email)
        otpCodes.delete(otpToken)
        return send(res, 409, { message: 'Email already registered' })
      }

      const user = await createUser(pendingUser)

      pendingRegistrations.delete(email)
      otpCodes.delete(otpToken)

      const token = randomUUID()
      sessions.set(token, user.id)

      const { createAccessLog } = await import('../utils/accessLogs.mjs')
      await createAccessLog({
        userId: user.id,
        name: user.name,
        email: user.email,
        action: 'User Registration',
        status: 'success',
        timestamp: new Date().toISOString(),
      })


      return send(res, 200, {

        token,
        user: publicUser(user),
      })

    } catch (err) {
      console.error('REGISTER VERIFY ERROR:', err)
      return send(res, 500, {
        message: err?.message || 'Register verify failed',
        stack: err?.stack,
      })
    }

  }


  if (method === 'POST' && path === '/auth/logout') {
    const token = getToken(req)
    if (token) {
      const userId = sessions.get(token)
      // Record logout only for real users.
      if (userId) {
        try {
          const { createAccessLog } = await import('../utils/accessLogs.mjs')
          const user = await findUserById(userId)
          if (user) {
            await createAccessLog({
              userId: user.id,
              name: user.name,
              email: user.email,
              action: 'Logout Success',
              status: 'success',
              timestamp: new Date().toISOString(),
            })
          }
        } catch {}
      }

      sessions.delete(token)
    }
    return send(res, 200, { ok: true })
  }


  if (method === 'GET' && path === '/auth/me') {
    return send(res, 200, { user: publicUser(await requireAuth(req)) })
  }

  return false
}

