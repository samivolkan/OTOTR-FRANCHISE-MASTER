[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-payment-checkout-route.test.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment checkout route test failed.' }
Write-Host 'FINANCE PAYMENT CHECKOUT ROUTE: PASSED' -ForegroundColor Green
