# OTOTR GM İK Sistemi — Analiz, Boşluklar ve Üretim Yol Haritası

Tarih: 2026-11-03
İncelenen kaynak: `OTOTR İK Modülü.html` (Claude prototipi)
Kanonik pilot: `apps/admin/prototype/gm-ik/`
Yayın hedefi: `https://samivolkan.github.io/Ototr/gm-ik/`

## Yönetici sonucu

Claude prototipi geniş bir İK ürün vizyonu ve güçlü bir süreç demosu sunuyor. Organizasyon/kadro, personel, izin, vardiya-puantaj, yetkinlik, işe alım, oryantasyon, performans, bordro girdisi, talep-onay, ayrılış, franchise yaşam döngüsü, görev ayrılığı ve Akademi bağlantıları tek arayüzde gösteriliyor.

Ancak mevcut dosya tek HTML içinde çalışan, tarayıcı `localStorage` alanına yazan bir prototiptir. Rol seçici gerçek kimlik doğrulama değildir; şube izolasyonu yalnızca JavaScript filtresidir; bordro değerleri örnektir; özlük/sağlık/disiplin verileri için güvenli sunucu ve hukuki politika yoktur. Bu nedenle sistem **gerçek çalışan verisiyle canlı kullanıma hazır değildir**.

Bu teslimatta prototip:

- ERP’ye bağımsız **GM İK Sistemi** başlığıyla bağlandı,
- gerçek kişi adlarından arındırıldı,
- ağ erişimi yalnızca dağıtımın ortak ERP oturum doğrulamasında kullandığı OTOTR Supabase uçlarıyla sınırlandı,
- arama motorlarına indekslenmeme işareti eklendi,
- gerçek veri girmeme uyarısı görünür hâle getirildi,
- canlıya hazırlık kapıları arayüze eklendi,
- üretim boşlukları aşağıdaki kabul kriterlerine bağlandı.

Bu yayın bir tasarım/iş akışı pilotudur; üretim aktivasyonu değildir.

## 2026-11-03 uygulama kapanış durumu

Kullanıcı kararıyla önceki sıralamadaki **2. madde (KVKK/veri sınıflandırması ve hukuki politika)** bu çalışmanın dışında bırakıldı. Bu istisna bir risk kabulü veya canlı onayı değildir. Veritabanı `PRIVACY_POLICY_APPROVED=EXCLUDED_BY_SCOPE` ve `PRODUCTION_APPROVED=BLOCKED` durumunu zorunlu tutar; gerçek kişi kaydı ile kimlik, sağlık ve disiplin belgesi yazımı tetikleyici seviyesinde reddedilir.

Diğer zorunlu teknik alanlar `supabase/migrations/20261103003922_gm_hr_production_foundation.sql` içinde uygulanmıştır:

- 28 tablodan oluşan özel `hr` şeması ve doğrudan Data API tablo erişimi yasağı,
- `app_users.auth_user_id = auth.uid()` tabanlı aktör çözümleme, şirket/şube kapsamı ve RLS,
- işveren, organizasyon, aday, çalışan, işe giriş/çıkış ve geçici görevlendirme,
- izin, vardiya, puantaj, zimmet, sertifika ve performans,
- dört-göz rol/izin/puantaj/görevlendirme/bordro onayları,
- ödeme üretmeyen, sentetik ve iki dönem mutabakatlı gölge bordro,
- SGK işlemi yaptığı iddiası yerine harici referans hash'i ve bağımsız doğrulayan kaydı,
- private Storage bucket metadata sınırı ve dört işlem politikası,
- SHA-256 zincirli, güncellenemeyen/silinemeyen audit kaydı,
- idempotent komut anahtarları, sürüm alanları ve üretim hazırlık kapıları,
- yalnızca allowlist'teki salt-okunur RPC'leri kullanan tarayıcı bağlantı katmanı.

`npm run test:gm-hr` sentetik PostgreSQL 17/PGlite kabul paketinde 28/28 RLS tablosunu, 31 RPC'yi, 43 zincirli audit olayını, izin bakiyesi rezervasyonunu, şube izolasyonunu, yetki reddini, iki dönem gölge bordroyu ve yedek/geri yüklemeyi doğrulamıştır. Docker bulunmadığı ve uzak migration geçmişinde önceden bilinen drift olduğu için bu migration staging veya production'a uygulanmamıştır. Kodun push edilmesi canlı veritabanı aktivasyonu anlamına gelmez.

## Mevcut ERP ile çakışma analizi

Mevcut ERP’de hâlihazırda `hr` route’u altında İnsan Kaynakları odası, çalışan dizini, personel talebi, işe alım/onay zinciri, Academy bağlantısı ve merkezi görev motoru bulunuyor. Claude prototipi şu alanlarda ek derinlik getiriyor:

| Claude prototipinin güçlü alanı | Mevcut ERP ile hedef ilişki |
| --- | --- |
| Organizasyon ağacı ve kadro doluluğu | ERP personel talebi ve onay motoruna kaynak olur |
| Yasal işveren / fiili şube ayrımı | Franchise şirket izolasyonunun ana veri kuralı olur |
| Şubeler arası geçici görevlendirme | Vardiya, puantaj ve atama kapsamını tarihsel olarak değiştirir |
| Vardiya ve puantaj | Operasyon kapasitesi ve bordro girdisine bağlanır |
| Yetkinlik/sertifika kapısı | Academy ve iş emri atama kurallarıyla birleşir |
| Talep ve limit zinciri | Merkezi Aksiyon & Görev motorunu kullanır |
| Görev ayrılığı (SoD) | Finans, rapor onayı ve yetki değişikliklerinde merkezi kural olur |
| Bordro taslağı | Hesap motoru değil, doğrulanmış bordro sağlayıcısına girdi/çıktı köprüsü olur |

Üretim hedefinde iki ayrı İK veritabanı veya iki ayrı çalışan kaydı oluşturulmamalıdır. `gm-ik` arayüzü ile mevcut ERP `hr` odası aynı kanonik API ve veri modelini kullanmalıdır.

## Doğrulanan güçlü yönler

1. Yasal işveren ile fiili görev şubesini ayırıyor.
2. Pozisyonu uygulama erişim rolünden ayırıyor.
3. Franchise/şube/çalışan kapsamlarını ürün diliyle görünür kılıyor.
4. İşe giriş ve işten ayrılış kontrol listeleri var.
5. İzin çakışması, bakiye ve kademeli onay senaryoları gösteriliyor.
6. Puantajdan fazla mesai talebi üretme mantığı var.
7. Yetkinlik seviyesi, sertifika tarihi ve cihaz/kalibrasyon kapısı bulunuyor.
8. Rapor hazırlayan ile onaylayanı ayıran dört göz kuralı tasarlanmış.
9. Yetki değişikliği, acil erişim ve süreli vekâlet düşünülmüş.
10. Performans skorunun otomatik ceza/fesih kararı vermemesi açıkça belirtilmiş.
11. Aday, çalışan, franchise ve şube açılışı süreçleri birbirine bağlanmış.
12. Mobil self-servis önizlemesi düşünülmüş.

## Kritik teknik bulgular

### 1. Kimlik doğrulama ve yetki güvenlik sınırı yok — P0

Rol açılır menüden değiştirilebiliyor. Bu, demo için uygundur; üretimde yetki kararı olamaz. Sunucu tarafında Supabase Auth oturumu, `app_users.auth_user_id = auth.uid()` bağı, şirket/şube kapsamı ve alan bazlı izinler gerekir. UI filtreleri yalnızca kullanıcı deneyimidir; erişim kontrolü RLS/RPC katmanında fail-closed uygulanmalıdır.

Kabul kriteri:

- oturumsuz kullanıcı hiçbir İK tablosunu okuyamaz,
- şube kullanıcısı başka şirket/şube çalışanını okuyamaz,
- çalışan yalnızca kendi self-servis verisini görür,
- bordro, sağlık, disiplin ve kimlik alanları ayrı izinlerle korunur,
- yetki test matrisi anon/auth kullanıcılarla staging ortamında kanıtlanır.

### 2. Kalıcı veri ve eşzamanlılık yok — P0

Tüm kayıtlar tek tarayıcı `localStorage` alanında tutuluyor. Yedekleme, eşzamanlı düzenleme, sürüm, merkezi raporlama veya cihazlar arası tutarlılık yoktur.

Kabul kriteri:

- kanonik Postgres şeması ve migration zinciri,
- tüm mutasyonlarda sunucu zamanı ve aktör kimliği,
- optimistic concurrency veya sürüm alanı,
- idempotent komutlar,
- transaction ile izin bakiyesi/puantaj/bordro dönem kilidi,
- yedek geri yükleme testi.

### 3. Özlük ve özel nitelikli veri koruması yok — P0

Prototip sağlık, maaş ve disiplin başlıklarını aynı HTML durumunda temsil ediyor. Sağlık ve benzeri özel nitelikli kişisel veriler için daha sıkı erişim, ayrı saklama alanı, erişim kaydı ve hukuki işleme şartı gerekir. KVKK Kurumu da özel nitelikli veriler için doğru hukuki sebep ve yeterli önlemlerin gerekliliğini vurgular.

Kabul kriteri:

- belge metadata’sı ile dosyanın ayrı tutulması,
- özel nitelikli belgeler için ayrı private bucket/prefix ve politika,
- istemciye doğrudan kalıcı dosya URL’si verilmemesi,
- kısa süreli signed URL veya kontrollü indirme RPC’si,
- indirme/görüntüleme olaylarının audit kaydı,
- anahtar rotasyonu ve yetki kaldırma testi.

### 4. KVKK saklama ve imha politikası kodlanmamış — P0

HTML’de örnek süreler var; bunlar doğrulanmış şirket politikası değildir. KVKK saklama ve imha yönetmeliği; amaç, ortam, hukuki/teknik sebep, tedbir, sorumlular, süre tablosu ve periyodik imha süresi gibi unsurların politika içinde belirlenmesini ister. Bu nedenle süreler Hukuk/İK/mali müşavir onayı olmadan sabit kodlanmamalıdır.

Kabul kriteri:

- veri kategorisi × işleme amacı × hukuki sebep × saklama süresi × imha yöntemi matrisi,
- aday, çalışan, eski çalışan, sağlık, disiplin, bordro ve erişim logu için ayrı politikalar,
- legal hold/uyuşmazlık kilidi,
- veri sahibi başvuru kaydı,
- periyodik imha işi ve kanıt raporu,
- anonimleştirme/erişilemezlik testi.

### 5. Bordro motoru üretim hesabı yapamaz — P0

Pilot, brüt ücret ve sabit katsayılarla taslak toplam üretir. Vergi, SGK, teşvik, damga, istisna, kümülatif matrah, icra, BES, yan hak, geçmiş dönem düzeltmesi ve çok şirketli muhasebe ayrıntıları yoktur.

Kabul kriteri:

- OTOTR İK modülü hesap motoru değil doğrulanmış girdi/çıktı orkestratörü olarak sınırlandırılır,
- bordro sağlayıcısı/mali müşavir sözleşmesi ve dosya/API şeması onaylanır,
- dönem aç/kapat/kilitle ve geri açma yetkileri ayrılır,
- girdi sahibi ile onaylayan ayrılır,
- toplam, kişi ve muhasebe fişi mutabakat testleri geçer,
- çalışan yalnızca kendi kesinleşmiş bordro belgesini görür.

### 6. SGK işe giriş/ayrılış entegrasyonu yok — P0

Prototip yalnızca kontrol listesi gösterir. SGK’nın işveren uygulamalarında işe giriş/işten ayrılış bildirgeleri ayrı resmi akışlardır. Sistem, resmi entegrasyon ve yetki doğrulanmadan “SGK bildirildi” durumunu otomatik üretmemelidir.

Kabul kriteri:

- manuel doğrulama veya resmi entegrasyon sınırı belgelenir,
- belge/işlem referansı ve doğrulayan kullanıcı kaydedilir,
- son tarih alarmı ve istisna akışı bulunur,
- resmi işlem başarısızken çalışanı tam aktif yapan kapı kapanır.

### 7. Tarih modeli demo seviyesinde — P0

İzinler yalnızca Kasım ayı gün numarasıyla, bazı sertifikalar sabit tarihle çalışıyor. Saat dilimi, resmi tatil, hafta sonu, yarım gün, vardiya gece taşması, çok aylı izin ve geriye dönük düzeltme yok.

Kabul kriteri:

- `date`, `timestamptz` ve `Europe/Istanbul` kullanım kararı,
- takvim ve çalışma günü kaynağı,
- yarım gün/saatlik izin,
- gece vardiyası ve gün aşımı,
- çakışma ve bakiye hesaplarının transaction testleri,
- dönem kapandıktan sonra kontrollü düzeltme.

### 8. Değiştirilemez denetim izi yok — P0

Ekrandaki `LOG` dizisi tarayıcıda tutuluyor ve kullanıcı tarafından değiştirilebilir. Üretimde aktör, rol, eski/yeni değer, gerekçe, kaynak IP/cihaz sinyali, bağlı kayıt ve korelasyon kimliği saklanmalıdır.

Kabul kriteri:

- audit tablosuna yalnız güvenilir fonksiyon/trigger yazabilir,
- uygulama rolleri audit satırını güncelleyemez/silemez,
- kritik olaylar için önce/sonra alanları ve gerekçe zorunludur,
- export, görüntüleme ve özel veri erişimi de audit’e girer,
- log bütünlüğü ve saklama politikası test edilir.

### 9. Kullanıcı girdisi güvenli biçimde işlenmiyor — P0

Prototip bazı kullanıcı girdilerini template string ile `innerHTML` içine basıyor. Üretimde XSS/HTML enjeksiyonu önlenmeli; alanlar şema doğrulamasından geçmeli ve çıktı bağlama güvenli yapılmalıdır.

Kabul kriteri:

- API tarafında tip/uzunluk/enum doğrulaması,
- UI’da metinler `textContent` veya güvenli framework binding ile gösterilir,
- rich text gerekiyorsa allowlist sanitizer,
- CSP nonce/hash yaklaşımı,
- kalıcı XSS güvenlik testi.

### 10. Çok şirketli işveren ve görev yeri modeli tamamlanmamış — P0

Prototip doğru ayrımı başlatıyor ancak şirketler arası görevlendirmede işveren, maliyet merkezi, izin/bordro sorumlusu, erişim kapsamı ve süre sonu geri dönüşü sunucu tarafında bağlanmıyor.

Kabul kriteri:

- her çalışan için tek aktif yasal işveren,
- tarih aralıklı birincil görev yeri ve geçici görevlendirme,
- maliyet dağıtım kuralı,
- çakışan aktif görevlendirme yasağı,
- görevlendirme bitişinde yetki ve vardiya kapsamının otomatik geri alınması.

## Hedef kanonik veri alanları

Üretim şeması aşağıdaki domain’lere ayrılmalıdır. Bu liste migration değildir; şema incelemesi için sözleşme taslağıdır.

| Domain | Ana kayıtlar |
| --- | --- |
| Organizasyon | legal_entities, branches, departments, positions, headcount_plans, cost_centers |
| Çalışan | employees, employments, manager_assignments, work_locations, contact_channels |
| Yetki | app_users, roles, permissions, user_scopes, access_change_requests, delegations, emergency_access |
| Aday | candidates, applications, interviews, assessments, offers, consent_records, retention_events |
| Oryantasyon | onboarding_cases, checklist_templates, checklist_items, account_provisioning_tasks |
| Zaman | shifts, shift_assignments, attendance_events, attendance_corrections, overtime_requests |
| İzin | leave_types, leave_policies, balances, requests, approvals, calendar_events |
| Yetkinlik | skills, employee_skills, courses, exams, certificates, assignment_gates |
| Belge | document_records, document_versions, storage_objects, access_events, retention_rules |
| Talep/onay | request_types, requests, approval_policies, approval_steps, approval_events |
| Bordro köprüsü | payroll_periods, payroll_inputs, payroll_exports, payroll_results, reconciliations |
| Performans | cycles, goals, metric_snapshots, reviews, employee_comments, objections, development_plans |
| Ayrılış | offboarding_cases, handover_tasks, asset_returns, account_revocations, exit_interviews |
| Denetim | audit_events, security_events, legal_holds, retention_jobs, incident_records |

Tüm çok şirketli tablolarda `legal_entity_id`; şube kapsamlı tablolarda ayrıca `branch_id` bulunmalı ve bu alanlar RLS güvenlik sınırının parçası olmalıdır.

## Rol ve alan bazlı erişim hedefi

| Rol | Görebilir | Değiştirebilir | Kesinlikle göremez/değiştiremez |
| --- | --- | --- | --- |
| Genel Müdür | Ağ özetleri, onay ve risk | Yetki politikasındaki GM adımları | Sistem sırları; tıbbi belgenin gereksiz içeriği |
| Merkez İK | Personel yaşam döngüsü, izin, kadro | İK kayıtları ve onay adımları | Bordro kesinleştirme; gereksiz sağlık içeriği |
| Bordro/Finans | Bordro için gerekli asgari veri | Dönem girdisi, mutabakat | Disiplin ve sağlık belgeleri |
| Hukuk/Uyum | Hukuki dosya ve politika verisi | Legal hold, saklama/imha onayı | Operasyonel değişiklikler |
| İş yeri hekimi/yetkili sağlık | Yetkili sağlık kayıtları | Sağlık uygunluk sonucu | Maaş, disiplin, finans |
| Bölge yöneticisi | Atanmış bölgelerin özetleri | Bölgesel takip | Diğer bölgeler; bordro detayı |
| Franchise sahibi | Kendi yasal şirketi | Kendi şirketindeki onaylar | Diğer şirketler; merkez özel verisi |
| Şube müdürü | Kendi şubesi ve gerekli alanlar | Vardiya, ilk onay, görev | Diğer şubeler; maaşın gereksiz detayı |
| Çalışan | Kendi profil/self-servis kayıtları | Kendi talep ve yorumları | Başka çalışan kayıtları |
| Sistem yöneticisi | Teknik metadata | Hesap/rol uygulaması | İş gerekçesi yoksa özlük içeriği |

`Genel Müdür / Merkez İK` birleşik demo rolü üretimde iki ayrı rol olmalıdır.

## Öncelikli eksik modüller

### P0 — gerçek veri öncesi zorunlu

- Auth, RLS ve alan bazlı yetki.
- Çok şirketli legal entity/branch veri modeli.
- Güvenli belge saklama ve özel nitelikli veri ayrımı.
- Kişisel veri envanteri, hukuki sebep, saklama/imha politikası.
- Değiştirilemez audit log.
- İzin/puantaj transaction mantığı ve gerçek tarih modeli.
- Bordro sağlayıcısı sınırı ve mutabakat.
- SGK işlem doğrulama sınırı.
- XSS/input validation güvenlik düzeltmeleri.
- Yedekleme, geri yükleme, olay müdahalesi.

### P1 — sınırlı pilot öncesi

- Onay politikası editörü ve dört göz kuralları.
- Doküman versiyonlama/e-imza sağlayıcısı kararı.
- Aday portalı ve rıza/saklama akışı.
- Mobil self-servis gerçek oturumu.
- Bildirim tercihleri ve SMS/e-posta sağlayıcıları.
- Resmi tatil/çalışma takvimi.
- İtiraz, savunma ve çalışan görüşü akışları.
- Academy sertifika API sözleşmesi.
- Operasyon iş emri atama kapısı.
- Raporlama veri sözlüğü ve yetkili export.

### P2 — olgunluk

- Kapasite tahmini ve vardiya önerisi.
- Devir/retention/işe alım analitiği.
- Performans kalibrasyon kurulu.
- Anomali ve tükenmişlik sinyalleri için etik/insan onaylı karar desteği.
- Sağlayıcı SLA panosu.
- Çok dil ve erişilebilirlik iyileştirmeleri.

## Üretim fazları

| Faz | Çıktı | Çıkış kriteri |
| --- | --- | --- |
| 0 — Güvenli tasarım pilotu | Bu teslimattaki anonim statik modül | Gerçek veri yok; iş akışı kabul notları toplandı |
| 1 — Veri ve güvenlik temeli | Şema, migration, Auth/RLS, audit, private storage | Staging RLS ve güvenlik testleri geçti |
| 2 — Çalışan çekirdeği | Organizasyon, çalışan, aday, onboarding/offboarding | Çok şirketli ve tarihsel kayıt testleri geçti |
| 3 — Zaman ve self-servis | Vardiya, puantaj, izin, mobil/self-servis | Bakiye/çakışma/dönem kilidi UAT’i geçti |
| 4 — Bordro ve resmi işlem köprüleri | Bordro girdi/çıktı, SGK kontrol kanıtı, mutabakat | Mali müşavir/İK/Finans yazılı kabulü |
| 5 — Yetkinlik ve performans | Academy, sertifika, atama kapısı, itiraz/gelişim | Teknik Kalite/Academy/İK kabulü |
| 6 — Kontrollü canlı | Tek şirket/şube pilotu, izleme ve destek | Go-live kapılarının tamamı kanıtlı |

## Test matrisi

### Güvenlik

- Anon kullanıcı tüm İK tablolarında reddedilir.
- Çalışan A, çalışan B’nin kaydına URL/API değiştirerek erişemez.
- Şube A yöneticisi şube B personelini göremez.
- Franchise A sahibi Franchise B kayıtlarını göremez.
- İK rolü bordro dönemini kesinleştiremez.
- Bordro rolü sağlık/disiplin belgelerini okuyamaz.
- Sistem yöneticisi iş gerekçesi olmadan belge içeriğine erişemez.
- İptal edilmiş/geçici rol token yenilendiğinde erişim kaybolur.
- Audit satırları istemci veya normal uygulama rolüyle değiştirilemez.

### İş akışı

- İzin bakiyesi eşzamanlı iki onayda eksiye düşmez.
- Reddedilen/iptal edilen izin bakiye tüketmez.
- Görevlendirme bitince çalışan eski şube kapsamına döner.
- Yetkinliği/sertifikası/kalibrasyonu eksik çalışan iş adımına atanamaz.
- Talep sahibi kendi talebini onaylayamaz.
- Rapor hazırlayan kendi raporunu yayınlayamaz.
- Bordro dönemi kilitlendikten sonra değişiklik kontrollü geri açma ister.
- Ayrılışta hesap, açık görev ve zimmet kapıları tamamlanmadan dosya kapanmaz.

### Veri ve operasyon

- Import aynı dosya tekrar işlendiğinde mükerrer kayıt üretmez.
- Export yalnız rolün görebildiği alanları içerir.
- Yedekten geri yükleme hedef RPO/RTO içinde kanıtlanır.
- Saat dilimi/yaz saati, gece vardiyası, ay/yıl geçişi test edilir.
- Dosya virüs taraması/format/boyut politikası uygulanır.
- Sağlayıcı kesintisinde kuyruk ve tekrar deneme davranışı izlenir.

## Go-live kapıları

Gerçek çalışan verisi açılmadan önce aşağıdakilerin tamamı imzalı/kanıtlı olmalıdır:

1. Hukuk/KVKK: veri envanteri, aydınlatma, hukuki sebepler, saklama-imha, veri sahibi başvurusu.
2. İK: çalışan yaşam döngüsü, izin/puantaj, performans, disiplin, itiraz ve ayrılış SOP’leri.
3. Finans/mali müşavir: bordro giriş/çıkış şeması, mutabakat ve dönem kilidi.
4. Bilgi güvenliği: tehdit modeli, RLS, özel veri ayrımı, erişim logu, yedekleme, olay müdahalesi.
5. Operasyon: franchise/şube yetki matrisi, görevlendirme ve vardiya kuralları.
6. Academy/Teknik Kalite: sertifika, yetkinlik ve iş atama kapıları.
7. UAT: en az bir merkez ve bir demo franchise veri setiyle rol bazlı kabul.
8. Rollback: veri migration geri dönüşü, özellik bayrağı ve destek iletişim planı.
9. Canlı veri geçişi: doğrulanmış kaynak, alan eşlemesi, mükerrer kontrol, örneklem mutabakatı.
10. Yönetim onayı: kapsam, risk kabulü ve canlı tarih kararı.

## Gerekli iş kararları

Üretim geliştirmesine başlamadan OTOTR yönetiminin şu bilgileri kesinleştirmesi gerekir:

- Yasal işveren şirket listesi ve her şubenin şirket ilişkisi.
- Merkez/şube/bayi/bölge rollerinin nihai sahipleri.
- İzin türleri, çalışma takvimi, vardiya ve fazla mesai politikası.
- Bordro sağlayıcısı/mali müşavir ve entegrasyon biçimi.
- SGK işlemlerinin manuel kanıt mı, resmi entegrasyon mu olacağı.
- Sağlık verisini işleyecek yetkili rol ve iş yeri hekimi modeli.
- Belge türleri ve Hukuk tarafından onaylı saklama/imha matrisi.
- Onay limitleri ve vekâlet kuralları.
- İlk canlı pilot şirket/şube ve kabul sorumluları.

## Geri alma planı

Pilot yayın geri alınırken:

1. ERP kök `index.html` içindeki `gm-ik/erp-nav-integration.js` script etiketi kaldırılır.
2. Yayın deposundaki `gm-ik/` klasörü silinmeden önce önceki commit’e revert uygulanır.
3. Kanonik kaynak `apps/admin/prototype/gm-ik/` korunur.
4. Bu pilot üretim verisi kullanmadığı için veri migration geri dönüşü gerektirmez.

## Resmî referanslar

- KVKK, Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik: https://www.kvkk.gov.tr/Icerik/5441/KISISEL-VERILERIN-SILINMESI-YOK-EDILMESI-VEYA-ANONIM-HALE-GETIRILMESI-HAKKINDA-YONETMELIK
- KVKK, Özel Nitelikli Kişisel Verilerin İşlenmesine İlişkin Rehber: https://www.kvkk.gov.tr/Icerik/8184/Ozel-Nitelikli-Kisisel-Verilerin-Islenmesine-Iliskin-Rehber
- 4857 sayılı İş Kanunu, TBMM kanun bilgisi: https://www.tbmm.gov.tr/Yasama/Kanun/f72877bd-9f9a-037b-e050-007f01005610
- 4857 sayılı İş Kanunu güncel metin bağlantısı: https://www.mevzuat.gov.tr/mevzuatmetin/1.5.4857.pdf
- SGK İşveren Uygulamaları: https://e.sgk.gov.tr/Uygulamalar/Isveren
- SGK 4/a İşe Giriş ve İşten Ayrılış Bildirgesi: https://e.sgk.gov.tr/Uygulamalar/Detay/4a-Sigortali-Ise-Giris-ve-Isten-Ayrilis-Bildirgesi-2024-10-02-10-08-51

Bu belge hukuki görüş değildir. Uygulanacak politikalar OTOTR Hukuk/İK birimleri, mali müşavir ve gerekiyorsa bağımsız bilgi güvenliği danışmanı tarafından onaylanmalıdır.
