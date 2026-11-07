[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\apps\admin\prototype\tools\test-finance-accounting-export-worker.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance accounting export worker test failed.'}
$entry=Get-Content -Raw (Join-Path $PSScriptRoot '..\supabase\functions\finance-accounting-export-worker\index.ts')
$guard=$entry.IndexOf("if (!request.headers.get('authorization')")
$dispatch=$entry.IndexOf('return getHandler()(request)')
if($guard-lt 0-or$dispatch-lt 0-or$guard-ge$dispatch-or$entry-notmatch "503, 'CONFIGURATION_UNAVAILABLE'"){throw 'Accounting export entrypoint must reject missing worker identity before lazy provider configuration.'}
Write-Host 'FINANCE ACCOUNTING EXPORT WORKER: PASSED' -ForegroundColor Green
