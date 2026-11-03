[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-payment-checkout-bff-client.test.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment checkout BFF client test failed.' }
Write-Host 'FINANCE PAYMENT CHECKOUT BFF CLIENT: PASSED' -ForegroundColor Green
