[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-finance-deployment-drift.json'))
$ErrorActionPreference='Stop'
$d=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 20
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'STAGING_DEPLOYMENT_DRIFT'-or$d.productionDataUsed){throw'Invalid staging deployment drift evidence identity.'}
if($d.status-notin@('MATCHED','DRIFT')-or$d.decision-ne'NO_GO'){throw'Invalid staging deployment drift decision.'}
$m=$d.migrationInventory;$f=$d.edgeFunctionInventory
if($m.expectedManifestCount-ne 153-or$m.bundledSourceCount-ne 138-or$m.expectedPostBundleCount-ne 15-or$m.matchedPostBundleCount-lt 0-or$m.matchedPostBundleCount-gt 15){throw'Invalid staging migration inventory.'}
if($f.expectedCount-ne 13-or$f.activeExpectedCount-lt 0-or$f.activeExpectedCount-gt 13){throw'Invalid staging function inventory.'}
$migrationMissing=@($m.missing);$functionMissing=@($f.missing)
if($d.status-eq'MATCHED' -and ($migrationMissing.Count-or$functionMissing.Count-or$m.matchedPostBundleCount-ne 15-or$f.activeExpectedCount-ne 13)){throw'MATCHED deployment contains missing items.'}
if($d.status-eq'DRIFT'){
  if($migrationMissing.Count-ne 0-or$m.matchedPostBundleCount-ne 15-or$m.appliedHostedVersion-ne'20261107031541'){throw'Staging migration remediation is not verified.'}
  if($functionMissing.Count-ne 1-or$functionMissing[0]-ne'finance-outbox-worker'){throw'Unexpected missing staging function.'}
  if($d.runtimeCorrelation.pendingOutboxCount-ne 11-or$d.runtimeCorrelation.attemptedOutboxCount-ne 0){throw'Staging outbox correlation changed; refresh evidence.'}
}
if(-not$d.requiredRemediation-or@($d.requiredRemediation).Count-lt 4){throw'Deployment drift remediation is incomplete.'}
Write-Host "FINANCE STAGING DEPLOYMENT DRIFT: $($d.status)" -ForegroundColor $(if($d.status-eq'MATCHED'){'Green'}else{'Yellow'})
Write-Host "Migrations: $($m.matchedPostBundleCount)/15 post-bundle; functions: $($f.activeExpectedCount)/13; preProductionDecision: NO_GO"
