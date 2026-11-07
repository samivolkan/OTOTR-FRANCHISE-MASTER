[CmdletBinding()]
param(
  [switch]$RequireApproved,
  [string]$DecisionFile = (Join-Path $PSScriptRoot '..\docs\finance\tax-accounting-decision.json')
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$d = Get-Content -LiteralPath (Resolve-Path $DecisionFile) -Raw | ConvertFrom-Json -Depth 20

if ($d.schemaVersion -ne 1 -or $d.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $d.gateId -ne 'FIN-G02' -or $d.environment -ne 'PREPRODUCTION_CANDIDATE') { throw 'Invalid tax/accounting decision identity.' }
if ($d.countryCode -ne 'TR' -or $d.currencyCode -ne 'TRY' -or $d.documentDecimalScale -ne 2 -or $d.storageDecimalScale -ne 8) { throw 'Invalid finance document/currency precision contract.' }
if ($d.status -notin @('PENDING_ADVISOR_APPROVAL','APPROVED')) { throw 'Invalid tax/accounting decision status.' }
if ($d.documentPolicy.invoiceIssuer -ne 'HEADQUARTERS_LEGAL_ENTITY' -or $d.documentPolicy.invoiceRecipient -ne 'BRANCH_LEGAL_NAME' -or $d.documentPolicy.invoiceNumberSource -ne 'ACCOUNTING_PROVIDER_CALLBACK' -or -not $d.documentPolicy.accountingExportRequiresBalancedJournal -or $d.documentPolicy.postedDocumentMutationAllowed -ne $false) { throw 'Invoice ownership or immutable accounting export policy changed.' }
if ($d.taxPolicy.royaltyBasis -ne 'FULL_SETTLED_CUSTOMER_GROSS_INCLUDING_VAT' -or $d.taxPolicy.royaltyChargeTreatment -ne 'VAT_ADDED_TO_CALCULATED_ROYALTY' -or [decimal]$d.taxPolicy.royaltyBusinessRatePercent -ne 20 -or $d.taxPolicy.passThroughServiceFeeTreatment -ne 'VAT_ADDED_TO_MARKUP_SERVICE_FEE' -or [decimal]$d.taxPolicy.passThroughBusinessRatePercent -ne 20 -or $d.taxPolicy.businessRatesAreAccountingApproval -ne $false -or -not $d.taxPolicy.taxCodeVersionRequiredBeforePublishing) { throw 'Confirmed business tax behavior or accounting-approval boundary changed.' }
if ($d.reversalPolicy.method -ne 'LINKED_REVERSAL_JOURNAL' -or $d.reversalPolicy.directBalanceEditAllowed -ne $false -or -not $d.reversalPolicy.preserveOriginalPeriodReference -or -not $d.reversalPolicy.preserveOriginalAccrualReference -or $d.reversalPolicy.lockedOriginalPeriodPosting -ne 'CURRENT_OPEN_PERIOD' -or $d.reversalPolicy.creditCarryForwardScope -ne 'BRANCH' -or $d.reversalPolicy.crossBranchTransferAllowed -ne $false) { throw 'Reversal accounting provenance policy changed.' }

$expected = @('ROYALTY','ENTRY_FRANCHISE','PERIODIC_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','DEDUCTION_CREDIT')
$mappings = @($d.feeFamilyMappings)
$codes = @($mappings | ForEach-Object code)
if ($mappings.Count -ne 8 -or @($codes | Sort-Object -Unique).Count -ne 8 -or @($expected | Where-Object { $_ -notin $codes }).Count) { throw 'Tax/accounting mapping must cover all eight fee families exactly once.' }
$royalty = $mappings | Where-Object code -eq 'ROYALTY'
if ($royalty.invoiceLineCode -ne 'ROYALTY_SERVICE_FEE') { throw 'Confirmed royalty invoice line code changed.' }

$approved = $d.status -eq 'APPROVED'
$requiredDocumentFields = @('outboundDocumentType','refundDocumentType')
$requiredMappingFields = @('taxCode','taxCodeVersionId','receivableAccountCode','revenueAccountCode','taxPayableAccountCode','reversalAccountCode','invoiceLineCode')
if ($approved) {
  if ($d.roundingMode -notin @('HALF_UP','HALF_EVEN','DOWN','UP')) { throw 'Approved rounding mode is missing or invalid.' }
  foreach ($field in $requiredDocumentFields) { if ([string]::IsNullOrWhiteSpace($d.documentPolicy.$field)) { throw "Approved document policy is incomplete: $field" } }
  foreach ($mapping in $mappings) { foreach ($field in $requiredMappingFields) { if ([string]::IsNullOrWhiteSpace($mapping.$field)) { throw "Approved mapping $($mapping.code) is incomplete: $field" } } }
  foreach ($field in @('financialAdvisorCorporateId','financeDirectorCorporateId','evidencePath','evidenceSha256','signedAtUtc')) { if ([string]::IsNullOrWhiteSpace($d.approval.$field)) { throw "Approved evidence is incomplete: $field" } }
  if ($d.approval.financialAdvisorCorporateId -eq $d.approval.financeDirectorCorporateId) { throw 'Mali Müşavir and Finans Direktörü must be distinct identities.' }
  if ($d.approval.evidencePath -match '^[A-Za-z]:|^\\|^/' -or $d.approval.evidenceSha256 -notmatch '^[a-fA-F0-9]{64}$') { throw 'Approved evidence locator or hash is invalid.' }
  $evidence = [IO.Path]::GetFullPath((Join-Path $root $d.approval.evidencePath))
  if (-not $evidence.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $evidence -PathType Leaf)) { throw 'Approved evidence file is missing or outside the repository.' }
  if ((Get-FileHash -LiteralPath $evidence -Algorithm SHA256).Hash.ToLowerInvariant() -ne $d.approval.evidenceSha256.ToLowerInvariant()) { throw 'Approved evidence hash mismatch.' }
  [void][DateTimeOffset]::Parse($d.approval.signedAtUtc)
} else {
  $filledMappings = @($mappings | Where-Object { $_.taxCode -or $_.taxCodeVersionId -or $_.receivableAccountCode -or $_.revenueAccountCode -or $_.taxPayableAccountCode -or $_.reversalAccountCode })
  if ($filledMappings.Count -gt 0) { throw 'Pending decision contains unapproved accounting or tax mappings.' }
}

Write-Host ("FINANCE TAX + ACCOUNTING DECISION: {0}" -f $d.status) -ForegroundColor $(if($approved){'Green'}else{'Yellow'})
Write-Host 'Eight fee families covered; business tax behavior preserved; synthetic account codes excluded.'
if ($RequireApproved -and -not $approved) { throw 'Tax/accounting decision is not approved.' }
