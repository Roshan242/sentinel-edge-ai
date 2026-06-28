-- Create security_events table for intrusion/anomaly detection.
--
-- Constraints:
-- - Do not modify existing tables.
-- - This migration only adds a new table.

begin;

create table if not exists public.security_events (
  id bigserial primary key,
  user_id bigint,
  event_type text not null,
  severity text not null,
  anomaly_score double precision not null default 0,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- Optional index for fast admin queries
create index if not exists security_events_created_at_idx
  on public.security_events (created_at desc);

commit;

