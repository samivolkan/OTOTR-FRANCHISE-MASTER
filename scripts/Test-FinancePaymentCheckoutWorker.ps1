[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-payment-checkout-worker.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Finance payment checkout worker test failed.' }
$entry=Get-Content -Raw (Join-Path $PSScriptRoot '..\supabase\functions\finance-payment-checkout\index.ts')
$guard=$entry.IndexOf("if (!request.headers.get('authorization')")
$dispatch=$entry.IndexOf('return getHandler()(request)')
if($guard-lt 0-or$dispatch-lt 0-or$guard-ge$dispatch-or$entry-notmatch "503, 'CONFIGURATION_UNAVAILABLE'"){throw 'Payment checkout entrypoint must reject missing gateway identity before lazy provider configuration.'}
Write-Host 'FINANCE PAYMENT CHECKOUT WORKER: PASSED' -ForegroundColor Green
