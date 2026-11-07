[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'Set-FinanceCommercialSecrets.ps1'
$names = @('FINANCE_QUERY_TRAMER_TRY_AMOUNT','FINANCE_QUERY_KM_TRY_AMOUNT','FINANCE_QUERY_TRAMER_360_TRY_AMOUNT','FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT')
$prior = @{}
foreach ($name in $names) { $prior[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
try {
  $env:FINANCE_QUERY_TRAMER_TRY_AMOUNT = '250.00'
  $env:FINANCE_QUERY_KM_TRY_AMOUNT = '350.00'
  $env:FINANCE_QUERY_TRAMER_360_TRY_AMOUNT = '750.00'
  $env:FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT = '10.00'
  $raw = & $script -ProjectRef 'bsjkohwbtrfwrqcyhsfz' -ValidateOnly
  $result = $raw | ConvertFrom-Json
  if (-not $result.validated -or $result.applied -or $result.valuesExposed -or $result.secretNames.Count -ne 4) { throw 'Secret provisioning validation contract failed.' }
  if ($raw -match '250\.00|350\.00|750\.00|10\.00') { throw 'Secret provisioning validation leaked a commercial value.' }
  $env:FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT = '100.00'
  $rejected = $false
  try { & $script -ProjectRef 'bsjkohwbtrfwrqcyhsfz' -ValidateOnly | Out-Null } catch { $rejected = $_.Exception.Message -match 'outside its allowed range' }
  if (-not $rejected) { throw 'Out-of-range markup must fail closed.' }
} finally {
  foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $prior[$name], 'Process') }
}
Write-Host 'FINANCE COMMERCIAL SECRET PROVISIONING: PASSED' -ForegroundColor Green
Write-Host 'Four names validated; values absent from output; hosted mutation not executed.'
