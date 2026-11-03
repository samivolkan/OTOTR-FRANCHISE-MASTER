[CmdletBinding()]
param(
  [switch]$RequireMatched,
  [string]$EvidenceFile = (Join-Path $PSScriptRoot '..\docs\finance\staging-reconciliation-evidence.json')
)
$ErrorActionPreference = 'Stop'
$evidence = Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile) | ConvertFrom-Json -Depth 30
if ($evidence.schemaVersion -ne 1 -or $evidence.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $evidence.target -ne 'STAGING') { throw 'Invalid staging reconciliation identity.' }
if ($evidence.productionDataUsed -or $evidence.pilotDataClassification -ne 'SYNTHETIC_OR_ANONYMIZED' -or $evidence.productionDecision -ne 'NO_GO') { throw 'Reconciliation must use synthetic/anonymized pilot data and remain NO_GO.' }
$allowedStatuses = @('NOT_RUN','RUNNING','MISMATCH','MATCHED')
if ($evidence.status -notin $allowedStatuses) { throw 'Invalid reconciliation status.' }
$expectedMetrics = @('SOURCE_EVENT_COUNT','COLLECTED_GROSS','REFUNDED_GROSS','ACCRUAL_GROSS','JOURNAL_DEBIT','JOURNAL_CREDIT','OPEN_ITEM_DEBIT','OPEN_ITEM_CREDIT','PAYMENT_TOTAL','ALLOCATION_TOTAL','BILLING_GROSS','ACCOUNTING_EXPORT_BALANCE')
$metrics = @($evidence.controlTotals | ForEach-Object metric)
if ($metrics.Count -ne 12 -or @($metrics | Sort-Object -Unique).Count -ne 12 -or @($expectedMetrics | Where-Object { $_ -notin $metrics }).Count) { throw 'Reconciliation control-total inventory is incomplete.' }
$serialized = $evidence | ConvertTo-Json -Depth 30
if ($serialized -match '(?i)customerName|fullName|phone|email|plate|tckn|vkn|iban|bankAccount|address') { throw 'Reconciliation evidence contains a forbidden personal-data field.' }

if ($evidence.status -eq 'MATCHED') {
  foreach ($name in @('environmentId','deployedCommit','startedAtUtc','completedAtUtc','executedBy','cutoffAtUtc')) { if ([string]::IsNullOrWhiteSpace($evidence.run.$name)) { throw "Matched run metadata missing: $name" } }
  if ($evidence.run.deployedCommit -notmatch '^[a-f0-9]{40}$') { throw 'Deployed commit must be a full Git SHA.' }
  foreach ($name in @('startedAtUtc','completedAtUtc','cutoffAtUtc')) { [void][DateTimeOffset]::Parse($evidence.run.$name, [Globalization.CultureInfo]::InvariantCulture) }
  if ($evidence.snapshots.sourceSha256 -notmatch '^[a-f0-9]{64}$' -or $evidence.snapshots.targetSha256 -notmatch '^[a-f0-9]{64}$') { throw 'Source and target snapshot hashes are required.' }
  foreach ($name in @('sourceCount','targetCount','unmappedCount','duplicateCount')) { if ($null -eq $evidence.identityMapping.$name -or [long]$evidence.identityMapping.$name -lt 0) { throw "Invalid identity mapping total: $name" } }
  if ([long]$evidence.identityMapping.sourceCount -ne [long]$evidence.identityMapping.targetCount -or [long]$evidence.identityMapping.unmappedCount -ne 0 -or [long]$evidence.identityMapping.duplicateCount -ne 0) { throw 'Identity mapping totals do not reconcile.' }
  foreach ($total in $evidence.controlTotals) {
    if ($null -eq $total.sourceValue -or $null -eq $total.targetValue -or $null -eq $total.difference) { throw "Control total is incomplete: $($total.metric)" }
    $source = [decimal]::Parse([string]$total.sourceValue, [Globalization.CultureInfo]::InvariantCulture)
    $target = [decimal]::Parse([string]$total.targetValue, [Globalization.CultureInfo]::InvariantCulture)
    $difference = [decimal]::Parse([string]$total.difference, [Globalization.CultureInfo]::InvariantCulture)
    if ($difference -ne ($target - $source) -or $difference -ne 0) { throw "Control total mismatch: $($total.metric)" }
  }
  if (@($evidence.exceptions).Count -gt 0) { throw 'MATCHED evidence cannot contain unresolved exceptions.' }
}
Write-Host "FINANCE STAGING RECONCILIATION: $($evidence.status)" -ForegroundColor $(if ($evidence.status -eq 'MATCHED') {'Green'} else {'Yellow'})
Write-Host 'Identity mapping and 12 source-target control totals are fail-closed; productionDataUsed: false.'
if ($RequireMatched -and $evidence.status -ne 'MATCHED') { throw 'Staging reconciliation has not matched.' }
