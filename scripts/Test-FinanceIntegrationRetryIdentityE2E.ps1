[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw 'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}
$testPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_integration_retry_identity_e2e.sql'))
$output=@(Get-Content -LiteralPath $testPath -Raw|&$dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Finance integration retry identity E2E SQL failed.'}
if(($output-join"`n")-notmatch'FINANCE INTEGRATION RETRY IDENTITY E2E PASSED'){throw 'Finance integration retry identity success marker was not returned.'}
$residue=@("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-RETRY-ID-DEMO';"|&$dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if($LASTEXITCODE-ne 0-or$residue.Count-ne 1-or$residue[0]-ne'0'){throw 'Integration retry identity E2E rollback left synthetic data behind.'}
Write-Host 'FINANCE INTEGRATION RETRY IDENTITY E2E: PASSED' -ForegroundColor Green
Write-Host 'ERP role, branch scope, assignment, dead-letter resolution policy, audit and server-only commit verified.'
