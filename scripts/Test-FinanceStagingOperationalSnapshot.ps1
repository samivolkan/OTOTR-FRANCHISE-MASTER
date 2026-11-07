[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-finance-operational-snapshot.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 30
if($e.schemaVersion-ne 1-or$e.module-ne'OTOTR_FRANCHISE_FINANCE'-or$e.target-ne'STAGING'-or$e.environment-ne'ototr-staging'-or$e.projectRef-ne'bsjkohwbtrfwrqcyhsfz'){throw'Invalid staging finance operational snapshot identity.'}
if($e.productionDataUsed-or$e.preProductionDecision-ne'NO_GO'-or$e.interpretation.status-ne'ACTION_REQUIRED'){throw'Operational snapshot must remain production-free and fail-closed.'}
$o=$e.databaseAggregate.outbox
if($o.pending-ne 11-or$o.processing-ne 0-or$o.published-ne 0-or$o.deadLetter-ne 0-or$o.oldestPendingAgeSeconds-le 900-or$o.minimumAttemptCount-ne 0-or$o.maximumAttemptCount-ne 0){throw'Outbox backlog evidence changed without a refreshed staging snapshot.'}
$s=$e.databaseAggregate.sourceEvents
if($s.processed-ne 3-or$s.received-ne 0-or$s.processing-ne 0-or$s.failed-ne 0){throw'Source-event terminal state evidence is invalid.'}
if($e.databaseAggregate.integrationErrors.open-ne 0-or-not$e.interpretation.candidateThresholdBreached-or$e.interpretation.dispatcherActivityProven-or$e.interpretation.alertDeliveryProven){throw'Operational blocker interpretation is not fail-closed.'}
if(@($e.outboxCategories|Measure-Object pending -Sum).Sum-ne 11-or@($e.outboxCategories).Count-ne 6){throw'Outbox category totals do not reconcile.'}
$raw=$e|ConvertTo-Json -Depth 30
if($raw-match'(?i)password|token|authorization|bearer\s+|sb_secret_|eyJ[A-Za-z0-9_-]{20,}|customerName|phone|email|ipAddress'){throw 'Operational snapshot contains a secret or personal-data field.'}
Write-Host 'FINANCE STAGING OPERATIONAL SNAPSHOT: ACTION_REQUIRED' -ForegroundColor Yellow
Write-Host '11 pending outbox records, zero attempts and oldest > 15 minutes; dispatcher and alert delivery remain unverified; preProductionDecision: NO_GO.'
