[CmdletBinding()]
param([string]$ManifestFile = (Join-Path $PSScriptRoot '..\docs\finance\staging-deployment-manifest.json'))
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifest = Get-Content -Raw -LiteralPath (Resolve-Path $ManifestFile) | ConvertFrom-Json -Depth 30
if ($manifest.schemaVersion -ne 1 -or $manifest.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $manifest.target -ne 'STAGING_CANDIDATE') { throw 'Invalid staging deployment manifest identity.' }
if ($manifest.stagingApplied -or $manifest.productionApplied -or $manifest.productionDataAllowed) { throw 'Unverified deployment state or production data is forbidden.' }

function Get-PortableHash([string]$Path) {
  $content = [IO.File]::ReadAllText($Path).Replace("`r`n", "`n")
  [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.UTF8Encoding]::new($false).GetBytes($content))).ToLowerInvariant()
}
function Get-PackageHash([string]$Directory, [object[]]$Files) {
  $lines = foreach ($file in $Files) {
    $path = Join-Path $Directory $file
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Function source missing: $path" }
    "${file}:$(Get-PortableHash $path)"
  }
  $joined = $lines -join "`n"
  [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.UTF8Encoding]::new($false).GetBytes($joined))).ToLowerInvariant()
}

$migrationPath = [IO.Path]::GetFullPath((Join-Path $root $manifest.migrationManifest.path))
if (-not $migrationPath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or (Get-PortableHash $migrationPath) -ne $manifest.migrationManifest.sha256) { throw 'Migration manifest hash mismatch.' }
$expected = @('finance-read','finance-command','finance-customer-revenue-worker','finance-payment-ingestion-worker','finance-refund-worker','finance-service-usage-worker','finance-invoice-callback-worker','finance-accounting-export-worker','finance-branch-access','finance-payment-callback-worker','finance-payment-checkout')
$names = @($manifest.functions | ForEach-Object name)
if ($names.Count -ne 11 -or @($names | Sort-Object -Unique).Count -ne 11 -or @($expected | Where-Object { $_ -notin $names }).Count) { throw 'Finance function deployment inventory is incomplete.' }
$config = Get-Content -Raw -LiteralPath (Join-Path $root 'supabase\config.toml')
$apiSection = [regex]::Match($config, '(?ms)^\[api\]\s*\r?\n(?<body>.*?)(?=^\[|\z)').Groups['body'].Value
$schemaList = [regex]::Match($apiSection, '(?m)^schemas\s*=\s*(\[[^\r\n]*\])').Groups[1].Value
$schemas = @($schemaList | ConvertFrom-Json)
if (($manifest.dataApiSchemaPolicy.required -join ',') -ne 'finance_api' -or
    ($manifest.dataApiSchemaPolicy.forbidden -join ',') -ne 'finance,finance_private' -or
    'finance_api' -notin $schemas -or 'finance' -in $schemas -or 'finance_private' -in $schemas) {
  throw 'Finance Data API schema policy does not match local API configuration.'
}
foreach ($function in $manifest.functions) {
  if ($function.packageSha256 -notmatch '^[a-f0-9]{64}$' -or (Get-PackageHash (Join-Path $root "supabase\functions\$($function.name)") @($function.files)) -ne $function.packageSha256) { throw "Function package hash mismatch: $($function.name)" }
  if (-not $function.requiredSecretNames -or @($function.requiredSecretNames | Where-Object { $_ -notmatch '^[A-Z][A-Z0-9_]+$' }).Count) { throw "Invalid secret name inventory: $($function.name)" }
  $section = [regex]::Escape("[functions.$($function.name)]")
  $jwt = if ($function.verifyJwt) { 'true' } else { 'false' }
  if ($config -notmatch "(?ms)^$section\s*.*?^verify_jwt\s*=\s*$jwt\s*$") { throw "verify_jwt configuration mismatch: $($function.name)" }
}
$serialized = $manifest | ConvertTo-Json -Depth 30
if ($serialized -match 'sb_secret_|eyJ[A-Za-z0-9_-]{20,}|Bearer\s+\S+|https://[a-z0-9-]+\.supabase\.co') { throw 'Deployment manifest contains a secret value or concrete project endpoint.' }
if (@($manifest.deploymentEvidenceRequired).Count -ne 9 -or 'dataApiSchemaEvidence' -notin $manifest.deploymentEvidenceRequired) { throw 'Staging deployment evidence contract is incomplete.' }
Write-Host 'FINANCE STAGING DEPLOYMENT MANIFEST: PASSED' -ForegroundColor Green
Write-Host '138 migrations; 11 immutable function packages; JWT policy and secret-name-only inventory verified; stagingApplied: false.'
