[CmdletBinding()]
param(
  [string]$ConfigurationFile = (Join-Path $PSScriptRoot '..\docs\finance\commercial-configuration.json'),
  [string]$OutputFile = (Join-Path $PSScriptRoot '..\docs\finance\commercial-configuration-public.json')
)
$ErrorActionPreference = 'Stop'
$source = Get-Content -Raw -LiteralPath (Resolve-Path $ConfigurationFile) | ConvertFrom-Json -Depth 30
if ($source.schemaVersion -ne 1 -or $source.module -ne 'OTOTR_FRANCHISE_FINANCE' -or $source.environment -ne 'PREPRODUCTION_CANDIDATE') { throw 'Invalid commercial configuration identity.' }
$codes = @('ROYALTY','ENTRY_FRANCHISE','QUERY','EXTERNAL_SERVICE','OPTIONAL_PRODUCT_SERVICE','PASS_THROUGH_EXPENSE','DEDUCTION_CREDIT')
$behaviors = [ordered]@{
  ROYALTY = 'Varsayılan oran güvenli backend yapılandırmasında onaylıdır; matrah müşteriden tahsil edilen KDV dahil brüt tutarın tamamıdır ve gider/kart komisyonu düşülmez; hesaplanan bedele ayrıca %20 KDV uygulanır. Şube açılışında ticari değer, süre ve günlük/haftalık/aylık fatura periyodu manuel seçilir; değişiklikler yalnız ileriye uygulanır. Dönem tahakkukları faturada Royalty Hizmet Bedeli adıyla tek satırda toplanır; müşteri iadesi ters kayıtları sonraki aynı satırda eksi mahsup edilir. Fazla eksi bakiye aynı şubenin sonraki dönemlerine süresiz kredi olarak devreder; şubeler arasında aktarılamaz ve alt hesaplama izi korunur. Fatura ertesi gün kredi kartıyla ödenir; doğrulanmış tam ödeme yoksa operasyon erişimi kilitlenir, ödeme ve destek erişimi açık kalır. 6/12 ay yeni şube ve onaylı mali zorluk muafiyeti desteklenir.'
  ENTRY_FRANCHISE = 'Şube veya sözleşme aktivasyonu tetikleyicisi tanımlı.'
  QUERY = 'Başarılı ve ücretlendirilebilir sorgu tetikleyicisi tanımlı.'
  EXTERNAL_SERVICE = 'Başarılı hizmet teslimi tetikleyicisi tanımlı.'
  OPTIONAL_PRODUCT_SERVICE = 'Ürün veya hizmet aktivasyonu tetikleyicisi tanımlı.'
  PASS_THROUGH_EXPENSE = 'Onaylı kaynak masraf ve maker-checker akışı tanımlı.'
  DEDUCTION_CREDIT = 'Onaylı karar üzerinden kredi; doğrudan bakiye düzenleme yasak.'
}
$decisionFields = [ordered]@{
  ROYALTY = @('taxCode','refundCashPayoutPolicy')
  ENTRY_FRANCHISE = @('calculationMethod','amountOrRate','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  QUERY = @('calculationMethod','amountOrRate','freeEntitlementPolicy','technicalRepeatPolicy','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  EXTERNAL_SERVICE = @('calculationMethod','amountOrRate','providerMarginPolicy','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  OPTIONAL_PRODUCT_SERVICE = @('calculationMethod','amountOrRate','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  PASS_THROUGH_EXPENSE = @('calculationMethod','allocationPolicy','effectiveFrom','dueRule','taxCode','invoiceLineCode')
  DEDUCTION_CREDIT = @('calculationMethod','amountOrRate','effectiveFrom','taxCode','invoiceLineCode')
}
$families = foreach ($code in $codes) {
  $matches = @($source.feeFamilies | Where-Object code -eq $code)
  if ($matches.Count -ne 1) { throw "Commercial family missing or duplicated: $code" }
  $family = $matches[0]
  $pending = @($decisionFields[$code] | Where-Object { $null -eq $family.$_ -or [string]::IsNullOrWhiteSpace([string]$family.$_) })
  [ordered]@{code=$code;decisionStatus=$family.decisionStatus;confirmedBehavior=$behaviors[$code];pendingFields=$pending}
}
$projection = [ordered]@{schemaVersion=1;module='OTOTR_FRANCHISE_FINANCE';projection='COMMERCIAL_DECISION_STATUS_PUBLIC';status=$source.status;productionValuesExposed=$false;approvalIdentitiesExposed=$false;evidenceMetadataExposed=$false;feeFamilies=$families}
$target = [IO.Path]::GetFullPath($OutputFile)
$parent = Split-Path -Parent $target
if (-not (Test-Path -LiteralPath $parent)) { throw 'Projection output directory does not exist.' }
$projection | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $target -Encoding utf8NoBOM
Write-Host "FINANCE COMMERCIAL PUBLIC PROJECTION: GENERATED ($($families.Count) families)"
