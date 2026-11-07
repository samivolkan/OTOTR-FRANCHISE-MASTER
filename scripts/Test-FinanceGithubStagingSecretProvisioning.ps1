[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$path = Join-Path $PSScriptRoot 'Set-FinanceGithubStagingUatSecrets.ps1'
if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw 'Finance staging secret provisioning script is missing.' }
$source = Get-Content -Raw -LiteralPath $path
$required = @(
  'OTOTR_FINANCE_UAT_FINANCE_EMAIL',
  'OTOTR_FINANCE_UAT_FINANCE_PASSWORD',
  'OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL',
  'OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD',
  'OTOTR_FINANCE_UAT_PUBLISHABLE_KEY'
)
foreach ($name in $required) { if ($source -notmatch [regex]::Escape($name)) { throw "Secret provisioning contract missing: $name" } }
if ($source -notmatch "Read-Host 'Merkez Finans demo hesabı parolası' -AsSecureString" -or
    $source -notmatch "Read-Host 'Şube Yöneticisi demo hesabı parolası' -AsSecureString" -or
    $source -notmatch 'SecureStringToBSTR' -or
    $source -notmatch 'ZeroFreeBSTR' -or
    $source -notmatch 'secret set \$Name --repo \$Repository --env \$Environment --body -') {
  throw 'Secret provisioning does not keep passwords off command arguments and local files.'
}
if ($source -match '(?i)Set-Content|Add-Content|Out-File|ConvertFrom-SecureString\s+-AsPlainText|Write-(?:Host|Output).*\$(?:plain|financeEmail|branchEmail|financePassword|branchPassword)') {
  throw 'Secret provisioning may persist or print credential values.'
}
if ($source -notmatch 'financeEmail\.Equals\(\$branchEmail' -or $source -notmatch 'valuesPrinted: false; valuesPersistedLocally: false') {
  throw 'Distinct-role or no-persistence verification is missing.'
}
Write-Host 'FINANCE GITHUB STAGING SECRET PROVISIONING: PASSED' -ForegroundColor Green
Write-Host 'Interactive SecureString input, stdin-only gh transfer, distinct roles and name-only verification confirmed.'
