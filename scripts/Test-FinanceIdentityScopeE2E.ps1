[CmdletBinding()]
param([string]$ContainerName='supabase_db_ototr-local')
$ErrorActionPreference='Stop';$docker=Get-Command docker -ErrorAction SilentlyContinue
if($null-eq$docker){$fallback='C:\Users\Samivolkannnn\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe';if(-not(Test-Path -LiteralPath $fallback -PathType Leaf)){throw'Docker CLI not found.'};$dockerPath=$fallback}else{$dockerPath=$docker.Source}
$testPath=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\supabase\tests\finance_identity_scope_e2e.sql'));$output=@(Get-Content -Raw -LiteralPath $testPath|&$dockerPath exec -i $ContainerName psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres 2>&1)
if($LASTEXITCODE-ne 0){$output|ForEach-Object{Write-Host $_};throw 'Finance identity scope E2E SQL failed.'};if(($output-join"`n")-notmatch'IDENTITY SCOPE E2E PASSED'){throw 'Finance identity scope success marker missing.'}
$residue=@("select count(*) from finance.legal_entities where entity_code='OTOTR-HQ-SCOPE-DEMO';"|&$dockerPath exec -i $ContainerName psql -X -At -v ON_ERROR_STOP=1 -U postgres -d postgres);if($LASTEXITCODE-ne 0-or$residue.Count-ne 1-or$residue[0]-ne'0'){throw 'Identity scope E2E rollback left data behind.'}
Write-Host 'FINANCE IDENTITY SCOPE E2E: PASSED' -ForegroundColor Green;Write-Host 'Real ERP roles, branch mappings, explicit grants and cross-scope denial verified.'
