[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
& node ([IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-rule-simulator.mjs')))
if($LASTEXITCODE-ne 0){throw 'Finance rule simulator test failed.'}
Write-Host 'FINANCE RULE SIMULATOR: PASSED' -ForegroundColor Green
