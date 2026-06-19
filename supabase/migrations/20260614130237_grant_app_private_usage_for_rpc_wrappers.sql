-- Public RPC wrappers call functions in app_private.
-- Authenticated users still need explicit schema usage before function execute grants can work.
grant usage on schema app_private to authenticated;
