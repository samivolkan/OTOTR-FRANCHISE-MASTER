[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-local-finance-performance-baseline.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 20
if($e.schemaVersion-ne 1-or$e.module-ne'OTOTR_FRANCHISE_FINANCE'-or$e.target-ne'LOCAL_BASELINE_ONLY'-or$e.environment-ne'LOCAL_DOCKER_SYNTHETIC'){throw'Invalid local performance baseline identity.'}
if($e.productionDataUsed-or$e.stagingTargetApproved-or$e.preProductionDecision-ne'NO_GO'){throw'Local performance evidence must not imply staging approval.'}
$w=$e.workload
if($w.id-ne'LOCAL-PERF-FIN-01'-or$w.datasetRows-ne 2000-or$w.pageSize-ne 200-or[decimal]$w.observedPageMs-lt 0-or[decimal]$w.observedPageMs-ge[decimal]$w.localRegressionThresholdMs-or$w.localRegressionThresholdMs-ne 1500-or-not$w.transactionRolledBack-or$w.residueCount-ne 0){throw'Local performance baseline is invalid.'}
$required=@('Not a hosted staging measurement','No approved concurrency, request-volume, P95, P99, error-rate or timeout budget','Does not prove Edge Function, network, Auth or provider latency','Does not close FIN-G09')
if((@($e.limitations)-join'|')-ne($required-join'|')){throw'Local performance limitations must remain explicit.'}
Write-Host 'FINANCE LOCAL PERFORMANCE BASELINE: PASSED' -ForegroundColor Green
Write-Host "2,000 rows; 200-row page: $($w.observedPageMs) ms; local threshold: $($w.localRegressionThresholdMs) ms; stagingApproved: false."
