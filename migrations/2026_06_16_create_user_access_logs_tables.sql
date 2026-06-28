-- Create per-user access log tables in Supabase (one table per user)
--
-- IMPORTANT:
-- - This migration will create tables dynamically based on existing users.
-- - Requires a known access log schema.
-- - Runs in Postgres (Supabase).

begin;

-- Create a helper function to sanitize email into a stable table suffix.
-- We'll use md5(email) so table names are deterministic and safe.
create or replace function public.user_access_logs_table_suffix(p_email text)
returns text
language sql
security definer
as $$
  select 'access_logs_user_' || md5(coalesce(lower(p_email), ''));
$$;

-- Create per-user tables
-- Schema matches current access log fields used by the backend/UI.
-- Fields (compatible with server/utils/accessLogs.mjs mapping):
-- - id: bigserial primary key
-- - user_id: bigint (redundant but useful)
-- - name: text
-- - email: text
-- - action: text
-- - status: text
-- - created_at: timestamptz (server sorts by created_at.desc)

-- NOTE about string literals:
-- In some environments, '\n' inside EXECUTE strings can break parsing.
-- So we build the SQL without explicit '\n' escapes.

do $$
declare
  u record;
  tbl text;
begin
  for u in (
    select id, email
    from public.users
    where email is not null
  )
  loop
    tbl := public.user_access_logs_table_suffix(u.email);

    execute format(
      'create table if not exists public.%I ( ' ||
      'id bigserial primary key, ' ||
      'user_id bigint not null, ' ||
      'name text not null, ' ||
      'email text not null, ' ||
      'action text not null, ' ||
      'status text not null, ' ||
      'created_at timestamptz not null default now() ' ||
      ');',
      tbl
    );

    execute format(
      'create index if not exists %I_created_at_idx on public.%I (created_at desc);',
      tbl,
      tbl
    );
  end loop;
end $$;

commit;

