[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-service-usage-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance service usage worker test failed.'}
Write-Host 'FINANCE SERVICE USAGE WORKER: PASSED' -ForegroundColor Green
