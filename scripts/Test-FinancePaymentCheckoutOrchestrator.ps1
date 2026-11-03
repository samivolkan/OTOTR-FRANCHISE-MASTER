[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-payment-checkout-orchestrator.test.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment checkout orchestrator test failed.' }
Write-Host 'FINANCE PAYMENT CHECKOUT ORCHESTRATOR: PASSED' -ForegroundColor Green
