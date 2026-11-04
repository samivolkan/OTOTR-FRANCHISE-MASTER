# GM Finans — ERP Staging Eşleme ve Adaptör Girdi Formu

Bu belge FIN-G03 ve FIN-G05 için gerekli teknik girdileri toplar. Üretim kimlik bilgileri repository'ye yazılmaz; yalnız secret manager referansı kaydedilir.

Dağıtılacak 137 migration ve on bir finans Edge Function paketinin değişmez hash, JWT politikası ve gerekli secret **adları** `staging-deployment-manifest.json` içinde tutulur. Manifest gerçek secret değeri veya proje endpoint'i içeremez; `stagingApplied` ancak gerçek dağıtım ve smoke-test kanıtı ayrıca imzalandıktan sonra güncellenebilir.

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
| Şube açılışı | ERP şube yaşam döngüsü → finans olay kaydı | Sunucudan sunucuya, bağlama bekleniyor | Secret manager referansı | Kaynak sistem + ERP olay kimliği | ERP Entegrasyon, sorumlu ataması bekleniyor | PENDING |
| Tahsilat kesinleşmesi | Bekleniyor | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Müşteri iadesi | Bekleniyor | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Sorgu/hizmet kullanımı | Bekleniyor | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Fatura dispatch/callback | Bayinin muhasebe/fatura adaptörü | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |
| Muhasebe export/feedback | Bayi veya GM muhasebe adaptörü | Bekleniyor | Secret manager referansı | Bekleniyor | Bekleniyor | PENDING |

## Şube açılış olayı ve UAT-FIN-05

ERP sunucusundaki olay işleyicisi, yetkili şube eşlemesini tamamladıktan sonra `packages/shared/src/finance-branch-opening-adapter.mjs` içindeki adaptörü çağırır. Staging bağlantısı sırasında `ingest` işlevi mevcut finans olay alımına, `cutoverDate` ise onaylı İstanbul iş gününe bağlanır. Olay alımı için ERP kaynak sistem kimliği sunucu yapılandırmasından sağlanır.

- ERP, yetkili açılış işleminin ardından `branch.opened` olayını üretir. Olay sabit bir kaynak olay kimliği, açılış işlemine ait `branchOpeningReference`, şube kimliği ve gerçekleşme zamanı taşır. Adaptör bu kimlikleri ERP ana verisinden GM, bayi, cari ve şube kapsamına eşler. İstanbul iş günü gerçekleşme zamanından türetilir.
- Devreye alma kesim tarihi ERP Ürün Sahibi ve Finans Operasyon tarafından belirlenir. Adaptör, onaylı tarih tanımlanana kadar yeni giriş bedeli akışını kapalı tutar. Kesim öncesi açılışlar yeniden oynatılsa bile tahakkuk kuyruğuna girmez. Kesim sonrası gecikmeli teslim, özgün olay kimliği ve gerçekleşme zamanı ile değerlendirilir.
- Tahakkuk motoru geçerli sözleşme ve ücret kuralı, vergi sürümü, muhasebe eşlemesi ve işlemeye açık dönem üzerinden hesaplama yapar. Onaylı tutar ve vade kuralı staging senaryosunun girdisidir. Hesaplama sonucunda tek borç, dengeli yevmiye ve faturaya izlenebilir tahakkuk beklenir.
- Staging kabulünde kesim öncesi açılış, kesim anındaki açılış, gecikmeli teslim, aynı olayın tekrarı, farklı olay kimliğiyle aynı şubeye ikinci tahakkuk, eksik açılış referansı ve şubeler arası kapsam uyuşmazlığı çalıştırılır. Her ret ve tekrar için olay sonucu ile tahakkuk, yevmiye ve açık kalem sayıları kaydedilir. Kanıt Franchise Yönetimi onayıyla UAT-FIN-05 kaydına bağlanır.

## Staging ortamı zorunluları

`ototr-staging`, 5 Kasım 2026 tarihinde kullanıcı tarafından Muhasebe V2 staging hedefi olarak onaylandı. Bağlı proje üzerinde salt okunur ön kontrolde ERP kimlik ve şube tabloları bulundu. Finans şemaları, finans migration kayıtları ve finans Edge Function paketleri henüz yoktu.

Ön kontrolde iki etkin ERP şubesi ve şubeye bağlı bir etkin yönetici hesabı bulundu. Demo, test veya pilot önekiyle işaretlenmiş etkin şube ve finans kapsamındaki etkin merkez oturumu bulunmadı. Bunlar envanter sonuçlarıdır. Rol yetkisini doğrulamak için finans dağıtımı, iki sentetik şube, merkez finans ve şube yönetici test oturumları gerekir. Mevcut şube kayıtları pilot olarak atanmış sayılmaz.

Migration ön kontrolünde staging geçmişindeki 125 sürümün çalışma kopyasında karşılığı bulunmadı. Çalışma kopyasındaki 28 finans dışı sürüm de staging geçmişinde görünmüyor. Bu karşılaştırma sürüm kimliklerine dayanır. Kurulumdan önce staging'in kayıtlı ERP geçmişi korunarak finans manifestindeki 137 sürüm için ayrı dağıtım önizlemesi alınır. Genel repo zinciri bu hedefe doğrudan uygulanmaz. Sürüm farkları eşlenmeden geçmiş onarımı yapılmaz.

Staging katalog kontrolü ERP kullanıcı tablosunun `FINANCE` ve `BRANCH_MANAGER` rollerini kabul ettiğini, yönetici kapsamının ERP şube kimliğine bağlanabildiğini doğruladı. Finans dağıtımı sonrasında `supabase/tests/finance_identity_scope_e2e.sql` ile iki sentetik şube üzerinde veritabanı yetkileri sınanır. Bu test işlemi geri alır. Ardından gerçek test oturumlarıyla finans API’sine ve Muhasebe V2 ekranına erişim ayrıca doğrulanır.

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

