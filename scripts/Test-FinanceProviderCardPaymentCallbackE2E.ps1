[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=(Get-Command docker -ErrorAction SilentlyContinue).Source;if(-not $docker){$docker='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'}
$sql=Get-Content -Raw (Join-Path $PSScriptRoot '..\supabase\tests\finance_provider_card_payment_callback_e2e.sql')
$sql|& $docker exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres
if($LASTEXITCODE-ne 0){throw 'Finance provider card payment callback E2E failed.'}
Write-Host 'FINANCE PROVIDER CARD PAYMENT CALLBACK E2E: PASSED' -ForegroundColor Green
