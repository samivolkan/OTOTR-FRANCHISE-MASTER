[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-payment-callback-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance payment callback worker test failed.'}
$entry=Get-Content -Raw (Join-Path $PSScriptRoot '..\supabase\functions\finance-payment-callback-worker\index.ts')
$guard=$entry.IndexOf("if (!request.headers.get('x-ototr-callback-signature')")
$dispatch=$entry.IndexOf('return getHandler()(request)')
if($guard-lt 0-or$dispatch-lt 0-or$guard-ge$dispatch-or$entry-notmatch "503, 'CONFIGURATION_UNAVAILABLE'"){throw 'Payment callback entrypoint must reject missing signature before lazy provider configuration.'}
Write-Host 'FINANCE PAYMENT CALLBACK WORKER: PASSED' -ForegroundColor Green
