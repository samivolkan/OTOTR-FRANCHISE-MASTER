[CmdletBinding()]
param(
  [string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-finance-deployment-drift.json'),
  [string]$PerimeterEvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-edge-auth-perimeter.json')
)
$ErrorActionPreference='Stop'
$d=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 20
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'STAGING_DEPLOYMENT_DRIFT'-or$d.productionDataUsed){throw'Invalid staging deployment drift evidence identity.'}
if($d.status-notin@('MATCHED','DRIFT')-or$d.decision-ne'NO_GO'){throw'Invalid staging deployment drift decision.'}
$m=$d.migrationInventory;$f=$d.edgeFunctionInventory
if($m.expectedManifestCount-ne 157-or$m.bundledSourceCount-ne 138-or$m.expectedPostBundleCount-ne 19-or$m.matchedPostBundleCount-lt 0-or$m.matchedPostBundleCount-gt 19){throw'Invalid staging migration inventory.'}
if($f.expectedCount-ne 13-or$f.activeExpectedCount-lt 0-or$f.activeExpectedCount-gt 13){throw'Invalid staging function inventory.'}
$migrationMissing=@($m.missing);$functionMissing=@($f.missing)
if($d.status-eq'MATCHED' -and ($migrationMissing.Count-or$functionMissing.Count-or$m.matchedPostBundleCount-ne 19-or$f.activeExpectedCount-ne 13)){throw'MATCHED deployment contains missing items.'}
if($d.status-eq'DRIFT'){
  if($migrationMissing.Count-ne 0-or$m.matchedPostBundleCount-ne 19-or$m.appliedHostedVersion-ne'20261107052521'){throw'Staging migration remediation is not verified.'}
  if($functionMissing.Count-ne 1-or$functionMissing[0]-ne'finance-outbox-worker'){throw'Unexpected missing staging function.'}
  if($d.runtimeCorrelation.pendingOutboxCount-ne 11-or$d.runtimeCorrelation.attemptedOutboxCount-ne 0){throw'Staging outbox correlation changed; refresh evidence.'}
}
if(-not$d.requiredRemediation-or@($d.requiredRemediation).Count-lt 4){throw'Deployment drift remediation is incomplete.'}
$p=Get-Content -Raw -LiteralPath (Resolve-Path $PerimeterEvidenceFile)|ConvertFrom-Json -Depth 20
if($p.schemaVersion-ne 1-or$p.module-ne'OTOTR_FRANCHISE_FINANCE'-or$p.target-ne'ototr-staging'-or$p.projectRef-ne'bsjkohwbtrfwrqcyhsfz'-or$p.productionDataUsed){throw'Invalid staging Edge auth perimeter evidence identity.'}
$deployments=@($p.deployments)
if($deployments.Count-ne 12-or@($deployments|Where-Object{$_.status-ne'ACTIVE'-or$_.anonymousStatus-ne 401}).Count-ne 0){throw'Every active staging finance function must reject anonymous access.'}
if($p.verification.activeFinanceFunctions-ne 12-or$p.verification.anonymous401Responses-ne 12-or$p.verification.anonymousNon401Responses-ne 0-or@($p.verification.missingExpectedFunctions).Count-ne 1-or$p.verification.missingExpectedFunctions[0]-ne'finance-outbox-worker'){throw'Staging Edge auth perimeter summary is inconsistent.'}
Write-Host "FINANCE STAGING DEPLOYMENT DRIFT: $($d.status)" -ForegroundColor $(if($d.status-eq'MATCHED'){'Green'}else{'Yellow'})
Write-Host "Migrations: $($m.matchedPostBundleCount)/19 post-bundle; functions: $($f.activeExpectedCount)/13; anonymous perimeter: 12/12 denied; preProductionDecision: NO_GO"
