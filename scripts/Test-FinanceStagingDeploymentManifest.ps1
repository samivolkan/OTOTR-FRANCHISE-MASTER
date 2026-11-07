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
function Get-RelativeImportGraph([string]$EntryPoint, [string]$PackageDirectory) {
  $seen = @{}
  function Visit-Import([string]$SourcePath) {
    $source = [IO.Path]::GetFullPath($SourcePath)
    if (-not $source.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { throw "Function import escapes repository: $source" }
    if ($seen.ContainsKey($source)) { return }
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Function dependency missing: $source" }
    $seen[$source] = $true
    $content = [IO.File]::ReadAllText($source)
    if ($content -match 'target-candidate') { throw "External target-candidate dependency is forbidden: $source" }
    $pattern = '(?m)^(?:import|export)\s+(?:[^''"]+?\s+from\s+)?[''"](?<specifier>\.[^''"]+)[''"]'
    foreach ($match in [regex]::Matches($content, $pattern)) {
      $dependency = [IO.Path]::GetFullPath((Join-Path (Split-Path -Parent $source) $match.Groups['specifier'].Value))
      if (-not [IO.Path]::HasExtension($dependency)) { $dependency += '.mjs' }
      Visit-Import $dependency
    }
  }
  Visit-Import $EntryPoint
  @($seen.Keys | ForEach-Object { [IO.Path]::GetRelativePath($PackageDirectory, $_).Replace('\', '/') } | Sort-Object)
}

$migrationPath = [IO.Path]::GetFullPath((Join-Path $root $manifest.migrationManifest.path))
if (-not $migrationPath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or (Get-PortableHash $migrationPath) -ne $manifest.migrationManifest.sha256) { throw 'Migration manifest hash mismatch.' }
$expected = @('finance-read','finance-command','finance-customer-revenue-worker','finance-payment-ingestion-worker','finance-refund-worker','finance-outbox-worker','finance-service-usage-worker','finance-invoice-callback-worker','finance-accounting-export-worker','finance-branch-access','finance-payment-callback-worker','finance-payment-checkout','finance-erp-demo')
$names = @($manifest.functions | ForEach-Object name)
if ($names.Count -ne 13 -or @($names | Sort-Object -Unique).Count -ne 13 -or @($expected | Where-Object { $_ -notin $names }).Count) { throw 'Finance function deployment inventory is incomplete.' }
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
$erpDemo = @($manifest.functions | Where-Object name -eq 'finance-erp-demo')
$erpDemoDirectory = Join-Path $root 'supabase\functions\finance-erp-demo'
$erpDemoGraph = @(Get-RelativeImportGraph (Join-Path $erpDemoDirectory 'index.ts') $erpDemoDirectory)
$erpDemoFiles = @($erpDemo.files | Sort-Object)
if ($erpDemoGraph.Count -ne 26 -or (Compare-Object $erpDemoGraph $erpDemoFiles)) { throw 'finance-erp-demo manifest does not match its complete repository-local dependency graph.' }
$financeCommand = @($manifest.functions | Where-Object name -eq 'finance-command')
$financeCommandDirectory = Join-Path $root 'supabase\functions\finance-command'
$financeCommandGraph = @(Get-RelativeImportGraph (Join-Path $financeCommandDirectory 'index.ts') $financeCommandDirectory)
$financeCommandFiles = @($financeCommand.files | Sort-Object)
if ($financeCommandGraph.Count -ne 5 -or @($financeCommandGraph | Where-Object { $_ -notin $financeCommandFiles }).Count) { throw 'finance-command manifest omits a repository-local runtime dependency.' }
$serialized = $manifest | ConvertTo-Json -Depth 30
if ($serialized -match 'sb_secret_|eyJ[A-Za-z0-9_-]{20,}|Bearer\s+\S+|https://[a-z0-9-]+\.supabase\.co') { throw 'Deployment manifest contains a secret value or concrete project endpoint.' }
if (@($manifest.deploymentEvidenceRequired).Count -ne 9 -or 'dataApiSchemaEvidence' -notin $manifest.deploymentEvidenceRequired) { throw 'Staging deployment evidence contract is incomplete.' }
Write-Host 'FINANCE STAGING DEPLOYMENT MANIFEST: PASSED' -ForegroundColor Green
Write-Host '155 migrations; 13 immutable function packages; finance-command and finance-erp-demo dependency graphs, JWT policy and secret-name-only inventory verified; stagingApplied: false.'
