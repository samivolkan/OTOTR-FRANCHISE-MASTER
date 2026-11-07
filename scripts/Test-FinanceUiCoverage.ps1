[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$test=Join-Path $root 'apps\admin\prototype\tools\test-finance-ui-coverage.mjs'
if(-not(Test-Path -LiteralPath $test -PathType Leaf)){throw'Finance UI coverage test is missing.'}
& node $test
if($LASTEXITCODE-ne 0){throw 'Finance UI coverage contract failed.'}
Write-Host 'FINANCE UI COVERAGE: PASSED' -ForegroundColor Green
Write-Host 'Seventeen screens mapped; zero shell-only screens; evidence paths and operation bridges verified.'
