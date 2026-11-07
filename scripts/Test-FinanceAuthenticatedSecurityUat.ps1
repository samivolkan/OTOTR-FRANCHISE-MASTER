[CmdletBinding()]param()
$ErrorActionPreference='Stop'
node --test (Join-Path $PSScriptRoot '..\packages\shared\src\finance-authenticated-security-uat.test.mjs')
if($LASTEXITCODE-ne 0){throw'Authenticated finance security UAT runner tests failed.'}
$runner=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'Invoke-FinanceAuthenticatedSecurityUat.mjs') -Raw
if($runner-notmatch'OTOTR_FINANCE_UAT_FINANCE_ACCESS_TOKEN'-or$runner-notmatch'OTOTR_FINANCE_UAT_BRANCH_MANAGER_ACCESS_TOKEN'-or$runner-notmatch"flag:'wx'"){throw'Authenticated security UAT CLI safety contract is incomplete.'}
Write-Host 'FINANCE AUTHENTICATED SECURITY UAT RUNNER: PASSED' -ForegroundColor Green
Write-Host 'IDOR, export scope, anonymous JWT, origin and response minimization contracts verified; hosted execution not performed.'
