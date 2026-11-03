[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-branch-access-middleware.test.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance branch access middleware test failed.'}
Write-Host 'FINANCE BRANCH ACCESS MIDDLEWARE: PASSED' -ForegroundColor Green
