[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-payment-checkout-worker.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment checkout worker test failed.' }
Write-Host 'FINANCE PAYMENT CHECKOUT WORKER: PASSED' -ForegroundColor Green
