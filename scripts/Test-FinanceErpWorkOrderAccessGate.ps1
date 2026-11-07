[CmdletBinding()]
param([string]$ContainerName = 'supabase_db_ototr-local')

$ErrorActionPreference = 'Stop'
$dockerCommand = Get-Command docker -ErrorAction SilentlyContinue
$docker = if ($dockerCommand) { $dockerCommand.Source } else { 'C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe' }
$test = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_erp_work_order_access_gate_e2e.sql'))
$output = @(Get-Content -Raw $test | & $docker exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if ($LASTEXITCODE -ne 0) {
  $output | ForEach-Object { Write-Host $_ }
  throw 'Finance ERP work-order access gate database test failed.'
}
if (($output -join "`n") -notmatch 'ERP WORK ORDER ACCESS GATE E2E PASSED') {
  throw 'Finance ERP work-order access gate success marker missing.'
}
Write-Host 'FINANCE ERP WORK ORDER ACCESS GATE: PASSED' -ForegroundColor Green
