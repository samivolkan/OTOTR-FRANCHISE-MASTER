$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$files = @('packages/shared/src/finance-credential-authenticated-uat.mjs','packages/shared/src/finance-credential-authenticated-uat.test.mjs','scripts/Invoke-FinanceCredentialAuthenticatedUat.mjs','.github/workflows/finance-staging-authenticated-uat.yml')
foreach ($file in $files) { if (-not (Test-Path -LiteralPath (Join-Path $root $file))) { throw "Missing credential UAT artifact: $file" } }
$output = & node --test (Join-Path $root 'packages/shared/src/finance-credential-authenticated-uat.test.mjs') 2>&1
if ($LASTEXITCODE -ne 0) { $output | ForEach-Object { Write-Host $_ }; throw 'Credential authenticated UAT tests failed.' }
$workflow = Get-Content -Raw -LiteralPath (Join-Path $root '.github/workflows/finance-staging-authenticated-uat.yml')
foreach ($name in @('OTOTR_FINANCE_UAT_FINANCE_EMAIL','OTOTR_FINANCE_UAT_FINANCE_PASSWORD','OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL','OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD','OTOTR_FINANCE_UAT_PUBLISHABLE_KEY')) { if ($workflow -notmatch [regex]::Escape("secrets.$name")) { throw "Workflow secret binding missing: $name" } }
$runner = Get-Content -Raw -LiteralPath (Join-Path $root 'scripts/Invoke-FinanceCredentialAuthenticatedUat.mjs')
if ($runner -notmatch 'tokensRecorded:false' -or $runner -notmatch 'sessionsRevokedAfterRun:true' -or $runner -notmatch "flag:'wx'") { throw 'Credential UAT runner safety contract is incomplete.' }
Write-Host 'FINANCE CREDENTIAL AUTHENTICATED UAT: PASSED' -ForegroundColor Green
Write-Host 'Two distinct role credentials, token-free evidence, session revocation and manual staging workflow verified; hosted execution not performed.'
