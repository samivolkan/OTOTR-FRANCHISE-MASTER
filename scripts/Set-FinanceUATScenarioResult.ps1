[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory)][ValidatePattern('^UAT-FIN-(0[1-9]|1[0-9])$')][string]$ScenarioId,
  [Parameter(Mandatory)][ValidateSet('PASSED','FAILED')][string]$Status,
  [Parameter(Mandatory)][string]$ExecutorCorporateId,
  [Parameter(Mandatory)][string]$ApproverCorporateId,
  [Parameter(Mandatory)][string]$ExpectedResultFile,
  [Parameter(Mandatory)][string]$ActualResultFile,
  [Parameter(Mandatory)][string[]]$EvidencePath,
  [Parameter(Mandatory)][bool]$ControlTotalsMatch,
  [Parameter(Mandatory)][string]$ExecutedAtUtc,
  [Parameter(Mandatory)][string]$ApprovedAtUtc,
  [string]$EvidenceFile = (Join-Path $PSScriptRoot '..\docs\finance\uat-execution-evidence.json')
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$resolvedEvidenceFile = (Resolve-Path -LiteralPath $EvidenceFile).Path
$document = Get-Content -Raw -LiteralPath $resolvedEvidenceFile | ConvertFrom-Json -Depth 30
if ($document.schemaVersion -ne 1 -or $document.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $document.target -ne 'STAGING_UAT') { throw 'Invalid finance UAT execution identity.' }
if ($document.productionDataUsed -or $document.preProductionDecision -ne 'NO_GO') { throw 'UAT result recording is allowed only for non-production NO_GO evidence.' }
$scenario = @($document.scenarios | Where-Object id -eq $ScenarioId)
if ($scenario.Count -ne 1) { throw "Scenario not found or duplicated: $ScenarioId" }
$scenario = $scenario[0]
if ($scenario.status -ne 'NOT_RUN' -and $scenario.status -ne 'RUNNING') { throw "Scenario result is already final: $ScenarioId" }
foreach ($identity in @($ExecutorCorporateId,$ApproverCorporateId)) {
  if ([string]::IsNullOrWhiteSpace($identity) -or $identity -notmatch '^[A-Za-z0-9][A-Za-z0-9._:@-]{2,119}$') { throw 'Corporate identities must be masked stable identifiers.' }
}
if ($ExecutorCorporateId -eq $ApproverCorporateId) { throw 'Maker-checker separation failed: executor and approver must be different.' }
if ($Status -eq 'PASSED' -and -not $ControlTotalsMatch) { throw 'A passed UAT scenario requires matching control totals.' }
$executed = [DateTimeOffset]::Parse($ExecutedAtUtc,[Globalization.CultureInfo]::InvariantCulture)
$approved = [DateTimeOffset]::Parse($ApprovedAtUtc,[Globalization.CultureInfo]::InvariantCulture)
if ($approved -lt $executed -or $approved -gt [DateTimeOffset]::UtcNow.AddMinutes(5)) { throw 'UAT approval time must be after execution and cannot be in the future.' }

function Resolve-RepositoryArtifact([string]$Path,[string]$Label) {
  if ([IO.Path]::IsPathRooted($Path)) { throw "$Label must be repository-relative." }
  $full = [IO.Path]::GetFullPath((Join-Path $root $Path))
  if (-not $full.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $full -PathType Leaf)) { throw "$Label is missing or outside the repository." }
  $raw = Get-Content -Raw -LiteralPath $full
  if ($raw -match '(?i)(password|authorization|service[_-]?role|secret|token)\s*[=:]\s*["''][^"'']+') { throw "$Label contains a secret-like value." }
  [pscustomobject]@{path=[IO.Path]::GetRelativePath($root,$full).Replace('\','/');sha256=(Get-FileHash -LiteralPath $full -Algorithm SHA256).Hash.ToLowerInvariant()}
}

$expected = Resolve-RepositoryArtifact $ExpectedResultFile 'Expected result file'
$actual = Resolve-RepositoryArtifact $ActualResultFile 'Actual result file'
$artifacts = @($EvidencePath | ForEach-Object { Resolve-RepositoryArtifact $_ 'Evidence file' })
if ($artifacts.Count -lt 1) { throw 'At least one evidence file is required.' }
$scenario.status = $Status
$scenario.executorCorporateId = $ExecutorCorporateId.Trim()
$scenario.approverCorporateId = $ApproverCorporateId.Trim()
$scenario.executedAtUtc = $executed.ToUniversalTime().ToString('o')
$scenario.approvedAtUtc = $approved.ToUniversalTime().ToString('o')
$scenario.expectedResultSha256 = $expected.sha256
$scenario.actualResultSha256 = $actual.sha256
$scenario.controlTotalsMatch = $ControlTotalsMatch
$scenario.evidence = @($artifacts | Sort-Object path -Unique)
$document.uatDecision = if (@($document.scenarios | Where-Object status -eq 'FAILED').Count) {'FAILED'} else {'NOT_SIGNED'}

if ($PSCmdlet.ShouldProcess($resolvedEvidenceFile,"Record $ScenarioId as $Status")) {
  [IO.File]::WriteAllText($resolvedEvidenceFile,($document | ConvertTo-Json -Depth 30) + [Environment]::NewLine,[Text.UTF8Encoding]::new($false))
}
[pscustomobject]@{scenarioId=$ScenarioId;status=$Status;approvalRole=$scenario.approvalRole;controlTotalsMatch=$ControlTotalsMatch;evidenceCount=$scenario.evidence.Count;uatDecision=$document.uatDecision}
