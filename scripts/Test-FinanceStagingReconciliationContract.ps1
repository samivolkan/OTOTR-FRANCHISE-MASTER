$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$temp = Join-Path $root 'docs\finance\evidence\.reconciliation-test.json'
try {
  $e = Get-Content -Raw (Join-Path $root 'docs\finance\staging-reconciliation-evidence.json') | ConvertFrom-Json -Depth 30
  $e.status = 'MATCHED'
  $e.run.environmentId = 'staging-synthetic'
  $e.run.deployedCommit = 'a' * 40
  $e.run.startedAtUtc = '2026-11-03T01:00:00Z'
  $e.run.completedAtUtc = '2026-11-03T01:05:00Z'
  $e.run.executedBy = 'synthetic-test-actor'
  $e.run.cutoffAtUtc = '2026-11-03T00:00:00Z'
  $e.snapshots.sourceSha256 = 'b' * 64
  $e.snapshots.targetSha256 = 'c' * 64
  $e.identityMapping.sourceCount = 10
  $e.identityMapping.targetCount = 10
  $e.identityMapping.unmappedCount = 0
  $e.identityMapping.duplicateCount = 0
  foreach ($total in $e.controlTotals) { $total.sourceValue = '100.00'; $total.targetValue = '100.00'; $total.difference = '0.00' }
  [IO.File]::WriteAllText($temp, ($e | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
  & (Join-Path $PSScriptRoot 'Test-FinanceStagingReconciliation.ps1') -RequireMatched -EvidenceFile $temp
  $e.controlTotals[0].targetValue = '101.00'
  $e.controlTotals[0].difference = '1.00'
  [IO.File]::WriteAllText($temp, ($e | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
  $rejected = $false
  try { & (Join-Path $PSScriptRoot 'Test-FinanceStagingReconciliation.ps1') -RequireMatched -EvidenceFile $temp } catch { $rejected = $_.Exception.Message -match 'mismatch' }
  if (-not $rejected) { throw 'Non-zero reconciliation difference was not rejected.' }
  Write-Host 'FINANCE STAGING RECONCILIATION CONTRACT: PASSED' -ForegroundColor Green
  Write-Host 'Matched totals accepted; non-zero difference rejected.'
} finally {
  if (Test-Path $temp) { Remove-Item -LiteralPath $temp -Force }
}
