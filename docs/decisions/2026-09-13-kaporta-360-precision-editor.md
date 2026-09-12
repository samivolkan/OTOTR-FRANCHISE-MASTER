# Kaporta 360 — hassas parça editörü

## Teslim

Kullanıcının hazırlık haritasından sonraki adım olarak onayladığı hassas editör, `studio.html` içindeki **03 Parça eşleştirme** ekranına eklendi. Aynı kaynak fotoğraftaki sınırı büyüterek düzenlemeyi ve kayıt öncesi kesiti incelemeyi kolaylaştırır.

- %100–800 yakınlaştırma, fotoğrafı sığdırma ve mevcut kontura odaklanma.
- Fotoğrafı kaydır modunda fare veya tek parmak sürükleme; fotoğraf sınırları içinde kalır.
- Nokta seçme düğmeleri; fotoğraf alanı odaktayken yön tuşlarıyla 1 kaynak piksel, Shift ile 10 piksel düzeltme. `[` ve `]` nokta seçer, `+` / `-` yakınlaştırır, `0` sığdırır, Escape nokta taşıma moduna döner.
- Sayısal koordinat alanlarında %0.001 adım. Nokta düzenlemesi kontrol işaretini kaldırır; yalnız seçim ve kaydırma kaydı değiştirmez.
- Kesit, sürükleme sırasında canlı güncellenir. Tek kesit ve kaynak fotoğraftan ayrılmış taslak görünümü arasında geçilir. Önizleme, kaydedilmemiş sınırı rapora eklemez.
- Geri/ileri alma seçili nokta indeksini mümkün olduğu ölçüde korur. Yeni kaynak veya parça seçimi yakınlaştırmayı sıfırlar.
- Ekran boyutu değişince nokta tutamaçları yeniden boyutlandırılır; eski SVG gözlemcisi gezinmede ve erişim kapanışında temizlenir.

## Teknik karar

Kontur ve ölçüm koordinatları özgün fotoğrafın 0–1 uzayında kalır. Yakınlaştırma/kaydırma yalnız SVG viewBox değiştirir; gösterim durumu sunum JSON'una eklenmez. İşaretçi konumu ters ekran matrisiyle fotoğraf koordinatına dönüştürülür. Çizim ve pin ekleme fotoğraf dışındaki boş alanda kabul edilmez; mevcut noktalar sürüklemede fotoğraf sınırına sıkıştırılır.

Bu teslim yeni rekonstrüksiyon, araç modeli, otomatik parça tanıma veya görüntü iyileştirme üretmez. 8 kat büyütme kaynakta olmayan ayrıntıyı oluşturmaz; yüksek çözünürlüklü gerçek OTOTR çekimleri sonraki saha gereksinimidir. İki parmakla pinch hareketi bu sürümde eklenmedi; dokunmatik kullanım yakınlaştırma düğmeleri ve kaydırma moduyla yapılır.

## Doğrulama

- 55 otomatik test: mevcut veri/kanıt/onay senaryoları ve 4 yeni viewport/piksel testi.
- ERP build başarılı. Mevcut 672 kB ortak 3D chunk için boyut uyarısı sürüyor.
- In-app tarayıcıda: kapıya odaklanınca kaynak noktaları değişmedi; pan viewBox'u değiştirdi, konturu değiştirmedi. Seçili X 731→732; Shift aşağı Y 182→192; geri alma 182, ileri alma 192. Büyütülmüş görünümde gerçek pointer sürükleme ve geri alma doğrulandı.
- Sol aynada %800 odak, kaynak değişince %100/boş kontur, seçili noktanın geri almada korunması ve kontrol edilmiş sınırın örnek kaydı doğrulandı.
- Kaydedilmemiş sınırla hazırlık kaydı engellendi. Canlı kesit önizlemesi gösterildi. 1440×1050 ve 390×844 düzenleri incelendi. Yeniden boyutlandırmada tutamaçların küçülmesi fark edilip ResizeObserver ile düzeltildi; masaüstünde 16 CSS piksel çap ölçüldü ve mobil görüntü yeniden kontrol edildi.
- Gerçek müşteri verisi, gerçek iş emri yazımı ve fiziksel dokunmatik cihaz bu turda denenmedi. Tarayıcıda demo ve mevcut yerel veri/rol testleri kullanıldı.

## Sınır ve geri alma

Sadece stüdyo frontend kaynakları, testler ve üretilmiş stüdyo bundle'ı değişir. Veritabanı, Edge servisleri, görev sahipliği ve nihai rapor kapısı değişmedi. Geri alma: bu teslimin kaynak değişikliklerini geri alıp önceki stüdyo bundle referanslarını yeniden yayımlamak. Önceki hashli varlıklar korunur.

Sonraki adım: ilk gerçek aracın model/kasa eşleşmesini ve çekim setini kabul etmek; ardından ayrı parçalardan oluşan lisanslı araç modelini gerçek kanıtlarla birleştirmek.
