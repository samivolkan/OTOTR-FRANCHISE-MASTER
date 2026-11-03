[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-payment-provider-adapter.test.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment provider adapter test failed.' }
Write-Host 'FINANCE PAYMENT PROVIDER ADAPTER: PASSED' -ForegroundColor Green
