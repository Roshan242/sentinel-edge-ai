-- Create trigger so that when a new user registers, a per-user access logs table is created automatically.
--
-- This uses the same naming convention as 2026_06_16_create_user_access_logs_tables.sql:
--   access_logs_user_<md5(lower(email))>

begin;

-- Disable the automatic per-user access log trigger.
-- User registration should no longer create a dedicated per-user log table.

begin;

drop trigger if exists trg_create_user_access_logs_table on public.users;

-- Optional cleanup: remove the trigger function if it is no longer needed.
drop function if exists public.create_user_access_logs_table_for_email();

commit;

