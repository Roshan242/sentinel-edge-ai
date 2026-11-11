# Sentinel Edge Backend

The backend API validates Supabase Auth access tokens and resolves each identity to its application profile in Supabase Postgres.

## Configure Supabase

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `frontend/.env` (see [`frontend/.env.example`](../../frontend/.env.example)).
2. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `SUPABASE_USERS_TABLE=users` to `backend/.env`. The service-role key must remain server-side.
3. Enable email confirmation in Supabase Auth. Set the Site URL and allow redirect URLs for `/auth/callback` and `/reset-password` on local and production origins.
4. Run [`2026_11_11_add_supabase_auth_profiles.sql`](../../migrations/2026_11_11_add_supabase_auth_profiles.sql) in the Supabase SQL editor. It adds the Auth identity link, makes legacy password storage nullable, and blocks direct `anon`/`authenticated` access to the profile table. If `SUPABASE_USERS_TABLE` names a different table, apply the equivalent changes to that table.
5. Link existing administrator profiles to the matching, verified Supabase Auth account before they sign in:

   ```sql
   UPDATE public.users AS profile
   SET auth_user_id = auth_user.id
   FROM auth.users AS auth_user
   WHERE lower(profile.email) = lower(auth_user.email)
     AND profile.role = 'admin'
     AND auth_user.email_confirmed_at IS NOT NULL
     AND profile.auth_user_id IS NULL;
   ```

Public registration always creates a `user` role. For the first administrator, create a confirmed identity in Supabase Auth, then run this as a trusted database administrator (replace the email):

```sql
INSERT INTO public.users (name, email, password, role, status, registered_date, auth_user_id)
SELECT
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email,
  NULL,
  'admin',
  'registered',
  current_date,
  id
FROM auth.users
WHERE lower(email) = lower('admin@example.com')
  AND email_confirmed_at IS NOT NULL
ON CONFLICT (email) DO UPDATE
SET auth_user_id = EXCLUDED.auth_user_id,
    role = 'admin';
```

Never assign roles from signup metadata or a public request.

## Run

```powershell
npm.cmd run backend
```

The API runs at `http://localhost:5000`; Vite proxies `/api/*` to it. `GET /auth/me` returns the verified application profile for the bearer token. Login, signup, email confirmation, password reset, and logout are handled by Supabase Auth in the frontend.

SMTP OAuth credentials are only needed for other backend email notifications. To enable them, add `SMTP_FROM_EMAIL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` to `backend/.env`.

## Main Endpoints

```text
GET  /auth/me
GET  /admin/users
POST /admin/users
PUT  /admin/users/:id
DEL  /admin/users/:id
GET  /admin/alerts
GET  /admin/logs
GET  /admin/settings
PUT  /admin/settings
GET  /cameras
GET  /cameras/:id/feed
GET  /system/health
```
