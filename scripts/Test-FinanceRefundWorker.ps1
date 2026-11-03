[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-refund-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance refund worker test failed.'}
Write-Host 'FINANCE REFUND WORKER: PASSED' -ForegroundColor Green
