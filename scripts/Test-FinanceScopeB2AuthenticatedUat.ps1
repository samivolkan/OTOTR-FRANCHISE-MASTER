[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
node --test (Join-Path $PSScriptRoot '..\packages\shared\src\finance-scope-b2-authenticated-uat.test.mjs')
if($LASTEXITCODE-ne 0){throw'SCOPE-B2 authenticated UAT runner tests failed.'}
$runner=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Invoke-FinanceScopeB2AuthenticatedUat.mjs') -Raw
if($runner-notmatch'OTOTR_FINANCE_UAT_FINANCE_ACCESS_TOKEN'-or$runner-notmatch'OTOTR_FINANCE_UAT_BRANCH_MANAGER_ACCESS_TOKEN'-or$runner-notmatch"flag:'wx'"){throw'Authenticated UAT CLI safety contract is incomplete.'}
Write-Host 'FINANCE SCOPE-B2 AUTHENTICATED UAT RUNNER: PASSED' -ForegroundColor Green
Write-Host 'Three settlement operations, two-role 96 TRY check, cross-scope 403 and token-free evidence contract verified; hosted execution not performed.'
