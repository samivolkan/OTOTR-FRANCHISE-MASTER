[CmdletBinding()]
param(
  [switch]$RequireGo,
  [string]$GateFile = (Join-Path $PSScriptRoot '..\docs\finance\uat-preproduction-gates.json')
)

$ErrorActionPreference = 'Stop'
$resolvedGateFile = (Resolve-Path -LiteralPath $GateFile).Path
$root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$document = Get-Content -Raw -LiteralPath $resolvedGateFile | ConvertFrom-Json -Depth 20

if ($document.schemaVersion -ne 1 -or $document.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $document.target -ne 'PREPRODUCTION') {
  throw 'Invalid finance pre-production gate document identity.'
}
if (-not $document.policy.allGatesMustPass -or $document.policy.defaultDecision -ne 'NO_GO' -or $document.policy.productionDataAllowed) {
  throw 'Finance pre-production policy must fail closed and forbid production data.'
}

$allowedStatuses = @('PENDING','PASSED','FAILED','BLOCKED')
$ids = @{}
$results = foreach ($gate in $document.gates) {
  if ($gate.id -notmatch '^FIN-G\d{2}$' -or $ids.ContainsKey($gate.id)) { throw "Invalid or duplicate finance gate id: $($gate.id)" }
  $ids[$gate.id] = $true
  if ($allowedStatuses -notcontains $gate.status) { throw "Invalid status for $($gate.id): $($gate.status)" }
  if ([string]::IsNullOrWhiteSpace($gate.owner) -or -not $gate.approvers -or $gate.approvers.Count -lt 1) { throw "Owner and approver are required for $($gate.id)" }
  if ($gate.status -eq 'PASSED') {
    if (-not $gate.evidence -or $gate.evidence.Count -lt 1) { throw "PASSED gate has no evidence: $($gate.id)" }
    foreach ($evidence in $gate.evidence) {
      if ([string]::IsNullOrWhiteSpace($evidence.path) -or $evidence.path -match '^[A-Za-z]:|^\\\\|^/') { throw "Evidence path must be repository-relative for $($gate.id)" }
      $evidencePath = [IO.Path]::GetFullPath((Join-Path $root $evidence.path))
      if (-not $evidencePath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $evidencePath -PathType Leaf)) { throw "Evidence file missing or outside repository for $($gate.id): $($evidence.path)" }
      $actualHash = (Get-FileHash -LiteralPath $evidencePath -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($evidence.sha256 -notmatch '^[0-9a-fA-F]{64}$' -or $actualHash -ne $evidence.sha256.ToLowerInvariant()) { throw "Evidence hash mismatch for $($gate.id): $($evidence.path)" }
      if ([string]::IsNullOrWhiteSpace($evidence.signedBy) -or [string]::IsNullOrWhiteSpace($evidence.signedAtUtc)) { throw "Evidence signoff missing for $($gate.id): $($evidence.path)" }
      [void][DateTimeOffset]::Parse($evidence.signedAtUtc, [Globalization.CultureInfo]::InvariantCulture)
    }
  } elseif ([string]::IsNullOrWhiteSpace($gate.blockingReason)) {
    throw "Non-passed gate requires blockingReason: $($gate.id)"
  }
  [pscustomobject]@{ id=$gate.id; name=$gate.name; owner=$gate.owner; status=$gate.status; evidenceCount=@($gate.evidence).Count }
}

if ($results.Count -ne 12) { throw "Expected 12 finance pre-production gates, found $($results.Count)." }
if (($results | Where-Object id -eq 'FIN-G12').status -eq 'PASSED' -and @($results | Where-Object { $_.id -ne 'FIN-G12' -and $_.status -ne 'PASSED' }).Count -gt 0) {
  throw 'FIN-G12 cannot pass before FIN-G01 through FIN-G11.'
}
$decision = if (@($results | Where-Object status -ne 'PASSED').Count -eq 0) { 'GO' } else { 'NO_GO' }
$summary = [pscustomobject]@{
  module = $document.module
  target = $document.target
  decision = $decision
  passed = @($results | Where-Object status -eq 'PASSED').Count
  total = $results.Count
  pendingGateIds = @($results | Where-Object status -ne 'PASSED' | ForEach-Object id)
  productionDataUsed = $false
}

Write-Host ("FINANCE PRE-PRODUCTION READINESS: {0} ({1}/{2} passed)" -f $decision,$summary.passed,$summary.total) -ForegroundColor $(if ($decision -eq 'GO') {'Green'} else {'Yellow'})
$results | Format-Table -AutoSize
$summary | ConvertTo-Json -Depth 5
if ($RequireGo -and $decision -ne 'GO') { throw "Finance pre-production gate is NO_GO: $($summary.pendingGateIds -join ', ')" }
