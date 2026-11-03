[CmdletBinding()]
param(
  [switch]$RequirePassed,
  [string]$EvidenceFile = (Join-Path $PSScriptRoot '..\docs\finance\staging-performance-evidence.json')
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$d = Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile) | ConvertFrom-Json -Depth 30
if ($d.schemaVersion -ne 1 -or $d.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $d.target -ne 'PREPRODUCTION_PERFORMANCE') { throw 'Invalid finance performance evidence identity.' }
if ($d.productionDataUsed -or $d.preProductionDecision -ne 'NO_GO' -or $d.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw 'Finance performance evidence policy is invalid.' }
$names = @('Genel merkez özet ve yönetişim okumaları','Bayi hesap özeti ve ekstre okumaları','Finans komut ve onay yazmaları','Entegrasyon worker timeout retry ve duplicate')
if (@($d.workloads).Count -ne 4) { throw 'Expected four finance performance workloads.' }
for ($i = 0; $i -lt 4; $i++) {
  $w = $d.workloads[$i]; $id = 'PERF-FIN-{0:d2}' -f ($i + 1)
  if ($w.id -ne $id -or $w.name -ne $names[$i] -or $w.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw "Invalid performance workload: $($w.id)" }
  if ($w.status -eq 'PASSED') {
    foreach ($name in @('datasetRows','concurrency','requests','p95Ms','p99Ms','maxErrorRatePct','timeoutBudgetMs')) { if ($null -eq $w.target.$name -or [decimal]$w.target.$name -le 0) { throw "Invalid approved target for ${id}: $name" } }
    foreach ($name in @('datasetRows','concurrency','requests','p50Ms','p95Ms','p99Ms','errorRatePct','maxMs','idempotencyViolations','financialMismatchCount')) { if ($null -eq $w.observed.$name -or [decimal]$w.observed.$name -lt 0) { throw "Invalid observed metric for ${id}: $name" } }
    if ([decimal]$w.observed.datasetRows -lt [decimal]$w.target.datasetRows -or [decimal]$w.observed.concurrency -lt [decimal]$w.target.concurrency -or [decimal]$w.observed.requests -lt [decimal]$w.target.requests) { throw "Performance test volume below approved target: $id" }
    if ([decimal]$w.observed.p95Ms -gt [decimal]$w.target.p95Ms -or [decimal]$w.observed.p99Ms -gt [decimal]$w.target.p99Ms -or [decimal]$w.observed.errorRatePct -gt [decimal]$w.target.maxErrorRatePct) { throw "Performance latency or error target breached: $id" }
    if ([decimal]$w.observed.idempotencyViolations -ne 0 -or [decimal]$w.observed.financialMismatchCount -ne 0 -or $w.observed.timeoutRetryRecovered -ne $true) { throw "Performance resilience invariant failed: $id" }
    if (-not $w.evidence -or @($w.evidence).Count -lt 1) { throw "Performance evidence missing: $id" }
    foreach ($item in $w.evidence) {
      if ([string]::IsNullOrWhiteSpace($item.path) -or $item.path -match '^[A-Za-z]:|^\\|^/') { throw "Performance evidence path must be repository-relative: $id" }
      $path = [IO.Path]::GetFullPath((Join-Path $root $item.path))
      if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf)) { throw "Performance evidence missing: $id" }
      if ((Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256) { throw "Performance evidence hash mismatch: $id" }
    }
  }
}
if ($d.status -eq 'PASSED') {
  foreach ($name in @('environmentId','deployedCommit','startedAtUtc','completedAtUtc','executedByCorporateId','approvedByCorporateId','loadTool','loadToolVersion')) { if ([string]::IsNullOrWhiteSpace($d.run.$name)) { throw "Passed performance run metadata missing: $name" } }
  if ($d.run.deployedCommit -notmatch '^[a-f0-9]{40}$' -or $d.run.executedByCorporateId -eq $d.run.approvedByCorporateId -or @($d.workloads | Where-Object status -ne 'PASSED').Count -gt 0) { throw 'Performance commit, maker-checker or workload state is invalid.' }
  foreach ($name in @('approvedBy','approvedAtUtc','evidencePath','evidenceSha256')) { if ([string]::IsNullOrWhiteSpace($d.targetApproval.$name)) { throw "Target approval missing: $name" } }
  $approvalPath = [IO.Path]::GetFullPath((Join-Path $root $d.targetApproval.evidencePath))
  if (-not $approvalPath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $approvalPath -PathType Leaf) -or (Get-FileHash $approvalPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $d.targetApproval.evidenceSha256) { throw 'Performance target approval evidence is invalid.' }
}
Write-Host "FINANCE STAGING PERFORMANCE: $($d.status)" -ForegroundColor $(if ($d.status -eq 'PASSED') {'Green'} else {'Yellow'})
Write-Host "Workloads: 4; passed: $(@($d.workloads | Where-Object status -eq 'PASSED').Count); productionDataUsed: false; targetsInferred: false"
if ($RequirePassed -and $d.status -ne 'PASSED') { throw 'Finance staging performance has not passed.' }
