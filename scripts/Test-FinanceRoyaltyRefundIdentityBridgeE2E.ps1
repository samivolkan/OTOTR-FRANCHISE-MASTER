[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$dockerPath='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'}else{$dockerPath=$docker.Source}
$testPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_royalty_refund_identity_bridge_e2e.sql'))
$output=@(Get-Content -LiteralPath $testPath -Raw|& $dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Royalty refund identity bridge E2E SQL failed.'}
if(($output-join"`n")-notmatch'ROYALTY REFUND IDENTITY BRIDGE E2E PASSED'){throw 'Royalty refund identity bridge success marker missing.'}
Write-Host 'FINANCE ROYALTY REFUND IDENTITY BRIDGE E2E: PASSED' -ForegroundColor Green
Write-Host 'Authenticated scope authorization and service-role-only refund mutation verified.'
