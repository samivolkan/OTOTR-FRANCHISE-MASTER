# OTOTR GM Finans Sentetik Test Ortamı

Bu ortam ana finans ekranlarının ve güvenli okuma akışlarının gerçek ERP veya üretim verisi olmadan incelenmesi içindir. Veriler tamamen sentetiktir, yalnız `127.0.0.1` üzerinde çalışır ve yazma işlemleri kalıcı değildir.

## Başlatma

PowerShell 7 ile depo kökünde:

```powershell
pwsh -NoProfile -File scripts/Start-GMFinanceDemo.ps1
```

Komut önce tarayıcı kabul testini çalıştırır, sonra demoyu `http://127.0.0.1:4173/index.html?financeDemo=1#finance` adresinde açılabilir hale getirir. Farklı port için `-Port 4273` kullanılabilir. Ön kontrol yalnız daha önce ayrıca çalıştırıldıysa `-SkipPreflight` seçeneği kullanılmalıdır.

## Bağımsız doğrulama

```powershell
pwsh -NoProfile -File scripts/Test-GMFinanceDemoEnvironment.ps1
```

Başarılı sonuç şu sözleşmeleri doğrular:

- ortam etiketi `SYNTHETIC_DEMO`;
- `productionDataUsed: false`;
- `writesPersisted: false`;
- yalnız `127.0.0.1` bağlantısı;
- GM Finans menüsü, genel merkez ve bayi özetleri, royalty simülasyonu, entegrasyon kuyruğu, onay listesi ve audit izi tarayıcıda çalışır.

Çalışan sunucunun makinece okunabilir durumu `GET /health` ile alınır.

## Sınırlar

Bu demo, staging veya pre-production onayı değildir. Gerçek ERP adaptörleri, yetkili kullanıcı maker-checker imzaları, ticari/vergi kararları, alarm hedefleri, maskeli pilot veri, hacim testi ve geri dönüş tatbikatı tamamlanmadan canlıya geçiş kararı `NO_GO` kalır. Demo ekranındaki tutarlar ticari karar veya fatura dayanağı olarak kullanılamaz.

For hosted demo provisioning, create a dedicated staging Auth user with no ERP roles. Grant only finance.source-events.ingest and finance.accruals.calculate for SCOPE-B2 via Auth app metadata. Keep the worker sign-in secrets in Edge Functions Secrets. Configure the scenario with the SCOPE-B2 ERP branch ID, finance branch ID, headquarters and dealer legal entity IDs, dealer account ID, royalty fee definition ID, one stable correlation UUID, explicitly allowed ERP user IDs, runType LIVE (inside staging), and attempt 1. The worker account must not be listed as an ERP UI actor.
