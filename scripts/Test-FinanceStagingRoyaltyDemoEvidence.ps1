[CmdletBinding()]
param([string]$EvidenceFile=(Join-Path $PSScriptRoot '..\docs\finance\evidence\2026-11-07-staging-royalty-demo-database-audit.json'))
$ErrorActionPreference='Stop'
$e=Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile)|ConvertFrom-Json -Depth 30
if($e.schemaVersion-ne 1-or $e.module-ne'OTOTR_FRANCHISE_FINANCE'-or $e.target-ne'STAGING'-or $e.environment-ne'ototr-staging'){throw 'Invalid staging royalty demo evidence identity.'}
if($e.productionDataUsed-or $e.dataClassification-ne'SYNTHETIC_AGGREGATE_ONLY'-or $e.gateImpact.preProductionDecision-ne'NO_GO'){throw 'Staging royalty demo evidence must remain synthetic and NO_GO.'}
$b1=$e.branchResults|Where-Object { $_.branchReference -eq 'BRANCH:SCOPE-B1' }
$b2=$e.branchResults|Where-Object { $_.branchReference -eq 'BRANCH:SCOPE-B2' }
if($null-eq$b1-or$null-eq$b2-or@($e.branchResults).Count-ne 2){throw 'Both staging branch results are required.'}
if([decimal]$b1.settledCollectionGross-ne 1000-or[decimal]$b1.refundedGross-ne 200-or[decimal]$b1.royaltyAccrualGross-ne 96-or[decimal]$b1.openItemNet-ne 96-or[decimal]$b1.billingGross-ne 96){throw 'SCOPE-B1 600/400/200 -> 96 totals are inconsistent.'}
if([decimal]$b2.settledCollectionGross-ne 0-or[decimal]$b2.royaltyAccrualGross-ne 0){throw 'SCOPE-B2 must remain explicitly unverified.'}
if([decimal]$e.scopeB1Trace.journalDebit-ne[decimal]$e.scopeB1Trace.journalCredit){throw 'Staging journal is not balanced.'}
if(@($e.scopeB1Trace.sourceEventSequence|Where-Object { $_.status -ne 'PROCESSING' }).Count-ne 0){throw 'Expected source-event PROCESSING discrepancy changed without evidence refresh.'}
if(@($e.notVerified).Count-lt 4-or$e.gateImpact.'FIN-G05'-ne'PENDING'-or$e.gateImpact.'FIN-G06'-ne'PENDING'){throw 'Known staging gaps must remain visible.'}
$raw=$e|ConvertTo-Json -Depth 30
if($raw-match'(?i)customerName|fullName|phone|email|plate|tckn|vkn|iban|bankAccount|address|password|token'){throw 'Staging evidence contains forbidden sensitive fields.'}
Write-Host 'FINANCE STAGING ROYALTY DEMO EVIDENCE: PASSED' -ForegroundColor Green
Write-Host 'SCOPE-B1 600/400/200 -> 96 verified at database level; SCOPE-B2, ERP browser initiation and role views remain explicitly unverified.'

