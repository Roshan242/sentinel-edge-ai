# TODO

## Email system fix (progress tracking)
- [x] Inspect existing email implementation and call sites.
- [x] Implement production-grade SMTP diagnostics in `backend/server/utils/email.mjs`:
  - [x] `transporter.verify()`
  - [x] step-by-step logging
  - [x] explicit timeouts
  - [x] retries with backoff
- [x] Implement automatic Resend API fallback / migration while keeping `sendAlertEmail(alert, recipientEmail)` signature unchanged.
- [ ] Configure Render env vars (user must set):
  - [ ] `EMAIL_PROVIDER=resend` (recommended)
  - [ ] `RESEND_API_KEY`
  - [ ] `RESEND_FROM` (optional; otherwise uses SMTP_FROM)
 - [ ] Run local smoke test:
  - [ ] `node testEmail.mjs`
- [ ] Verify email delivery from provider logs after deployment.

