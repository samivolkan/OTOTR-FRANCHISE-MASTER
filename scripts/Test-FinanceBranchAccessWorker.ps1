[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-branch-access-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance branch access worker test failed.'}
Write-Host 'FINANCE BRANCH ACCESS WORKER: PASSED' -ForegroundColor Green
