# OTOTR Franchise Finans — UAT ve Pre-Production Kabul Planı

## Amaç ve karar sınırı

Bu plan, yerelde doğrulanan franchise finans çekirdeğini gerçek ERP adaptörleri, yetkili kullanıcılar ve maskeli pilot verilerle pre-production kabulüne taşır. Yerel testin geçmesi canlı onayı değildir. `docs/finance/uat-preproduction-gates.json` içindeki 12 kapının tamamı kanıt ve imzayla `PASSED` olmadan karar **NO-GO** kalır.

Canlı üretim verisi bu aşamada kullanılamaz. Pilot veri anonimleştirilmiş veya sentetik olmalı; ad, telefon, plaka, TCKN/VKN, banka bilgisi ve serbest metinlerdeki kişisel veriler test paketine girmemelidir.

## Aşama ve sorumluluklar

| Aşama | Sorumlu | Girdi | Çıkış / kanıt |
|---|---|---|---|
| 1. Ticari kural dondurma | Finans Direktörü + Franchise + Hukuk | Sözleşmeler ve ücret politikası | İmzalı bedel matrisi, geçerlilik tarihleri, KDV/vade/iade kuralları |
| 2. Muhasebe tasarımı | Mali Müşavir + Finans Kontrol | Bedel matrisi | Hesap planı, belge tipi, borç/alacak ve ters kayıt eşlemesi |
| 3. Staging ana veri | ERP Ürün Sahibi + Veri Lideri | Tüzel kişi/bayi/şube listesi | Kimlik eşleme kontrol toplamları ve istisna listesi |
| 4. Entegrasyon | Entegrasyon Lideri | Kaynak olay sözleşmeleri | Tahsilat, iade, kullanım, fatura ve muhasebe adaptör kanıtları |
| 5. Teknik kabul | Teknik Lider + Güvenlik | Staging dağıtımı | Replay, RLS, izolasyon, idempotency, performans ve log kanıtları |
| 6. İş UAT | Finans Operasyon + pilot bayi | Maskeli pilot senaryo seti | Senaryo bazlı beklenen/gerçek sonuç ve kullanıcı imzası |
| 7. Operasyon tatbikatı | Operasyon + Platform | Destek ve geri dönüş planı | Alarm, hata kuyruğu, restore ve rollback tatbikat kaydı |
| 8. Nihai karar | Proje Yöneticisi | FIN-G01…FIN-G11 | Dört yetkili imzalı GO/NO-GO tutanağı |

## Zorunlu UAT senaryoları

Her satır için kaynak olay kimliği, correlation ID, sözleşme/kural sürümü, beklenen tutar, gerçek tutar, defter kaydı, açık kalem, dönem ve ekran görüntüsü/çıktı saklanır.

| ID | Senaryo | Kabul kriteri | Birincil onay |
|---|---|---|---|
| UAT-FIN-01 | KDV dahil tam tahsilat royalty | Kesinleşen brüt tahsilat × onaylı oran; tek tahakkuk ve dengeli kayıt | Finans Operasyon |
| UAT-FIN-02 | Kısmi tahsilat royalty | Her kesinleşen parça ayrı ve idempotent hesaplanır | Finans Operasyon |
| UAT-FIN-03 | Kısmi/tam müşteri iadesi | Önceki royalty oransal ters kayıtla azalır; orijinal referans korunur | Finans Kontrol |
| UAT-FIN-04 | Kilitli dönem iadesi | Ters kayıt açık döneme gider; orijinal dönem/tahakkuk provenance korunur | Mali Müşavir |
| UAT-FIN-05 | Giriş franchise bedeli | Doğru şube, sözleşme, KDV, vade, fatura adayı ve açık kalem | Franchise Yönetimi |
| UAT-FIN-06 | Sorgu bedeli | Ücretsiz hak/teknik tekrar/ücretli kullanım ayrımı ve tekilleştirme doğru | Operasyon |
| UAT-FIN-07 | Harici ve opsiyonel hizmet | Hizmet türü, sağlayıcı maliyeti, bayi fiyatı ve marj doğru | Finans Operasyon |
| UAT-FIN-08 | Masraf yansıtma | Belge, dayanak, dağıtım anahtarı, yuvarlama, maker-checker ve ters kayıt doğru | Finans Kontrol |
| UAT-FIN-09 | Kesinti / kredi düzeltmesi | Yetkisiz doğrudan değişiklik yok; itiraz kararıyla izlenebilir düzeltme oluşur | Finans Direktörü |
| UAT-FIN-10 | Ödeme ve kısmi tahsis | Doğrulanmış ödeme açık kalemlere doğru dağılır; dağıtılmamış bakiye görünür | Finans Operasyon |
| UAT-FIN-11 | Tahsis geri alma | Açık bakiye ve ödeme dağıtılmamış tutarı ters zincirle geri gelir | Finans Kontrol |
| UAT-FIN-12 | Faturalama geri bildirimi | Şube adına paket, dış fatura ID/no callback ve tekrar çağrı idempotent | Muhasebe |
| UAT-FIN-13 | Muhasebe export | Kontrol toplamları eşit, hesap eşlemesi sürümlü, tekrar export güvenli | Mali Müşavir |
| UAT-FIN-14 | Dönem hesaplama/kapanış | Kaynak dondurma, eksik iş bekleme, mutabakat, kilit ve kontrollü reopen | Finans Direktörü |
| UAT-FIN-15 | Bayi özeti ve ekstre | Özet/ekstre/defter kontrol toplamları eşit; cursor ve filtre sonucu tam | Pilot Bayi |
| UAT-FIN-16 | Çapraz bayi/şube erişimi | Başka kapsam için sonuç değil 403/kapalı hata; ham tablo erişimi yok | Bilgi Güvenliği |
| UAT-FIN-17 | Hata, retry ve duplicate | Timeout/retry aynı finansal sonucu üretir; DLQ ve correlation izi görünür | Teknik Lider |
| UAT-FIN-18 | Export ve kişisel veri | Yetkisiz export reddedilir; log/çıktıda gizli veya kişisel veri bulunmaz | KVKK Sorumlusu |

## UAT kayıt şablonu

Makinece doğrulanan yürütme kaydı `docs/finance/uat-execution-evidence.json` dosyasıdır. Repository’deki kayıt gerçek staging çalışması yapılana kadar `NOT_SIGNED` kalır. On sekiz senaryonun tamamında farklı uygulayan/onaylayan kurumsal kimliği, doğru onay rolü, sonuç hash’leri, eşit kontrol toplamları ve repository-relative hash’li kanıt bulunmadan aşağıdaki kapı geçmez:

```powershell
pwsh -NoProfile -File scripts/Test-FinanceUATExecution.ps1 -RequirePassed
```

Her çalıştırma için aşağıdaki alanlar zorunludur:

- senaryo ID ve test tarihi;
- ortam commit/migration manifest hash’i;
- test kullanıcısı ve rolü (kullanıcı adı yerine kurumsal kimlik ID’si);
- tüzel kişi, bayi ve şube test kimlikleri;
- girdi olayları ve correlation ID’ler;
- beklenen net/KDV/brüt, gerçek net/KDV/brüt ve fark;
- ilgili tahakkuk, journal, açık kalem, ödeme/tahsis ve dönem kimlikleri;
- PASS/FAIL, sapma kaydı ve çözüm commit’i;
- uygulayan ve onaylayan kişinin adı, rolü, UTC imza zamanı;
- kanıt dosyasının repository-relative yolu ve SHA-256 değeri.

## Pre-production teknik kapısı

Güvenlik yürütme kaydı `docs/finance/staging-security-evidence.json` dosyasıdır. Sekiz kontrolün tamamı hash’li kanıtla geçmeden, uygulayan ve onaylayan kurumsal kimlikler ayrışmadan ve kritik/yüksek/çözülmemiş/kabul edilmiş risk sayıları sıfır olmadan aşağıdaki kapı geçmez:

```powershell
pwsh -NoProfile -File scripts/Test-FinanceStagingSecurity.ps1 -RequirePassed
```

1. Temiz migration replay aynı manifest ile geçer.
2. Hiçbir tarayıcı rolü `finance` veya `finance_private` tablolarına doğrudan erişemez.
3. ERP JWT kimliği ve şube kapsamı sunucuda doğrulanır; tarayıcı kapsamı güven kaynağı değildir.
4. UAT kontrol toplamları kaynak olay → tahakkuk → defter → açık kalem → ödeme/tahsis → fatura/export zincirinde eşittir.
5. P95 okuma ve yazma hedefleri gerçekçi staging hacminde onaylanır; timeout ve retry bütçeleri kaydedilir.
6. Hata kuyruğu, alarm, correlation araması ve destek SLA tatbikatı tamamlanır.
7. Yedekten restore ayrı hedefte doğrulanır. Finans verisinde yıkıcı down migration uygulanmaz; uygulama geri alma + erişim kapatma + forward-fix kullanılır.
8. Dağıtım penceresi, sorumlular, iletişim zinciri ve ilk 24 saat izleme planı imzalanır.

## Karar komutu

FIN-G01…FIN-G11 tamamlandığında nihai karar `docs/finance/preproduction-decision.json` dosyasında hazırlanır. Proje Yöneticisi, Finans Direktörü, ERP Ürün Sahibi, Bilgi Güvenliği ve Franchise Yönetimi farklı kimliklerle imzalamadan; release commit’i, değişiklik penceresi, release manifesti ve rollback kanıtı bağlanmadan aşağıdaki komut `GO` vermez. Doğrulanan karar dosyası daha sonra beş rol tarafından FIN-G12 kanıtı olarak kaydedilir.

```powershell
pwsh -NoProfile -File scripts/Test-FinancePreproductionDecision.ps1 -RequireGo
```

Mevcut durumu raporlamak:

```powershell
pwsh -NoProfile -File scripts/Test-FinancePreproductionReadiness.ps1
```

CI/CD veya release sırasında eksik kapıda işlemi durdurmak:

```powershell
pwsh -NoProfile -File scripts/Test-FinancePreproductionReadiness.ps1 -RequireGo
```

Bir kapı yalnız kanıt dosyası mevcutken; SHA-256, imzalayan kişi, yetkili rol ve UTC imza zamanı girildiğinde `PASSED` yapılabilir. Kapı sahibi ile `approvers` listesindeki rollerin tamamı imzalamadan durum `PENDING` kalır. Kayıtlar JSON elle değiştirilerek değil aşağıdaki komutla eklenir:

```powershell
pwsh -NoProfile -File scripts/Set-FinancePreproductionGateEvidence.ps1 `
  -GateId FIN-G01 `
  -EvidencePath docs/finance/evidence/imzali-ticari-karar.pdf `
  -SignedBy "Ad Soyad" `
  -SignedRole "Finans Direktörü"
```

Komut kanıtın SHA-256 değerini kendisi üretir. Aynı dosya/rol imzasının tekrarı ve yetkisiz rol reddedilir. FIN-G12, FIN-G01…FIN-G11 tamamlanmadan onaylanamaz.

## Bugünkü doğrulanmış durum

- Yerel veritabanı kabul kapısı sentetik verilerle geçiyor.
- 17 GM Finans ekranının tamamı en az canlı okuma seviyesinde; shell ekran kalmadı.
- Onay iş listesi ve audit/correlation projectionları şube izolasyonu ve veri minimizasyonuyla doğrulandı.
- ERP arayüzü izole Chrome testinde yönetişim, entegrasyon, export, masraf, itiraz, ekstre ve ödeme akışlarıyla doğrulandı.
- Ticari/mali karar girişi için `commercial-configuration-intake.md`, ERP staging eşlemesi için `erp-staging-mapping-intake.md` hazırlandı.
- Yerel sentetik operasyon tabanı hazırdır: 2.000 kapsamlı audit kaydında sayfalama ölçülür; ayrı yerel hedefe backup/restore katalog doğrulaması yapılır; `operations-runbook.md` alarm, retry, forward-fix ve tatbikat kayıtlarını tanımlar; GM Finans sağlık özeti outbox yaşı/sayısı, dead-letter, açık entegrasyon hatası ve audit zincirini yetkili genel merkez ekranına taşır.
- Staging adaptörleri, gerçek kullanıcı UAT’si, ticari/vergi imzaları, staging hacminde performans, pre-production restore ve imzalı operasyon tatbikatı henüz yoktur.

Sonuç: **NO-GO**. Bu, bir hata değil; eksik kurumsal kanıtları görünür tutan fail-closed karardır.
