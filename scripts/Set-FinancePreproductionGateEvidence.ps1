[CmdletBinding(SupportsShouldProcess)]
param(
  [Parameter(Mandatory)][ValidatePattern('^FIN-G\d{2}$')][string]$GateId,
  [Parameter(Mandatory)][string]$EvidencePath,
  [Parameter(Mandatory)][string]$SignedBy,
  [Parameter(Mandatory)][string]$SignedRole,
  [string]$SignedAtUtc = [DateTimeOffset]::UtcNow.ToString('o'),
  [string]$GateFile = (Join-Path $PSScriptRoot '..\docs\finance\uat-preproduction-gates.json')
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$resolvedGateFile = (Resolve-Path -LiteralPath $GateFile).Path
$document = Get-Content -Raw -LiteralPath $resolvedGateFile | ConvertFrom-Json -Depth 30
$gate = @($document.gates | Where-Object id -eq $GateId)
if ($gate.Count -ne 1) { throw "Gate not found or duplicated: $GateId" }
$gate = $gate[0]

$allowedRoles = @($gate.owner) + @($gate.approvers)
if ($SignedRole -notin $allowedRoles) { throw "Role is not authorized to sign $GateId. Allowed roles: $($allowedRoles -join ', ')" }
if ([string]::IsNullOrWhiteSpace($SignedBy)) { throw 'SignedBy is required.' }
$signedTime = [DateTimeOffset]::Parse($SignedAtUtc, [Globalization.CultureInfo]::InvariantCulture)
if ($signedTime -gt [DateTimeOffset]::UtcNow.AddMinutes(5)) { throw 'Signoff time cannot be in the future.' }

if ([IO.Path]::IsPathRooted($EvidencePath)) { throw 'EvidencePath must be repository-relative.' }
$resolvedEvidence = [IO.Path]::GetFullPath((Join-Path $root $EvidencePath))
if (-not $resolvedEvidence.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $resolvedEvidence -PathType Leaf)) { throw 'Evidence file is missing or outside the repository.' }
$relativeEvidence = [IO.Path]::GetRelativePath($root, $resolvedEvidence).Replace('\','/')
$hash = (Get-FileHash -LiteralPath $resolvedEvidence -Algorithm SHA256).Hash.ToLowerInvariant()

$existing = @($gate.evidence | Where-Object { $_.path -eq $relativeEvidence -and $_.signedRole -eq $SignedRole })
if ($existing.Count -gt 0) { throw "This evidence and role signoff is already registered for $GateId." }
$newEvidence = [pscustomobject]@{
  path = $relativeEvidence
  sha256 = $hash
  signedBy = $SignedBy.Trim()
  signedRole = $SignedRole
  signedAtUtc = $signedTime.ToUniversalTime().ToString('o')
}
$gate.evidence = @($gate.evidence) + @($newEvidence)
$signedRoles = @($gate.evidence | ForEach-Object signedRole | Sort-Object -Unique)
$missingRoles = @($allowedRoles | Where-Object { $_ -notin $signedRoles })
if ($missingRoles.Count -eq 0) {
  $officialGateFile = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../docs/finance/uat-preproduction-gates.json')).Path
  if ($GateId -eq 'FIN-G01' -and $resolvedGateFile -eq $officialGateFile) {
    & (Join-Path $PSScriptRoot 'Test-FinanceCommercialConfiguration.ps1') -RequireApproved
  }
  $gate.status = 'PASSED'
  $gate.blockingReason = $null
} else {
  $gate.status = 'PENDING'
  $gate.blockingReason = "Eksik zorunlu imza rolleri: $($missingRoles -join ', ')"
}
$document.updatedAtUtc = [DateTimeOffset]::UtcNow.ToString('o')

if ($PSCmdlet.ShouldProcess($resolvedGateFile, "Register evidence for $GateId as $SignedRole")) {
  $json = $document | ConvertTo-Json -Depth 30
  [IO.File]::WriteAllText($resolvedGateFile, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
}
[pscustomobject]@{ gateId=$GateId; status=$gate.status; signedRole=$SignedRole; missingRoles=$missingRoles; sha256=$hash }
