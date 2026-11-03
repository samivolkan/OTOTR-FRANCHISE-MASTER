[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop'
$docker=(Get-Command docker -ErrorAction SilentlyContinue).Source
if([string]::IsNullOrWhiteSpace($docker)){$docker='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'}
$test=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_royalty_credit_carry_forward_e2e.sql'))
$output=@(Get-Content -Raw -LiteralPath $test | & $docker exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE -ne 0){$output|ForEach-Object{Write-Host $_};throw 'Royalty credit carry-forward E2E SQL failed.'}
if(($output-join "`n")-notmatch 'ROYALTY CREDIT CARRY FORWARD E2E PASSED'){throw 'Royalty credit carry-forward success marker missing.'}
$residue=@("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-CREDIT-DEMO';"|& $docker exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres)
if($LASTEXITCODE -ne 0-or$residue.Count-ne 1-or$residue[0]-ne'0'){throw 'Royalty credit carry-forward rollback left synthetic data behind.'}
Write-Host 'FINANCE ROYALTY CREDIT CARRY FORWARD E2E: PASSED' -ForegroundColor Green
Write-Host '180.00 TRY branch credit settled 120.00 TRY fully, carried 60.00 TRY, and reduced the next 100.00 TRY royalty invoice to 40.00 TRY.'
