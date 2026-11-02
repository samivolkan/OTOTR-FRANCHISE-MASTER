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
  (Join-Path $PSScriptRoot '..\supabase\tests\finance_pass_through_expense_lifecycle_e2e.sql')
)
if (-not (Test-Path -LiteralPath $testPath -PathType Leaf)) {
  throw "Pass-through expense E2E SQL not found: $testPath"
}

$output = @(Get-Content -LiteralPath $testPath -Raw |
  & $dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if ($LASTEXITCODE -ne 0) {
  $output | ForEach-Object { Write-Host $_ }
  throw 'Pass-through expense E2E SQL failed.'
}
if (($output -join "`n") -notmatch 'PASS-THROUGH EXPENSE E2E PASSED') {
  throw 'Pass-through expense E2E success marker was not returned.'
}

$residueSql = @'
select count(*)
  from finance.legal_entities
 where entity_code='OTOTR-HQ-EXPENSE-DEMO';
'@
$residue = @($residueSql |
  & $dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if ($LASTEXITCODE -ne 0 -or $residue.Count -ne 1 -or $residue[0] -ne '0') {
  throw 'Pass-through expense E2E rollback left synthetic finance data behind.'
}

Write-Host 'FINANCE PASS-THROUGH EXPENSE E2E: PASSED' -ForegroundColor Green
Write-Host 'Source expense: 1200.00 TRY; equal allocation: 2 x 600.00 TRY; maker-checker approval: verified.'
Write-Host 'Debit open items: 1200.00 TRY; reversal credit items: 1200.00 TRY; journal provenance and balance: verified.'
