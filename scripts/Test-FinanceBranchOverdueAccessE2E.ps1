[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop';$command=Get-Command docker -ErrorAction SilentlyContinue;$docker=if($command){$command.Source}else{'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'}
$test=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_branch_overdue_access_e2e.sql'))
$output=@(Get-Content -Raw $test|&$docker exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1);if($LASTEXITCODE -ne 0){$output|ForEach-Object{Write-Host $_};throw 'Branch overdue access E2E failed.'};if(($output-join"`n")-notmatch'BRANCH OVERDUE ACCESS E2E PASSED'){throw 'Branch overdue access success marker missing.'};Write-Host 'FINANCE BRANCH OVERDUE ACCESS E2E: PASSED' -ForegroundColor Green
