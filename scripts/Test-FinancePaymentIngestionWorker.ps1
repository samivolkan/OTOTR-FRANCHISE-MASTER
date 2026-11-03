[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-payment-ingestion-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance payment ingestion worker test failed.'}
Write-Host 'FINANCE PAYMENT INGESTION WORKER: PASSED' -ForegroundColor Green
