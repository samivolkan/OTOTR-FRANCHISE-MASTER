[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-finance-recovery-readiness.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 30
if($e.schemaVersion-ne 1-or$e.module-ne'OTOTR_FRANCHISE_FINANCE'-or$e.target-ne'STAGING'-or$e.environment-ne'ototr-staging'-or$e.projectRef-ne'bsjkohwbtrfwrqcyhsfz'){throw'Invalid staging recovery readiness identity.'}
if($e.productionDataUsed-or$e.preProductionDecision-ne'NO_GO'-or$e.interpretation.status-ne'ACTION_REQUIRED'){throw'Recovery readiness must remain production-free and fail-closed.'}
$p=$e.projectState
if($p.defaultBranch-ne'main'-or$p.defaultBranchStatus-ne'ACTIVE_HEALTHY'-or$p.developmentBranchCount-ne 0-or$p.isolatedRestoreTargetExists-or$p.healthAdvisorFindingCount-ne 0){throw'Staging project recovery topology evidence is inconsistent.'}
$m=$e.migrationState
if($m.latestAppliedFinanceMigrationVersion-ne'20261107015427'-or$m.localCandidateMigrationVersion-ne'20261107021500'-or$m.localCandidateAppliedToStaging){throw'Staging migration boundary is inconsistent.'}
$r=$e.recoveryChecks
if(-not$r.localSeparateDatabaseRestorePassed-or$r.localFinanceTableCount-ne 52-or$r.localFinanceApiFunctionCount-ne 191-or$r.managedBackupHistoryVerified-or$r.stagingRestoreDrillExecuted-or$r.applicationRollbackDrillExecuted-or$r.forwardFixDrillExecuted-or$r.destructiveDownMigrationUsed){throw'Recovery drill evidence must expose all remaining staging gaps.'}
$raw=$e|ConvertTo-Json -Depth 30
if($raw-match'(?i)password|token|authorization|bearer\s+|sb_secret_|eyJ[A-Za-z0-9_-]{20,}|customerName|phone|email|tckn|vkn|iban'){throw'Recovery evidence contains a secret or personal-data field.'}
Write-Host 'FINANCE STAGING RECOVERY READINESS: ACTION_REQUIRED' -ForegroundColor Yellow
Write-Host 'Main staging is healthy; isolated restore target and hosted restore/rollback/forward-fix drills remain unverified; preProductionDecision: NO_GO.'
