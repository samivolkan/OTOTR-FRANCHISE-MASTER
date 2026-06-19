-- Dealer portal live intake stores non-critical form snapshots on the vehicle
-- row, and the live list query can read customer metadata when present.
alter table public.customers
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.vehicles
  add column if not exists metadata jsonb not null default '{}'::jsonb;
