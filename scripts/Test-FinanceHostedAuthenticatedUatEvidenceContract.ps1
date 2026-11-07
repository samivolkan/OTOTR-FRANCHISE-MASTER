$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$temp = Join-Path $root 'docs\finance\evidence\.hosted-uat-contract-test'
New-Item -ItemType Directory -Path $temp -Force | Out-Null
try {
  $h1 = 'a' * 64
  $h2 = 'b' * 64
  $ops = @('collection-600','collection-400','refund-200') | ForEach-Object { [pscustomobject]@{operation=$_;status=200;outcome='CREATED';correlationIdSha256='c'*64} }
  $scope = [pscustomobject]@{
    schemaVersion=1;module='OTOTR_FRANCHISE_FINANCE';target='STAGING_AUTHENTICATED_API_UAT';environment='ototr-staging';projectRef='bsjkohwbtrfwrqcyhsfz';executedAtUtc='2026-11-07T03:45:00Z';productionDataUsed=$false;dataClassification='SYNTHETIC_AGGREGATE_ONLY'
    identities=[pscustomobject]@{financeIdentitySha256=$h1;branchManagerIdentitySha256=$h2;distinct=$true}
    scopeMatrix=[pscustomobject]@{financeVisibleBranchCodes=@('SCOPE-B1','SCOPE-B2');branchManagerVisibleBranchCodes=@('SCOPE-B2');branchManagerCrossScopeStatus=403}
    operations=$ops
    royaltyBalance=[pscustomobject]@{finance=[pscustomobject]@{status=200;netGrossAmount='96.00';currency='TRY'};branchManager=[pscustomobject]@{status=200;netGrossAmount='96.00';currency='TRY'}}
    secretsRecorded=$false;tokensRecorded=$false;browserSessionVerified=$false;preProductionDecision='NO_GO'
  }
  $security = [pscustomobject]@{
    schemaVersion=1;module='OTOTR_FRANCHISE_FINANCE';target='STAGING_AUTHENTICATED_SECURITY_UAT';environment='ototr-staging';projectRef='bsjkohwbtrfwrqcyhsfz';executedAtUtc='2026-11-07T03:45:00Z';productionDataUsed=$false;dataClassification='SYNTHETIC_AGGREGATE_ONLY'
    identities=[pscustomobject]@{financeIdentitySha256=$h1;branchManagerIdentitySha256=$h2;distinct=$true}
    scopeMatrix=[pscustomobject]@{financeVisibleBranchCodes=@('SCOPE-B1','SCOPE-B2');branchManagerVisibleBranchCodes=@('SCOPE-B2')}
    controls=[pscustomobject]@{idorCrossScopeStatus=403;exportOwnScopeStatus=200;exportCrossScopeStatus=403;anonymousStatus=401;invalidOriginStatus=403;responseDataMinimized=$true}
    correlationEvidenceSha256=@(('c'*64),('d'*64),('e'*64),('f'*64),('1'*64),('2'*64),('3'*64))
    secretsRecorded=$false;tokensRecorded=$false;browserSessionVerified=$false;preProductionDecision='NO_GO'
  }
  $scopePath = Join-Path $temp 'scope-b2-authenticated-uat.json'
  $securityPath = Join-Path $temp 'authenticated-security-uat.json'
  [IO.File]::WriteAllText($scopePath,($scope|ConvertTo-Json -Depth 30),[Text.UTF8Encoding]::new($false))
  [IO.File]::WriteAllText($securityPath,($security|ConvertTo-Json -Depth 30),[Text.UTF8Encoding]::new($false))
  & (Join-Path $PSScriptRoot 'Test-FinanceHostedAuthenticatedUatEvidence.ps1') -EvidenceDirectory $temp
  $scope.scopeMatrix.branchManagerCrossScopeStatus = 200
  [IO.File]::WriteAllText($scopePath,($scope|ConvertTo-Json -Depth 30),[Text.UTF8Encoding]::new($false))
  $rejected = $false
  try { & (Join-Path $PSScriptRoot 'Test-FinanceHostedAuthenticatedUatEvidence.ps1') -EvidenceDirectory $temp } catch { $rejected = $_.Exception.Message -match 'role matrix' }
  if (-not $rejected) { throw 'Hosted UAT validator accepted cross-scope 200.' }
  Write-Host 'FINANCE HOSTED AUTHENTICATED UAT EVIDENCE CONTRACT: PASSED' -ForegroundColor Green
  Write-Host 'Valid aggregate evidence accepted; cross-scope authorization regression rejected.'
} finally {
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
}
