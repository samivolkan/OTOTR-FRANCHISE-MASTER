[CmdletBinding()]
param(
  [string]$AuditFile = (Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-finance-erp-demo-v7-runtime-audit.json')
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$audit = Get-Content -Raw -LiteralPath (Resolve-Path $AuditFile) | ConvertFrom-Json -Depth 20

if ($audit.schemaVersion -ne 1 -or $audit.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $audit.target -ne 'STAGING') { throw 'Invalid ERP demo runtime audit identity.' }
if ($audit.environment -ne 'ototr-staging' -or $audit.projectRef -ne 'bsjkohwbtrfwrqcyhsfz' -or $audit.projectStatus -ne 'ACTIVE_HEALTHY') { throw 'ERP demo runtime audit does not identify the active staging project.' }
[void][DateTimeOffset]::Parse($audit.checkedAtUtc, [Globalization.CultureInfo]::InvariantCulture)

$function = $audit.function
if ($audit.observationSource -ne 'SUPABASE_MANAGEMENT_API_AND_UNIFIED_LOGS') { throw 'ERP demo runtime audit source is invalid.' }
if ($function.name -ne 'finance-erp-demo' -or $function.version -ne 7 -or $function.status -ne 'ACTIVE' -or -not $function.verifyJwt) { throw 'ERP demo v7 deployment metadata is invalid.' }
if ($function.hostedBundleSha256 -notmatch '^[a-f0-9]{64}$' -or $function.repositoryManifestPackageSha256 -notmatch '^[a-f0-9]{64}$' -or $function.hashSchemeComparable -ne $false) { throw 'ERP demo hosted/repository package hash boundary is invalid.' }

$databaseEvidence = Get-Content -Raw -LiteralPath (Join-Path $root 'docs\finance\evidence\2026-11-07-staging-royalty-demo-database-audit.json') | ConvertFrom-Json -Depth 20
$manifest = Get-Content -Raw -LiteralPath (Join-Path $root 'docs\finance\staging-deployment-manifest.json') | ConvertFrom-Json -Depth 20
$manifestFunction = $manifest.functions | Where-Object name -eq 'finance-erp-demo'
if ($databaseEvidence.stagingDeployment.erpDemo.version -ne $function.version -or $databaseEvidence.stagingDeployment.erpDemo.status -ne $function.status -or $databaseEvidence.stagingDeployment.erpDemo.verifyJwt -ne $function.verifyJwt) { throw 'ERP demo runtime audit does not match the current database audit deployment record.' }
if ($manifestFunction.packageSha256 -ne $function.repositoryManifestPackageSha256) { throw 'ERP demo repository candidate hash does not match the deployment manifest.' }

$runtime = $audit.runtimeWindow
if ($runtime.lookbackHours -ne 24 -or $runtime.version7RequestCount -ne 1 -or $runtime.version7UnauthorizedRequestCount -ne 1 -or $runtime.version7AcceptedRequestCount -ne 0 -or $runtime.version7RuntimeEventCount -ne 0 -or $runtime.latestObservedVersion -ne 7 -or (@($runtime.observedStatusCodes) -join ',') -ne '401') { throw 'ERP demo v7 runtime observation window is invalid.' }
[void][DateTimeOffset]::Parse($runtime.latestObservedAtUtc, [Globalization.CultureInfo]::InvariantCulture)
if (-not $audit.interpretation.deploymentVerified -or -not $audit.interpretation.unauthenticatedPerimeterVerified -or $audit.interpretation.authenticatedRuntimeInvocationVerified -or $audit.interpretation.erpEndToEndScenarioVerified -or $audit.interpretation.scopeB2RoyaltyBalanceVerified) { throw 'ERP demo runtime interpretation overstates the observed v7 request.' }
if ($audit.preProductionDecision -ne 'NO_GO' -or $audit.security.productionDataUsed -or $audit.security.secretValuesRecorded -or $audit.security.requestBodiesRecorded -or $audit.security.authorizationValuesRecorded) { throw 'ERP demo runtime audit must stay fail-closed and secret-free.' }

$gateDocument = Get-Content -Raw -LiteralPath (Join-Path $root 'docs\finance\uat-preproduction-gates.json') | ConvertFrom-Json -Depth 20
$gate = $gateDocument.gates | Where-Object id -eq 'FIN-G05'
if ($gate.status -ne 'PENDING' -or $gate.blockingReason -notmatch 'SCOPE-B1' -or $gate.blockingReason -notmatch 'SCOPE-B2' -or $gate.blockingReason -notmatch '96 TL' -or $gate.blockingReason -notmatch 'PROCESSED' -or $gate.blockingReason -notmatch 'v7') { throw 'FIN-G05 does not reflect the current ERP demo runtime and database blockers.' }

$serialized = $audit | ConvertTo-Json -Depth 20
if ($serialized -match '(?i)service.role.key|worker.password|bearer\s+|sb_secret_|eyJ[A-Za-z0-9_-]{20,}') { throw 'ERP demo runtime audit contains a secret-like value.' }

Write-Host 'FINANCE STAGING ERP DEMO RUNTIME AUDIT: PASSED' -ForegroundColor Green
Write-Host 'Deployment v7 is active and JWT-protected; one 401 perimeter request observed; authenticated runtime invocation remains unverified; FIN-G05: PENDING; preProductionDecision: NO_GO.'
