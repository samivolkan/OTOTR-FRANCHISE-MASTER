[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$testPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-command-edge.mjs'))
& node $testPath
if($LASTEXITCODE-ne 0){throw 'Finance command Edge contract test failed.'}
Write-Host 'FINANCE COMMAND EDGE: PASSED' -ForegroundColor Green
