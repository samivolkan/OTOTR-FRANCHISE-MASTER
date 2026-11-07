[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-finance-identity-scope-architecture.json'))
$ErrorActionPreference='Stop'
$d=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 20
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'STAGING_IDENTITY_SCOPE_ARCHITECTURE'-or$d.productionDataUsed-or$d.preProductionDecision-ne'NO_GO'){throw'Invalid identity-scope architecture evidence.'}
if($d.erpRoleCounts.FINANCE-ne 1-or$d.erpRoleCounts.BRANCH_MANAGER-ne 2-or$d.activeErpBranchMappings-ne 3-or$d.activeActorScopeGrants-ne 0-or$d.activeLegacyBranchAssignments-ne 0){throw'Staging identity-scope aggregate changed; refresh evidence.'}
if($d.duplicateActiveErpMappings-ne 0-or$d.duplicateActiveActorGrants-ne 0){throw'Duplicate active scope mapping detected.'}
$a=$d.authIdentityReadiness
if($a.distinctAuthUsers-ne 3-or$a.financeAppUsers-ne 1-or$a.branchManagerAppUsers-ne 2-or$a.authUidLinked-ne 3-or$a.authUsersPresent-ne 3-or$a.confirmedAuthUsers-ne 3-or$a.distinctErpBranchesForBranchManagers-ne 2-or$a.distinctFinanceBranchesForBranchManagers-ne 2-or$a.unmappedBranchManagers-ne 0-or$a.emailsRead-or$a.passwordsRead-or$a.tokensRead){throw'Staging Auth identity readiness is incomplete or exposes credentials.'}
$b = @($d.mappedFinanceBranches)
$scopeB1 = $b | Where-Object -Property branchCode -EQ 'SCOPE-B1'
$scopeB2 = $b | Where-Object -Property branchCode -EQ 'SCOPE-B2'
if ($b.Count -ne 2 -or $scopeB1.activeMappingCount -ne 2 -or $scopeB2.activeMappingCount -ne 1) { throw 'Pilot branch mapping inventory is invalid.' }
if($d.authorizationModel.FINANCE-ne'ROLE_WIDE_LEGAL_ENTITY_SCOPE'-or$d.authorizationModel.BRANCH_MANAGER-ne'ERP_BRANCH_TO_FINANCE_SCOPE_MAPPING'-or$d.authorizationModel.QUALITY_AUDITOR_AND_LEGAL-ne'EXPLICIT_ACTOR_SCOPE_GRANT'){throw'Authorization model is invalid.'}
if($d.authorizationModel.financeBranchAssignmentsPurpose-ne'BRANCH_TO_DEALER_LEGAL_ENTITY_MASTER_DATA_NOT_USER_AUTHORIZATION'-or$d.conclusion-ne'ZERO_ACTOR_SCOPE_GRANTS_IS_EXPECTED_WITHOUT_AUDITOR_OR_LEGAL_PILOT_USERS'){throw'Legacy assignment interpretation is invalid.'}
if(@($d.remaining).Count-lt 3){throw'Identity-scope remaining work is incomplete.'}
Write-Host 'FINANCE STAGING IDENTITY-SCOPE ARCHITECTURE: PASSED' -ForegroundColor Green
Write-Host '1 FINANCE and 2 BRANCH_MANAGER Auth identities are confirmed; two managers map to two branches; credentials remain outside evidence.'
