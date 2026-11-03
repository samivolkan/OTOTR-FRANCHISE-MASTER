[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-accounting-export-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance accounting export worker test failed.'}
Write-Host 'FINANCE ACCOUNTING EXPORT WORKER: PASSED' -ForegroundColor Green
