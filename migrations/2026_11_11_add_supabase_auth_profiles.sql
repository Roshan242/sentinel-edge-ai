ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid
  REFERENCES auth.users (id)
  ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_user_id_key
  ON public.users (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

ALTER TABLE public.users
  ALTER COLUMN password DROP NOT NULL;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users FROM anon, authenticated;
