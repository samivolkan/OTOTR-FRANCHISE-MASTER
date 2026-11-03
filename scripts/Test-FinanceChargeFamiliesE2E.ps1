[CmdletBinding()]
param(
  [string]$ContainerName = 'supabase_db_ototr-local'
)

$ErrorActionPreference = 'Stop'
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $docker) {
  $fallback = 'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
  if (-not (Test-Path -LiteralPath $fallback -PathType Leaf)) { throw 'Docker CLI not found.' }
  $dockerPath = $fallback
} else {
  $dockerPath = $docker.Source
}

$testPath = [System.IO.Path]::GetFullPath(
  (Join-Path $PSScriptRoot '..\supabase\tests\finance_charge_family_accrual_e2e.sql')
)
if (-not (Test-Path -LiteralPath $testPath -PathType Leaf)) {
  throw "Charge-family E2E SQL not found: $testPath"
}

$output = @(Get-Content -LiteralPath $testPath -Raw |
  & $dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if ($LASTEXITCODE -ne 0) {
  $output | ForEach-Object { Write-Host $_ }
  throw 'Charge-family E2E SQL failed.'
}
if (($output -join "`n") -notmatch 'CHARGE FAMILY ACCRUAL E2E PASSED') {
  throw 'Charge-family E2E success marker was not returned.'
}

$residueSql = @'
select count(*)
  from finance.legal_entities
 where entity_code='OTOTR-HQ-FAMILY-DEMO';
'@
$residue = @($residueSql |
  & $dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if ($LASTEXITCODE -ne 0 -or $residue.Count -ne 1 -or $residue[0] -ne '0') {
  throw 'Charge-family E2E rollback left synthetic finance data behind.'
}

Write-Host 'FINANCE CHARGE FAMILY E2E: PASSED' -ForegroundColor Green
Write-Host 'ENTRY_FRANCHISE, QUERY, EXTERNAL_SERVICE and OPTIONAL_PRODUCT_SERVICE posted through the shared accrual engine.'
Write-Host 'Four balanced journals and four branch debit open items total 1980.00 TRY; identical retries produced REPLAY.'
