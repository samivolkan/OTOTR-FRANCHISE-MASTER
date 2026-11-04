[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node --test (Join-Path $PSScriptRoot '..\packages\shared\src\finance-branch-opening-adapter.test.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance branch opening adapter test failed.' }
Write-Host 'FINANCE BRANCH OPENING ADAPTER: PASSED' -ForegroundColor Green
