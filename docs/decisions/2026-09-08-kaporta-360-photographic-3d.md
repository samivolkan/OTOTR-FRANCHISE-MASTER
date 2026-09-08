# Kaporta 360 — özgün fotoğraf dokulu 3D sunum

## İstek ve kapsam

Kullanıcı mevcut “3D şema” görünümünde özgün araç fotoğraflarıyla daha profesyonel bir müşteri sunumu istedi. Aynı ERP girişinin yayınlanması önceki istekte yetkilidir. Kaynak `apps/web/vehicle-3d`, derlenmiş ERP kopyası `apps/admin/prototype/kaporta-360`, mevcut yayın `samivolkan/Ototr` deposundaki `kaporta-360/` yoludur.

## Uygulama

- Referans Opel ADAM için fotoğraf konturlarına göre elle hazırlanmış kavisli üç kapılı dış gövde ve 23 seçilebilir ekspertiz parçası.
- Ön/sağ/arka/sol 1/7/13/19 numaralı özgün fotoğrafların UV koordinatlarıyla ilgili dış yüzeylere yerleştirilmesi. Tüm 24 JPG kaynak manifestteki SHA-256 değerleriyle korunur. Raster kaynak dosyaları değiştirilmez.
- Fotoğraf renklerini koruyan sRGB dokular; seçilen yüzeyde ince kenar çizgisi. Birleştirme, mesafeli açılma, tek parça, saydamlık, serbest dönüş, bulgu turu ve mobil kamera uyumu.
- Başlangıç `Fotoğraflı 3D` / birleşik araç. `?view=cutout` ve “Fotoğraftan parçalar” önceki sekiz açılı 59 bölge deneyimini korur. “24 fotoğraf” asıl kareleri gösterir.
- Dört dokunun tamamı yüklenmeden hazır durumu verilmez. Fotoğraf yükleme veya WebGL hatasında açık mesaj ve genel fotoğraflara geçiş. Kaynak temizleme, azaltılmış hareket ve erişilebilir parça listesi korunur.

## Doğruluk sınırı

Geometri otomatik fotogrametriyle çıkarılmaz; ölçülebilir 3D tarama veya üretici CAD modeli değildir. Fotoğraf eşlemesi yalnız aynı referans araca hazırlanmıştır. Tavan üstü için üst açı bulunmadığından sade temsili malzeme kullanılır; parça arkaları ve lastik yan derinliği nötrdür. Gizli mekanik yapı, iç aksam veya sentetik hasar üretilmez. Örnek bulgular bu fotoğraftaki araç hakkında bir ekspertiz iddiası değildir.

## Veri ayrımı

`photo-body-domain.js` demo türü, rapor kimliği, üç kapılı profil ve 24 fotoğrafın tekil kare/kimlik/URL/örnek niteliğini birlikte kontrol eder. Onaylı rapora, kopyalanmış demo adları olsa dahi referans dokusu uygulanmaz. Müşteri raporu kendi imzalı fotoğraflarıyla açılır; temsili genel 3D şema ayrı sekmede kalır. Kullanıcıya bu iki kapsam açıkça yazılır.

Bu değişiklik veri tabanı, auth, süreli müşteri paylaşımı, teknik/nihai onay, görev sahipliği veya asli kanıt kayıtlarına dokunmaz. Kontrol sırasında gerçek müşteri kaydı okunmaz/yazılmaz; tarayıcı rapor yanıtları sentetik fixture ile karşılanır. OTOTR çekimlerine uygulamak için araca özel yüzey/UV hazırlama ve teknik kabul gerekir; bu kayıt/onay hattı bu görsel güncellemenin kapsamı değildir.

## Kontrol ve geri dönüş

`npm test` kaynak UV/sonlu geometri/parça kimliği, kaynak fotoğraf bütünlüğü ve müşteri referans ayrımı kontrollerini kapsar. `check-photo-body.cjs` asıl dört fotoğrafın WebGL doku yüklemesini, gerçek canvas değişimlerini, tüm parça seçimlerini, mobil görünümü, hata alternatifini ve onaylı raporda referans bulunmamasını doğrular. Önceki sunum/katman kontrolleri tekrar çalıştırılır. Yayın kontrolü son derlenmiş modülün birebir SHA-256 eşleşmesini doğrular. Son sayımlar ve canlı yayın sonucu `TEST_RESULTS.md` içinde kaydedilir.

Geri dönüş aynı sunumun `?view=cutout` veya `?view=photo` girişidir; veri ve asıl fotoğraflar etkilenmez. Tam sürüm geri dönüşü yalnız bu sunumun kaynak/derlenmiş dosyalarına uygulanır. Önceden var olan diğer çalışma ağacı değişiklikleri korunur. Üçüncü taraf fotoğraf ticari kullanım izni doğrulanmadığı için örnek kaynak bildirimi devam eder.
