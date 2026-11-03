# OTOTR GM Finans — Operasyon ve Geri Dönüş Runbook Taslağı

## Kullanım sınırı

Bu doküman yerel ve pre-production tatbikatı içindir. Üretim ortamında çalıştırma yetkisi vermez. Canlı erişim, sorumlu isimleri, iletişim kanalı, RTO/RPO ve bakım penceresi Platform Lideri ile Finans Operasyon tarafından imzalanmadan FIN-G10 veya FIN-G11 geçemez.

## İzleme sinyalleri

| Sinyal | Uyarı adayı | Kritik aday | İlk kontrol |
|---|---:|---:|---|
| `outbox PENDING` en yaşlı kayıt | 5 dakika | 15 dakika | Adaptör sağlığı, son hata kodu, correlation ID |
| `outbox DEAD_LETTER` yeni kayıt | 1 kayıt | 5 kayıt / 15 dakika | Retry uygunluğu ve idempotency anahtarı |
| Açık entegrasyon hatası | 10 dakika | 30 dakika | Güvenli hata detayı, kaynak sistem ve sahip |
| Audit zinciri doğrulaması | 1 geçersiz kayıt | Aynı | Yazmayı durdur, Bilgi Güvenliği’ne yükselt |
| Finans RPC hata oranı | %2 / 5 dakika | %5 / 5 dakika | RPC, rol/kapsam ve veritabanı logları |
| P95 okuma süresi | staging hedefinin %80’i | staging hedefi | Sorgu planı, indeks ve bağlantı havuzu |

Eşikler adaydır; staging ölçümü ve sahip onayı olmadan üretim SLO’su değildir.

Staging performans kaydı `docs/finance/staging-performance-evidence.json` dosyasıdır. Hedef hacim, eşzamanlılık, istek sayısı, P95/P99, hata oranı ve timeout bütçesi Platform Lideri tarafından kanıtla onaylanmadan değerler tahmin edilmez. Dört iş yükünün tamamı için `Test-FinanceStagingPerformance.ps1 -RequirePassed` geçmeden FIN-G09 kapatılamaz.

## Olay akışı

1. Alarmı alan görevli correlation ID, tüzel kişi, bayi/şube test kimliği ve UTC zamanı kaydeder; ham payload veya kişisel veri destek kaydına kopyalanmaz.
2. Finansal yazma etkileniyorsa ilgili adaptör/komut yolu kapatılır; ham tabloya manuel düzeltme yapılmaz.
3. Retry yalnız `retryable=true`, ERP rol/şube kapsam yetkisi ve aynı idempotency/intent sözleşmesiyle çalıştırılır. GM Finans ekranı kullanıcı JWT’siyle yetki sorar; commit yalnız `finance-command` içindeki server-side service-role adaptörü üzerinden yapılır. Çözüm notunun yalnız SHA-256 izi saklanır.
4. Tutar etkisi varsa tahakkuk → journal → açık kalem → ödeme/tahsis → fatura/export kontrol toplamları karşılaştırılır.
5. Düzeltme ters kayıt veya forward-fix ile yapılır. Finans migrasyonunda yıkıcı down migration kullanılmaz.
6. Kapanışta kök neden, etkilenen correlation ID’ler, düzeltme commit’i, kontrol toplamı ve iki yetkili onayı saklanır.

Atama, retry, çözüm ve dead-letter kararları `integration-error-action-policy.md` içindeki `INTEGRATION_ERROR_ACTION_V1` sözleşmesine uyar. Dead-letter kaydı doğrudan yok sayılamaz; yok sayma için maker-checker onayı gerekir.

## Geri dönüş stratejisi

- Uygulama hatasında önce yeni yazma yolu feature flag/route seviyesinde kapatılır ve son doğrulanmış uygulama paketi geri alınır.
- Şema değişikliklerinde down migration uygulanmaz. Geriye uyumlu forward-fix hazırlanır; eski uygulamanın okuyabileceği alanlar korunur.
- Finansal kayıt silinmez veya overwrite edilmez. İptal ve düzeltmeler orijinal dönem/tahakkuk referansını taşıyan ters kayıtla yapılır.
- Restore yalnız ayrı hedefte doğrulanır. Kaynak veritabanı restore tatbikatında overwrite edilmez.

Yerel restore doğrulaması:

```powershell
pwsh -NoProfile -File scripts/Test-FinanceLocalBackupRestore.ps1
```

Bu komut ERP kimlik bağımlılıkları ile `finance`, `finance_api` ve `finance_private` şemalarının yerel dump'ını alır; yalnız `ototr_finance_restore_verify` adlı ayrı veritabanını oluşturur, 48 finans tablosu ve 170 API fonksiyonunu karşılaştırır, ardından geçici hedefi ve dump dosyalarını siler. Supabase'in yönetilen `realtime`, storage veya auth sistem şemalarını restore etmez.

## Pre-production tatbikat kayıt alanları

- ortam, commit ve migration manifest hash’i;
- başlangıç/bitiş UTC zamanı;
- alarmı alan, teknik uygulayan ve finansal kontrolü yapan roller;
- maskeli/sentetik senaryo ve correlation ID;
- algılama, müdahale ve toparlanma süreleri;
- beklenen/gerçek kontrol toplamları;
- backup zamanı, restore hedefi ve doğrulanan nesne sayıları;
- rollback veya forward-fix commit’i;
- sapmalar, takip işi ve imzalayanlar.

## Henüz doldurulması gereken kurumsal alanlar

- Operasyon Lideri ve yedek nöbetçi;
- Platform Lideri ve veritabanı sorumlusu;
- Finans Operasyon onaycısı;
- güvenli alarm/destek kanalı;
- destek önem seviyeleri ve SLA;
- staging P95/P99 hedefleri;
- RTO ve RPO;
- bakım ve geri dönüş penceresi;
- ilk 24 saat izleme vardiyası.
