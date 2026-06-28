TODO/idea: Trigger email alert to registered admin when too many failed logins occur.

Current code situation:
- server/security/detect.mjs already emits event_type='failed_login_attempts' when failures >= threshold per user within windowMinutes.
- server/security/scheduler.mjs persists detected security events to Supabase security_events.
- server/routes/security.mjs exposes anomaly detection endpoints but does not notify admin.
- server/routes/alerts.mjs currently returns false (not implemented).
- server/routes/admin.mjs can create alerts (and email admin) via POST /admin/alerts.

Desired behavior:
- When scheduler detects a 'failed_login_attempts' event, create an alert record in `alerts` table (or call /admin/alerts internally), and email it to admin user id/email.
- Prefer using existing admin email logic in server/routes/admin.mjs and/or server/utils/email.mjs.

Implementation approach (planned):
1) Add a new helper in server/security/scheduler.mjs or new file server/security/notify.mjs:
   - For each detected event requiring notification, find admin recipients (e.g., users where role='admin' and status='registered'/'active').
   - Create alert row(s) in alertsTable.
   - SendAlertEmail(subject/body, recipientEmail).
   - Deduplicate: use fingerprint to avoid spamming (scheduler already dedups by lastRunFingerprint).
2) Ensure scheduler uses settings.emailAlerts / suspiciousActivityAlerts.
3) Read thresholds from env or from detectSecurityEvents defaults.

Risk:
- Need a reliable way to fetch admin emails in fallbackMode.
- Ensure scheduler never crashes.

