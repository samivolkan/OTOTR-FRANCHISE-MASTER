[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw 'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}
$testPath=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_data_minimization_e2e.sql'))
$output=@(Get-Content -LiteralPath $testPath -Raw|&$dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Finance data minimization E2E SQL failed.'}
if(($output-join"`n")-notmatch'FINANCE DATA MINIMIZATION E2E PASSED'){throw 'Finance data minimization E2E success marker was not returned.'}
Write-Host 'FINANCE DATA MINIMIZATION E2E: PASSED' -ForegroundColor Green
Write-Host 'Raw tables, export mutations, anonymous projections and private functions are client-inaccessible.'
