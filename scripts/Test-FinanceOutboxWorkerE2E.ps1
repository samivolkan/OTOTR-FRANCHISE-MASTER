$ErrorActionPreference='Stop'
$root=(Resolve-Path(Join-Path $PSScriptRoot '..')).Path
$sql=Join-Path $root 'supabase\tests\finance_outbox_worker_e2e.sql'
$docker=(Get-Command docker -ErrorAction SilentlyContinue).Source
if(-not$docker){$docker='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'}
if(-not(Test-Path -LiteralPath $docker -PathType Leaf)){throw'Docker CLI not found.'}
$output=@(Get-Content -Raw -LiteralPath $sql|&$docker exec -i supabase_db_ototr-local psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw'Finance outbox worker E2E failed.'}
if(($output-join"`n")-notmatch'FINANCE OUTBOX WORKER E2E PASSED'){throw'Finance outbox worker E2E marker missing.'}
Write-Host 'FINANCE OUTBOX WORKER E2E: PASSED' -ForegroundColor Green
