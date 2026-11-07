$ErrorActionPreference='Stop'
$test=Join-Path $PSScriptRoot '..\supabase\functions\finance-outbox-worker\core.test.mjs'
node --test $test
if($LASTEXITCODE-ne 0){throw 'Finance outbox worker test failed.'}
Write-Host 'FINANCE OUTBOX WORKER: PASSED' -ForegroundColor Green
