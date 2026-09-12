# Passat B8 pilot adayı

Kullanıcı ilk gerçek OTOTR pilotu için Passat B8 önerdi. Sedan / Variant ayrımı asenkron soruldu; cevap gelene kadar sedan, dört kapı hazırlık taslağı üretildi. Model yılı, makyaj, donanım ve tavan tipi henüz bilinmiyor. Sedan varsayımı kesin araç kabulü değildir.

## Yapılan çalışma

- `passat-b8-pilot.html`: yazdırılabilir, beş bölümlü araç/çekim/parça/model/kabul hazırlık dosyası.
- `passat-b8-pilot.json`: 25 mevcut sedan inceleme bölgesi, 28 özgün açı planı, önerilen dosya adları. Yıl/mesh/fotoğraf/lisans alanları bilinmiyor; tüm incelemeler `unchecked`, müşteri yayımlama durumu false. ERP raporu veya doğrudan içe aktarma formatı değildir.
- `passat-b8-model-brief.txt`: 3D üreticisine verilebilecek kapsam, parça kimlikleri ve kullanım hakkı teyit maddeleri. Hiçbir satıcıya gönderilmedi.
- Referans stüdyosunun hazırlık kartından pilot dosyasına bağlantı. Gerçek iş emrinin aracı veya mevcut referans fotoğrafları değiştirilmedi.
- Tekrarlanabilir üretim `tools/prepare-passat-pilot.mjs`; ERP build öncesi çalışır ve mevcut domain parça/açı kimliklerini kullanır.

## Araştırmada görülen sorun

[Volkswagen'in B8 referansı](https://www.volkswagen.ie/en/owners-and-services/previous-models/mid-size-class/passat-b8.html) sedan/estate ve farklı donanımları ayırıyor. [TurboSquid 917105 adayı](https://www.turbosquid.com/3d-models/volkswagen-passat-sedan-3d-model/917105) incelendiğinde “Editorial Uses Only” etiketi görüldü. Ayrıca model ilanında dingil mesafesi 2775 mm, Volkswagen referansında 2791 mm. Bu, ilan bilgilerinin uyuşmazlığıdır; dosya indirilip geometri ölçülmüş değildir.

Bu aday satın alınmadı, indirilmedi veya onaylı model olarak kaydedilmedi. Etkileşimli OTOTR web kullanımı, modelin istemciye aktarımı ve uyarlama kapsamı yazılı olarak doğrulanmalı; gerçek araçla gövde uyumu kontrol edilmeli. Özel üretim aynı teknik kabul koşullarıyla alternatif olarak değerlendirilebilir. Model edinme/üretme için maliyet kesinleştirilmedi.

## Test ve geri alma

- `npm.cmd run build:erp` başarılı; önceki ortak 3D chunk boyut uyarısı sürüyor.
- 55 mevcut otomatik test geçti. Statik plan kontrolü: 25 bilinen bölge, 28 benzersiz çekim, boş kanıt/mesh ve yayımlanamaz hazırlık durumu.
- In-app tarayıcı: içerik, bölüm bağlantısı, masaüstü 1440×1000 ve mobil 390×844 görünümü, 25 bölge/28 açı sayımı, indirme hedefleri ve hata kayıtları kontrol edildi. Yatay sayfa taşması görülmedi. Fiziksel yazıcı/PDF baskısı veya gerçek araç kabulü bu turda yapılmadı.
- Etkilenen alanlar: yeni statik pilot dosyaları, demo stüdyo hazırlık bağlantısı, build kopyalama akışı. Veritabanı, yetkilendirme ve onay zinciri değişmedi. Geri alma: bu dosya/bağlantı ve build eklerini geri alıp önceki stüdyo bundle referansını yayımlamak; eski hashli varlıklar korunur.

## Sonraki girdi

Sedan/Variant, model yılı, makyaj ve donanım teyidi; yetkili iş emrinden gerçek OTOTR fotoğrafları; kullanım hakkı ve geometrisi doğrulanmış 3D model. Bu girdiler gelmeden Passat'a ait gerçekçi parçalı 3D sunum tamamlandı diye sunulmaz.
