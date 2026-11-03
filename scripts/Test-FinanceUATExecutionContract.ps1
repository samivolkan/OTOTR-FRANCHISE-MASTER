$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$tempEvidence = Join-Path $root 'docs\finance\evidence\.uat-execution-test.json'
$tempArtifact = Join-Path $root 'docs\finance\evidence\.uat-artifact-test.json'
try {
  [IO.File]::WriteAllText($tempArtifact, '{"synthetic":true}', [Text.UTF8Encoding]::new($false))
  $artifactHash = (Get-FileHash $tempArtifact -Algorithm SHA256).Hash.ToLowerInvariant()
  $relativeArtifact = [IO.Path]::GetRelativePath($root, $tempArtifact).Replace('\','/')
  $d = Get-Content -Raw (Join-Path $root 'docs\finance\uat-execution-evidence.json') | ConvertFrom-Json -Depth 30
  $d.uatDecision = 'PASSED'
  $d.run.environmentId = 'staging-synthetic'
  $d.run.deployedCommit = 'd' * 40
  $d.run.startedAtUtc = '2026-11-03T01:00:00Z'
  $d.run.completedAtUtc = '2026-11-03T02:00:00Z'
  foreach ($s in $d.scenarios) {
    $s.status = 'PASSED'; $s.executorCorporateId = "executor-$($s.id)"; $s.approverCorporateId = "approver-$($s.id)"
    $s.executedAtUtc = '2026-11-03T01:10:00Z'; $s.approvedAtUtc = '2026-11-03T01:20:00Z'
    $s.expectedResultSha256 = 'e' * 64; $s.actualResultSha256 = 'f' * 64; $s.controlTotalsMatch = $true
    $s.evidence = @([pscustomobject]@{path=$relativeArtifact;sha256=$artifactHash})
  }
  [IO.File]::WriteAllText($tempEvidence, ($d | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
  & (Join-Path $PSScriptRoot 'Test-FinanceUATExecution.ps1') -RequirePassed -EvidenceFile $tempEvidence
  $d.scenarios[0].approverCorporateId = $d.scenarios[0].executorCorporateId
  [IO.File]::WriteAllText($tempEvidence, ($d | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
  $rejected = $false
  try { & (Join-Path $PSScriptRoot 'Test-FinanceUATExecution.ps1') -RequirePassed -EvidenceFile $tempEvidence } catch { $rejected = $_.Exception.Message -match 'Maker-checker' }
  if (-not $rejected) { throw 'Same-person UAT approval was not rejected.' }
  Write-Host 'FINANCE UAT EXECUTION CONTRACT: PASSED' -ForegroundColor Green
  Write-Host 'All 18 scenario signoffs accepted; same-person approval rejected.'
} finally {
  foreach ($path in @($tempEvidence,$tempArtifact)) { if (Test-Path $path) { Remove-Item -LiteralPath $path -Force } }
}
