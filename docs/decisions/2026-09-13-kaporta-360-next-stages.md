# OTOTR Kaporta 360 — saha ürününe geçiş analizi

13 Eylül 2026. İncelenen başlangıç: `studio.html?v=studio-v1`. Amaç: müşterinin aracını, parçasını ve inceleme kanıtını kolayca anlayacağı etkileyici bir sunum; personelin bunu tekrar üretilebilir sürede hazırlaması.

## Karar

İlk teslim, mevcut stüdyoya **hazırlık haritası** eklemektir. Sonraki büyük yatırım, bir pilot kasa için ayrı parçalardan oluşan, kullanım hakkı doğrulanmış 3D model ve gerçek OTOTR çekim setidir. Önce bir aracı uçtan uca doğrulayacağız; ardından model sayısını artıracağız.

24 çevre fotoğrafı, mevcut 360° oynatıcı için yararlıdır. Aynı 24 karenin her araçta ölçülebilir ve eksiksiz 3D rekonstrüksiyon oluşturacağını varsayamayız. Parlak boya ve camın geometrik rekonstrüksiyonu zorlaştırması araştırmalarda da ele alınır: [Car-GS araştırması](https://arxiv.org/abs/2501.11020). Bu nedenle önerim, ayrı parça geometrisi + gerçek fotoğraf kanıtı + uzman onaylı açıklama birleşimidir. Otomatik tarama ayrı bir deney hattı olur.

## Mevcut altı adımın denetimi

Bu oturumda canlı referans ekranları görüntülenmiş, ardından kaynak kod incelenmiştir. Bulgular örnek araca aittir; gerçek müşteri iş emri veya fiziksel cihaz denenmemiştir. Görseller sıralı ve bu oturumda alınmıştır.

1. **Araç ve hazırlık — kısmen hazır.** Kasa tipi, parça sayısı, ekipman alanı ve referans model sınırlaması görünür. 24/28 açı mevcut, üst açılar eksik. Kasa yılı, model dosyası lisansı ve geometrik eşleşmenin kayıtlı kabul süreci henüz yok. İlk sürümde toplam kesit sayısı, kaç farklı parçanın hazır olduğunu anlatmıyordu. [Başlangıç ekranı](../../apps/web/vehicle-3d/.local/audit-2026-09-13/01-setup.png).
2. **Çekim kontrolü — işlevsel; sahada doğrulama gerekli.** 24 çevre + 4 üst açı, kimlik/açı/görüntü kontrolleri ve yardımcı netlik/ışık incelemesi var. Referans kareler 1072×586; gerçek çekim için uygulamanın 720 piksel kısa kenar koşulunu karşılamıyor. Görüntü analizi hasar tespiti yapmıyor. [Çekim ekranı](../../apps/web/vehicle-3d/.local/audit-2026-09-13/02-capture.png).
3. **Parça eşleştirme — ilk iyileştirme tamamlandı.** Başlangıçta 23 parçada yalnız renkli nokta vardı; kontrol edilmiş/taslak/geçersiz kaynak ayrımı açık değildi. Yeni sürüm durum metni, sayılı filtreler ve kaynak önerisi sunuyor. Kesit hazırlığı elle yapılıyor; hassas yakınlaştırma ve kaydırma sonraki editör işi. [Önce](../../apps/web/vehicle-3d/.local/audit-2026-09-13/03-mapping.png), [sonra](../../apps/web/vehicle-3d/.local/audit-2026-09-13/07-coverage-desktop.png).
4. **Anlatım planı — işlevsel.** Kanıt, görünüm, sıra, süre ve açıklama düzenleniyor. Örnek 3 durak/24 saniye. Tüm uygun parçalar eklendiğinde boş parça seçicisi ve etkin ekleme düğmesi kalıyor; ileride boş durum açıklaması eklenmeli. Temsili metinlerin gerçek kayıtlarla değiştirilmesi saha gereksinimi. [Anlatım ekranı](../../apps/web/vehicle-3d/.local/audit-2026-09-13/04-story.png).
5. **Sunum provası — güçlü görsel temel; geometrik kapsam sınırlı.** Gerçek fotoğraf kesitleri ayrılıyor; özgün fotoğrafa dönüş ve parça açıklaması var. Görülmeyen yüzeyler ve iç mekanik ayrıntılar fotoğraftan doğrulanmış değildir. Referansa özel gövde her müşteri aracına uygulanamaz. [Prova ekranı](../../apps/web/vehicle-3d/.local/audit-2026-09-13/05-preview.png).
6. **Teknik teslim — kontrol kapıları mevcut.** Referansta 28 sunum eksiği ve 27 ekspertiz eksiği gösteriliyor; gönderim kapalı. Uzun eksik listeleri nedeniyle personel hazırlık sırasında erken yönlendirmeden yararlanır. Gerçek şube/usta/bağımsız teknik sorumlu/nihai rapor onayı senaryosu fiziksel pilotta yürütülmeli. [Teslim ekranı](../../apps/web/vehicle-3d/.local/audit-2026-09-13/06-review.png).

Genel durum: kontrollü pilot için yazılım temeli var; bütün araçlarda otomatik fotoğraflı 3D sunum veren tamamlanmış saha ürünü seviyesinde değil. Bu inceleme tam erişilebilirlik uygunluk denetimi değildir.

## Sırayla uygulanacak işler

| Sıra | Çıktı | Gereken girdi / sorumlu | Bitti kabulü |
|---|---|---|---|
| 1 — tamamlandı | Hazırlık haritası, eksik parça filtresi, sıradaki işe geçiş | Mevcut yazılım | Güncel fotoğraf ve geçerli sınır esas alınır; eski kaynak hazır sayılmaz; masaüstü/telefon kontrolü |
| 2 | İlk gerçek araç için çekim ve model kabul dosyası | OTOTR: marka, model, kasa/yıl aralığı, kapı sayısı; bir araç, bir personel, bir teknik sorumlu | 28 özgün açı + her bulgu için detay; fotoğraf/parça bağlantısı; ekipman ve tekrar çekim kaydı |
| 3 | Hassas parça editörü | Yazılım: yakınlaştırma, kaydırma, seçili nokta odağı, küçük yüzeylerde kullanım | Aynı kontur farklı yakınlaştırmalarda kaymaz; dokunmatik ve klavye ile düzenlenir; kaynak piksel koordinatları korunur |
| 4 | İlk kasa için profesyonel 3D varlık | Kullanım hakkı doğrulanmış GLB/glTF, 3D sanatçısı, araç referansları | Her kaporta parçası ayrı mesh; doğru kapı sayısı, oturan birleşim çizgileri, doğru seçim alanları ve ayrılma yönleri |
| 5 | Araca özgü model + gerçek kanıt sunumu | Kabul edilmiş model, gerçek fotoğraflar, parça eşlemesi | Tıklanan parça doğru kanıtı açar; model versiyonu rapora bağlanır; fotoğrafı olmayan yüzey temsili kalır; mobil yükleme ölçülür |
| 6 | Müşteri anlatımı ve karşılaştırma | Uzmanın onayladığı kısa metinler, ölçümler ve yakın planlar | Genel görünüm → bulgu → kanıt → sonuç akışı; durdurma/yeniden oynatma; müşterinin aynı bulguyu kendi başına bulabilmesi |
| 7 | Kanıt işleme ve operasyon dayanıklılığı | Backend: dosyanın sunucuda doğrulanması, kesilen yüklemenin kurtarılması, sürümlü model kaydı | Dosya özeti/çözünürlük sunucuda doğrulanır; başarısız yükleme rapora eklenmez; yetki kaybı ve geri çekme sınanır |
| 8 | Ölçülen saha pilotu ve kademeli yayılım | Önerilen ilk seri: tek şubede 10 araç; farklı renk/ışık/kaporta senaryoları | Hazırlama süresi, tekrar çekim, yanlış parça bağlantısı ve müşteri anlama sonuçları kaydedilir; teknik sorumlu kabulü sonrası yeni kasa |

Bu sıra bir uygulama planıdır; 2–8 henüz teslim edilmiş özellikler değildir. Araç verisi beklenirken 3. sıradaki editör iyileştirmesi geliştirilebilir. Çok sayıda marka için model satın alma veya model üretme işine, ilk kasa kabul edilmeden başlanmamalı.

## İlk saha için ekipman

Mevcut bir telefon/kamera ile kontrollü deneme yapılabilir. Satın alma kararı için önce gerçek çekim testini görmeliyiz. Asgari kurulum: tek cihaz ve tutarlı 1× lens kullanımı; sabit/ölçülmüş kamera yüksekliği ve mesafesi; zeminde 24 yön işareti; aracın çevresinde güvenli dolaşım alanı; homojen ve sabit aydınlatma; üst açı için güvenli çekim imkânı; metal tipine uygun boya ölçüm cihazı ve üreticisinin kontrol referansları; yeterli ağ/yükleme kapasitesi; sunumu gösterecek telefon ve büyük ekran.

Cihaz modeli, optik ayar, ışık düzeni, çekim süresi ve tekrar çekim nedenleri ilk araç kabul dosyasına yazılmalı. Güncel stüdyoda ekipman serbest metin alanıdır; cihazdan otomatik ölçüm alma yoktur. Gerçek ölçümün doğru parçaya girilmesi ve bağımsız uzman kontrolü gereklidir.

## 3D sanatçısına verilecek teslim şartları

GLB/glTF dosyası; marka-model-kasa/yıl-kapı sayısı eşleşmesi; ticari kullanım, web dağıtımı ve türetme izni; kaynak model ve sürüm kaydı; mevcut `partsFor(profile)` kimlikleriyle eşleşen parça listesi; her parçanın ayrı seçilebilir geometrisi; doğru yüzey normalleri, UV koordinatları ve birleşim çizgileri; birleştirme/ayırma için tanımlı pivot ve yön; mobil cihaz için sadeleştirilmiş sürüm.

Cam, boya, vernik ve metalin ışık altında tutarlı görünümü için PBR malzemeler kullanılmalı; glTF'nin bu özellikleri [Khronos PBR açıklamasında](https://www.khronos.org/gltf/pbr) tanımlanıyor. Malzeme gerçekçiliği, aracın ekspertiz durumunu doğrulamaz. Boya/değişim rengi yalnız uzman kaydından gelir. Model malzemesi ile gerçek kanıt fotoğrafı arasındaki fark arayüzde anlaşılır kalmalı.

Model kabulünde önce dört ana yönde siluet ve parça sınırları, ardından çapraz ve üst açılar kontrol edilir. Oturan dış yüzey, doğru parça tıklaması, aşırı açılmayan patlatılmış görünüm ve mobil kadraj doğrulanır. Ölçülmemiş model üzerinden milimetrik onarım veya şasi kararı verilmez.

## İlk geliştirme kapsamı ve doğrulama

Hazırlık kartı farklı parça sayısını gösterir; örnekte **9/23** parçada en az bir kontrol edilmiş kesit var. Filtreler: tüm parçalar, hazırlık bekleyenler, kesit hazır, kesit kontrolü, kaynağı yenile, sınır çizilecek, kanıt bağlanacak. Eksik çekim düğmesi önce olmayan açıyı, sonra kontrol bekleyen çekimi açar.

Parça önerisi yalnız aynı parçanın kayıtlı kesitine veya güncel bağlı kanıtına dayanır. Başka bir parçanın fotoğrafı öneri yapılmaz. Kaynak bulunamadığında mevcut çevre fotoğrafı elle seçim için gösterilir ve öneri olmadığı açıklanır. Detay fotoğrafı o parçaya bağlı olmalıdır. Kaynak değişimi, geçersiz çokgen veya özet uyuşmazlığı hazır kapsamına katılmaz. Kontrol kutusu değişince sayaç ve filtre yenilenir. Bu hesap rapor onay kapısına yeni bir koşul eklemez ve incelenmemiş parçayı orijinal ilan etmez.

`npm.cmd test`: 51 test geçti; yeni 5 test kapsam/source/tekrar çekim/öncelik/çoklu kesit sayımını kapsıyor. `npm.cmd run build:erp` başarılı. Mevcut 672 kB ortak 3D paketi için Vite boyut uyarısı sürüyor; ilk açılış optimizasyonu sonraki performans işidir.

Tarayıcıda örnek akışla hazırlık haritası, filtre, arka tamponun bağlı arka fotoğrafına yönlenmesi, kontrol kutusuyla 9→8→9 değişimi, taslak parçaya öncelik, eksik ön sağ üst açıya geçiş doğrulandı. 1440×1000 ve 390×844 düzenleri görüntülendi; yeni görünümde yatay sayfa taşması ve tarayıcı hata kaydı görülmedi. Fiziksel kamera, gerçek ölçüm cihazı, gerçek müşteri verisi ve gerçek yetkili iş emri bu oturumda sınanmadı.

[Yeni hazırlık kartı](../../apps/web/vehicle-3d/.local/audit-2026-09-13/08-readiness-desktop.png) · [Mobil parça haritası](../../apps/web/vehicle-3d/.local/audit-2026-09-13/09-coverage-mobile.png)

Etkilenen ekran: `studio.html`, hazırlık ve eşleştirme adımları. Veri tabanı, erişim rolleri ve müşteri paylaşım servisi değişmedi. Geri alma: bu teslimin kaynak ve stüdyo bundle değişikliklerini geri alıp önceki `studio.html` ve varlık referanslarını yeniden yayımlamak; eski hashli dosyalar korunur.
