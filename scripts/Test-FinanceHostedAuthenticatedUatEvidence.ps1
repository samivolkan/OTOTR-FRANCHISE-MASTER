[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$EvidenceDirectory)
$ErrorActionPreference='Stop'
$dir=(Resolve-Path -LiteralPath $EvidenceDirectory).Path
$scopePath=Join-Path $dir 'scope-b2-authenticated-uat.json'
$securityPath=Join-Path $dir 'authenticated-security-uat.json'
foreach($path in @($scopePath,$securityPath)){if(-not(Test-Path -LiteralPath $path -PathType Leaf)){throw"Hosted UAT evidence missing: $path"}}
$scope=Get-Content -Raw -LiteralPath $scopePath|ConvertFrom-Json -Depth 30
$security=Get-Content -Raw -LiteralPath $securityPath|ConvertFrom-Json -Depth 30
$hash='^[a-f0-9]{64}$'
function Test-Identity($value,$name){if($value.identities.distinct-ne$true-or$value.identities.financeIdentitySha256-notmatch$hash-or$value.identities.branchManagerIdentitySha256-notmatch$hash-or$value.identities.financeIdentitySha256-eq$value.identities.branchManagerIdentitySha256){throw"$name role identity evidence is invalid."}}
function Test-Common($value,$target){if($value.schemaVersion-ne 1-or$value.module-ne'OTOTR_FRANCHISE_FINANCE'-or$value.target-ne$target-or$value.environment-ne'ototr-staging'-or$value.projectRef-ne'bsjkohwbtrfwrqcyhsfz'){throw"$target evidence identity is invalid."};if($value.productionDataUsed-or$value.dataClassification-ne'SYNTHETIC_AGGREGATE_ONLY'-or$value.secretsRecorded-or$value.tokensRecorded-or$value.browserSessionVerified-or$value.preProductionDecision-ne'NO_GO'){throw"$target evidence policy is invalid."};$parsed=[datetimeoffset]::MinValue;if(-not[datetimeoffset]::TryParse([string]$value.executedAtUtc,[ref]$parsed)){throw"$target execution time is invalid."};Test-Identity $value $target}
Test-Common $scope 'STAGING_AUTHENTICATED_API_UAT'
if((@($scope.scopeMatrix.financeVisibleBranchCodes|Sort-Object)-join',')-ne'SCOPE-B1,SCOPE-B2'-or(@($scope.scopeMatrix.branchManagerVisibleBranchCodes)-join',')-ne'SCOPE-B2'-or$scope.scopeMatrix.branchManagerCrossScopeStatus-ne 403){throw'Scope UAT role matrix is invalid.'}
$expectedOps=@('collection-600','collection-400','refund-200');if((@($scope.operations.operation)-join',')-ne($expectedOps-join',')){throw'Scope UAT operation sequence is invalid.'};foreach($op in $scope.operations){if($op.status-ne 200-or$op.outcome-notin@('CREATED','REPLAY')-or$op.correlationIdSha256-notmatch$hash){throw"Scope UAT operation is invalid: $($op.operation)"}}
foreach($role in @('finance','branchManager')){$balance=$scope.royaltyBalance.$role;if($balance.status-ne 200-or[decimal]$balance.netGrossAmount-ne[decimal]96-or$balance.currency-ne'TRY'){throw"Scope UAT $role balance is invalid."}}
Test-Common $security 'STAGING_AUTHENTICATED_SECURITY_UAT'
if((@($security.scopeMatrix.financeVisibleBranchCodes|Sort-Object)-join',')-ne'SCOPE-B1,SCOPE-B2'-or(@($security.scopeMatrix.branchManagerVisibleBranchCodes)-join',')-ne'SCOPE-B2'){throw'Security UAT role matrix is invalid.'}
$c=$security.controls;if($c.idorCrossScopeStatus-ne 403-or$c.exportOwnScopeStatus-ne 200-or$c.exportCrossScopeStatus-ne 403-or$c.anonymousStatus-ne 401-or$c.invalidOriginStatus-ne 403-or$c.responseDataMinimized-ne$true){throw'Security UAT controls are invalid.'}
if(@($security.correlationEvidenceSha256).Count-ne 7-or@($security.correlationEvidenceSha256|Where-Object{$_-notmatch$hash}).Count-ne 0){throw'Security UAT correlation evidence is invalid.'}
$raw=(Get-Content -Raw -LiteralPath $scopePath)+(Get-Content -Raw -LiteralPath $securityPath)
if($raw-match'(?i)"(?:password|email|accessToken|refreshToken|authorization|serviceRole|rawPayload)"\s*:'-or$raw-match'eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}'){throw'Hosted UAT evidence contains forbidden credential or raw-data material.'}
Write-Host 'FINANCE HOSTED AUTHENTICATED UAT EVIDENCE: PASSED' -ForegroundColor Green
Write-Host 'Two distinct roles, 600/400/200 -> 96 TRY, cross-scope 403, security controls and credential-free evidence verified.'
