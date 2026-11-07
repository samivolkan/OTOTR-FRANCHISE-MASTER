$ErrorActionPreference='Stop'
$test=Join-Path $PSScriptRoot '..\supabase\functions\finance-outbox-worker\core.test.mjs'
node --test $test
if($LASTEXITCODE-ne 0){throw 'Finance outbox worker test failed.'}
$resilienceTest=Join-Path $PSScriptRoot '..\supabase\functions\finance-outbox-worker\core-resilience.test.mjs'
node --test $resilienceTest
if($LASTEXITCODE-ne 0){throw 'Finance outbox resilience test failed.'}
$adapterTest=Join-Path $PSScriptRoot '..\supabase\functions\finance-outbox-worker\supabase-adapter.test.mjs'
node --test $adapterTest
if($LASTEXITCODE-ne 0){throw 'Finance outbox route validation test failed.'}
$entry=Get-Content -Raw (Join-Path $PSScriptRoot '..\supabase\functions\finance-outbox-worker\index.ts')
$guard=$entry.IndexOf("if (!request.headers.get('authorization')")
$dispatch=$entry.IndexOf('return getHandler()(request)')
if($guard-lt 0-or$dispatch-lt 0-or$guard-ge$dispatch-or$entry-notmatch "503, 'CONFIGURATION_UNAVAILABLE'"){throw 'Outbox entrypoint must reject missing worker identity before route configuration or message claim.'}
Write-Host 'FINANCE OUTBOX WORKER: PASSED' -ForegroundColor Green
