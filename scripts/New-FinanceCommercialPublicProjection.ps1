[CmdletBinding()]
param(
  [string]$ConfigurationFile = (Join-Path $PSScriptRoot '..\docs\finance\commercial-configuration.json'),
  [string]$OutputFile = (Join-Path $PSScriptRoot '..\docs\finance\commercial-configuration-public.json')
)
$ErrorActionPreference = 'Stop'
$source = Get-Content -Raw -LiteralPath (Resolve-Path $ConfigurationFile) | ConvertFrom-Json -Depth 30
if ($source.schemaVersion -ne 1 -or $source.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $source.environment -ne 'PREPRODUCTION_CANDIDATE') { throw 'Invalid commercial configuration identity.' }
$codes = @('ROYALTY','ENTRY_FRANCHISE','PERIODIC_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','DEDUCTION_CREDIT')
$behaviors = [ordered]@{
  ROYALTY = 'Varsayılan oran güvenli backend yapılandırmasında onaylıdır; matrah müşteriden tahsil edilen KDV dahil brüt tutarın tamamıdır ve gider/kart komisyonu düşülmez; hesaplanan bedele ayrıca %20 KDV uygulanır. Şube açılışında ticari değer, süre ve günlük/haftalık/aylık fatura periyodu manuel seçilir; değişiklikler yalnız ileriye uygulanır. Dönem tahakkukları faturada Royalty Hizmet Bedeli adıyla tek satırda toplanır; müşteri iadesi ters kayıtları sonraki aynı satırda eksi mahsup edilir. Fazla eksi bakiye aynı şubenin sonraki dönemlerine süresiz kredi olarak devreder; şubeler arasında aktarılamaz ve alt hesaplama izi korunur. Fatura ertesi gün kredi kartıyla ödenir; doğrulanmış tam ödeme yoksa operasyon erişimi kilitlenir, ödeme ve destek erişimi açık kalır. 6/12 ay yeni şube ve onaylı mali zorluk muafiyeti desteklenir.'
  ENTRY_FRANCHISE = 'Giriş franchise bedeli şube açılışında her şube için ayrı sabit tutar olarak manuel ve maker-checker onaylı belirlenir; global sabit değildir. Açılış referansıyla şube başına yalnız bir kez tahakkuk eder; tekrar tahakkuk reddedilir, değişiklikler ileriye uygulanır ve geriye dönük oluşturulmaz. Vade şube veya sözleşme bazında ayarlanır; kredi kartı desteklenen seçeneklerden biridir fakat tek zorunlu yöntem değildir.'
  PERIODIC_FRANCHISE = 'Ayrı periyodik franchise bedeli ticari kararla devre dışıdır. Yeni sözleşmelerde etkinleştirilemez ve yeni tahakkuk oluşturamaz; teknik aile yalnız geçmiş kayıt uyumluluğu için korunur.'
  QUERY = 'Başarılı ve ücretlendirilebilir sorgu başına sabit tutar uygulanır. Sözleşme veya kampanya üzerinden ücretsiz sorgu hakkı tanımlanmaz. Orijinal sorguya bağlı ve teknik hata kanıtı bulunan tekrar ücretsizdir; normal kullanıcı tekrarı bu istisnaya girmez ve audit izi korunur. TRAMER, KM ve TRAMER 360 hizmet kodlarının kullanıcı tarafından kararlaştırılan tutarları yalnız güvenli backend yapılandırmasında tutulur; public projeksiyon ticari tutar açıklamaz.'
  EXTERNAL_SERVICE = 'Başarılı harici hizmet teslimi, sağlayıcı maliyeti artı yüzdesel hizmet bedeli ve ayrıca KDV yöntemiyle yansıtılır. Sağlayıcı maliyeti, hizmet bedeli ve vergi şubeye ayrı gösterilir; oran, yürürlük, KDV matrahı ve vergi kodu onayı beklenir.'
  OPTIONAL_PRODUCT_SERVICE = 'Opsiyonel ürün veya hizmette girilen kaynak maliyet üzerine kullanıcı tarafından onaylanan hizmet bedeli ve bu hizmet bedeline ayrıca KDV uygulanır. Oran güvenli sunucu yapılandırmasında tutulur; kaynak maliyet, hizmet bedeli ve KDV ayrı gösterilir. KDV oranı ve muhasebe kodu Mali Müşavir onayı bekler.'
  PASS_THROUGH_EXPENSE = 'Onaylı genel merkez kaynak masrafına güvenli backend yapılandırmasındaki hizmet oranı ve ayrıca KDV uygulanır. Kaynak masraf, hizmet bedeli ve vergi şubeye ayrı ve izlenebilir gösterilir; belge izi ile maker-checker korunur.'
  DEDUCTION_CREDIT = 'Onaylanan itiraz veya kesinti tutarı ayrı kredi belgesi yerine aynı şubenin mevcut cari ödemesinden mahsup edilebilir. Mahsup kaynak işlem ve onay referanslarıyla izlenir; maker-checker ve audit izi zorunludur. Sessiz doğrudan bakiye düzenleme ve şubeler arası mahsup yasaktır.'
}
$decisionFields = [ordered]@{
  ROYALTY = @('taxCode','refundCashPayoutPolicy')
  ENTRY_FRANCHISE = @('amountOrRate','effectiveFrom','additionalPaymentMethods','taxCode','invoiceLineCode')
  PERIODIC_FRANCHISE = @()
  QUERY = @('freeEntitlementPolicy','technicalRepeatPolicy','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  EXTERNAL_SERVICE = @('calculationMethod','amountOrRate','providerMarginPolicy','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  OPTIONAL_PRODUCT_SERVICE = @('secureRateHostedConfiguration','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  PASS_THROUGH_EXPENSE = @('allocationPolicy','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  DEDUCTION_CREDIT = @('amountOrRate','excessOffsetPolicy','effectiveFrom','taxCode','invoiceLineCode')
}
$families = foreach ($code in $codes) {
  $matches = @($source.feeFamilies | Where-Object code -eq $code)
  if ($matches.Count -ne 1) { throw "Commercial family missing or duplicated: $code" }
  $family = $matches[0]
  $pending = @($decisionFields[$code] | Where-Object { $null -eq $family.$_ -or [string]::IsNullOrWhiteSpace([string]$family.$_) })
  [ordered]@{code=$code;decisionStatus=$family.decisionStatus;confirmedBehavior=$behaviors[$code];pendingFields=$pending}
}
$invoicePresentation=[ordered]@{
  mode=$source.invoicePresentationPolicy.mode
  transparentFeeFamilies=@($source.invoicePresentationPolicy.transparentFeeFamilies)
  queryServiceLines=@($source.invoicePresentationPolicy.queryServiceLines)
  showSourceExpenseServiceFeeAndTaxSeparately=[bool]$source.invoicePresentationPolicy.showSourceExpenseServiceFeeAndTaxSeparately
  showProviderCostServiceFeeAndTaxSeparately=[bool]$source.invoicePresentationPolicy.showProviderCostServiceFeeAndTaxSeparately
  officialInvoiceLineCodesStatus=$source.invoicePresentationPolicy.officialInvoiceLineCodesStatus
  aggregateDifferentFeeFamilies=[bool]$source.invoicePresentationPolicy.aggregateDifferentFeeFamilies
}
$feeFamilyStorageMapping=@($source.feeFamilyStorageMapping|ForEach-Object{[ordered]@{businessCode=$_.businessCode;storageCode=$_.storageCode}})
$projection = [ordered]@{schemaVersion=1;module='OTOTR_FRANCHISE_FINANCE';projection='COMMERCIAL_DECISION_STATUS_PUBLIC';status=$source.status;currencyCode=$source.currencyCode;changePolicy=$source.generalChangePolicy.mode;productionValuesExposed=$false;approvalIdentitiesExposed=$false;evidenceMetadataExposed=$false;feeFamilyStorageMapping=$feeFamilyStorageMapping;invoicePresentation=$invoicePresentation;feeFamilies=$families}
$target = [IO.Path]::GetFullPath($OutputFile)
$parent = Split-Path -Parent $target
if (-not (Test-Path -LiteralPath $parent)) { throw 'Projection output directory does not exist.' }
$projection | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $target -Encoding utf8NoBOM
Write-Host "FINANCE COMMERCIAL PUBLIC PROJECTION: GENERATED ($($families.Count) families)"
