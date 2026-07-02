import test from 'node:test'
import assert from 'node:assert/strict'
import { buildOtpResponse } from '../routes/auth.mjs'

test('buildOtpResponse includes debug OTP for development fallback', () => {
  const result = buildOtpResponse({
    otp: '123456',
    otpToken: 'otp-token',
    expiresInSeconds: 300,
    emailDelivery: 'fallback',
    nodeEnv: 'development',
  })

  assert.equal(result.debugOtp, '123456')
  assert.equal(result.emailDelivery, 'fallback')
  assert.equal(result.otpToken, 'otp-token')
})

test('buildOtpResponse omits debug OTP in production', () => {
  const result = buildOtpResponse({
    otp: '123456',
    otpToken: 'otp-token',
    expiresInSeconds: 300,
    emailDelivery: 'fallback',
    nodeEnv: 'production',
  })

  assert.equal(result.debugOtp, undefined)
  assert.equal(result.emailDelivery, 'fallback')
})
