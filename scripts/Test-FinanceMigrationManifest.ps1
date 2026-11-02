[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$supabaseRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase'))
$migrationRoot = Join-Path $supabaseRoot 'migrations'
$manifestPath = Join-Path $supabaseRoot 'finance-migration-promotion.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json -Depth 10

if ($manifest.manifestId -ne 'OTOTR-FINANCE-LOCAL-MIGRATION-PROMOTION-V1') {
  throw 'Unexpected finance migration manifest id.'
}
if ($manifest.applyTarget -ne 'LOCAL_ONLY' -or $manifest.stagingApplied -or $manifest.productionApplied) {
  throw 'Finance migration manifest has an unsafe apply target or promotion state.'
}
if ($manifest.migrationCount -ne 69 -or @($manifest.migrations).Count -ne 69) {
  throw 'Finance migration manifest must contain exactly 69 migrations.'
}

$failures = [System.Collections.Generic.List[string]]::new()
foreach ($entry in $manifest.migrations) {
  $path = Join-Path $migrationRoot $entry.migration
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    $failures.Add("Missing migration: $($entry.migration)")
    continue
  }
  $actualHash = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash
  if ($actualHash -ne $entry.migrationSha256) {
    $failures.Add("Hash mismatch: $($entry.migration)")
  }
}

$ordered = @($manifest.migrations | Sort-Object { [long]$_.version })
if ($ordered[0].kind -ne 'SCHEMA') {
  $failures.Add('Migration order must start with SCHEMA.')
}
if (@($ordered | Where-Object kind -eq 'RPC').Count -ne 59) {
  $failures.Add('Migration order must contain exactly 59 RPC entries.')
}
if (@($ordered | Where-Object kind -eq 'SECURITY').Count -ne 9) {
  $failures.Add('Migration order must contain exactly 9 SECURITY entries.')
}

if ($failures.Count -gt 0) {
  Write-Host 'FINANCE MIGRATION MANIFEST: FAILED' -ForegroundColor Red
  $failures | ForEach-Object { Write-Host "- $_" }
  exit 1
}

Write-Host 'FINANCE MIGRATION MANIFEST: PASSED' -ForegroundColor Green
Write-Host 'Migrations: 69; schema: 1; RPC: 59; security: 9; target: LOCAL_ONLY'
