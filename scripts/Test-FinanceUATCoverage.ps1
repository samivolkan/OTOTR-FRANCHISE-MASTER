[CmdletBinding()]
param([string]$CoverageFile=(Join-Path $PSScriptRoot '..\docs\finance\uat-coverage.json'))
$ErrorActionPreference='Stop'
$root=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$document=Get-Content -Raw -LiteralPath (Resolve-Path -LiteralPath $CoverageFile) | ConvertFrom-Json -Depth 20
if($document.schemaVersion-ne 1-or$document.module-ne'OTOTR_FRANCHISE_FINANCE'-or$document.environment-ne'LOCAL_SYNTHETIC'){throw'Invalid finance UAT coverage identity.'}
if(-not$document.policy.automatedEvidenceIsNotHumanSignoff-or$document.policy.productionDataUsed-or$document.policy.uatDecision-ne'NOT_SIGNED'){throw'Finance UAT coverage must remain fail-closed before human signoff.'}
$allowed=@('AUTOMATED_LOCAL_VERIFIED','PARTIAL_AUTOMATION','EXTERNAL_REQUIRED');$ids=@{};$counts=@{}
foreach($scenario in $document.scenarios){
 if($scenario.id-notmatch'^UAT-FIN-(0[1-9]|1[0-8])$'-or$ids.ContainsKey($scenario.id)){throw"Invalid or duplicate UAT scenario: $($scenario.id)"};$ids[$scenario.id]=$true
 if($allowed-notcontains$scenario.automationStatus){throw"Invalid automation status for $($scenario.id)"}
 if(-not$scenario.remaining-or$scenario.remaining.Count-lt 1){throw"UAT scenario must disclose remaining human or staging work: $($scenario.id)"}
 if($scenario.automationStatus-ne'EXTERNAL_REQUIRED'-and(-not$scenario.evidence-or$scenario.evidence.Count-lt 1)){throw"Automated UAT scenario has no evidence: $($scenario.id)"}
 foreach($path in $scenario.evidence){if($path-match'^[A-Za-z]:|^\\|^/' ){throw"UAT evidence path must be repository-relative: $path"};$resolved=[IO.Path]::GetFullPath((Join-Path $root $path));if(-not$resolved.StartsWith($root,[StringComparison]::OrdinalIgnoreCase)-or-not(Test-Path -LiteralPath $resolved -PathType Leaf)){throw"UAT evidence missing or outside repository: $path"}}
 $counts[$scenario.automationStatus]=1+($counts[$scenario.automationStatus]??0)
}
if($document.scenarios.Count-ne 18){throw"Expected 18 finance UAT scenarios, found $($document.scenarios.Count)."}
Write-Host 'FINANCE UAT COVERAGE: PASSED (AUTOMATION INVENTORY ONLY)' -ForegroundColor Green
Write-Host ("Scenarios: 18; automatedLocal: {0}; partial: {1}; external: {2}; humanSignoff: NOT_SIGNED; productionDataUsed: false" -f ($counts.AUTOMATED_LOCAL_VERIFIED??0),($counts.PARTIAL_AUTOMATION??0),($counts.EXTERNAL_REQUIRED??0))
