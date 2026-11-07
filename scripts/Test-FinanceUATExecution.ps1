[CmdletBinding()]
param(
  [switch]$RequirePassed,
  [string]$EvidenceFile = (Join-Path $PSScriptRoot '..\docs\finance\uat-execution-evidence.json')
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$document = Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile) | ConvertFrom-Json -Depth 30
if ($document.schemaVersion -ne 1 -or $document.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $document.target -ne 'STAGING_UAT') { throw 'Invalid finance UAT execution identity.' }
if ($document.productionDataUsed -or $document.preProductionDecision -ne 'NO_GO' -or $document.uatDecision -notin @('NOT_SIGNED','FAILED','PASSED')) { throw 'UAT execution policy is invalid.' }
$roles = @('Finans Operasyon','Finans Operasyon','Finans Kontrol','Mali Müşavir','Franchise Yönetimi','Operasyon','Finans Operasyon','Finans Kontrol','Finans Direktörü','Finans Operasyon','Finans Kontrol','Muhasebe','Mali Müşavir','Finans Direktörü','Pilot Bayi Yetkilisi','Bilgi Güvenliği','ERP Teknik Lideri','KVKK Sorumlusu','Franchise Yönetimi')
if (@($document.scenarios).Count -ne 19) { throw 'Expected 19 UAT execution scenarios.' }
$ids = @{}
for ($i = 0; $i -lt 19; $i++) {
  $scenario = $document.scenarios[$i]
  $expectedId = 'UAT-FIN-{0:d2}' -f ($i + 1)
  if ($scenario.id -ne $expectedId -or $ids.ContainsKey($scenario.id)) { throw "Invalid or duplicate UAT scenario: $($scenario.id)" }
  $ids[$scenario.id] = $true
  if ($scenario.approvalRole -ne $roles[$i] -or $scenario.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw "Invalid role or status for $($scenario.id)" }
  if ($scenario.status -eq 'PASSED') {
    foreach ($name in @('executorCorporateId','approverCorporateId','executedAtUtc','approvedAtUtc','expectedResultSha256','actualResultSha256')) { if ([string]::IsNullOrWhiteSpace($scenario.$name)) { throw "Passed scenario field missing for $($scenario.id): $name" } }
    if ($scenario.executorCorporateId -eq $scenario.approverCorporateId) { throw "Maker-checker separation failed for $($scenario.id)" }
    if ($scenario.expectedResultSha256 -notmatch '^[a-f0-9]{64}$' -or $scenario.actualResultSha256 -notmatch '^[a-f0-9]{64}$' -or $scenario.controlTotalsMatch -ne $true) { throw "Result evidence invalid for $($scenario.id)" }
    [void][DateTimeOffset]::Parse($scenario.executedAtUtc, [Globalization.CultureInfo]::InvariantCulture)
    [void][DateTimeOffset]::Parse($scenario.approvedAtUtc, [Globalization.CultureInfo]::InvariantCulture)
    if (-not $scenario.evidence -or @($scenario.evidence).Count -lt 1) { throw "Evidence missing for $($scenario.id)" }
    foreach ($item in $scenario.evidence) {
      if ([string]::IsNullOrWhiteSpace($item.path) -or $item.path -match '^[A-Za-z]:|^\\|^/') { throw "Evidence path must be repository-relative for $($scenario.id)" }
      $path = [IO.Path]::GetFullPath((Join-Path $root $item.path))
      if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf)) { throw "Evidence file missing for $($scenario.id)" }
      $hash = (Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($item.sha256 -notmatch '^[a-f0-9]{64}$' -or $hash -ne $item.sha256) { throw "Evidence hash mismatch for $($scenario.id)" }
    }
  }
}
if ($document.uatDecision -eq 'PASSED') {
  foreach ($name in @('environmentId','deployedCommit','startedAtUtc','completedAtUtc')) { if ([string]::IsNullOrWhiteSpace($document.run.$name)) { throw "Passed UAT run metadata missing: $name" } }
  if ($document.run.deployedCommit -notmatch '^[a-f0-9]{40}$' -or @($document.scenarios | Where-Object status -ne 'PASSED').Count -gt 0) { throw 'UAT cannot pass until all scenarios pass on a full commit SHA.' }
}
Write-Host "FINANCE UAT EXECUTION: $($document.uatDecision)" -ForegroundColor $(if ($document.uatDecision -eq 'PASSED') {'Green'} else {'Yellow'})
Write-Host "Scenarios: 19; passed: $(@($document.scenarios | Where-Object status -eq 'PASSED').Count); productionDataUsed: false; preProductionDecision: NO_GO"
if ($RequirePassed -and $document.uatDecision -ne 'PASSED') { throw 'Finance UAT has not been signed and passed.' }
