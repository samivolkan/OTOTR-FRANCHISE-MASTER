[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-invoice-callback-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance invoice callback worker test failed.'}
Write-Host 'FINANCE INVOICE CALLBACK WORKER: PASSED' -ForegroundColor Green
