# FIN-G02 Vergi ve Muhasebe Onay Formu

Ana kayıt `tax-accounting-decision.json` dosyasıdır. Bu form Mali Müşavir ve Finans Direktörü tarafından tamamlanmadan FIN-G02 kapatılamaz. Sentetik testlerde kullanılan `391.KDV`, `600.*` ve benzeri hesaplar öneri veya canlı eşleme değildir.

## Onaylanacak genel kararlar

| Alan | Mevcut durum | Karar sahibi |
|---|---|---|
| Fatura/belge tipi | Bekleniyor | Mali Müşavir |
| İade/mahsup belge tipi | Bekleniyor | Mali Müşavir |
| Yuvarlama yöntemi | Bekleniyor | Mali Müşavir |
| Ana para birimi | FIN-C01 kullanıcı kararı bekleniyor | Finans Direktörü + Mali Müşavir |
| Faturayı düzenleyen | Genel merkez tüzel kişisi | Mali Müşavir + Finans Direktörü |
| Fatura muhatabı | Şube ticari unvanı | Mali Müşavir + Finans Direktörü |
| Belge numarası | Muhasebe sağlayıcısı callback'i | Finans Direktörü |

## Her bedel ailesi için zorunlu eşleme

Sekiz bedel ailesinin her biri için vergi kodu, onaylı vergi kodu sürümü, bayi/şube alacak hesabı, gelir hesabı, hesaplanan KDV hesabı, ters kayıt hesabı ve fatura satır kodu doldurulur. Royalty için mevcut iş kararı: müşteriden kesinleşen KDV dahil brüt tahsilatın tamamı matrahtır; hesaplanan royalty bedeline ayrıca yüzde 20 KDV uygulanır. Bu iş kararı tek başına muhasebe/vergi görüşü değildir.

Harici hizmetler için mevcut iş kararı sağlayıcı maliyeti + yüzdesel hizmet bedeli + ayrıca KDV ve üç kalemin ayrı gösterimidir. KDV'nin sağlayıcı maliyeti, hizmet bedeli veya toplam yansıtma tutarından hangisine uygulanacağı Mali Müşavir tarafından ayrıca onaylanmadan yapılandırılmaz.

İade ve iptaller doğrudan bakiye değişikliği yapmaz. Bağlı ters yevmiye üretir, orijinal dönem ve tahakkuk referansını korur; orijinal dönem kilitliyse kayıt güncel açık döneme atılır. Fazla royalty kredisi yalnız aynı şubede ileri taşınır.

## Kapatma koşulu

JSON kaydı `APPROVED` yapılmadan önce tüm zorunlu alanlar doldurulur, imzalı kanıt depo içinde güvenli bir göreli yola eklenir, SHA-256 değeri kaydedilir ve iki farklı kurumsal kimlik ile imza zamanı yazılır. `Test-FinanceTaxAccountingDecisionPack.ps1 -RequireApproved` geçmeden FIN-G02 `PASSED` yapılamaz.
