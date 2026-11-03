[CmdletBinding()]
param([string]$ContainerName = 'supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq $docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw 'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}
$testPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_contract_rule_exception_projection_e2e.sql'))
$output=@(Get-Content -LiteralPath $testPath -Raw|& $dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Finance contract rule exception projection E2E SQL failed.'}
if(($output-join "`n")-notmatch 'CONTRACT RULE EXCEPTION PROJECTION E2E PASSED'){throw 'Finance contract rule exception projection success marker was not returned.'}
Write-Host 'FINANCE CONTRACT RULE EXCEPTION PROJECTION E2E: PASSED' -ForegroundColor Green
Write-Host 'Branch-scoped exception summaries are visible; raw scope, condition and override definitions remain server-side.'
