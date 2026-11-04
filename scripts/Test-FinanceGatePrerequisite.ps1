[CmdletBinding()]
param([Parameter(Mandatory)][string]$GateId)

$ErrorActionPreference = 'Stop'
switch ($GateId) {
  'FIN-G01' { & (Join-Path $PSScriptRoot 'Test-FinanceCommercialConfiguration.ps1') -RequireApproved }
  'FIN-G06' { & (Join-Path $PSScriptRoot 'Test-FinanceStagingReconciliation.ps1') -RequireMatched }
  'FIN-G07' { & (Join-Path $PSScriptRoot 'Test-FinanceUATExecution.ps1') -RequirePassed }
  'FIN-G08' { & (Join-Path $PSScriptRoot 'Test-FinanceStagingSecurity.ps1') -RequirePassed }
  'FIN-G09' { & (Join-Path $PSScriptRoot 'Test-FinanceStagingPerformance.ps1') -RequirePassed }
  'FIN-G10' { & (Join-Path $PSScriptRoot 'Test-FinanceStagingOperations.ps1') -RequirePassed }
  'FIN-G11' { & (Join-Path $PSScriptRoot 'Test-FinanceStagingRecovery.ps1') -RequirePassed }
}
