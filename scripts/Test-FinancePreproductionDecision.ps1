[CmdletBinding()]
param(
  [switch]$RequireGo,
  [string]$DecisionFile=(Join-Path $PSScriptRoot '..\docs\finance\preproduction-decision.json'),
  [string]$GateFile=(Join-Path $PSScriptRoot '..\docs\finance\uat-preproduction-gates.json')
)
$ErrorActionPreference='Stop';$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path;$d=Get-Content -Raw -LiteralPath (Resolve-Path $DecisionFile)|ConvertFrom-Json -Depth 30;$g=Get-Content -Raw -LiteralPath (Resolve-Path $GateFile)|ConvertFrom-Json -Depth 30
if($d.schemaVersion -ne 1 -or $d.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $d.target -ne 'PREPRODUCTION_DECISION'){throw 'Invalid pre-production decision identity.'}
if($d.productionDataUsed -or $d.productionDecision -ne 'NO_GO' -or $d.decision -notin @('NOT_READY','NO_GO','GO')){throw 'Pre-production decision policy is invalid.'}
$roles=@('Proje Yöneticisi','Finans Direktörü','ERP Ürün Sahibi','Bilgi Güvenliği','Franchise Yönetimi');if(@($d.signoffs).Count -ne 5){throw 'Expected five final decision signoffs.'};for($i=0;$i -lt 5;$i++){if($d.signoffs[$i].role -ne $roles[$i]){throw "Invalid final signoff role: $($d.signoffs[$i].role)"}}
if($d.decision -eq 'GO'){
 & (Join-Path $PSScriptRoot 'Test-FinancePreproductionReadiness.ps1') -GateFile $GateFile 6>&1 | Out-Null
 $prerequisites=@($g.gates|Where-Object{$_.id -ne 'FIN-G12'});if($prerequisites.Count -ne 11 -or @($prerequisites|Where-Object status -ne 'PASSED').Count -gt 0){throw 'FIN-G01 through FIN-G11 must pass before final GO.'}
 $finalGate=$g.gates|Where-Object id -eq 'FIN-G12';if($finalGate.status -ne 'PENDING'){throw 'FIN-G12 must remain PENDING until this decision record is registered as evidence.'}
 if($d.decisionRecordId -notmatch '^FIN-GO-[A-Z0-9-]{8,64}$' -or $d.releaseCommit -notmatch '^[a-f0-9]{40}$' -or $d.deploymentOwnerIdentitySha256 -notmatch '^[a-f0-9]{64}$'){throw 'Final decision release identity is invalid.'}
 $start=[DateTimeOffset]::Parse($d.changeWindowStartUtc,[Globalization.CultureInfo]::InvariantCulture);$end=[DateTimeOffset]::Parse($d.changeWindowEndUtc,[Globalization.CultureInfo]::InvariantCulture);if($end -le $start){throw 'Change window end must follow start.'}
 foreach($pair in @(@('releaseManifestPath','releaseManifestSha256'),@('rollbackEvidencePath','rollbackEvidenceSha256'))){$path=[IO.Path]::GetFullPath((Join-Path $root $d.($pair[0])));if(-not $path.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $path -PathType Leaf) -or (Get-FileHash $path -Algorithm SHA256).Hash.ToLowerInvariant() -ne $d.($pair[1])){throw "Final decision evidence invalid: $($pair[0])"}}
 $identities=@();foreach($signoff in $d.signoffs){if($signoff.identitySha256 -notmatch '^[a-f0-9]{64}$' -or [string]::IsNullOrWhiteSpace($signoff.signedAtUtc)){throw "Final signoff missing: $($signoff.role)"};[void][DateTimeOffset]::Parse($signoff.signedAtUtc,[Globalization.CultureInfo]::InvariantCulture);$identities+=$signoff.identitySha256};if(@($identities|Sort-Object -Unique).Count -ne 5){throw 'Final decision signers must be distinct.'}
}
Write-Host "FINANCE PRE-PRODUCTION DECISION: $($d.decision)" -ForegroundColor $(if($d.decision -eq 'GO'){'Green'}else{'Yellow'});Write-Host "Prerequisite gates passed: $(@($g.gates|Where-Object{$_.id -ne 'FIN-G12' -and $_.status -eq 'PASSED'}).Count)/11; final signoffs configured: $(@($d.signoffs|Where-Object{$_.identitySha256 -match '^[a-f0-9]{64}$'}).Count)/5; productionDecision: NO_GO"
if($RequireGo -and $d.decision -ne 'GO'){throw 'Pre-production final decision is not GO.'}
