[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-finance-security-advisor.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 30
if($e.schemaVersion-ne 1-or$e.module-ne'OTOTR_FRANCHISE_FINANCE'-or$e.target-ne'STAGING'-or$e.environment-ne'ototr-staging'-or$e.projectRef-ne'bsjkohwbtrfwrqcyhsfz'){throw'Invalid staging finance security advisor evidence identity.'}
if($e.productionDataUsed-or$e.preProductionDecision-ne'NO_GO'-or$e.interpretation.securityGatePassed){throw'Security advisor evidence must remain production-free and fail-closed.'}
if($e.advisor.criticalCount-ne 0-or$e.advisor.highCount-ne 0-or$e.advisor.warningCount-ne 0-or$e.advisor.infoCount-ne 52-or$e.advisor.finding.level-ne'INFO'){throw'Unexpected finance security advisor severity inventory.'}
$d=$e.databaseVerification
if($d.financeTableCount-ne 52-or$d.rlsEnabledCount-ne 52-or$d.rlsForcedCount-ne 52-or$d.financeTablePolicyCount-ne 0-or$d.browserRawTableGrantCount-ne 0){throw'Raw finance table fail-closed controls are inconsistent.'}
if($d.financePrivateAnonExecuteCount-ne 0-or$d.financePrivateAuthenticatedExecuteCount-ne 4-or$e.privateFunctionReview.storagePoliciesUsingHelpers-ne 6-or$e.privateFunctionReview.classification-ne'INTENTIONAL_STORAGE_RLS_HELPERS'){throw'Private storage helper review is inconsistent.'}
if(-not$e.interpretation.rawFinanceTablesAreFailClosed-or-not$e.interpretation.browserAccessIsThroughFinanceApi-or-not$e.interpretation.advisorInfoAcceptedAsArchitecture){throw'Security architecture interpretation is incomplete.'}
$raw=$e|ConvertTo-Json -Depth 30
if($raw-match'(?i)password|service.role.key|bearer\s+|sb_secret_|eyJ[A-Za-z0-9_-]{20,}|customerName|phone|email|tckn|vkn|iban'){throw'Security advisor evidence contains a secret or personal-data field.'}
Write-Host 'FINANCE STAGING SECURITY ADVISOR EVIDENCE: PASSED' -ForegroundColor Green
Write-Host '52/52 raw finance tables keep FORCE RLS and zero browser grants; one INFO lint is documented; FIN-G08 remains NO_GO pending browser-role tests and signoff.'
