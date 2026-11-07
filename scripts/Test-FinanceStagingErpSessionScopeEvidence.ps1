[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-erp-session-scope-resolver.json'))
$ErrorActionPreference='Stop'
$raw=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)
$d=$raw|ConvertFrom-Json -Depth 20
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'STAGING_ERP_SESSION_SCOPE_RESOLVER'-or$d.projectRef-ne'bsjkohwbtrfwrqcyhsfz'-or$d.productionDataUsed){throw'Invalid staging ERP session scope evidence identity.'}
if(-not$d.migration.applied-or$d.migration.hostedVersion-ne'20261107041537'-or$d.migration.name-ne'finance_erp_session_scope_resolver'){throw'Staging ERP session resolver migration is not evidenced.'}
$c=$d.controls
if(-not$c.functionPresent-or-not$c.serviceRoleExecute-or$c.authenticatedExecute-or$c.anonExecute-or$c.activeBranchManagerCount-ne 2-or$c.activeMappingCount-ne 3-or$c.scopeInputFromBrowser-or-not$c.actorBoundToVerifiedAuthUser){throw'Staging ERP session resolver controls are unsafe or stale.'}
if($d.securityAdvisor.resolverFindingCount-ne 0-or-not$d.securityAdvisor.projectWideExistingWarningsUnchanged-or$d.status-ne'STAGING_DATABASE_VERIFIED'-or$d.preProductionDecision-ne'NO_GO'-or@($d.remaining).Count-lt 3){throw'Staging ERP session resolver decision is invalid.'}
if($raw-match'(?i)(bearer\s+[a-z0-9._-]{20,}|service[_-]?role[_-]?key|password\s*[:=]|@[a-z0-9.-]+\.[a-z]{2,})'){throw'Staging ERP session resolver evidence contains a credential or personal identifier.'}
Write-Host 'FINANCE STAGING ERP SESSION SCOPE EVIDENCE: PASSED' -ForegroundColor Green
Write-Host 'Service-only resolver, two branch managers, three active mappings, zero browser scope input and zero resolver advisor findings verified; preProductionDecision: NO_GO.'
