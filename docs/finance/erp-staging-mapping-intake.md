# GM Finans — ERP Staging Eşleme ve Adaptör Girdi Formu

Bu belge FIN-G03 ve FIN-G05 için gerekli teknik girdileri toplar. Üretim kimlik bilgileri repository'ye yazılmaz; yalnız secret manager referansı kaydedilir.

Dağıtılacak 153 migration ve on üç finans Edge Function paketinin değişmez hash, JWT politikası ve gerekli secret **adları** `staging-deployment-manifest.json` içinde tutulur. Manifest gerçek secret değeri veya proje endpoint'i içeremez; `stagingApplied` ancak gerçek dağıtım ve smoke-test kanıtı ayrıca imzalandıktan sonra güncellenebilir.

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

`ototr-staging`, 5 Kasım 2026 tarihinde kullanıcı tarafından Muhasebe V2 staging hedefi olarak onaylandı. İlk salt okunur kontrolde yalnız ERP kimlik ve şube tabloları vardı. 7 Kasım güncel kanıtında finans kurulumu mevcuttur: 52 finans tablosunun tamamında RLS ve FORCE RLS açıktır; tarayıcı rollerine ham finans tablo/rutin grantı yoktur; `finance-read`, `finance-command`, `finance-erp-demo` ve finans worker paketleri staging üzerinde aktiftir. Bu teknik kurulum gerçek kullanıcı UAT veya pre-production onayı değildir.

Güncel envanterde iki finans şubesi, iki bayi hesabı, bir Merkez Finans rolü, iki Şube Yöneticisi ve SCOPE-B1/SCOPE-B2 üzerinde çakışmasız üç aktif ERP kapsam eşlemesi bulunur. Merkez Finans kapsamı rol seviyesinde, Şube Yöneticisi kapsamı ERP şube köprüsüyle çözülür; `finance.branch_assignments` kullanıcı yetkilendirmesi değil şube-bayi tüzel kişi ana verisidir. Merkez Finans ve Şube Yöneticisi gerçek ERP oturumlarıyla iki şubede `200/403` matrisi tamamlanmadan pilot rol kabulü verilmez.

İlk migration fark analizi nedeniyle genel repo zinciri doğrudan uygulanmadı; staging'in mevcut ERP geçmişi korunarak finans paketi ayrı bundle olarak kuruldu. Güncel finans veri-modeli sınırı `20261107015427_finance_source_event_processed_terminal_state`; `20261107021500_finance_outbox_worker_identity_bridge` staging'e semantik eşdeğer migration olarak uygulanmış ve servis-rolü-only yetkisiyle doğrulanmıştır. Migration geçmişi yeniden yazılmaz; `finance-outbox-worker` ise gerçek tüketici endpoint'i ile teslim anahtarı onaylanmadan dağıtılmaz.

Staging Data API ayarında yalnız `finance_api` finans yüzeyi olarak kullanılır; `finance` ile `finance_private` API dışında tutulur. Ham finans şema erişim grantları sıfırdır. Gerçek kullanıcı HTTP erişim sonuçları yine de ayrı UAT kanıtı olarak alınmalıdır.

Tarayıcı bağlantısından önce Edge Function Secrets ekranında `OTOTR_FINANCE_ALLOWED_ORIGINS` tanımlanır. Değer, staging istemcisinin tam origin’idir. Sayfa yolu ve sorgu parametreleri eklenmez. Örneğin ayrı bir yerel staging istemcisi 42733 portunda çalıştırılırsa değer `http://127.0.0.1:42733` olur. Birden çok onaylı origin virgülle ayrılır. `finance-read` ve `finance-command` için önce izinli origin ile OPTIONS 204, ardından farklı origin ile 403 doğrulanır. Yetki testi iki ayrı Supabase Auth oturumuyla çalıştırılır.

Staging katalog kontrolü ERP kullanıcı tablosunun `FINANCE` ve `BRANCH_MANAGER` rollerini kabul ettiğini doğruladı. `supabase/tests/finance_identity_scope_e2e.sql` iki sentetik şube üzerinde geçti ve işlemi geri aldı. Bu yalnız veritabanı kapsam kabulüdür; gerçek test oturumlarıyla finans API’si ve Muhasebe V2 ekranı ayrıca doğrulanmalıdır.

Gerçek oturum kabul aracı kısa ömürlü JWT’nin elle kopyalanmasını gerektirmez. İki ayrı test hesabının bilgileri yalnız süreç ortamına verilir; araç Supabase Auth üzerinden geçici token alır ve tokenı çıktıya yazmaz. Eski CI akışları için doğrudan `*_TOKEN` değişkenleri de desteklenir, ancak e-posta/parola yöntemi tercih edilir.

```powershell
$env:OTOTR_STAGING_PUBLISHABLE_KEY = '<publishable-key>'
# Secret manager sürece OTOTR_STAGING_FINANCE_EMAIL/PASSWORD ve
# OTOTR_STAGING_MANAGER_EMAIL/PASSWORD değişkenlerini enjekte eder.
$env:OTOTR_STAGING_SCOPE_A = '<legal-entity-uuid>,<dealer-account-uuid>,<branch-a-uuid>'
$env:OTOTR_STAGING_SCOPE_B = '<legal-entity-uuid>,<dealer-account-uuid>,<branch-b-uuid>'
$env:OTOTR_STAGING_FIXTURE_DATE = 'YYYY-MM-DD'
node apps/admin/prototype/tools/test-finance-staging-scope.mjs apps/admin/prototype/bayi-portal
```

Parola, token ve servis anahtarı repository dosyasına, terminal geçmişine, ekran görüntüsüne veya UAT kanıtına eklenmez. Kanıt yalnız rol, kapsam, HTTP sonucu, correlation kimliği ve kişisel veri içermeyen kontrol toplamlarını içerir.

Bu koşu yalnız ekran açılışını kontrol etmez. Merkez Finans için iki şubede özet ve ekstre export çağrısı `200`; Şube Yöneticisi için kendi şubesinde aynı çağrılar `200`, diğer şubede hem özet hem export `403 SCOPE_DENIED` olmalıdır. Başarılı API yanıtları ve ERP DOM’u ham payload/context, depolama anahtarı, müşteri PII’si, kart alanı ve token örüntülerine karşı fail-closed taranır.

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

