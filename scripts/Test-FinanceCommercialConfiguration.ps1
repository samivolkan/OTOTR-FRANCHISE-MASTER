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
$invoicePolicy=$d.invoicePresentationPolicy
$invoiceFamilies=@('ROYALTY','ENTRY_FRANCHISE','PERIODIC_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','DEDUCTION_CREDIT')
if($invoicePolicy.mode-ne'SEPARATE_LINE_PER_FEE_FAMILY'-or(@($invoicePolicy.transparentFeeFamilies)-join',')-ne($invoiceFamilies-join',')-or(@($invoicePolicy.queryServiceLines)-join',')-ne'TRAMER_QUERY,KM_QUERY,TRAMER_360_QUERY'-or-not$invoicePolicy.showSourceExpenseServiceFeeAndTaxSeparately-or-not$invoicePolicy.showProviderCostServiceFeeAndTaxSeparately-or$invoicePolicy.officialInvoiceLineCodesStatus-ne'PENDING_TAX_ACCOUNTING_APPROVAL'-or$invoicePolicy.aggregateDifferentFeeFamilies){throw'Confirmed transparent invoice presentation policy was changed.'}
$expected=@('ROYALTY','ENTRY_FRANCHISE','PERIODIC_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','DEDUCTION_CREDIT')
$codes = @($d.feeFamilies | ForEach-Object code)
if ($codes.Count -ne 8 -or @($codes | Sort-Object -Unique).Count -ne 8 -or @($expected | Where-Object { $_ -notin $codes }).Count) { throw 'Commercial configuration fee family inventory is incomplete.' }
$royalty = $d.feeFamilies | Where-Object code -eq 'ROYALTY'
if ($royalty.trigger -ne 'SETTLED_COLLECTION_PIECE' -or $royalty.calculationMethod -ne 'PERCENTAGE' -or $royalty.basisIncludesTax -ne $true -or $royalty.refundPolicy.mode -ne 'PROPORTIONAL_REVERSAL' -or -not $royalty.refundPolicy.onEachConfirmedRefund -or -not $royalty.refundPolicy.preserveOriginalPeriodReference -or -not $royalty.refundPolicy.preserveOriginalAccrualReference -or -not $royalty.refundPolicy.postToOpenPeriodWhenOriginalLocked) { throw 'Confirmed royalty/refund invariants were changed.' }
if ($null -ne $royalty.ratePercent -or $royalty.rateDecisionStatus -ne 'CONFIRMED_SECURE_VALUE' -or $royalty.rateSource -ne 'SECRET_MANAGER' -or $royalty.rateSecretName -ne 'FINANCE_ROYALTY_DEFAULT_RATE_PERCENT' -or $royalty.scopeVariability -ne 'BRANCH' -or $royalty.chargeTaxTreatment -ne 'VAT_ADDED_TO_CALCULATED_ROYALTY') { throw 'Confirmed plus VAT, branch-variable and secret-backed royalty policy was changed.' }
if ([decimal]$royalty.taxRatePercent -ne 20 -or $royalty.taxRateDecisionStatus -ne 'CONFIRMED') { throw 'Confirmed 20 percent royalty VAT policy was changed.' }
if ($royalty.deductionsFromBasis -ne 'NONE_GROSS_COLLECTION_ALWAYS') { throw 'Confirmed full gross collection royalty basis was changed.' }
if ($royalty.effectiveFromPolicy -ne 'BRANCH_OPENING_DATE' -or $royalty.retroactiveRecalculation -ne $false -or $royalty.changePolicy -ne 'PROSPECTIVE_VERSION_ONLY' -or -not $royalty.branchOpeningConfiguration.manualCommercialValueRequired -or -not $royalty.branchOpeningConfiguration.manualDurationRequired -or -not $royalty.branchOpeningConfiguration.manualInvoiceFrequencyRequired -or -not $royalty.branchOpeningConfiguration.requiresMakerCheckerApproval) { throw 'Confirmed branch-opening and prospective-only royalty policy was changed.' }
if ((@($royalty.invoiceAggregationPolicy.allowedFrequencies) -join ',') -ne 'DAILY,WEEKLY,MONTHLY' -or $royalty.invoiceAggregationPolicy.selectionScope -ne 'BRANCH' -or $royalty.invoiceAggregationPolicy.selectionAt -ne 'BRANCH_OPENING' -or $royalty.invoiceAggregationPolicy.frequencyChangePolicy -ne 'PROSPECTIVE_ONLY' -or $royalty.invoiceAggregationPolicy.rebundlePastAccruals -ne $false) { throw 'Confirmed branch invoice aggregation policy was changed.' }
if ($royalty.dueRule.type -ne 'NEXT_CALENDAR_DAY' -or $royalty.dueRule.timezone -ne 'Europe/Istanbul' -or (@($royalty.dueRule.allowedPaymentMethods) -join ',') -ne 'CREDIT_CARD' -or $royalty.dueRule.paymentSuccessSource -ne 'PAYMENT_PROVIDER_VERIFIED_CALLBACK') { throw 'Confirmed next-day credit-card collection policy was changed.' }
if ($royalty.accessEnforcement.unpaidAtDueAction -ne 'LOCK_BRANCH_OPERATIONS' -or -not $royalty.accessEnforcement.failClosed -or $royalty.accessEnforcement.unlockOn -ne 'VERIFIED_FULL_PAYMENT' -or (@($royalty.accessEnforcement.allowedWhileLocked) -join ',') -ne 'PAYMENT,INVOICE_READ,STATEMENT_READ,SUPPORT,LOGOUT' -or $royalty.accessEnforcement.cardDataStored -ne $false -or -not $royalty.accessEnforcement.providerTokenOnly) { throw 'Confirmed unpaid branch access enforcement policy was changed.' }
if ($royalty.invoiceLineCode -ne 'ROYALTY_SERVICE_FEE' -or $royalty.invoicePresentation.grouping -ne 'SINGLE_LINE_PER_INVOICE_PERIOD' -or $royalty.invoicePresentation.lineLabel -ne 'Royalty Hizmet Bedeli' -or -not $royalty.invoicePresentation.retainAccrualTrace -or -not $royalty.invoicePresentation.retainStatementLinks) { throw 'Confirmed royalty single-line invoice presentation was changed.' }
if ($royalty.refundPolicy.invoiceTreatment -ne 'NET_NEGATIVE_ON_NEXT_ROYALTY_LINE' -or $royalty.refundPolicy.invoiceLineCode -ne 'ROYALTY_SERVICE_FEE' -or -not $royalty.refundPolicy.preserveReversalTrace) { throw 'Confirmed royalty refund invoice netting policy was changed.' }
if ($royalty.refundExcessPolicy.mode -ne 'CARRY_FORWARD_CREDIT' -or $royalty.refundExcessPolicy.scope -ne 'BRANCH' -or $royalty.refundExcessPolicy.applyToInvoiceLineCode -ne 'ROYALTY_SERVICE_FEE' -or -not $royalty.refundExcessPolicy.consumeOnNextEligibleInvoice -or $royalty.refundExcessPolicy.expires -ne $false -or $royalty.refundExcessPolicy.crossBranchTransferAllowed -ne $false -or -not $royalty.refundExcessPolicy.preserveSourceTrace) { throw 'Confirmed royalty excess credit carry-forward policy was changed.' }
if ($royalty.refundCashPayoutPolicy -ne 'DISABLED_CARRY_FORWARD_ONLY') { throw 'Confirmed royalty cash payout prohibition was changed.' }
if ($royalty.waiverPolicy.scope -ne 'BRANCH' -or @($royalty.waiverPolicy.allowedTypes) -notcontains 'NEW_DEALER_INTRODUCTORY' -or @($royalty.waiverPolicy.allowedTypes) -notcontains 'FINANCIAL_HARDSHIP' -or (@($royalty.waiverPolicy.introductoryDurationsMonths) -join ',') -ne '6,12' -or -not $royalty.waiverPolicy.requiresEffectiveDateRange -or -not $royalty.waiverPolicy.requiresMakerCheckerApproval -or -not $royalty.waiverPolicy.financialHardshipReviewRequired -or $royalty.waiverPolicy.shiftSystemDependency -ne $false) { throw 'Confirmed branch waiver policy was changed.' }
$entryFranchise = $d.feeFamilies | Where-Object code -eq 'ENTRY_FRANCHISE'
if ($entryFranchise.decisionStatus -notin @('PARTIALLY_CONFIRMED','APPROVED') -or $entryFranchise.trigger -ne 'BRANCH_OPENING' -or $entryFranchise.accrualOccurrence -ne 'ONCE_PER_BRANCH' -or $entryFranchise.duplicateAccrualPolicy -ne 'REJECT' -or $entryFranchise.retroactiveAccrual -ne $false -or -not $entryFranchise.requiresBranchOpeningReference) { throw 'Confirmed one-time branch-opening entry franchise policy was changed.' }
$periodicFranchise = $d.feeFamilies | Where-Object code -eq 'PERIODIC_FRANCHISE'
if ($periodicFranchise.decisionStatus -notin @('PENDING','APPROVED') -or $periodicFranchise.trigger -ne 'SCHEDULED_CONTRACT_PERIOD' -or $periodicFranchise.activationPolicy -ne 'CONTRACT_RULE_REQUIRED' -or $periodicFranchise.defaultEnabled -ne $false) { throw 'Periodic franchise must remain disabled until an approved contract rule enables it.' }
$queryFamily = $d.feeFamilies | Where-Object code -eq 'QUERY'
$queryCodes = @($queryFamily.priceCatalog | ForEach-Object serviceCode)
if ($queryFamily.decisionStatus -notin @('PARTIALLY_CONFIRMED','APPROVED') -or $queryFamily.calculationMethod -ne 'FIXED_AMOUNT_PER_SUCCESSFUL_QUERY' -or $null -ne $queryFamily.amountOrRate -or $queryFamily.priceDecisionStatus -ne 'CONFIRMED_SECURE_VALUES' -or $queryFamily.priceSource -ne 'SECRET_MANAGER' -or $queryFamily.currencyCode -ne 'TRY' -or (@($queryCodes) -join ',') -ne 'TRAMER_QUERY,KM_QUERY,TRAMER_360_QUERY') { throw 'Confirmed secure query price catalog policy was changed.' }
foreach ($item in $queryFamily.priceCatalog) { if ($item.amountSecretName -notmatch '^FINANCE_QUERY_[A-Z0-9_]+_TRY_AMOUNT$' -or $item.PSObject.Properties.Name -contains 'amount') { throw 'Query price catalog must contain secret names only.' } }
$externalService = $d.feeFamilies | Where-Object code -eq 'EXTERNAL_SERVICE'
if ($externalService.decisionStatus -notin @('PARTIALLY_CONFIRMED','APPROVED') -or $externalService.calculationMethod -ne 'COST_PLUS_PERCENTAGE_SERVICE_FEE' -or $externalService.basis -ne 'PROVIDER_COST' -or $null -ne $externalService.amountOrRate -or $externalService.providerMarginPolicy -ne 'PERCENTAGE_SERVICE_FEE' -or $externalService.taxTreatment -ne 'VAT_ADDED_SEPARATELY' -or $externalService.taxBaseDecisionStatus -ne 'PENDING_ADVISOR_APPROVAL') { throw 'Confirmed external-service cost-plus and separate VAT decision was changed.' }
if (-not $externalService.transparencyPolicy.showProviderCost -or -not $externalService.transparencyPolicy.showServiceFee -or -not $externalService.transparencyPolicy.showTaxSeparately) { throw 'External-service transparency policy was changed.' }
$expenseFamily = $d.feeFamilies | Where-Object code -eq 'PASS_THROUGH_EXPENSE'
if ($expenseFamily.decisionStatus -notin @('PARTIALLY_CONFIRMED','APPROVED') -or $expenseFamily.calculationMethod -ne 'COST_PLUS_PERCENTAGE_SERVICE_FEE' -or $expenseFamily.basis -ne 'APPROVED_SOURCE_EXPENSE_GROSS' -or $null -ne $expenseFamily.markupRatePercent -or $expenseFamily.markupRateDecisionStatus -ne 'CONFIRMED_SECURE_VALUE' -or $expenseFamily.markupRateSource -ne 'SECRET_MANAGER' -or $expenseFamily.markupRateSecretName -ne 'FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT' -or $expenseFamily.taxTreatment -ne 'VAT_ADDED_TO_MARKUP_SERVICE_FEE' -or [decimal]$expenseFamily.taxRatePercent -ne 20 -or $expenseFamily.taxRateDecisionStatus -ne 'CONFIRMED') { throw 'Confirmed transparent pass-through expense service-fee policy was changed.' }
if (-not $expenseFamily.transparencyPolicy.showSourceExpense -or -not $expenseFamily.transparencyPolicy.showServiceFee -or -not $expenseFamily.transparencyPolicy.showTaxSeparately -or -not $expenseFamily.transparencyPolicy.retainSourceDocumentTrace) { throw 'Pass-through expense transparency policy was changed.' }
$deduction = $d.feeFamilies | Where-Object code -eq 'DEDUCTION_CREDIT'
if ($deduction.directBalanceEditAllowed -ne $false) { throw 'Direct balance editing must remain forbidden.' }
$publicRaw = Get-Content -Raw -LiteralPath (Resolve-Path $PublicProjectionFile)
$public = $publicRaw | ConvertFrom-Json -Depth 20
if ($public.schemaVersion -ne 1 -or $public.module -ne $d.module -or $public.projection -ne 'COMMERCIAL_DECISION_STATUS_PUBLIC' -or $public.productionValuesExposed -ne $false -or $public.approvalIdentitiesExposed -ne $false -or $public.evidenceMetadataExposed -ne $false) { throw 'Invalid commercial public projection identity.' }
if ($publicRaw -match 'financeDirector|financialAdvisor|franchiseManagement|evidencePath|evidenceSha256|signedAtUtc|ratePercent\s*"\s*:|amountOrRate\s*"\s*:|FINANCE_QUERY_|FINANCE_PASS_THROUGH_') { throw 'Commercial public projection exposes protected approval, evidence or production values.' }
if (@($public.feeFamilies).Count -ne 8) { throw 'Commercial public projection fee family inventory is incomplete.' }
if($public.invoicePresentation.mode-ne'SEPARATE_LINE_PER_FEE_FAMILY'-or(@($public.invoicePresentation.transparentFeeFamilies)-join',')-ne($invoiceFamilies-join',')-or(@($public.invoicePresentation.queryServiceLines)-join',')-ne'TRAMER_QUERY,KM_QUERY,TRAMER_360_QUERY'-or$public.invoicePresentation.aggregateDifferentFeeFamilies){throw'Commercial public invoice presentation is incomplete.'}
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
 foreach ($family in $generated.feeFamilies) {
   if ($family.decisionStatus -eq 'APPROVED' -and @($family.pendingFields).Count -gt 0) {
     throw "Approved fee family has pending fields: $($family.code)"
   }
 }
} finally {
 if (Test-Path -LiteralPath $generatedFile) { Remove-Item -LiteralPath $generatedFile -Force }
}
$approved = $d.status -eq 'APPROVED'
if ($approved) {
 if ($d.currencyCode -notmatch '^[A-Z]{3}$' -or $d.roundingMode -notin @('HALF_UP','HALF_EVEN','DOWN','UP')) { throw 'Approved general commercial values are incomplete.' }
 foreach ($f in $d.feeFamilies) { if ($f.decisionStatus -ne 'APPROVED' -or ($f.code -ne 'ROYALTY' -and [string]::IsNullOrWhiteSpace($f.effectiveFrom)) -or [string]::IsNullOrWhiteSpace($f.taxCode) -or [string]::IsNullOrWhiteSpace($f.invoiceLineCode)) { throw "Approved fee family is incomplete: $($f.code)" }; if($f.code -ne 'ROYALTY'){[void][datetime]::ParseExact($f.effectiveFrom,'yyyy-MM-dd',[Globalization.CultureInfo]::InvariantCulture)} }
 if ($royalty.rateDecisionStatus -ne 'CONFIRMED_SECURE_VALUE' -or $royalty.rateSource -ne 'SECRET_MANAGER' -or $royalty.rateSecretName -notmatch '^FINANCE_[A-Z0-9_]{3,80}$' -or $royalty.scopeVariability -notin @('FIXED_GLOBAL','CONTRACT','DEALER','BRANCH')) { throw 'Approved royalty rate source or scope policy is invalid.' }
 foreach ($name in @('financeDirector','financialAdvisor','franchiseManagement','legal')) { if ([string]::IsNullOrWhiteSpace($d.approval.$name)) { throw "Commercial approval missing: $name" } }
 if ($d.approval.evidencePath -match '^[A-Za-z]:|^\\|^/' -or $d.approval.evidenceSha256 -notmatch '^[a-fA-F0-9]{64}$') { throw 'Commercial evidence identity is invalid.' }
 $e = [IO.Path]::GetFullPath((Join-Path $root $d.approval.evidencePath))
 if (-not $e.StartsWith($root,[StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path $e)) { throw 'Commercial evidence file is missing.' }
 if ((Get-FileHash $e -Algorithm SHA256).Hash.ToLowerInvariant() -ne $d.approval.evidenceSha256.ToLowerInvariant()) { throw 'Commercial evidence hash mismatch.' }
 [void][DateTimeOffset]::Parse($d.approval.signedAtUtc)
}
$decision=if($approved){'APPROVED'}else{'PENDING_DECISIONS'}
Write-Host "FINANCE COMMERCIAL CONFIGURATION: $decision" -ForegroundColor $(if($approved){'Green'}else{'Yellow'})
Write-Host ("Fee families: 8; periodic franchise disabled until approved contract rule; production values exposed: false")
if ($RequireApproved -and -not $approved) { throw 'Commercial configuration is not approved.' }
