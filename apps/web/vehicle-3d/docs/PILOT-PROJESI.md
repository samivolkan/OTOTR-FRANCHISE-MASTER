# OTOTR VISION pilot projesi

Tarih: 6 Eylül 2026. Aşağıdaki adet, süre ve hedefler proje önerisidir; ölçülmüş sonuç veya satış taahhüdü değildir.

## Önerilen ürün

Personel araç üzerinde standart bir fotoğraf turunu tamamlar. Ekspertiz uzmanı her kaporta parçasına ölçüm, durum ve kanıt ekler. Teknik sorumlu raporu onaylar. Müşteri kendi aracının gerçek fotoğraflarını, aynı parça kimliklerini taşıyan 3D şablon üzerinde inceler.

İlk ürün için “fotoğraf + semantik 3D şablon” öneriyorum. Böylece boya/değişen gibi sınıflar, geometrisi kusurlu bir taramaya bağlı kalmadan doğru parçaya bağlanır. Araca özel görünüm için marka/model/kasa/yıl bazlı, kullanım hakkı alınmış GLB varlık kütüphanesi ayrıca oluşturulmalıdır. Eşleşmeyen araçta “temsili gövde” etiketi korunur.

Parlak, az dokulu ve saydam yüzeyler fotogrametriyi zorlaştırır. Agisoft, çekim kılavuzunda bu yüzeylerden kaçınmayı önerir. Bu nedenle 24 fotoğrafla her otomobilde doğru tarama garantisi verilemez. [Agisoft Metashape çekim kılavuzu](https://www.agisoft.com/pdf/metashape_2_2_en.pdf)

## Bir şube için ekipman

| Kalem | Adet | Pilot için seçim ölçütü | Öncelik |
| --- | ---: | --- | --- |
| İyi ana kameralı telefon | 1 | 12 MP veya üstü, 1× lens, AE/AF kilidi, yeterli boş alan. Önce şubedeki cihaz denenir. | Zorunlu |
| Telefon tutacağı / kısa monopod | 1 | Güvenli tutuş, sabit yükseklik, araca temas etmeden kullanım | Zorunlu |
| Yaygın ışık veren LED panel + difüzör | 2–4 | Aynı renk sıcaklığı, titreşimsiz kayıt, kontrollü sabit ışık | Ortama göre |
| Zemin poz işaretleri | 12 | 30° aralıklı yön işaretleri, park çizgisi, çekim sıra numarası | Zorunlu |
| Fe/NFe boya ölçer | 1 | Çelik/alüminyum desteği, cihaz kayıt numarası, kalibrasyon kontrolü | Ekspertiz için |
| Ölçer kalibrasyon plakaları / folyo seti | 1 | Üreticinin cihaz için tanımladığı doğrulama prosedürü | Ekspertiz için |
| İnceleme lambası, yansıtıcı çizgi paneli | 1 | Göçük ve yüzey dalgasını farklı ışık altında inceleme | Önerilir |
| Sabit Wi‑Fi, şarj noktası, yedek güç | 1 set | Çekim sırasında kesintiyi azaltma; üretimde çevrimdışı kuyruk | Önerilir |
| Polarize filtre / kontrollü çapraz polarizasyon | Deneme seti | Parlama azaltma etkisi saha testiyle görülmeli; bütün yansımaları çözmez | Fotogrametri deneyi |
| GPU iş istasyonu | 1 merkezi | Planlama hedefi: 32–64 GB RAM, NVIDIA CUDA GPU, 1–2 TB NVMe SSD | Yalnız gerçek tarama deneyi |

6 × 8 m civarı bir alan ve araç etrafında yaklaşık 1,5–2 m güvenli dolaşım payı pilot başlangıç varsayımıdır. Gerçek araç boyu, lens görüş açısı ve şube ölçüsüne göre yerleşim sahada çizilmelidir. Sabit döner platform ilk pilot için gerekli değildir.

Fe/NFe seçimi kaplamanın altındaki malzemeye bağlıdır; demir dışı yüzeyler için uygun prob gerekir. Plastik tamponda standart metal tabanlı boya ölçümü kullanılmamalıdır. [Elcometer prob seçimi](https://www.elcometer.com/en/what-is-the-correct-coating-thickness-gauge-probe-for-each-coating-substrate)

RealityScan model ve doku üretimi için uyumlu NVIDIA GPU ister. Üreticinin listesi minimum/önerilen donanımı açıklar; yukarıdaki 32–64 GB çalışma hedefi bizim pilot önerimizdir, resmi minimum değildir. GPU alımı öncesinde örnek veriyle işlem süresi test edilmelidir. [RealityScan donanım gereksinimleri](https://dev.epicgames.com/documentation/realityscan/hardware-and-software-requirements)

## Fotoğraf standardı

1. İş emri ve araç kimliği doğrulanır. Personel atanmış kaporta başlığından çekime girer.
2. Araç sabit park konumuna alınır. Yüzey mevcut durumuyla belgelenir; kir ve ıslaklık raporlanır. Matlaştırıcı sprey, bant, pudra veya boyaya müdahale varsayılan iş akışına alınmaz.
3. Camlar ve kapılar standart dış turda kapalı kalır. Aydınlatma sabitlenir. 1× lens, sabit odak/pozlama; dijital zoom ve portre bulanıklığı kullanılmaz.
4. Ön yön 0° kabul edilir. Sürücünün soluna doğru 30°, 60°, 90°…330° sırasıyla 12 dış fotoğraf çekilir. Sol/sağ araç yönüne göredir, karşıdan bakan kişinin yönüne göre değildir.
5. 45°, 135°, 225°, 315° yönlerinde 4 üst açı çekilir. Yükseklik yaklaşık 1,7–1,9 m; araca tırmanılmaz, güvenli tutuş kullanılır.
6. Kaput, bagaj, dört kapı ve iki tampon için 8 parça detayı çekilir. Sabit plan toplam 24 fotoğraftır.
7. Her bulgulu parça için genel konum fotoğrafı, yakın plan ve gerekiyorsa ölçüm cihazı/bağlantı noktası fotoğrafı eklenir. Bunlar 24 zorunlu pozun yerine sayılmaz. Mevcut prototipte bu ek sınırsız kanıt yükleyicisi henüz bulunmaz; üretim kapsamıdır.
8. Uzman netlik, parlama, kadraj, yön, araç kimliği ve bulgu görünürlüğünü kontrol eder. Dosya yüklenmiş olması çekimin kabul edildiği anlamına gelmez.

Şablonlu 3D gösterim ile daha akıcı gerçek fotoğraf turu farklıdır. Akıcı bir 360° fotoğraf turu için pilotta 36–72 sabit açılı görüntü denenebilir; bu yöntem serbest yukarı/aşağı bakış sağlayan 3D geometri üretmez.

## Gerçek fotoğraftan 3D üretme deneyi

1. Aynı araçtan sabit aydınlatmada 3 yükseklik turunda toplam 120–240 fotoğrafla başlayın. Yoğun örtüşme sağlayın; örneğin yaklaşık %70–80 ortak görünen yüzey bir başlangıç hedefidir. Sayı/örtüşme sahadaki geometriye göre artırılır.
2. Orijinal dosyaları koruyun. Aracı veya çevredeki nesneleri turlar arasında oynatmayın. Yüzey ve arka plan maskeleri gerekiyorsa kontrollü üretin; sahte doku veya yapay hasar eklemeyin.
3. RealityScan / Metashape içinde kamera hizalama, nokta bulutu/yüzey üretimi, doku, sadeleştirme ve dışa aktarma gerçekleştirin.
4. Gerçekten hizalanan fotoğraf oranını, kaput/tavan/kapı deliklerini, çift yüzeyleri ve cam bozulmalarını uzman incelemesine alın. Ölçek için bağımsız referans ölçüler kullanın; telefon LiDAR'ını boya kalınlığı veya hassas deformasyon ölçümü yerine kullanmayın.
5. Blender'da kontrollü temizleme yapın; kanıt niteliğindeki hasarı “düzeltmeyin”. Üretici/kasa modeliyle ilişkiyi ve varlık lisansını kaydedin.
6. 3D tarama tek mesh olabilir. Kapı/çamurluk kimliği kendiliğinden oluşmaz: yüzey parçalama, segmentasyon veya doğrulanmış hotspot eşleştirmesi gerekir.
7. GLB teslimi için geometri boyutu, texture çözünürlüğü, mobil FPS, yükleme süresi ve gerçek araca görsel uyum ölçülür. İlk hedef: mobil için 5–15 MB model paketi; bu bir kabul denemesi hedefidir.
8. Tarama başarısızsa müşteriye onaylı fotoğraflar + doğru etiketlenmiş şablon gösterilir. Başarısız çıktı gerçek araç ikizi gibi yayınlanmaz.

Bu deneyi tamamlamak için aynı gerçek araca ait orijinal çekim seti gerekir. Mevcut projedeki 24 render bu deneyi doğrulamak amacıyla kullanılamaz.

## Yazılım ve lisans

| Bileşen | Kullanım | Maliyet / karar |
| --- | --- | --- |
| Three.js | Web'de model, raycasting, kaporta rengi | MIT; lisans bedeli yok, geliştirme işi var |
| Blender | Model hazırlama, parça isimleri, optimizasyon | Açık kaynak; 3D sanatçı emeği ayrıca |
| RealityScan | İsteğe bağlı fotoğraftan model üretimi | Uygun işletme için ücretsiz veya yıllık koltuk lisansı |
| Metashape | Alternatif fotogrametri aracı | Edition ve otomasyon ihtiyaçlarına göre seçim |
| Ototr mevcut backend | İş emri, personel, kanıt, onaylı rapor | Mevcut kapasiteye ek depolama/işleme maliyeti |

Kontrol tarihindeki RealityScan lisans sayfası, son 12 aylık geliri 1 milyon USD altındaki uygun kişi/işletmelere ücretsiz kullanım; eşiğin üstündekilere koltuk başına yıllık 1.250 USD belirtir. Uygunluk şirketin gelirine ve lisans koşullarına göre değerlendirilmelidir. [RealityScan lisansı](https://www.realityscan.com/license)

Agisoft mağazasında Standard node-locked lisans 179 USD, Professional node-locked lisans 3.499 USD olarak listelenmiştir. Bunlar cihaz veya proje toplam fiyatı değildir; edition farkları, otomasyon ihtiyacı, vergi ve satış koşulları ayrıca kontrol edilmelidir. [Agisoft resmi mağaza](https://www.agisoft.com/buy/online-store/)

Donanım için doğrulanmamış TL toplamı vermek yerine yukarıdaki adetlerle teklif alınmalıdır. Mevcut telefon/ölçerle başlamak, GPU alımını gerçek veri deneyi sonrasına bırakmak ilk yatırım riskini azaltır.

## Pilot teslim sırası ve kabul

| Aşama | Önerilen süre | Çıktı / kabul |
| --- | --- | --- |
| Saha standardı | 2–3 iş günü | 1 şubede 10 araç, 2 personel, farklı renklerde ve farklı kasa tiplerinde çekim; eksik poz listesi |
| Ototr bağlantısı | 1–2 hafta | Atanmış iş emri, parça kaydı, kanıt yükleme, görev kilidi ve eksik kontrolü |
| Onaylı müşteri raporu | 1 hafta | Teknik onay + rapor sürümü + süreli erişim + bayi izolasyonu testleri |
| Gerçek rekonstrüksiyon deneyi | Ayrı 1–2 hafta | En az siyah/beyaz/metalik araçta başarı, işleme zamanı ve yüzey kalitesi raporu |

Süreler ekip ve altyapı hazır olmasına bağlı tahmindir. Pilot ekibi: 1 ürün/operasyon sorumlusu, 1 kaporta uzmanı, 1 web geliştirici, mevcut mobil/backend geliştiricisi; gerçek model kütüphanesi için 3D sanatçı.

Önerilen kabul hedefleri: zorunlu poz eksikliği olan kayıt müşteriye açılmasın; her bulgu en az bir kabul edilmiş gerçek kanıta bağlansın; yeniden çekim oranı ölçülsün; 24 poz çekiminde hedef medyan süre 6–10 dakika pilotla değerlendirilsin; telefonlarda müşteri ekranı etkileşimli kalsın. Sayısal hasar doğruluğu veya ölçü hassasiyeti pilot yapılmadan ilan edilmesin.

Depolama örneği: 24 × 4 MB = 96 MB/araç yalnız dış çekim asılları. 1.000 araç/ay için yaklaşık 96 GB/ay; ek bulgu fotoğrafları, önizlemeler, modeller ve yedekler buna eklenir. Bu planlama hesabı gerçek cihaz dosya boyutuyla güncellenmelidir.
