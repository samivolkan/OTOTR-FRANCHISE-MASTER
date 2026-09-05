# OTOTR VISION — Gerçek fotoğraflı alternatif

6 Eylül 2026 · Yerel tasarım ve uygulama örneği

Kullanıcının ilk semantik sedan modelini oyuncak gibi bulması üzerine, aynı gerçek aracın çevresinden çekilmiş 24 fotoğrafla ikinci bir arayüz hazırlandı. Önceki model korunur. Yeni giriş: `http://127.0.0.1:4318/real-360.html`.

## Gerçek görüntülerin kaynağı

Kaynak: [WebRotate 360 — 360 car photography](https://www.webrotate360.com/examples/browse-all-examples/360-car-photography.aspx). Sayfa çevre turunu SpinFrame'e atfeder ve tek sıra 24 JPG ile fotoğraflandığını belirtir. Konfigürasyon: [sfcar.xml](https://www.webrotate360.com/images/webrotate360/views/sfcar/sfcar.xml). Buradaki 1–24 sırası korundu.

- Araç: Opel ADAM, iki yan kapı ve bagaj kapısından oluşan üç kapılı hatchback.
- Kullanılan 24 JPG'nin her biri 1072 × 586 piksel; SHA-256 özetleri birbirinden farklı.
- Sayfadaki 2000 × 1024 bilgisi içeri aktarılmış orijinal görsellere aittir. Prototipte kullanılan erişilebilir karelerin gerçek ölçüsü 1072 × 586'dır.
- Kaynak görüntülerin byte'ları korunur. Araca yapay hasar eklenmedi; görüntüler ImageGen veya başka bir üretici ile oluşturulmadı. Ekrandaki büyütme yalnız görüntüleme ölçeğidir.
- Kare başına kaynak URL, ölçü ve özet `public/real-car/source.json` içindedir. Edinme aracı `tools/fetch-real-spin.cjs` yeniden ağdan indirir; normal uygulama çalışmasında kullanılmaz.
- Kaynak sayfanın başka hotspot görselleri projeye alınmadı. Arayüz ve 2B parça işaretleri bu proje için yazıldı; WebRotate görüntüleyici yazılımı kopyalanmadı.

Bu fotoğraflar OTOTR'a ait ekspertiz kanıtı değildir. Ticari yeniden kullanım izni doğrulanmadı; kaynak adı vermek kullanım izni yerine geçmez. Set yerel tasarım referansıdır. Canlı müşteri raporunda OTOTR'ın kendi çekimleri veya açıkça lisanslanan bir set kullanılmalıdır. Dışarıya yayın yapılmadı.

## Tasarım ve çalışan etkileşimler

Büyük beyaz fotoğraf alanı, koyu kaporta açıklama paneli ve OTOTR kırmızısı kullanıldı. Araç fotoğrafı görsel odağı oluşturur. Kullanıcı yatay sürükleme, klavye okları, önceki/sonraki butonları veya açı kaydırıcısı ile 24 kareyi döndürür. 24→1 geçişi süreklidir. Otomatik döndürme, 1–1,8× yakınlaştırma ve inceleme alanını genişletme bulunur.

Sekiz ana açı küçük görsellerle, bütün set ise 24 karelik seçilebilir galeriyle açılır. Parça listesi bu kasaya göre 23 dış parça içerir; sedanın arka yan kapıları bu araçta gösterilmez. Parça seçimi uygun referans karesine gider. Görünür parçalar için normalleştirilmiş fotoğraf koordinatlarında elle konumlandırılan işaretler vardır. İki yakın referansta da görünür olan işaretler ara karelerde enterpole edilir; görünmeyen tarafta işaret üretilmez. Bu eşleştirme otomatik segmentasyon veya ölçülebilir 3D konum değildir.

Tavan üst yüzeyi ve iç yapısal alanlar bu yatay setten değerlendirilemez. Tavan seçildiğinde ek üst çekim gereği açıklanır. Dış sütun görünümü, iç direk/podye/şasi kontrolünü karşılamaz.

Başlangıçtaki üç örnek bulgu ve boya ölçümleri tamamen kurgusaldır; araca hasar iddiası yöneltmez. Diğer 20 parça incelenmedi durumundadır. Örnek durum, metal yüzey ölçümleri ve not düzenlenip aynı tarayıcının localStorage alanına kaydedilir. Eski prototipin kayıtlarından ayrı anahtar kullanılır. JSON taslağında fotoğrafların gerçek, ekspertiz verisinin kurgusal ve geometrinin yeniden oluşturulmamış olduğu açık bayraklarla belirtilir. Fotoğraf asılları bu JSON içinde bulunmaz.

## Fotoğraf turu ve gerçek 3D arasındaki sınır

Bu yöntem fotoğraftaki gerçek aracı gösterir; derinlik ağı, hacim veya serbest kamera üreten fotogrametri değildir. Kullanıcı yalnız çekilmiş yükseklik ve açılardan bakabilir. Kaportayı renklendirmek için gerçek görüntüyü değiştirmek yerine işaret ve açıklama kullanılır. Ölçüm ve uzman kararı ayrı veridir. 15° etiketleri 24 eşit sıra için nominal açıdır; kaynak kameranın ölçülmüş pozları değildir.

## OTOTR çekim akışına uyarlama

İlk prototipin 24 poz planı **12 çevre + 4 üst + 8 detay** idi. Yeni alternatifin 24 karesinin **tamamı çevre turudur**. Bu iki protokol eşit sayılmaz; ilk ekranın tamamlanma sayacı bu sete doğrudan bağlanamaz.

Personel için önerilen sıra: ön → sağ ön → sağ → sağ arka → arka → sol arka → sol → sol ön; her ana yön arasında iki ara kare, toplam 24. Kamera yüksekliği, lens, kadraj merkezi, araç konumu ve ışık sabit tutulur. Yerde 24 konum işareti ve telefonda siluet kılavuzu aynı turu tekrar etmeyi kolaylaştırır. Araç başına tavan, bulgu yakın planları, cihaz ekranı ve iç yüzeyler ayrıca çekilir. Bu set, tek başına bütün kaporta ekspertizini tamamlamaz.

Üretimde mevcut atanmış iş emrine ayrı bir `exterior_spin_24` çekim grubu eklenmesi önerilir. `frameIndex`, `sourceAssetId`, `vehicleId`, çekim zamanı ve ilgili parça kanıtı tutulur. Kalite kontrolü eksik/tekrarlanan kareyi, kadraj sapmasını, farklı aracı ve okunamayan bulguyu ele almalıdır. Sıralama ve parça eşleştirmesi uzman tarafından düzeltilebilir olmalıdır. İş emri sahipliği, bayi erişimi, teknik onay ve rapor kilidi korunur.

Bu ikinci ekran sabit örnek seti sunar. Yeni bir 24 kare turu yükleme, kamera yönlendirmesi, iş emri API'si, otomatik kare eşleştirme ve müşteri paylaşım yetkisi henüz bu ekrana bağlanmadı. İlk tasarımda genel dosya yükleme örneği vardır. Entegrasyon altyapısı ve ekipman yaklaşımı için [pilot projesi](PILOT-PROJESI.md) ve [entegrasyon planı](OTOTR-ENTEGRASYON.md) korunur; çekim sayısı yukarıdaki yeni protokole göre güncellenmelidir.

## Kontrol ve teslim

`npm.cmd test` parça/kare ve kaynak bütünlüğünü, `node tools/check-real-spin.cjs` gerçek tarayıcı etkileşimlerini kontrol eder. Kontrol aracı 4318 sunucusu ve Microsoft Edge/Playwright gerektirir. `npm.cmd run build` iki HTML girişini birlikte derler. Gerçek saha çekimi ve ticari yayın bu yerel prototipin kapsamı dışındadır.
