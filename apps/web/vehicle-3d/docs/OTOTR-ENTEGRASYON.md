# Ototr entegrasyon taslağı

Bu belge uygulanmış backend değişikliği değildir. Canlı veritabanında işlem, migration veya deployment yapılmadı. Mevcut Ototr oturumları, görev kilitleri ve teknik onay kuralları korunarak eklenmesi gereken bağlantıyı tarif eder.

## Kaynaktan doğrulanan alanlar

`apps/mobile-branch/lib/data/generated/inspection_schema_catalog.dart` dosyasında `report.body_paint_checkup.*` alanları bulunuyor. Örnek: kaput `on_kaput`, sol ön kapı `sol_on_kapi`, ön tampon `on_tampon`, bagaj `arka_bagaj`, sol marşpiyel `sol_marsbiyel` olarak geçiyor. Yazım biçimi kaynakla aynen korunmalı; key'ler dilbilgisi düzeltmesi nedeniyle değiştirilmemeli.

17 dış parça için doğrulanmış eşleştirme `integration/part-map.json` içindedir. 6 dış sütun yüzeyi ve 2 ayna için eşleştirme açık bırakıldı. Dış sütun, katalogdaki “iç direk” kontrolüyle otomatik olarak eşitlenmemelidir. Gerekli alan ve görev sözleşmesini backend sahibi doğrulamalıdır.

Bu katalog, çalışma klasöründe bulunan bir kaynak sözlüğüdür; canlı veritabanının güncel şemasının doğrulandığı anlamına gelmez. Entegrasyondan önce uygulamanın gerçek kullandığı katalog sürümü ve çalışma emri API sözleşmesiyle karşılaştırılmalıdır.

## Korunacak iş akışı

1. Sekreterya/bayi portalı mevcut süreçle iş emrini açar.
2. Usta sadece kendisine atanmış iş emrindeki kaporta görevini sahiplenir. Mobil çekim, yeni müşteri kabul akışı başlatmaz.
3. Görev kilidi sırasında çekim oturumu açılır. Aynı göreve ikinci yazıcı giremez; devretme ve müdür atama yetkisi korunur.
4. Fotoğraf aslı yüklenir, sunucuda dosya doğrulanır. İstemcinin gönderdiği branch/work-order ilişkisine güvenilmez; oturum yetkisiyle denetlenir.
5. Fotoğraf `shot_id` ve gerekiyorsa birden çok `part_id` ile bağlanır. Uzman ölçüm, not ve durumu girer.
6. Eksik zorunlu pozlar, reddedilen kanıtlar, kanıtsız risk bulguları ve açık görevler teknik onayı engeller.
7. Teknik onay ve rapor kilidi tamamlandığında değişmez rapor sürümü üretilir. Müşteri bu sürümü görür.
8. Sonraki düzeltme eski raporu sessizce değiştirmez; yeni sürüm ve denetim izi oluşturur.

## Önerilen veri sözleşmesi

Mevcut iş emri/kanıt tabloları mümkünse genişletilir; bu isimler yeni tabloların var olduğu iddiası değildir.

| Kayıt | Önerilen temel alanlar |
| --- | --- |
| Capture session | id, work_order_id, branch_id, assigned_technician_id, protocol_version, model_asset_version, status, revision |
| Evidence | id, session_id, shot_id, storage_key_original, storage_key_preview, sha256_original, mime, dimensions, captured_at, uploaded_at, captured_by, kind, review_status |
| Evidence-part link | evidence_id, part_id, relation (overview/detail/measurement), optional image region |
| Part finding | work_order_id, task_id, part_id, report_field_key, status, measurement_values_um, substrate, device_id, note, evidence_ids, revision |
| Model asset | id, make/model/body/year range, license_provenance, glb_key, part_mapping_version, origin (template/reconstruction), quality_review |
| Report version | id, work_order_id, approved_by, approved_at, immutable_snapshot, model_version, evidence_snapshot, revision |
| Reconstruction job | id, capture_session_id, software_version, input_hashes, queued/running/review/failed/completed, output_asset_id, quality_notes |

`kind=synthetic-render` olan görüntüler gerçek kanıt kabulünden dışlanmalıdır. İstemci bu alanı tek başına güvenilir biçimde belirleyemez; sunucu süreci ve uzman kontrolü gerekir. SHA-256 yalnız byte eşitliğini gösterir; fotoğrafın sahada çekildiğini veya aynı araca ait olduğunu ispatlamaz.

## Önerilen API uçları

Aşağıdaki uçlar bu prototipte çalışmaz; Ototr API'si içinde sağlanacak sözleşme taslağıdır.

| İşlem | Önerilen uç | Zorunlu kontrol |
| --- | --- | --- |
| Çekim başlat | POST /work-orders/{id}/capture-sessions | Atama, bayi kapsamı, görev kilidi |
| Yükleme hazırla | POST /capture-sessions/{id}/uploads | Oturum, MIME/boyut, kısa süreli yükleme yetkisi |
| Yüklemeyi tamamla | POST /evidence/{id}/complete | Obje gerçekten var mı, hash/boyut/içerik doğrulaması |
| Parça bulgusu | PUT /work-orders/{id}/body-parts/{partId} | Görev sahibi, optimistic revision, ölçüm veri tipi |
| Kanıt incele | POST /evidence/{id}/review | Yetkili teknik uzman, gerekçe, denetim izi |
| Onaylı 3D rapor | GET /reports/{token}/3d | Token geçerliliği, onaylı sabit rapor sürümü |
| Gerçek model işi | POST /capture-sessions/{id}/reconstruction-jobs | İstenen fotoğraf protokolü, kuyruk ve işçi yetkisi |

Fotoğraf yüklemelerinde bağlantı kopması halinde idempotency key ve yeniden deneme kuyruğu kullanılmalıdır. Teknik onay bir sunucu transaction'ı içinde eksik/görev/kanıt kontrolleriyle birlikte yapılmalıdır. Uzmanın taslağı müşteriye açık bir route'tan doğrudan okunmamalıdır.

## GLB / Three.js adaptasyonu

Prototipin GLB dosyasında grup ve mesh `extras.partId` değerleri aynı 25 semantik kimliği taşır. Tarayıcıdaki seçim bu kimlikle kayda gider. Three.js glTF yükleme süreci için resmi örneğe bakılabilir. [Three.js GLTF yükleme kılavuzu](https://threejs.org/manual/en/load-gltf.html)

Üretimde:

1. İş emrindeki kasa/model/yıl ile lisanslı model kütüphanesi varlığı seçilir.
2. `GLTFLoader` ile güvenilir depodan yüklenir. Mesh/grup isimleri parça sözlüğüne doğrulanır.
3. Raycast sonucu ilgili mesh'ten yukarı doğru `partId` taşıyan gruba çözülür.
4. `partId` → rapor alanı → onaylı bulgu → kanıt bağları okunur.
5. Renk durumunun yanında metin ve simge kullanılır; yalnız renge dayanılmaz.
6. Klavye erişimli parça listesi WebGL seçimine eşdeğer kalır.

Modelde bir parça eksikse “incelenmedi” ile karıştırılmamalı; “bu modelde gösterilemiyor” uyarısı verilip liste üzerinden kanıt gösterilmelidir. Kasa eşleştirmesi olmayan temsili model gerçek araç ikizi gibi sunulmamalıdır.

## Mevcut Supabase altyapısına bağlama

Saklama alanı private olmalı; kullanıcı rolü ve bayi/iş emri ilişkisine göre erişim sınırlandırılmalıdır. Supabase Storage erişimi `storage.objects` RLS politikalarıyla yönetilir. Sadece `authenticated` rolünü kontrol etmek bayi izolasyonunu sağlamaz; veri sahipliği/atama koşulu da gerekir. [Supabase Storage erişim kontrolü](https://supabase.com/docs/guides/storage/security/access-control)

Yönetici/service anahtarı tarayıcıya konmaz. Sınırlı süreli URL üretimi yetkili sunucu katmanından yapılır. Görüntüleme ve thumbnail üretiminde plaka, ruhsat ve yüz gibi müşteri verilerine ilişkin gereksiz paylaşım azaltılır. Erişim süresi ve saklama/silme politikası Ototr'un gerçek iş süreciyle belirlenmelidir; bu belge hukuki süre tayin etmez.

Bu işte Supabase değişiklikleri uygulanmadığı için migration veya sorgu çalıştırılmadı. Changelog ve Storage erişim dokümanı 6 Eylül 2026'da okundu; gerçek uygulama aşamasında güncel sürüm tekrar doğrulanmalıdır.

## Üretime geçiş kapıları

- Bayi A, bayi B'nin oturumunu, fotoğrafını ve raporunu okuyamasın/değiştiremesin.
- Atanmamış usta yazamasın; devredilen görevin önceki sahibi yazamasın.
- İncelenmeyen parça orijinal gibi sunulmasın. Demo kanıt onaya yetmesin.
- Teknik onay öncesi müşteri raporu erişilemesin.
- Raporda görülen bulgu, model varlığı ve fotoğraf aynı sabit sürüme ait olsun.
- Kamera izni reddi, HEIC dönüşümü, kesilen yükleme ve azalan depolama alanı akışları test edilsin.
- iOS Safari ve Android Chrome üzerinde gerçek kamera ve dokunma testi yapılsın; masaüstü mobil emülasyonu bunların yerine geçmez.
- Gerçek fotoğraftan üretilen modelde bağımsız kalite kabulü olmadan müşteri yayını yapılmasın.

## Geri dönüş

Özellik bayrağını kapatıp müşteriyi mevcut Ototr raporuna yönlendirin. Uygulama geri dönüşü için asıl kanıtları, rapor sürümlerini veya görev kayıtlarını silmek gerekmemelidir.
