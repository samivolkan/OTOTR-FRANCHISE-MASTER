# Ödeme Sağlayıcı Checkout Adaptör Sözleşmesi

Bu sözleşme, şubenin GM faturasını kredi kartıyla ödemek için yönlendirileceği gerçek ödeme kuruluşunu OTOTR finans çekirdeğinden ayırır. Sağlayıcı seçimi yapılmadan kanonik sınır sabitlenmiştir; sağlayıcıya özgü alan eşleme ve imza doğrulama daha sonra bu sınırın arkasına eklenir.

## Kanonik checkout isteği

Sunucu/BFF yalnız aşağıdaki alanları adaptöre verir:

- `externalInvoiceId`, `legalEntityId`, `dealerAccountId`, `branchId`
- iki ondalıklı pozitif `amount` ve üç harfli `currencyCode`
- HTTPS `returnUrl`
- `correlationId`

PAN, kart numarası, CVV/CVC, son kullanma tarihi veya kart sahibi bilgisi OTOTR uygulamasına, loglarına ya da veritabanına giremez. Kart bilgisi yalnız ödeme kuruluşunun PCI uyumlu sayfasında alınır.

ERP geçidi checkout orkestratörüne tutar, para birimi, bayi veya şube kapsamı gönderemez. Yalnız aktör, harici fatura kimliği ve HTTPS dönüş adresi kabul edilir. `finance-payment-checkout-orchestrator` fatura durumunu, açık tutarı, para birimini ve üç boyutlu kapsamı sunucu tarafı portundan yeniden türetir. Böylece tarayıcıdan tutar düşürme veya farklı şubeye ödeme başlatma engellenir.

## Kanonik checkout yanıtı

Adaptör yalnız `providerPaymentToken`, HTTPS `redirectUrl` ve gelecekteki `expiresAtUtc` döndürebilir. Ortak katman bunlara `providerCode` ve sabit `cardDataStored: false` ekler. Bilinmeyen alanlar ve kart verisi çağrışımlı alanlar fail-closed reddedilir.

Orkestratör sağlayıcı tokenının yalnız SHA-256 özetini kayıt portuna verir; ham tokenı ERP yanıtına veya kalıcı finans kaydına taşımaz. Tarayıcıya checkout oturum kimliği, yönlendirme adresi, son kullanım zamanı ve sunucudan türetilen tutar döner.

Başarılı checkout ödeme sayılmaz. Finansal kapatma ve şube erişiminin açılması yalnız imzası doğrulanmış `SETTLED` callback'inin `finance-payment-callback-worker` üzerinden atomik kaydıyla gerçekleşir.

## Gerçek sağlayıcı kabul kapısı

FIN-G05 ve UAT-FIN-10 tamamlanmadan önce seçilen kuruluş için şu kanıtlar zorunludur:

1. Sandbox checkout ve 3D Secure başarı/başarısızlık/iptal akışları.
2. Tutar, para birimi, fatura ve şube kapsamının sunucu tarafından yeniden doğrulanması.
3. Callback imzası, replay, değiştirilmiş tekrar ve zaman aşımı/retry testleri.
4. Ham kart verisinin OTOTR log, ağ gövdesi ve veritabanında bulunmadığına dair güvenlik kanıtı.
5. Tam ödeme sonrası otomatik açılma; eksik/başarısız ödeme sonrası kilidin korunması.
6. Sağlayıcı sözleşmesi, komisyon, valör, iade/chargeback ve mutabakat sahiplerinin onayı.

Yerel uyumluluk testleri `scripts/Test-FinancePaymentProviderAdapter.ps1` ve `scripts/Test-FinancePaymentCheckoutOrchestrator.ps1` ile çalıştırılır. Bu testler gerçek sağlayıcı veya PCI sertifikasyonu yerine geçmez.
