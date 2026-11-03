[CmdletBinding()]
param(
  [switch]$RequireApproved,
  [string]$ConfigurationFile = (Join-Path $PSScriptRoot '..\docs\finance\commercial-configuration.json'),
  [string]$PublicProjectionFile = (Join-Path $PSScriptRoot '..\docs\finance\commercial-configuration-public.json')
)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$d = Get-Content -Raw -LiteralPath (Resolve-Path $ConfigurationFile) | ConvertFrom-Json -Depth 30
if ($d.schemaVersion -ne 1 -or $d.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $d.environment -ne 'PREPRODUCTION_CANDIDATE') { throw 'Invalid commercial configuration identity.' }
if ($d.storageDecimalScale -ne 8 -or $d.documentDecimalScale -ne 2) { throw 'Finance decimal scale policy changed without review.' }
$expected=@('ROYALTY','ENTRY_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','DEDUCTION_CREDIT')
$codes = @($d.feeFamilies | ForEach-Object code)
if ($codes.Count -ne 7 -or @($codes | Sort-Object -Unique).Count -ne 7 -or @($expected | Where-Object { $_ -notin $codes }).Count) { throw 'Commercial configuration fee family inventory is incomplete.' }
$royalty = $d.feeFamilies | Where-Object code -eq 'ROYALTY'
if ($royalty.trigger -ne 'SETTLED_COLLECTION_PIECE' -or $royalty.calculationMethod -ne 'PERCENTAGE' -or $royalty.basisIncludesTax -ne $true -or $royalty.refundPolicy.mode -ne 'PROPORTIONAL_REVERSAL' -or -not $royalty.refundPolicy.onEachConfirmedRefund -or -not $royalty.refundPolicy.preserveOriginalPeriodReference -or -not $royalty.refundPolicy.preserveOriginalAccrualReference -or -not $royalty.refundPolicy.postToOpenPeriodWhenOriginalLocked) { throw 'Confirmed royalty/refund invariants were changed.' }
$deduction = $d.feeFamilies | Where-Object code -eq 'DEDUCTION_CREDIT'
if ($deduction.directBalanceEditAllowed -ne $false) { throw 'Direct balance editing must remain forbidden.' }
$publicRaw = Get-Content -Raw -LiteralPath (Resolve-Path $PublicProjectionFile)
$public = $publicRaw | ConvertFrom-Json -Depth 20
if ($public.schemaVersion -ne 1 -or $public.module -ne $d.module -or $public.projection -ne 'COMMERCIAL_DECISION_STATUS_PUBLIC' -or $public.productionValuesExposed -ne $false -or $public.approvalIdentitiesExposed -ne $false -or $public.evidenceMetadataExposed -ne $false) { throw 'Invalid commercial public projection identity.' }
if ($publicRaw -match 'financeDirector|financialAdvisor|franchiseManagement|evidencePath|evidenceSha256|signedAtUtc|ratePercent\s*"\s*:|amountOrRate\s*"\s*:') { throw 'Commercial public projection exposes protected approval, evidence or production values.' }
if (@($public.feeFamilies).Count -ne 7) { throw 'Commercial public projection fee family inventory is incomplete.' }
foreach ($sourceFamily in $d.feeFamilies) {
 $projected = @($public.feeFamilies | Where-Object code -eq $sourceFamily.code)
 if ($projected.Count -ne 1 -or $projected[0].decisionStatus -ne $sourceFamily.decisionStatus -or [string]::IsNullOrWhiteSpace($projected[0].confirmedBehavior) -or $null -eq $projected[0].pendingFields) { throw "Commercial public projection mismatch: $($sourceFamily.code)" }
}
$generatedFile = Join-Path ([IO.Path]::GetTempPath()) ("ototr-commercial-public-{0}.json" -f [guid]::NewGuid().ToString('N'))
try {
 & (Join-Path $PSScriptRoot 'New-FinanceCommercialPublicProjection.ps1') -ConfigurationFile $ConfigurationFile -OutputFile $generatedFile *> $null
 $generated = Get-Content -Raw -LiteralPath $generatedFile | ConvertFrom-Json -Depth 20
 $generatedCanonical = $generated | ConvertTo-Json -Depth 20 -Compress
 $committedCanonical = $public | ConvertTo-Json -Depth 20 -Compress
 if ($generatedCanonical -cne $committedCanonical) { throw 'Committed commercial public projection is stale or was edited manually.' }
} finally {
 if (Test-Path -LiteralPath $generatedFile) { Remove-Item -LiteralPath $generatedFile -Force }
}
$approved = $d.status -eq 'APPROVED'
if ($approved) {
 if ($d.currencyCode -notmatch '^[A-Z]{3}$' -or $d.roundingMode -notin @('HALF_UP','HALF_EVEN','DOWN','UP')) { throw 'Approved general commercial values are incomplete.' }
 foreach ($f in $d.feeFamilies) { if ($f.decisionStatus -ne 'APPROVED' -or [string]::IsNullOrWhiteSpace($f.effectiveFrom) -or [string]::IsNullOrWhiteSpace($f.taxCode) -or [string]::IsNullOrWhiteSpace($f.invoiceLineCode)) { throw "Approved fee family is incomplete: $($f.code)" }; [void][datetime]::ParseExact($f.effectiveFrom,'yyyy-MM-dd',[Globalization.CultureInfo]::InvariantCulture) }
 if ($null -eq $royalty.ratePercent -or [decimal]$royalty.ratePercent -le 0 -or [decimal]$royalty.ratePercent -gt 100 -or $royalty.scopeVariability -notin @('FIXED_GLOBAL','CONTRACT','DEALER','BRANCH')) { throw 'Approved royalty rate or scope policy is invalid.' }
 foreach ($name in @('financeDirector','financialAdvisor','franchiseManagement','legal')) { if ([string]::IsNullOrWhiteSpace($d.approval.$name)) { throw "Commercial approval missing: $name" } }
 if ($d.approval.evidencePath -match '^[A-Za-z]:|^\\|^/' -or $d.approval.evidenceSha256 -notmatch '^[a-fA-F0-9]{64}$') { throw 'Commercial evidence identity is invalid.' }
 $e = [IO.Path]::GetFullPath((Join-Path $root $d.approval.evidencePath))
 if (-not $e.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $e)) { throw 'Commercial evidence file is missing.' }
 if ((Get-FileHash $e -Algorithm SHA256).Hash.ToLowerInvariant() -ne $d.approval.evidenceSha256.ToLowerInvariant()) { throw 'Commercial evidence hash mismatch.' }
 [void][DateTimeOffset]::Parse($d.approval.signedAtUtc)
}
$decision=if($approved){'APPROVED'}else{'PENDING_DECISIONS'}
Write-Host "FINANCE COMMERCIAL CONFIGURATION: $decision" -ForegroundColor $(if($approved){'Green'}else{'Yellow'})
Write-Host ("Fee families: 7; confirmed royalty invariants: 5; production values inferred: false")
if ($RequireApproved -and -not $approved) { throw 'Commercial configuration is not approved.' }
