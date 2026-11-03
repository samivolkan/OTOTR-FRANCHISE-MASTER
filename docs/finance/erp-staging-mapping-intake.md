# GM Finans — ERP Staging Eşleme ve Adaptör Girdi Formu

Bu belge FIN-G03 ve FIN-G05 için gerekli teknik girdileri toplar. Üretim kimlik bilgileri repository'ye yazılmaz; yalnız secret manager referansı kaydedilir.

Dağıtılacak 134 migration ve sekiz finans Edge Function paketinin değişmez hash, JWT politikası ve gerekli secret **adları** `staging-deployment-manifest.json` içinde tutulur. Manifest gerçek secret değeri veya proje endpoint'i içeremez; `stagingApplied` ancak gerçek dağıtım ve smoke-test kanıtı ayrıca imzalandıktan sonra güncellenebilir.

## Ana veri eşlemeleri

| Alan | ERP kaynak nesnesi/alanı | Finans hedefi | Tekillik anahtarı | Sahip | Durum |
|---|---|---|---|---|---|
| Genel merkez tüzel kişi | Bekleniyor | `finance.legal_entities` | Bekleniyor | ERP Ürün Sahibi | PENDING |
| Bayi tüzel kişisi | Bekleniyor | `finance.dealer_legal_entities` | Bekleniyor | ERP Ürün Sahibi | PENDING |
| Şube | Bekleniyor | `finance.branches` | Bekleniyor | ERP Ürün Sahibi | PENDING |
| Bayi cari hesabı | Bekleniyor | `finance.dealer_accounts` | Bekleniyor | Finans Operasyon | PENDING |
| ERP kullanıcı/rol | Bekleniyor | `app_users` + scope mapping | Bekleniyor | Bilgi Güvenliği | PENDING |
| Sözleşme | Bekleniyor | `finance.franchise_contracts` | Bekleniyor | Franchise Yönetimi | PENDING |
| Hizmet/sorgu kodu | Bekleniyor | `finance.fee_definitions` | Bekleniyor | Operasyon | PENDING |
| Muhasebe hesap kodu | Bekleniyor | accounting mapping version | Bekleniyor | Mali Müşavir | PENDING |

## Adaptör sözleşmeleri

| Akış | Kaynak/hedef sistem | Taşıma | Kimlik doğrulama referansı | Idempotency anahtarı | Retry/DLQ sahibi | Durum |
|---|---|---|---|---|---|---|
| Tahsilat kesinleşmesi | Bekleniyor | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Müşteri iadesi | Bekleniyor | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Sorgu/hizmet kullanımı | Bekleniyor | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Fatura dispatch/callback | Bayinin muhasebe/fatura adaptörü | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Muhasebe export/feedback | Bayi veya GM muhasebe adaptörü | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |

## Staging ortamı zorunluları

- Staging Supabase proje referansı veya eşdeğer veritabanı hedefi;
- ERP test tenant/base URL;
- secret manager ve secret adları (değerler değil);
- izinli ERP origin listesi;
- pilot bayi ve şube kodları;
- test kullanıcılarının kurumsal kimlik ID'leri ve rolleri;
- maskeli açılış bakiyesi kesim tarihi;
- hedef hacim ve eşzamanlı kullanıcı sayısı;
- fatura/muhasebe test adaptörü ve callback allowlist'i;
- log/izleme hedefi ve alarm sahibi.

## Mutabakat kontrol toplamları

Her staging yüklemesinde kaynak ve hedef için kayıt sayısı, net, KDV, brüt, açık bakiye ve tarih aralığı kaydedilir. Fark sıfır değilse yükleme kabul edilmez; istisna listesi imzalanmadan FIN-G03 veya FIN-G06 geçmez.

Makinece doğrulanan çalışma kaydı `staging-reconciliation-evidence.json` dosyasıdır. Kimlik eşlemesinde eksik/mükerrer kayıt, on iki kontrol toplamından herhangi birinde sıfır dışı fark veya çözülmemiş istisna varken durum `MATCHED` olamaz. Gerçek çalıştırma sonrasında `Test-FinanceStagingReconciliation.ps1 -RequireMatched` geçmeli ve dosya FIN-G06 kanıt sürecinde Veri Lideri ile Finans Kontrol tarafından imzalanmalıdır.

