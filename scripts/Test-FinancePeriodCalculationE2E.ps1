[CmdletBinding()]
param([string]$ContainerName = 'supabase_db_ototr-local')

$ErrorActionPreference = 'Stop'
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $docker) {
  $fallback = 'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
  if (-not (Test-Path -LiteralPath $fallback -PathType Leaf)) { throw 'Docker CLI not found.' }
  $dockerPath = $fallback
} else { $dockerPath = $docker.Source }

$testPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_period_calculation_queue_e2e.sql'))
if (-not (Test-Path -LiteralPath $testPath -PathType Leaf)) { throw "Period calculation E2E SQL not found: $testPath" }
$output = @(Get-Content -LiteralPath $testPath -Raw |
  & $dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if ($LASTEXITCODE -ne 0) {
  $output | ForEach-Object { Write-Host $_ }
  throw 'Period calculation E2E SQL failed.'
}
if (($output -join "`n") -notmatch 'PERIOD CALCULATION E2E PASSED') {
  throw 'Period calculation E2E success marker was not returned.'
}
$residue = @("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-CALC-DEMO';" |
  & $dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if ($LASTEXITCODE -ne 0 -or $residue.Count -ne 1 -or $residue[0] -ne '0') {
  throw 'Period calculation E2E rollback left synthetic finance data behind.'
}

Write-Host 'FINANCE PERIOD CALCULATION E2E: PASSED' -ForegroundColor Green
Write-Host 'OPEN -> SOURCE_FROZEN -> WAITING -> CALCULATED with deterministic source snapshot.'
Write-Host 'Finalization remained waiting until source processing and posted calculation-run provenance were complete.'
