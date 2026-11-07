[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$SourceSnapshotFile,
  [Parameter(Mandatory)][string]$TargetSnapshotFile,
  [Parameter(Mandatory)][string]$OutputFile,
  [Parameter(Mandatory)][string]$ExecutedBy,
  [Parameter(Mandatory)][string]$StartedAtUtc,
  [Parameter(Mandatory)][string]$CompletedAtUtc
)
$ErrorActionPreference = 'Stop'
$expectedMetrics = @(
  'SOURCE_EVENT_COUNT','COLLECTED_GROSS','REFUNDED_GROSS','ACCRUAL_GROSS',
  'JOURNAL_DEBIT','JOURNAL_CREDIT','OPEN_ITEM_DEBIT','OPEN_ITEM_CREDIT',
  'PAYMENT_TOTAL','ALLOCATION_TOTAL','BILLING_GROSS','ACCOUNTING_EXPORT_BALANCE'
)
$forbidden = '(?i)customerName|fullName|phone|email|plate|tckn|vkn|iban|bankAccount|address'

function Read-SafeSnapshot([string]$Path, [string]$Label) {
  $resolved = Resolve-Path -LiteralPath $Path
  $raw = Get-Content -Raw -LiteralPath $resolved
  if ($raw -match $forbidden) { throw "$Label snapshot contains a forbidden personal-data field." }
  $snapshot = $raw | ConvertFrom-Json -Depth 30
  if ($snapshot.schemaVersion -ne 1 -or $snapshot.dataClassification -ne 'SYNTHETIC_OR_ANONYMIZED' -or $snapshot.productionDataUsed -ne $false) {
    throw "$Label snapshot must be schema v1 synthetic/anonymized data with productionDataUsed=false."
  }
  foreach ($name in @('environmentId','deployedCommit','cutoffAtUtc')) {
    if ([string]::IsNullOrWhiteSpace($snapshot.$name)) { throw "$Label snapshot metadata missing: $name" }
  }
  if ($snapshot.deployedCommit -notmatch '^[a-f0-9]{40}$') { throw "$Label deployedCommit must be a full Git SHA." }
  [void][DateTimeOffset]::Parse($snapshot.cutoffAtUtc, [Globalization.CultureInfo]::InvariantCulture)
  $metricNames = @($snapshot.controlTotals.PSObject.Properties.Name)
  if ($metricNames.Count -ne 12 -or @($expectedMetrics | Where-Object { $_ -notin $metricNames }).Count) { throw "$Label control-total inventory is incomplete." }
  $identities = @($snapshot.identityReferences)
  if (@($identities | Where-Object { $_ -notmatch '^[A-Z0-9][A-Z0-9:_-]{2,119}$' }).Count) { throw "$Label contains an invalid masked identity reference." }
  if (@($identities | Sort-Object -Unique).Count -ne $identities.Count) { throw "$Label contains duplicate identity references." }
  return [pscustomobject]@{ Path=$resolved.Path; Raw=$raw; Value=$snapshot; Identities=$identities }
}

$source = Read-SafeSnapshot $SourceSnapshotFile 'Source'
$target = Read-SafeSnapshot $TargetSnapshotFile 'Target'
if ($source.Value.environmentId -ne $target.Value.environmentId -or $source.Value.deployedCommit -ne $target.Value.deployedCommit -or $source.Value.cutoffAtUtc -ne $target.Value.cutoffAtUtc) {
  throw 'Source and target snapshot run metadata do not match.'
}
[void][DateTimeOffset]::Parse($StartedAtUtc, [Globalization.CultureInfo]::InvariantCulture)
[void][DateTimeOffset]::Parse($CompletedAtUtc, [Globalization.CultureInfo]::InvariantCulture)

$sourceSet = @{}; foreach ($id in $source.Identities) { $sourceSet[$id] = $true }
$targetSet = @{}; foreach ($id in $target.Identities) { $targetSet[$id] = $true }
$unmapped = @($source.Identities | Where-Object { -not $targetSet.ContainsKey($_) })
$unexpected = @($target.Identities | Where-Object { -not $sourceSet.ContainsKey($_) })
$exceptions = [System.Collections.Generic.List[object]]::new()
$totals = foreach ($metric in $expectedMetrics) {
  $sourceValue = [decimal]::Parse([string]$source.Value.controlTotals.$metric, [Globalization.CultureInfo]::InvariantCulture)
  $targetValue = [decimal]::Parse([string]$target.Value.controlTotals.$metric, [Globalization.CultureInfo]::InvariantCulture)
  $difference = $targetValue - $sourceValue
  if ($difference -ne 0) { $exceptions.Add([ordered]@{type='CONTROL_TOTAL_MISMATCH';metric=$metric;difference=$difference.ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)}) }
  [ordered]@{
    metric=$metric
    currency=$(if ($metric -eq 'SOURCE_EVENT_COUNT') {'N/A'} else {'TRY'})
    sourceValue=$sourceValue.ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
    targetValue=$targetValue.ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
    difference=$difference.ToString('0.########',[Globalization.CultureInfo]::InvariantCulture)
  }
}
foreach ($id in $unmapped) { $exceptions.Add([ordered]@{type='UNMAPPED_SOURCE_IDENTITY';identityReference=$id}) }
foreach ($id in $unexpected) { $exceptions.Add([ordered]@{type='UNEXPECTED_TARGET_IDENTITY';identityReference=$id}) }
$matched = $exceptions.Count -eq 0 -and $source.Identities.Count -eq $target.Identities.Count

$evidence = [ordered]@{
  schemaVersion=1; module='OTOTR_FRANCHISE_FINANCE'; target='STAGING'; status=$(if($matched){'MATCHED'}else{'MISMATCH'})
  productionDataUsed=$false; pilotDataClassification='SYNTHETIC_OR_ANONYMIZED'
  run=[ordered]@{environmentId=$source.Value.environmentId;deployedCommit=$source.Value.deployedCommit;startedAtUtc=$StartedAtUtc;completedAtUtc=$CompletedAtUtc;executedBy=$ExecutedBy;cutoffAtUtc=$source.Value.cutoffAtUtc}
  snapshots=[ordered]@{sourceSha256=(Get-FileHash -LiteralPath $source.Path -Algorithm SHA256).Hash.ToLowerInvariant();targetSha256=(Get-FileHash -LiteralPath $target.Path -Algorithm SHA256).Hash.ToLowerInvariant()}
  identityMapping=[ordered]@{sourceCount=$source.Identities.Count;targetCount=$target.Identities.Count;unmappedCount=$unmapped.Count;duplicateCount=0}
  controlTotals=@($totals);exceptions=@($exceptions);productionDecision='NO_GO'
}
$outputFull = [IO.Path]::GetFullPath($OutputFile)
$outputDirectory = Split-Path -Parent $outputFull
if (-not (Test-Path -LiteralPath $outputDirectory -PathType Container)) { throw "Output directory does not exist: $outputDirectory" }
[IO.File]::WriteAllText($outputFull, ($evidence | ConvertTo-Json -Depth 30), [Text.UTF8Encoding]::new($false))
Write-Host "FINANCE STAGING RECONCILIATION EVIDENCE: $($evidence.status)" -ForegroundColor $(if($matched){'Green'}else{'Yellow'})
Write-Host "Identity references: $($source.Identities.Count) source / $($target.Identities.Count) target; exceptions: $($exceptions.Count); productionDataUsed: false."

