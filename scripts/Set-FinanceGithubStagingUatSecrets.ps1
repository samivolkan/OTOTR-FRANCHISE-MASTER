[CmdletBinding()]
param(
  [string]$Repository = 'samivolkan/OTOTR-FRANCHISE-MASTER',
  [string]$Environment = 'ototr-staging'
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'GitHub CLI bulunamadı.'
}

& gh auth status 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
  throw 'GitHub CLI oturumu açık değil.'
}

function Set-EnvironmentSecretFromText {
  param([Parameter(Mandatory)][string]$Name,[Parameter(Mandatory)][string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { throw "Boş secret reddedildi: $Name" }
  $Value | & gh secret set $Name --repo $Repository --env $Environment --body - 1>$null
  if ($LASTEXITCODE -ne 0) { throw "GitHub secret yazılamadı: $Name" }
}

function Set-EnvironmentSecretFromSecureString {
  param([Parameter(Mandatory)][string]$Name,[Parameter(Mandatory)][Security.SecureString]$Value)
  $pointer = [IntPtr]::Zero
  $plain = $null
  try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    Set-EnvironmentSecretFromText -Name $Name -Value $plain
  } finally {
    $plain = $null
    if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
  }
}

$financeEmail = (Read-Host 'Merkez Finans demo hesabı e-posta adresi').Trim()
$financePassword = Read-Host 'Merkez Finans demo hesabı parolası' -AsSecureString
$branchEmail = (Read-Host 'Şube Yöneticisi demo hesabı e-posta adresi').Trim()
$branchPassword = Read-Host 'Şube Yöneticisi demo hesabı parolası' -AsSecureString

if ($financeEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$' -or $branchEmail -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
  throw 'Geçerli iki demo hesap e-posta adresi gereklidir.'
}
if ($financeEmail.Equals($branchEmail,[StringComparison]::OrdinalIgnoreCase)) {
  throw 'Merkez Finans ve Şube Yöneticisi farklı Auth kullanıcıları olmalıdır.'
}

Set-EnvironmentSecretFromText -Name 'OTOTR_FINANCE_UAT_FINANCE_EMAIL' -Value $financeEmail
Set-EnvironmentSecretFromSecureString -Name 'OTOTR_FINANCE_UAT_FINANCE_PASSWORD' -Value $financePassword
Set-EnvironmentSecretFromText -Name 'OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL' -Value $branchEmail
Set-EnvironmentSecretFromSecureString -Name 'OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD' -Value $branchPassword

$financeEmail = $null
$branchEmail = $null
$financePassword.Dispose()
$branchPassword.Dispose()

$configured = @(& gh api "repos/$Repository/environments/$Environment/secrets" --jq '.secrets[].name')
if ($LASTEXITCODE -ne 0) { throw 'GitHub secret adı envanteri doğrulanamadı.' }
$required = @(
  'OTOTR_FINANCE_UAT_FINANCE_EMAIL',
  'OTOTR_FINANCE_UAT_FINANCE_PASSWORD',
  'OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL',
  'OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD',
  'OTOTR_FINANCE_UAT_PUBLISHABLE_KEY'
)
$missing = @($required | Where-Object { $_ -notin $configured })
if ($missing.Count) { throw "Eksik GitHub secret adları: $($missing -join ', ')" }

Write-Host 'FINANCE STAGING UAT SECRETS: READY' -ForegroundColor Green
Write-Host 'Configured: 5/5; valuesPrinted: false; valuesPersistedLocally: false'
