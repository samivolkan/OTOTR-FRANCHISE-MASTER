[CmdletBinding()]
param(
  [string]$AuditFile = (Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-finance-erp-demo-v6-runtime-audit.json')
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$audit = Get-Content -Raw -LiteralPath (Resolve-Path $AuditFile) | ConvertFrom-Json -Depth 20

if ($audit.schemaVersion -ne 1 -or $audit.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $audit.target -ne 'STAGING') { throw 'Invalid ERP demo runtime audit identity.' }
if ($audit.environment -ne 'ototr-staging' -or $audit.projectRef -ne 'bsjkohwbtrfwrqcyhsfz' -or $audit.projectStatus -ne 'ACTIVE_HEALTHY') { throw 'ERP demo runtime audit does not identify the active staging project.' }
[void][DateTimeOffset]::Parse($audit.checkedAtUtc, [Globalization.CultureInfo]::InvariantCulture)

$function = $audit.function
if ($function.name -ne 'finance-erp-demo' -or $function.version -ne 6 -or $function.status -ne 'ACTIVE' -or -not $function.verifyJwt) { throw 'ERP demo v6 deployment metadata is invalid.' }
if ($function.deploymentPackageSha256 -notmatch '^[a-f0-9]{64}$') { throw 'ERP demo deployment package hash is invalid.' }

$deploymentEvidence = Get-Content -Raw -LiteralPath (Join-Path $root 'docs\finance\evidence\2026-11-07-staging-rule-exception-regression.json') | ConvertFrom-Json -Depth 20
if ($deploymentEvidence.erpDemoBundle.version -ne $function.version -or $deploymentEvidence.erpDemoBundle.deploymentPackageSha256 -ne $function.deploymentPackageSha256) { throw 'ERP demo runtime audit does not match immutable deployment evidence.' }

$runtime = $audit.runtimeWindow
if ($runtime.lookbackHours -ne 24 -or $runtime.version6RequestCount -lt 0 -or $runtime.version6RuntimeEventCount -lt 0) { throw 'ERP demo runtime observation window is invalid.' }
if ($audit.interpretation.runtimeInvocationVerified) {
  if (($runtime.version6RequestCount + $runtime.version6RuntimeEventCount) -lt 1) { throw 'Runtime invocation is claimed without a version 6 observation.' }
} elseif ($runtime.version6RequestCount -ne 0 -or $runtime.version6RuntimeEventCount -ne 0 -or $audit.interpretation.erpEndToEndScenarioVerified -or $audit.interpretation.scopeB2RoyaltyBalanceVerified) {
  throw 'Uninvoked ERP demo cannot claim end-to-end or balance verification.'
}
if (-not $audit.interpretation.deploymentVerified -or $audit.preProductionDecision -ne 'NO_GO' -or $audit.security.productionDataUsed -or $audit.security.secretValuesRecorded) { throw 'ERP demo runtime audit must stay fail-closed and secret-free.' }

$gateDocument = Get-Content -Raw -LiteralPath (Join-Path $root 'docs\finance\uat-preproduction-gates.json') | ConvertFrom-Json -Depth 20
$gate = $gateDocument.gates | Where-Object id -eq 'FIN-G05'
if ($gate.status -ne 'PENDING' -or $gate.blockingReason -notmatch 'SCOPE-B1' -or $gate.blockingReason -notmatch 'SCOPE-B2' -or $gate.blockingReason -notmatch '96 TL' -or $gate.blockingReason -notmatch 'PROCESSING') { throw 'FIN-G05 does not reflect the current ERP demo runtime and database blockers.' }

$serialized = $audit | ConvertTo-Json -Depth 20
if ($serialized -match '(?i)service.role.key|worker.password|bearer\s+|sb_secret_|eyJ[A-Za-z0-9_-]{20,}') { throw 'ERP demo runtime audit contains a secret-like value.' }

Write-Host 'FINANCE STAGING ERP DEMO RUNTIME AUDIT: PASSED' -ForegroundColor Green
Write-Host 'Deployment v6 is active and JWT-protected; hosted runtime invocation remains unverified; FIN-G05: PENDING; preProductionDecision: NO_GO.'
