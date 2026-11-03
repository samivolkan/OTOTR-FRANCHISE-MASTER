[CmdletBinding()]
param([string]$ContainerName = 'supabase_db_ototr-local')

$ErrorActionPreference = 'Stop'
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $docker) {
  $fallback = 'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
  if (-not (Test-Path -LiteralPath $fallback -PathType Leaf)) { throw 'Docker CLI not found.' }
  $dockerPath = $fallback
} else { $dockerPath = $docker.Source }

$testPath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_payment_allocation_reversal_e2e.sql'))
if (-not (Test-Path -LiteralPath $testPath -PathType Leaf)) { throw "Payment lifecycle E2E SQL not found: $testPath" }

$output = @(Get-Content -LiteralPath $testPath -Raw |
  & $dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if ($LASTEXITCODE -ne 0) {
  $output | ForEach-Object { Write-Host $_ }
  throw 'Payment lifecycle E2E SQL failed.'
}
if (($output -join "`n") -notmatch 'PAYMENT E2E PASSED') { throw 'Payment lifecycle E2E success marker was not returned.' }

$residue = @("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-PAYMENT-DEMO';" |
  & $dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if ($LASTEXITCODE -ne 0 -or $residue.Count -ne 1 -or $residue[0] -ne '0') {
  throw 'Payment lifecycle E2E rollback left synthetic finance data behind.'
}

Write-Host 'FINANCE PAYMENT LIFECYCLE E2E: PASSED' -ForegroundColor Green
Write-Host '100.00 TRY recorded and verified; 80.00 TRY allocated; allocation reversed; 100.00 TRY restored as unallocated.'
Write-Host 'Maker-checker, balanced verification journal, open-item equation, provenance and idempotent replay verified.'
