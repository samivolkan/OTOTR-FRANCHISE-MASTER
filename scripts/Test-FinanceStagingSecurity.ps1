[CmdletBinding()]
param(
  [switch]$RequirePassed,
  [string]$EvidenceFile = (Join-Path $PSScriptRoot '..\docs\finance\staging-security-evidence.json')
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$document = Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile) | ConvertFrom-Json -Depth 30
if ($document.schemaVersion -ne 1 -or $document.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $document.target -ne 'PREPRODUCTION_SECURITY') { throw 'Invalid finance security evidence identity.' }
if ($document.productionDataUsed -or $document.preProductionDecision -ne 'NO_GO' -or $document.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw 'Finance security evidence policy is invalid.' }
$expected = @('RLS ve ham tablo erişimi','IDOR ve çapraz şube izolasyonu','Export yetkilendirmesi','Service-role mutasyon izolasyonu','Log ve hata maskeleme','Veri minimizasyonu','DLP ve kişisel veri sızıntısı','JWT rol ve şube kapsamı')
if (@($document.controls).Count -ne 8) { throw 'Expected eight finance security controls.' }
for ($i = 0; $i -lt 8; $i++) {
  $control = $document.controls[$i]
  $id = 'SEC-FIN-{0:d2}' -f ($i + 1)
  if ($control.id -ne $id -or $control.name -ne $expected[$i] -or $control.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw "Invalid security control: $($control.id)" }
  if ($control.status -eq 'PASSED') {
    if (-not $control.evidence -or @($control.evidence).Count -lt 1) { throw "Security evidence missing: $id" }
    foreach ($item in $control.evidence) {
      if ([string]::IsNullOrWhiteSpace($item.path) -or $item.path -match '^[A-Za-z]:|^\\|^/') { throw "Security evidence path must be repository-relative: $id" }
      $path = [IO.Path]::GetFullPath((Join-Path $root $item.path))
      if (-not $path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf)) { throw "Security evidence missing or outside repository: $id" }
      $hash = (Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant()
      if ($item.sha256 -notmatch '^[a-f0-9]{64}$' -or $hash -ne $item.sha256) { throw "Security evidence hash mismatch: $id" }
    }
  }
}
if ($document.status -eq 'PASSED') {
  foreach ($name in @('environmentId','deployedCommit','startedAtUtc','completedAtUtc','executedByCorporateId','approvedByCorporateId')) { if ([string]::IsNullOrWhiteSpace($document.run.$name)) { throw "Passed security run metadata missing: $name" } }
  if ($document.run.deployedCommit -notmatch '^[a-f0-9]{40}$' -or $document.run.executedByCorporateId -eq $document.run.approvedByCorporateId) { throw 'Security run commit or maker-checker identity is invalid.' }
  if (-not $document.run.toolVersions -or @($document.run.toolVersions).Count -lt 1) { throw 'Security tool versions are required.' }
  foreach ($tool in $document.run.toolVersions) { if ([string]::IsNullOrWhiteSpace($tool.name) -or [string]::IsNullOrWhiteSpace($tool.version)) { throw 'Security tool identity is incomplete.' } }
  if (@($document.controls | Where-Object status -ne 'PASSED').Count -gt 0) { throw 'All security controls must pass.' }
  foreach ($name in @('critical','high','medium','low','unresolved','acceptedRisk')) { if ($null -eq $document.findings.$name -or [int]$document.findings.$name -lt 0) { throw "Invalid security finding count: $name" } }
  if ([int]$document.findings.critical -ne 0 -or [int]$document.findings.high -ne 0 -or [int]$document.findings.unresolved -ne 0 -or [int]$document.findings.acceptedRisk -ne 0) { throw 'Security gate cannot pass with critical/high, unresolved or accepted-risk findings.' }
}
Write-Host "FINANCE STAGING SECURITY: $($document.status)" -ForegroundColor $(if ($document.status -eq 'PASSED') {'Green'} else {'Yellow'})
Write-Host "Controls: 8; passed: $(@($document.controls | Where-Object status -eq 'PASSED').Count); productionDataUsed: false; preProductionDecision: NO_GO"
if ($RequirePassed -and $document.status -ne 'PASSED') { throw 'Finance staging security has not passed.' }
