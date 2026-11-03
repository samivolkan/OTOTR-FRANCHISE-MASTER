[CmdletBinding()]
param(
  [string]$ContainerName = 'supabase_db_ototr-local'
)

$ErrorActionPreference = 'Stop'

$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $docker) {
  $desktopDocker = 'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
  if (-not (Test-Path -LiteralPath $desktopDocker -PathType Leaf)) {
    throw 'Docker CLI not found.'
  }
  $dockerPath = $desktopDocker
} else {
  $dockerPath = $docker.Source
}

$running = & $dockerPath inspect --format '{{.State.Running}}' $ContainerName 2>$null
if ($LASTEXITCODE -ne 0 -or $running -ne 'true') {
  throw "Local Supabase database container is not running: $ContainerName"
}

$sql = @'
select 'migration_count=' || count(*)
  from supabase_migrations.schema_migrations;
select 'finance_migration_count=' || count(*)
  from supabase_migrations.schema_migrations
where version between '20261103010000' and '20261103010080';
select 'finance_tables=' || count(*)
  from information_schema.tables
 where table_schema='finance' and table_type='BASE TABLE';
select 'finance_private_tables=' || count(*)
  from information_schema.tables
 where table_schema='finance_private' and table_type='BASE TABLE';
select 'finance_api_functions=' || count(*)
  from information_schema.routines
 where routine_schema='finance_api';
select 'finance_rls_enabled=' || count(*)
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
 where n.nspname='finance' and c.relkind='r' and c.relrowsecurity;
select 'finance_rls_forced=' || count(*)
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid=c.relnamespace
 where n.nspname='finance' and c.relkind='r' and c.relforcerowsecurity;
select 'raw_client_table_grants=' || count(*)
  from information_schema.role_table_grants
 where table_schema in ('finance','finance_private')
   and grantee in ('anon','authenticated','PUBLIC');
select 'scope_hook_uses_erp_identity=' ||
       (position('public.app_users' in pg_catalog.pg_get_functiondef(
          'finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text)'::regprocedure
        )) > 0)::text;
select 'scope_hook_fail_closed_stub=' ||
       (position('select false' in lower(pg_catalog.pg_get_functiondef(
          'finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text)'::regprocedure
        ))) > 0)::text;
select 'scope_hook_browser_execute=' ||
       (
         pg_catalog.has_function_privilege('anon',
           'finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text)', 'EXECUTE')
         or pg_catalog.has_function_privilege('authenticated',
           'finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text)', 'EXECUTE')
         or pg_catalog.has_function_privilege('public',
           'finance_private.current_actor_can_read_scope(uuid,uuid,uuid,uuid,text)', 'EXECUTE')
       )::text;
select 'refund_trace_uses_scope_bridge=' ||
       (position('getRoyaltyRefundTrace' in pg_catalog.pg_get_functiondef(
          'finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text)'::regprocedure
        )) > 0)::text;
select 'refund_trace_helper_browser_execute=' ||
       (
         pg_catalog.has_function_privilege('anon',
           'finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text)', 'EXECUTE')
         or pg_catalog.has_function_privilege('authenticated',
           'finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text)', 'EXECUTE')
         or pg_catalog.has_function_privilege('public',
           'finance_api.authorize_refund_trace_scope(uuid,uuid,uuid,text)', 'EXECUTE')
       )::text;
'@

$lines = @($sql | & $dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if ($LASTEXITCODE -ne 0) {
  throw 'Finance local replay catalog query failed.'
}

$actual = @{}
foreach ($line in $lines) {
  $parts = $line -split '=', 2
  if ($parts.Count -eq 2) {
    $actual[$parts[0]] = $parts[1]
  }
}

$expected = [ordered]@{
  migration_count = '109'
  finance_migration_count = '81'
  finance_tables = '45'
  finance_private_tables = '2'
  finance_api_functions = '120'
  finance_rls_enabled = '45'
  finance_rls_forced = '45'
  raw_client_table_grants = '0'
  scope_hook_uses_erp_identity = 'true'
  scope_hook_fail_closed_stub = 'false'
  scope_hook_browser_execute = 'false'
  refund_trace_uses_scope_bridge = 'true'
  refund_trace_helper_browser_execute = 'false'
}

$failures = [System.Collections.Generic.List[string]]::new()
foreach ($entry in $expected.GetEnumerator()) {
  if (-not $actual.ContainsKey($entry.Key)) {
    $failures.Add("Missing result: $($entry.Key)")
  } elseif ($actual[$entry.Key] -ne $entry.Value) {
    $failures.Add("$($entry.Key): expected $($entry.Value), actual $($actual[$entry.Key])")
  }
}

if ($failures.Count -gt 0) {
  Write-Host 'FINANCE LOCAL REPLAY: FAILED' -ForegroundColor Red
  $failures | ForEach-Object { Write-Host "- $_" }
  exit 1
}

Write-Host 'FINANCE LOCAL REPLAY: PASSED' -ForegroundColor Green
$expected.GetEnumerator() | ForEach-Object { Write-Host "$($_.Key)=$($_.Value)" }
