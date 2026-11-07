[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-erp-operation-guard-registry.test.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance ERP operation guard registry test failed.'}
Write-Host 'FINANCE ERP OPERATION GUARD REGISTRY: PASSED' -ForegroundColor Green
