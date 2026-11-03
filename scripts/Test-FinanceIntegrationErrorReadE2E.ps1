[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw 'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}
$testPath=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_integration_error_read_e2e.sql'))
$output=@(Get-Content -LiteralPath $testPath -Raw|&$dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Integration error read E2E SQL failed.'}
if(($output-join"`n")-notmatch'INTEGRATION ERROR READ E2E PASSED'){throw 'Integration error read E2E success marker was not returned.'}
$residue=@("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-INTEGRATION-DEMO';"|&$dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if($LASTEXITCODE-ne 0-or$residue.Count-ne 1-or$residue[0]-ne'0'){throw 'Integration error E2E rollback left synthetic data behind.'}
Write-Host 'FINANCE INTEGRATION ERROR READ E2E: PASSED' -ForegroundColor Green
Write-Host 'Masked detail, inbox/outbox correlation trace and cross-scope isolation verified.'
