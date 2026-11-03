[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-customer-revenue-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance customer revenue worker test failed.'}
Write-Host 'FINANCE CUSTOMER REVENUE WORKER: PASSED' -ForegroundColor Green
