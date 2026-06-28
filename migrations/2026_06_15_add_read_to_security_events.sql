begin;

alter table if exists public.security_events
  add column if not exists read boolean not null default false;

commit;