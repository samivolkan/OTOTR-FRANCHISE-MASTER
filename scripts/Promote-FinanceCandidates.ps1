[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$CandidateRoot,

  [string]$MigrationRoot = (Join-Path $PSScriptRoot '..\supabase\migrations'),

  [long]$BaseVersion = 20261103010000
)

$ErrorActionPreference = 'Stop'

$candidateRootPath = [System.IO.Path]::GetFullPath($CandidateRoot)
$migrationRootPath = [System.IO.Path]::GetFullPath($MigrationRoot)
$schemaPath = Join-Path $candidateRootPath 'candidate-schema.sql'
$bridgePath = Join-Path $candidateRootPath 'candidate-erp-finance-identity-bridge.sql'
$rpcFiles = @(Get-ChildItem -LiteralPath $candidateRootPath -Filter 'candidate-*-rpc.sql' | Sort-Object Name)

if (-not (Test-Path -LiteralPath $schemaPath -PathType Leaf)) {
  throw "Finance schema candidate not found: $schemaPath"
}
if (-not (Test-Path -LiteralPath $bridgePath -PathType Leaf)) {
  throw "Finance identity bridge candidate not found: $bridgePath"
}
if ($rpcFiles.Count -ne 50) {
  throw "Expected 50 finance RPC candidates, found $($rpcFiles.Count)."
}
if (-not (Test-Path -LiteralPath $migrationRootPath -PathType Container)) {
  throw "Migration root not found: $migrationRootPath"
}

$targets = [System.Collections.Generic.List[object]]::new()
$targets.Add([pscustomobject]@{
  Version = $BaseVersion
  Name = 'finance_schema_foundation'
  Source = $schemaPath
  Kind = 'SCHEMA'
})

for ($index = 0; $index -lt $rpcFiles.Count; $index++) {
  $name = $rpcFiles[$index].BaseName -replace '^candidate-', '' -replace '-rpc$', '' -replace '-', '_'
  $targets.Add([pscustomobject]@{
    Version = $BaseVersion + $index + 1
    Name = "finance_$name"
    Source = $rpcFiles[$index].FullName
    Kind = 'RPC'
  })
}

$targets.Add([pscustomobject]@{
  Version = $BaseVersion + $rpcFiles.Count + 1
  Name = 'finance_erp_identity_bridge'
  Source = $bridgePath
  Kind = 'SECURITY'
})

$existingTargets = @($targets | ForEach-Object {
  Join-Path $migrationRootPath ("{0}_{1}.sql" -f $_.Version, $_.Name)
} | Where-Object { Test-Path -LiteralPath $_ })
if ($existingTargets.Count -gt 0) {
  throw "Refusing to overwrite existing finance migrations: $($existingTargets -join ', ')"
}

$manifest = foreach ($target in $targets) {
  $sourceText = [System.IO.File]::ReadAllText($target.Source)
  $sourceHash = (Get-FileHash -LiteralPath $target.Source -Algorithm SHA256).Hash
  $header = @(
    '-- OTOTR Finance migration promoted from a reviewed candidate.',
    "-- Source: $([System.IO.Path]::GetFileName($target.Source))",
    "-- Source SHA256: $sourceHash",
    '-- Local replay required before any staging promotion.',
    ''
  ) -join "`n"
  $body = $sourceText -replace '(?m)^-- OTOTR FINANCE CANDIDATE DECLARATIVE SCHEMA\r?\n', ''
  $body = $body -replace '(?m)^-- DO NOT APPLY[^\r\n]*\r?\n', ''
  $body = $body -replace '(?m)^-- This is not a Supabase migration[^\r\n]*\r?\n', ''
  $body = $body -replace '(?m)^-- A real migration must be created[^\r\n]*\r?\n', ''
  $body = $body -replace '(?m)^-- Candidate ERP -> finance identity bridge[^\r\n]*\r?\n', ''
  $body = $body -replace '(?m)^-- explicit role-owner approval[^\r\n]*\r?\n', ''
  $destinationName = "{0}_{1}.sql" -f $target.Version, $target.Name
  $destinationPath = Join-Path $migrationRootPath $destinationName
  [System.IO.File]::WriteAllText($destinationPath, $header + $body.Trim() + "`n", [System.Text.UTF8Encoding]::new($false))
  [pscustomobject]@{
    version = [string]$target.Version
    kind = $target.Kind
    source = [System.IO.Path]::GetFileName($target.Source)
    sourceSha256 = $sourceHash
    migration = $destinationName
    migrationSha256 = (Get-FileHash -LiteralPath $destinationPath -Algorithm SHA256).Hash
  }
}

$manifestPath = Join-Path (Split-Path $migrationRootPath -Parent) 'finance-migration-promotion.json'
$manifestDocument = [ordered]@{
  manifestId = 'OTOTR-FINANCE-LOCAL-MIGRATION-PROMOTION-V1'
  generatedAtUtc = [DateTimeOffset]::UtcNow.ToString('o')
  sourceRoot = 'ototr-finans-modulu/database/supabase'
  migrationCount = $manifest.Count
  applyTarget = 'LOCAL_ONLY'
  stagingApplied = $false
  productionApplied = $false
  migrations = @($manifest)
}
[System.IO.File]::WriteAllText(
  $manifestPath,
  ($manifestDocument | ConvertTo-Json -Depth 6) + "`n",
  [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Promoted $($manifest.Count) finance migrations."
Write-Output "Manifest: $manifestPath"
