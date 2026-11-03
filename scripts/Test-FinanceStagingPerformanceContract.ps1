$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$tempEvidence = Join-Path $root 'docs\finance\evidence\.performance-test.json'
$tempArtifact = Join-Path $root 'docs\finance\evidence\.performance-artifact-test.json'
try {
  [IO.File]::WriteAllText($tempArtifact, '{"synthetic":true}', [Text.UTF8Encoding]::new($false))
  $hash = (Get-FileHash $tempArtifact -Algorithm SHA256).Hash.ToLowerInvariant(); $relative = [IO.Path]::GetRelativePath($root,$tempArtifact).Replace('\','/')
  $d = Get-Content -Raw (Join-Path $root 'docs\finance\staging-performance-evidence.json') | ConvertFrom-Json -Depth 30
  $d.status='PASSED';$d.run.environmentId='preprod-synthetic';$d.run.deployedCommit='a'*40;$d.run.startedAtUtc='2026-11-03T01:00:00Z';$d.run.completedAtUtc='2026-11-03T01:30:00Z';$d.run.executedByCorporateId='perf-runner';$d.run.approvedByCorporateId='perf-reviewer';$d.run.loadTool='synthetic-load';$d.run.loadToolVersion='1.0.0'
  $d.targetApproval.approvedBy='platform-owner';$d.targetApproval.approvedAtUtc='2026-11-03T00:00:00Z';$d.targetApproval.evidencePath=$relative;$d.targetApproval.evidenceSha256=$hash
  foreach($w in $d.workloads){$w.status='PASSED';$w.target.datasetRows=10000;$w.target.concurrency=20;$w.target.requests=1000;$w.target.p95Ms=500;$w.target.p99Ms=900;$w.target.maxErrorRatePct=1;$w.target.timeoutBudgetMs=2000;$w.observed.datasetRows=10000;$w.observed.concurrency=20;$w.observed.requests=1000;$w.observed.p50Ms=100;$w.observed.p95Ms=400;$w.observed.p99Ms=800;$w.observed.errorRatePct=0.1;$w.observed.maxMs=1000;$w.observed.idempotencyViolations=0;$w.observed.financialMismatchCount=0;$w.observed.timeoutRetryRecovered=$true;$w.evidence=@([pscustomobject]@{path=$relative;sha256=$hash})}
  [IO.File]::WriteAllText($tempEvidence,($d|ConvertTo-Json -Depth 30),[Text.UTF8Encoding]::new($false)); & (Join-Path $PSScriptRoot 'Test-FinanceStagingPerformance.ps1') -RequirePassed -EvidenceFile $tempEvidence
  $d.workloads[0].observed.p95Ms=501;[IO.File]::WriteAllText($tempEvidence,($d|ConvertTo-Json -Depth 30),[Text.UTF8Encoding]::new($false));$rejected=$false
  try{& (Join-Path $PSScriptRoot 'Test-FinanceStagingPerformance.ps1') -RequirePassed -EvidenceFile $tempEvidence}catch{$rejected=$_.Exception.Message -match 'target breached'}
  if(-not$rejected){throw'P95 target breach was not rejected.'}
  Write-Host 'FINANCE STAGING PERFORMANCE CONTRACT: PASSED' -ForegroundColor Green
  Write-Host 'Four workloads accepted within approved targets; P95 breach rejected.'
}finally{foreach($path in @($tempEvidence,$tempArtifact)){if(Test-Path $path){Remove-Item -LiteralPath $path -Force}}}
