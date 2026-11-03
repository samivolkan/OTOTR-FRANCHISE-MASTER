[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-payment-callback-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance payment callback worker test failed.'}
Write-Host 'FINANCE PAYMENT CALLBACK WORKER: PASSED' -ForegroundColor Green
