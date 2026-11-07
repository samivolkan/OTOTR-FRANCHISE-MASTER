[CmdletBinding()]
param(
  [switch]$RequirePassed,
  [string]$EvidenceFile = (Join-Path $PSScriptRoot '..\docs\finance\staging-operations-evidence.json')
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$d = Get-Content -Raw -LiteralPath (Resolve-Path $EvidenceFile) | ConvertFrom-Json -Depth 30
if ($d.schemaVersion -ne 1 -or $d.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $d.target -ne 'PREPRODUCTION_OPERATIONS') { throw 'Invalid finance operations evidence identity.' }
if ($d.productionDataUsed -or $d.preProductionDecision -ne 'NO_GO' -or $d.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw 'Finance operations evidence policy is invalid.' }
$names = @('Alarm teslimi','Olay kabulü','Correlation araması','Eskalasyon zinciri','Finansal olay çözümü','İlk 24 saat sorumluluk devri')
if (@($d.drills).Count -ne 6) { throw 'Expected six finance operations drills.' }
for ($i=0; $i -lt 6; $i++) {
  $drill=$d.drills[$i];$id='OPS-FIN-{0:d2}' -f ($i+1)
  if ($drill.id -ne $id -or $drill.name -ne $names[$i] -or $drill.status -notin @('NOT_RUN','RUNNING','FAILED','PASSED')) { throw "Invalid operations drill: $($drill.id)" }
  if ($drill.status -eq 'PASSED') {
    if ($null -eq $drill.targetMaxMinutes -or [decimal]$drill.targetMaxMinutes -le 0 -or $null -eq $drill.observedMinutes -or [decimal]$drill.observedMinutes -lt 0 -or [decimal]$drill.observedMinutes -gt [decimal]$drill.targetMaxMinutes) { throw "Operations drill target breached: $id" }
    if (-not $drill.evidence -or @($drill.evidence).Count -lt 1) { throw "Operations drill evidence missing: $id" }
    foreach ($item in $drill.evidence) {
      if ([string]::IsNullOrWhiteSpace($item.path) -or $item.path -match '^[A-Za-z]:|^\\|^/') { throw "Operations evidence path must be repository-relative: $id" }
      $path=[IO.Path]::GetFullPath((Join-Path $root $item.path))
      if (-not $path.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf) -or (Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256) { throw "Operations evidence invalid: $id" }
    }
  }
}
if ($d.status -eq 'PASSED') {
  foreach ($name in @('environmentId','deployedCommit','startedAtUtc','completedAtUtc','executedByIdentitySha256','approvedByIdentitySha256')) { if ([string]::IsNullOrWhiteSpace($d.run.$name)) { throw "Passed operations metadata missing: $name" } }
  if ($d.run.deployedCommit -notmatch '^[a-f0-9]{40}$' -or $d.run.executedByIdentitySha256 -notmatch '^[a-f0-9]{64}$' -or $d.run.approvedByIdentitySha256 -notmatch '^[a-f0-9]{64}$' -or $d.run.executedByIdentitySha256 -eq $d.run.approvedByIdentitySha256) { throw 'Operations commit or maker-checker identity is invalid.' }
  if (@($d.drills | Where-Object status -ne 'PASSED').Count -gt 0) { throw 'All operations drills must pass.' }
  foreach ($name in @('alertChannelSecretName','supportChannelSecretName')) { if ($d.configuration.$name -notmatch '^[A-Z][A-Z0-9_]{2,127}$') { throw "Secret-manager name is invalid: $name" } }
  foreach ($name in @('primaryOnCallIdentitySha256','backupOnCallIdentitySha256')) { if ($d.configuration.$name -notmatch '^[a-f0-9]{64}$') { throw "On-call identity hash missing: $name" } }
  if ($d.configuration.primaryOnCallIdentitySha256 -eq $d.configuration.backupOnCallIdentitySha256) { throw 'Primary and backup on-call identities must differ.' }
  foreach ($pair in @(@('supportSlaPolicyPath','supportSlaPolicySha256'),@('first24hResponsibilityPlanPath','first24hResponsibilityPlanSha256'))) {
    $path=[IO.Path]::GetFullPath((Join-Path $root $d.configuration.($pair[0])))
    if (-not $path.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf) -or (Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $d.configuration.($pair[1])) { throw "Operations configuration evidence invalid: $($pair[0])" }
  }
  foreach($name in @('policyPath','policySha256')){if([string]::IsNullOrWhiteSpace($d.configuration.$name)){throw"Operations policy reference missing: $name"}};$policyPath=[IO.Path]::GetFullPath((Join-Path $root $d.configuration.policyPath));if(-not$policyPath.StartsWith($root,[StringComparison]::OrdinalIgnoreCase)-or-not(Test-Path -LiteralPath $policyPath -PathType Leaf)-or(Get-FileHash -LiteralPath $policyPath -Algorithm SHA256).Hash.ToLowerInvariant()-ne$d.configuration.policySha256){throw'Operations policy hash is invalid.'};& (Join-Path $PSScriptRoot 'Test-FinanceOperationsPolicy.ps1') -RequireApproved -PolicyFile $policyPath;$policy=Get-Content -LiteralPath $policyPath -Raw|ConvertFrom-Json -Depth 20;foreach($drill in $d.drills){$target=$policy.drillTargets|Where-Object id -eq $drill.id;if($null-eq$target-or[decimal]$drill.targetMaxMinutes-ne[decimal]$target.targetMaxMinutes){throw"Operations target differs from approved policy: $($drill.id)"}}
  $serialized=$d|ConvertTo-Json -Depth 30
  if ($serialized -match '(?i)https?://|@|\+\d{8,}|slack\.com|teams\.microsoft|webhook') { throw 'Operations evidence contains a concrete private channel or contact value.' }
}
Write-Host "FINANCE STAGING OPERATIONS: $($d.status)" -ForegroundColor $(if($d.status -eq 'PASSED'){'Green'}else{'Yellow'})
Write-Host "Drills: 6; passed: $(@($d.drills|Where-Object status -eq 'PASSED').Count); productionDataUsed: false; privateChannelsStored: false"
if ($RequirePassed -and $d.status -ne 'PASSED') { throw 'Finance staging operations has not passed.' }
