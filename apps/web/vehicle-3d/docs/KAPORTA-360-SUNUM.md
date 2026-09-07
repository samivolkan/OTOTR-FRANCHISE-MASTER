# Kaporta 360 — müşteriye parçalar üzerinden anlatım

8 Eylül 2026

## Gerçek fotoğraftan parçalar güncellemesi

Örnek sunum artık gerçek fotoğraf katmanlarıyla açılır. Fotoğraf setindeki 1, 4, 7, 10, 13, 16, 19 ve 22 numaralı kare için 59 görünür bölge, 18 farklı parça türüne elle konturlanmıştır. Konturu hazırlanmamış bir parça seçilirse ilgili genel fotoğraf açılır. Tüm 24 kare ayrıca “24 fotoğraf” sekmesindedir. Önceki genel geometri “3D şema” sekmesine taşınmıştır.

“Birleştir” asıl fotoğrafı doğrudan ve maskesiz gösterir; şeffaf seçim konturları etkileşimi korur. “Parçaları ayır” fotoğrafın gerçek piksellerini dışarı taşır; sıfır mesafede tüm parçalar kaynak konumundadır. “Tek parça” seçilen fotoğraf kesitini büyütür. Aynı işlem sekiz hazır açıdan gösterilebilir. Açılan boşluklardaki nötr renk yalnız konum rehberidir; araç içi veya parça arkası olarak yorumlanmamalıdır.

Bu konturlar referans fotoğraflara özgüdür. Onaylı müşteri raporu kendi fotoğraflarıyla açılır, demo kesimleri gerçek araca uygulanmaz. İşletmenin kendi araçlarında bu etkiyi kullanmak için her çekime özel parça konturları hazırlanmalı ve teknik kontrol kapsamında onaylanmalıdır; mevcut sürümde bunun sunucu kayıt/onay akışı henüz eklenmemiştir. Yeni ekran araç fotoğrafını otomatik tanıyıp parçalamaz.

Ek doğrulama: `node --test tests/photo-mask-domain.test.mjs`; `node tools/check-photo-layers.cjs` ve canlı sürüm için `--live`. Fotoğraf dosyalarının 24 kaynak SHA-256 değeri değişmemiştir.

## Teslim edilen deneyim

Sunum `sunum.html` girişinde açılır. Sol kapı seçili ve gövde ayrılmış halde başlayan referans ekran, müşteriye etkileşimi ilk anda gösterir. Seçili parça gövdeden yükselir; kamera seçilen yüzeye döner. Tüm gövdeyi birleştirmek, açılmayı ayarlamak, tek parçayı öne çıkarmak ve diğer yüzeyleri saydamlaştırmak mümkündür. Klavye ile erişilen tüm parça listesi, 3D seçimine alternatif sağlar.

Sağ panelde işlem, yüzey bulgusu, kaydedilmiş boya kalınlıkları, uzman açıklaması ve bağlı fotoğraf birlikte gösterilir. Genel çevre fotoğrafı, bulgu yakın planı olarak sunulmaz. Varsa uzmanın dikdörtgen işaretleri özgün fotoğraftan ayrı katmanda, fotoğrafın gerçek görüntü alanına hizalanır. Fotoğraf tam ekran sunum sırasında da büyütülebilir.

“Anlatımı başlat” bulgulu parçaları sırayla 7,5 saniyede bir açar; elle duraklatılabilir. Herhangi bir parçanın seçimi otomatik turu durdurur. Bu, yazılı açıklamalarla görsel bir turdur; sesli yapay zekâ anlatımı yoktur. “Gerçek fotoğraf” görünümü 24 çevre açısı arasında dolaşır; eksik fotoğraf açıkça belirtilir.

## ERP ve müşteri erişimi

Personel giriş ekranında ve gerçek fotoğraf demosunda yeni örnek sunuma bağlantı vardır. Müşteri, onaylı raporundaki “Parçalı 3D sunumu aç” bağlantısını kullanır. Yeni ekran, mevcut `kaporta-360-report` servisine aynı fragment token ile erişir. Teknik inceleme ve ERP nihai rapor onayı/kilidi koşullarını değiştirmez; yeni paylaşım üretmez ve veritabanına yazmaz.

Onay durumu, tarih ve desteklenen profil doğrulanır. Sadece servis yanıtının bilinen parça alanları ile bağlı HTTPS fotoğrafları kullanılır. Bilinmeyen veya incelenmemiş parça otomatik “orijinal” sayılmaz. Sayısal ölçümden otomatik boya/değişim kararı çıkarılmaz. Notlar metin olarak kaçışlanır. Geçersiz/boş token örnek sayfaya dönüştürülmez.

Görünür sayfa her 90 saniyede ve sekmeye dönüşte yetkiyi tekrar kontrol eder; fotoğraf adresleri mevcut serviste 120 saniyeliktir. Kontrol başarısız olursa rapor metni, fotoğraf, büyütme penceresi ve 3D sahne kaldırılır. İptalin açık ekrana yansıması bir sonraki kontrolü bulabilir; önceden indirilmiş dosyalar geri alınamaz. Rapor verisi bu sunum tarafından kalıcı tarayıcı depolarına yazılmaz. API yapılandırması ve kimlik doğrulama kodu mevcut pilotla ortaktır.

## Görsel doğruluk ve sınırlar

3D model, gövde parçalarının yerini anlatan proje geometrisidir. Üç kapılı şablonda uzun ön kapı ve arka çamurluk birleşimi bulunur; hayali arka yan kapılar gösterilmez. Diğer kasa seçenekleri genel 25 parçalı şablondur. Sedan, hatchback veya SUV seçimi araç üreticisinin birebir geometrisi anlamına gelmez. Motor, hava yastığı, iç şasi veya mekanik aksam hakkında bu modelden sonuç çıkarılmaz.

Referans sunumda 24 gerçek SpinFrame/WebRotate 360 fotoğrafı, 3 temsili bulgu ve 20 incelenmemiş parça vardır. Ticari fotoğraf kullanım izni doğrulanmamıştır. Gerçek raporda yalnız o iş emrinin onaylı fotoğrafları bulunur.

WebGL desteklenmezse fotoğraf ve kayıt inceleme kullanılabilir. Hareket azaltma tercihi animasyon ve otomatik dönüşte dikkate alınır. Masaüstü Edge ve 390px tarayıcı kontrolleri fiziksel iPhone/Android veya gerçek uzman/onaycı saha kabulünün yerine geçmez.

## Sonraki geliştirme sırası

1. **OTOTR’ye ait bir araçla saha sunumu:** 24 çevre + 4 üst açı, gerçek cihaz ölçümleri ve parça detaylarıyla mevcut onay akışını tamamlamak. Teknik sorumlu ile açıklamaların müşterinin anlayacağı biçimde yazılmasını değerlendirmek.
2. **Kasa bazlı profesyonel model kütüphanesi:** lisansı doğrulanmış, ayrı parça kimliklerine sahip modelleri segment/kasa yılıyla eşleştirmek. Fotoğraf ile model arasında kapı, cam, tavan ve çamurluk konum uyumu için kabul kontrolü yapmak. Birebir model bulunmayan araçta “genel şablon” bilgisini korumak.
3. **Sunum yönetimi:** uzman tarafından düzenlenebilen bulgu sırası, seçilmiş kamera açıları ve kısa açıklamalar. Bunları mevcut teknik inceleme ve nihai onay kapsamına dahil etmek.
4. **Teslim materyali:** aynı süreli/iptal edilebilir raporu açan QR, müşterinin seçtiği parçaları özetleyen paylaşılabilir rapor ve hakları doğrulanmış fotoğraflarla kısa video. Video veya statik dışa aktarmanın bağlantı iptaliyle geri çağrılamadığını açık tutmak.
5. **Ölçüm cihazı entegrasyonu:** cihaz modeli ve protokolü doğrulandıktan sonra nokta/kalibrasyon bilgili ölçüm aktarımı. Otomatik aktarım, uzmanın kaporta kararını değiştirmez.

Bu maddeler yol haritasıdır; mevcut sürümde tamamlanmış özellik olarak sunulmaz.
