[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-payment-checkout-browser.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment checkout browser test failed.' }
Write-Host 'FINANCE PAYMENT CHECKOUT BROWSER: PASSED' -ForegroundColor Green
