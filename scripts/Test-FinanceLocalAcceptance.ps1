[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$startedAt = [DateTimeOffset]::UtcNow
$checks = @(
  'Test-FinanceMigrationManifest.ps1',
  'Test-FinanceLocalReplay.ps1',
  'Test-FinanceRoyaltyE2E.ps1',
  'Test-FinanceChargeFamiliesE2E.ps1',
  'Test-FinancePassThroughExpenseE2E.ps1',
  'Test-FinanceDisputeAdjustmentE2E.ps1',
  'Test-FinancePaymentLifecycleE2E.ps1',
  'Test-FinanceBillingAccountingE2E.ps1'
)

$results = foreach ($check in $checks) {
  $path = Join-Path $PSScriptRoot $check
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Finance acceptance check not found: $path" }
  $checkStartedAt = [DateTimeOffset]::UtcNow
  & $path
  [pscustomobject]@{
    check = $check
    status = 'PASSED'
    durationMs = [math]::Round(([DateTimeOffset]::UtcNow - $checkStartedAt).TotalMilliseconds)
  }
}

$duration = [math]::Round(([DateTimeOffset]::UtcNow - $startedAt).TotalMilliseconds)
Write-Host 'FINANCE LOCAL ACCEPTANCE: PASSED' -ForegroundColor Green
Write-Host ("Checks: {0}; durationMs: {1}; target: LOCAL_ONLY; productionDataUsed: false" -f $results.Count,$duration)
$results | Format-Table -AutoSize
