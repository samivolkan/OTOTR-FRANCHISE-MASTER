$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$tempRecord = Join-Path $root 'docs\finance\evidence\.uat-result-record-test.json'
$expected = Join-Path $root 'docs\finance\evidence\.uat-expected-test.json'
$actual = Join-Path $root 'docs\finance\evidence\.uat-actual-test.json'
try {
  Copy-Item (Join-Path $root 'docs\finance\uat-execution-evidence.json') $tempRecord
  [IO.File]::WriteAllText($expected,'{"gross":"96.00","currency":"TRY"}',[Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($actual,'{"gross":"96.00","currency":"TRY"}',[Text.UTF8Encoding]::new($false))
  $relativeExpected = [IO.Path]::GetRelativePath($root,$expected)
  $relativeActual = [IO.Path]::GetRelativePath($root,$actual)
  & (Join-Path $PSScriptRoot 'Set-FinanceUATScenarioResult.ps1') -ScenarioId UAT-FIN-01 -Status PASSED -ExecutorCorporateId executor-finance-01 -ApproverCorporateId approver-finance-01 -ExpectedResultFile $relativeExpected -ActualResultFile $relativeActual -EvidencePath @($relativeExpected,$relativeActual) -ControlTotalsMatch $true -ExecutedAtUtc '2026-11-07T01:00:00Z' -ApprovedAtUtc '2026-11-07T01:05:00Z' -EvidenceFile $tempRecord | Out-Null
  $d = Get-Content -Raw $tempRecord | ConvertFrom-Json -Depth 30
  $s = $d.scenarios[0]
  if ($s.status -ne 'PASSED' -or $s.controlTotalsMatch -ne $true -or @($s.evidence).Count -ne 2 -or $s.expectedResultSha256 -notmatch '^[a-f0-9]{64}$') { throw 'Recorded UAT result is incomplete.' }
  $duplicateRejected = $false
  try { & (Join-Path $PSScriptRoot 'Set-FinanceUATScenarioResult.ps1') -ScenarioId UAT-FIN-01 -Status FAILED -ExecutorCorporateId executor-finance-02 -ApproverCorporateId approver-finance-02 -ExpectedResultFile $relativeExpected -ActualResultFile $relativeActual -EvidencePath $relativeActual -ControlTotalsMatch $false -ExecutedAtUtc '2026-11-07T01:00:00Z' -ApprovedAtUtc '2026-11-07T01:05:00Z' -EvidenceFile $tempRecord | Out-Null } catch { $duplicateRejected = $_.Exception.Message -match 'already final' }
  if (-not $duplicateRejected) { throw 'Final UAT result was mutable.' }
  $rejected = $false
  try { & (Join-Path $PSScriptRoot 'Set-FinanceUATScenarioResult.ps1') -ScenarioId UAT-FIN-02 -Status PASSED -ExecutorCorporateId same-person -ApproverCorporateId same-person -ExpectedResultFile $relativeExpected -ActualResultFile $relativeActual -EvidencePath $relativeActual -ControlTotalsMatch $true -ExecutedAtUtc '2026-11-07T01:00:00Z' -ApprovedAtUtc '2026-11-07T01:05:00Z' -EvidenceFile $tempRecord | Out-Null } catch { $rejected = $_.Exception.Message -match 'Maker-checker' }
  if (-not $rejected) { throw 'Same-person UAT approval was not rejected.' }
  $mismatchRejected = $false
  try { & (Join-Path $PSScriptRoot 'Set-FinanceUATScenarioResult.ps1') -ScenarioId UAT-FIN-02 -Status PASSED -ExecutorCorporateId executor-finance-02 -ApproverCorporateId approver-finance-02 -ExpectedResultFile $relativeExpected -ActualResultFile $relativeActual -EvidencePath $relativeActual -ControlTotalsMatch $false -ExecutedAtUtc '2026-11-07T01:00:00Z' -ApprovedAtUtc '2026-11-07T01:05:00Z' -EvidenceFile $tempRecord | Out-Null } catch { $mismatchRejected = $_.Exception.Message -match 'control totals' }
  if (-not $mismatchRejected) { throw 'Mismatched control totals could pass UAT.' }
  Write-Host 'FINANCE UAT SCENARIO RESULT: PASSED' -ForegroundColor Green
  Write-Host 'Repository-relative artifacts were hashed and recorded; duplicate finalization and same-person approval are fail-closed.'
} finally {
  foreach ($path in @($tempRecord,$expected,$actual)) { if (Test-Path $path) { Remove-Item -LiteralPath $path -Force } }
}
