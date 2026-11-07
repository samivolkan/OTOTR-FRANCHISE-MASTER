[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
node (Join-Path $PSScriptRoot '..\packages\shared\src\finance-erp-session-scope-resolver.test.mjs')
if($LASTEXITCODE-ne 0){throw 'Finance ERP session scope resolver adapter test failed.'}
$dockerCommand=Get-Command docker -ErrorAction SilentlyContinue;$docker=if($dockerCommand){$dockerCommand.Source}else{'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'}
$test=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_erp_session_scope_resolver_e2e.sql'))
$output=@(Get-Content -Raw $test|&$docker exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Finance ERP session scope resolver database test failed.'}
if(($output-join"`n")-notmatch'ERP SESSION SCOPE RESOLVER E2E PASSED'){throw 'Finance ERP session scope resolver success marker missing.'}
Write-Host 'FINANCE ERP SESSION SCOPE RESOLVER: PASSED' -ForegroundColor Green
