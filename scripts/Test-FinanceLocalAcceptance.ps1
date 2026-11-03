[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$startedAt = [DateTimeOffset]::UtcNow
$checks = @(
  'Test-FinanceMigrationManifest.ps1',
  'Test-FinanceStagingDeploymentManifest.ps1',
  'Test-FinanceStagingReconciliationContract.ps1',
  'Test-FinanceLocalReplay.ps1',
  'Test-FinanceRoyaltyE2E.ps1',
  'Test-FinanceRoyaltyRefundIdentityBridgeE2E.ps1',
  'Test-FinanceRoyaltyCreditCarryForwardE2E.ps1',
  'Test-FinanceBranchOverdueAccessE2E.ps1',
  'Test-FinanceBranchAccessWorker.ps1',
  'Test-FinanceBranchAccessMiddleware.ps1',
  'Test-FinanceRefundWorker.ps1',
  'Test-FinanceChargeFamiliesE2E.ps1',
  'Test-FinanceServiceUsageWorker.ps1',
  'Test-FinancePassThroughExpenseE2E.ps1',
  'Test-FinanceExpenseIdentityBridgeE2E.ps1',
  'Test-FinanceDisputeAdjustmentE2E.ps1',
  'Test-FinancePaymentLifecycleE2E.ps1',
  'Test-FinancePaymentIngestionWorker.ps1',
  'Test-FinancePaymentCallbackWorker.ps1',
  'Test-FinancePaymentProviderAdapter.ps1',
  'Test-FinancePaymentCheckoutOrchestrator.ps1',
  'Test-FinanceProviderCardPaymentCallbackE2E.ps1',
  'Test-FinanceBillingAccountingE2E.ps1',
  'Test-FinanceAccountingExportWorker.ps1',
  'Test-FinanceInvoiceCallbackWorker.ps1',
  'Test-FinanceIntegrationErrorReadE2E.ps1',
  'Test-FinanceIntegrationRetryIdentityE2E.ps1',
  'Test-FinanceCommandEdge.ps1',
  'Test-FinanceRuleSimulator.ps1',
  'Test-FinanceContractRuleExceptionsE2E.ps1',
  'Test-FinanceContractImpactSimulationE2E.ps1',
  'Test-FinancePeriodCalculationE2E.ps1',
  'Test-FinancePeriodGovernanceE2E.ps1',
  'Test-FinanceDealerReadModelsE2E.ps1',
  'Test-FinanceCustomerRevenueWorker.ps1',
  'Test-FinanceGovernanceReadE2E.ps1',
  'Test-FinanceIdentityScopeE2E.ps1',
  'Test-FinanceDataMinimizationE2E.ps1',
  'Test-FinanceOperationalPerformanceE2E.ps1',
  'Test-FinanceOperationalHealthE2E.ps1',
  'Test-FinanceLocalBackupRestore.ps1',
  'Test-GMFinanceDemoEnvironment.ps1',
  'Test-FinanceUATCoverage.ps1',
  'Test-FinanceUATExecutionContract.ps1',
  'Test-FinanceStagingSecurityContract.ps1',
  'Test-FinanceStagingPerformanceContract.ps1',
  'Test-FinanceStagingOperationsContract.ps1',
  'Test-FinanceStagingRecoveryContract.ps1',
  'Test-FinanceCommercialConfiguration.ps1',
  'Test-FinancePreproductionGateEvidence.ps1',
  'Test-FinancePreproductionDecisionContract.ps1',
  'Test-FinancePreproductionReadiness.ps1'
)

$results = foreach ($check in $checks) {
  $path = Join-Path $PSScriptRoot $check
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Finance acceptance check not found: $path" }
  $checkStartedAt = [DateTimeOffset]::UtcNow
  $global:LASTEXITCODE = 0
  & $path | Out-Host
  if ($null -ne $LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "Finance acceptance check failed: $check (exit $LASTEXITCODE)" }
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
