[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw 'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}
$testPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_operational_performance_e2e.sql'))
$output=@(Get-Content -LiteralPath $testPath -Raw|&$dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Finance operational performance E2E SQL failed.'}
$joined=$output-join"`n"
if($joined-notmatch'FINANCE OPERATIONAL PERFORMANCE E2E PASSED'){throw 'Finance operational performance success marker was not returned.'}
$measurement=[regex]::Match($joined,'200-row page in ([0-9.,]+) ms').Groups[1].Value
$residue=@("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-PERF-DEMO';"|&$dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if($LASTEXITCODE-ne 0-or$residue.Count-ne 1-or$residue[0]-ne'0'){throw 'Operational performance E2E rollback left synthetic data behind.'}
Write-Host 'FINANCE OPERATIONAL PERFORMANCE E2E: PASSED' -ForegroundColor Green
Write-Host "2,000 scoped audit rows; 200-row page: $measurement ms; local threshold: 1,500 ms; productionDataUsed: false."
