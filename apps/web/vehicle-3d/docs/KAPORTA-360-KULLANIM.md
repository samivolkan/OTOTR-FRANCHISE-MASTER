# Kaporta 360 kullanım pilotu

Personel: https://samivolkan.github.io/Ototr/kaporta-360/pilot.html

Örnek fotoğraf turu: https://samivolkan.github.io/Ototr/kaporta-360/

## İlk iş emri

1. Sekreterya bayi portalında iş emrini açar, personel ataması ve işe başlama kanıtı mevcut ERP akışında tamamlanır. Kaporta 360 yeni müşteri veya iş emri üretmez.
2. Personel mevcut ERP hesabıyla girer; erişebildiği son 50 iş emrini görür. Mevcut oturum bulunursa sunucudan doğrulanır. Boş görev için mevcut `claim_inspection_task` kullanılır. Başkasının görevi alınmaz; devir/yeniden atama ERP’den yapılır.
3. İlk açılışta 3 kapılı hatchback, 4 kapılı sedan, 5 kapılı hatchback veya SUV düzenini seçer. 3 kapılı düzen 23; diğerleri 25 dış parçadır. Profil kaydı açıldıktan sonra sabittir. Yanlış profil için yeni çekime başlamadan yöneticinin kontrolünü isteyin; mevcut veriyi silmeyin.
4. Araç sabitken önünden başlayıp kendi sağına doğru 15° aralıklarla 24 çevre fotoğrafı çeker. Telefonu aynı yükseklik/mesafede, 1× lenste tutar. Ardından 4 üst açıyı ekler. Her açı ayrı fotoğraf olmalı; plaka ve araç kimliği, netlik ve yansıma elle kontrol edilir.
5. Parça ekranında inceleme durumu, işlem durumu, yüzey bulguları ve açıklama girer. Metal yüzeylerde en az 3 noktanın µm ölçümünü kaydeder. Plastik/cama standart metal boya ölçümü girilemez. Ölçümden otomatik boyalı/değişen sonucu çıkarılmaz.
6. Bulguya yakın plan ekler, parçaya kanıt olarak seçer, fotoğraf üzerinde sürükleyerek alan işaretler. “Parça kaydını kaydet” sunucuya yazar. İşaretler asıl fotoğrafı değiştirmez. Okuma görünümünde de asıl fotoğraf ayrı sekmede açılabilir.
7. Eksiklerin tamamı giderildikten sonra teknik incelemeye gönderir. Farklı bir teknik sorumlu/yetkili fotoğrafları ve kayıtları kontrol eder; gerekçeyle düzeltmeye gönderebilir veya onaylar. Kaydı hazırlayan/edit eden kişi kendi kaydını onaylayamaz.
8. Nihai ERP raporu ayrıca onaylanıp kilitlenir. Bundan sonra yetkili, müşteri görünümünden 7 günlük bağlantı üretir ve kendisi paylaşır. Sistem müşteriye otomatik mesaj göndermez. Bağlantıya sahip olan kişi raporu okuyabilir; tüm bağlantılar aynı ekrandan kapatılabilir.

## Yetki ve kayıt davranışı

| İşlem | Koşul |
|---|---|
| Fotoğraf/bulgu yazma | Aynı bayi; INSPECTION_TECHNICIAN veya TECHNICAL_SUPERVISOR; BODY_PAINT_CHECKUP görevi sahibi; görev OPEN; iş emri TECHNICAL_ENTRY_OPEN veya REVISION_REQUESTED ve kilitsiz; çekim draft/returned |
| Teknik onay / iade | Aynı bayinin TECHNICAL_SUPERVISOR / BRANCH_MANAGER rolü veya global CEO / GENERAL_MANAGER; kaydı hazırlamamış olma; kilitsiz iş emri |
| Müşteri bağlantısı | Kaporta onaylı; ERP iş emri APPROVED/DELIVERED, kilitli ve report_approved_at dolu; aynı revizyonda LOCKED final_report |
| Salt okunur erişim | Atanmış/sahiplenilmiş görev veya iş emri; aynı bayi kalite denetçisi; yetkili teknik/yönetim rolü |

Müdür görev sahibi olsa dahi teknik veri yazamaz. Kaporta pilotu mevcut teknik görevleri tamamlandı saymaz, master rapor cevaplarını doldurmaz veya nihai rapor onayını vermez. Bu pilot kaydı nihai rapora bağlı bir fotoğraflı ek olarak paylaşır. Mevcut ERP raporunun tüm zorunlu modülleri ayrıca tamamlanmalıdır.

Asıllar özel `kaporta-360` deposunda tutulur; istemci üzerine yazamaz/silemez. Yeniden çekim yeni nesne oluşturur, güncel açı seçimi değişir, eski fotoğraf kalır. Önizlemeler tarayıcıda küçültülür; sunucudaki özgün dosya korunur. Kimlik, boyut ve MIME denetimleri vardır; istemcinin SHA/dimensions/capture-time beyanı adli doğrulama veya sertifikalı zaman damgası değildir.

Kuyruk, yalnız giriş yapan kullanıcının fotoğraflarını gösterir. Yükleme başarısızsa fotoğraf bu cihazdaki IndexedDB’de bekler. Sayfa yenilemesinden sonra aynı iş emrinde tekrar yüklenebilir. Tarayıcı verisi silinirse yüklenmemiş fotoğraf kaybolabilir; cihaz güvenilir ve kuruma ait olmalıdır. Çıkış sırasında bekleyen yerel dosyaların silinmesi açıkça onaylatılır. Pilot çıkışı ERP’nin diğer sekmelerindeki oturumunu kapatmaz.

Çakışan kayıt sürümü sunucuda reddedilir; kaydedilmemiş parça alanları sessizce ezilmez. Form değişiklikleri ayrıca kaydedilmelidir, çevrimdışı form taslağı desteği yoktur. Fotoğraf yükleme kuyruğu desteklenir; tamamen çevrimdışı uygulama değildir.

Müşteri yalnız onaylı fotoğraf/rapor kopyasını görür; veritabanına anonim erişim açılmaz. Link token’ı URL fragment’ında taşınır, veritabanında özeti saklanır. Link süresi 7 gün, fotoğraf adresleri 120 saniyedir; açık sayfa 90 saniyede bir yeniler. Link kapatıldıktan sonra önceden alınmış bir fotoğraf adresi en fazla iki dakika çalışabilir. İndirilmiş bir dosya geri çağrılamaz.

## Pilot sınırları ve saha kabulü

Bu sürüm fotoğraflı 360 turdur; fotoğraflardan ölçülebilir 3D geometri üretmez. Otomatik hasar/boya tespiti, Bluetooth cihaz bağlantısı, VIN ile otomatik parça düzeni, tarihsel karşılaştırma ve tüm ERP cevaplarına otomatik aktarım henüz yoktur. Dış sütunlar, iç direk/şasi/podye incelemesinin yerine geçmez. Kasa düzenleri genel şablondur; özel malzeme/karoser varyantları için uzman kapsam gerekçesi gerekir.

JPG, PNG, WebP kabul edilir: 1 KB–20 MB, en az 720 px kısa kenar, en fazla 60 MP. İş emri başına 150 fotoğraf. HEIC önce JPEG’e çevrilmelidir. Yakın plan ve ölçüm cihazı fotoğrafları için ek yuvalar otomatik açılır. Pilotta otomatik saklama süresi/silme işi yoktur; kuruluşun kanıt saklama politikası üretim öncesinde ayrıca uygulanmalıdır.

Bağlı Supabase projesinin adı `ototr-staging` olarak doğrulandı. Testler sentetik yerel kayıtlarla çalıştırıldı; canlı müşteri kaydı oluşturulmadı. Üretim kabulü için OTOTR’nin kendi aracı/fotoğrafları, fiziksel Android ve iPhone, ayrı teknisyen/teknik sorumlu hesapları ve gerçek nihai ERP onayının birlikte sınanması gerekir. Mobil kamera dosya seçicisi tarayıcı tarafından yönetilir; fiziksel cihaz davranışı masaüstü testinden çıkarılamaz.

Başlangıç ekipmanı: mevcut iyi kameralı telefon, sabit yükseklik/mesafe işaretleri, homojen aydınlatma, uygun kalibreli Fe/NFe ölçüm cihazı ve güvenilir internet. Satın alma/bütçe zorunlu değildir; ilk saha denemesi mevcut ekipmanla yapılabilir. Referans demo fotoğrafları üçüncü tarafa aittir ve ticari kullanım izni doğrulanmadığı için gerçek müşteri raporuna örnek olarak taşınmaz.

## Doğrulama ve yayın

`npm test`: domain, PGlite/PostgreSQL RLS/RPC ve müşteri sunucu fonksiyonu testleri.

`npm run build:erp` → `node tools/check-pilot.cjs`: izole tarayıcı verileriyle masaüstü/390 px, yükleme kuyruğu, not/ölçüm/kanıt, işaretleme, salt okunur görünüm ve müşteri akışı.

`node tools/check-pilot-backend.cjs`: gerçek servise yalnız olumsuz/okuma HTTP kontrolleri; özel veri yazmaz/okumaz.

`node tools/check-erp-publication.cjs` ve `--live`: ERP menüsü, pilot girişi, eski gerçek fotoğraf demosu ve dönüş bağlantıları.

Database incelemesi: `packages/database/kaporta-360-review.md`. Servis anahtarı yalnız Edge ortamındadır; yayımlanan runtime-config sadece Supabase public publishable key içerir. Yeni endpoint için JWT yerine sunucu tarafından kontrol edilen 256-bit süreli rapor token’ı kullanılır.
