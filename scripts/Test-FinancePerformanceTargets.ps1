[CmdletBinding()]
param(
  [switch]$RequireApproved,
  [string]$TargetFile = (Join-Path $PSScriptRoot '..\docs\finance\performance-targets.json')
)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$d=Get-Content -LiteralPath (Resolve-Path $TargetFile) -Raw|ConvertFrom-Json -Depth 20
if($d.schemaVersion-ne 1-or$d.module-ne'OTOTR_FRANCHISE_FINANCE'-or$d.target-ne'PREPRODUCTION_PERFORMANCE_TARGETS'-or$d.environment-ne'ototr-staging'-or$d.status-notin@('PENDING_APPROVAL','APPROVED')){throw'Invalid finance performance target registry.'}
$names=@('Genel merkez özet ve yönetişim okumaları','Bayi hesap özeti ve ekstre okumaları','Finans komut ve onay yazmaları','Entegrasyon worker timeout retry ve duplicate')
if(@($d.workloads).Count-ne 4){throw'Performance target registry must contain four workloads.'}
$fields=@('datasetRows','concurrency','requests','p95Ms','p99Ms','maxErrorRatePct','timeoutBudgetMs')
for($i=0;$i-lt 4;$i++){$w=$d.workloads[$i];$id='PERF-FIN-{0:d2}'-f($i+1);if($w.id-ne$id-or$w.name-ne$names[$i]){throw"Invalid performance target workload: $($w.id)"}}
$approved=$d.status-eq'APPROVED'
if($approved){
  foreach($w in $d.workloads){foreach($field in $fields){if($null-eq$w.$field-or[decimal]$w.$field-le 0){throw"Approved target $($w.id) is incomplete: $field"}};if([int]$w.datasetRows-ne[decimal]$w.datasetRows-or[int]$w.concurrency-ne[decimal]$w.concurrency-or[int]$w.requests-ne[decimal]$w.requests){throw"Approved volume target must be an integer: $($w.id)"};if([decimal]$w.p99Ms-lt[decimal]$w.p95Ms-or[decimal]$w.timeoutBudgetMs-lt[decimal]$w.p99Ms-or[decimal]$w.maxErrorRatePct-gt 100){throw"Approved latency/error target is inconsistent: $($w.id)"}}
  foreach($field in @('platformLeadIdentitySha256','erpTechnicalLeadIdentitySha256','evidencePath','evidenceSha256','approvedAtUtc')){if([string]::IsNullOrWhiteSpace($d.approval.$field)){throw"Performance target approval missing: $field"}}
  if($d.approval.platformLeadIdentitySha256-notmatch'^[a-f0-9]{64}$'-or$d.approval.erpTechnicalLeadIdentitySha256-notmatch'^[a-f0-9]{64}$'-or$d.approval.platformLeadIdentitySha256-eq$d.approval.erpTechnicalLeadIdentitySha256){throw'Performance target approver identities are invalid.'}
  if($d.approval.evidencePath-match'^[A-Za-z]:|^\\|^/'-or$d.approval.evidenceSha256-notmatch'^[a-f0-9]{64}$'){throw'Performance target approval evidence locator is invalid.'}
  $e=[IO.Path]::GetFullPath((Join-Path $root $d.approval.evidencePath));if(-not$e.StartsWith($root,[StringComparison]::OrdinalIgnoreCase)-or-not(Test-Path -LiteralPath $e -PathType Leaf)-or(Get-FileHash -LiteralPath $e -Algorithm SHA256).Hash.ToLowerInvariant()-ne$d.approval.evidenceSha256){throw'Performance target approval evidence is invalid.'};[void][DateTimeOffset]::Parse($d.approval.approvedAtUtc)
}else{
  foreach($w in $d.workloads){foreach($field in $fields){if($null-ne$w.$field){throw"Pending target contains an unapproved value: $($w.id).$field"}}}
}
Write-Host "FINANCE PERFORMANCE TARGETS: $($d.status)" -ForegroundColor $(if($approved){'Green'}else{'Yellow'})
Write-Host 'Four workloads covered; approved targets require distinct identities and immutable evidence.'
if($RequireApproved-and-not$approved){throw'Finance performance targets are not approved.'}
