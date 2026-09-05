# Doğrulama sonuçları — 6 Eylül 2026

## Geçen kontroller

- `npm.cmd test`: 6 test geçti. 25 parça için gerçek mesh ve sonlu koordinatlar, makul araç sınırları, 24 poz, parça kimlikleri, sentetik/gerçek ayrımı, boş çekim başlangıcı, giriş doğrulama ve dışa aktarma köken bilgisi kontrol edildi.
- `node tools/check-interface.cjs`: 24 kontrol geçti. WebGL başlangıcı, parça seçimi, düzenleme, metnin güvenli gösterimi, IndexedDB kalıcılığı, müşteri önizlemesi, dönme/ayırma/görünüm kontrolleri, gerçek fotoğraf sayacı, yükleme, tekrar ve düşük çözünürlük reddi, JSON indirme, ekipman ekranı ve mobil yatay taşma kontrol edildi.
- Test oturumunda tarayıcı çalışma zamanı hatası görülmedi. Uygulamanın başlatılması ve bu akışlarda harici ağ isteği görülmedi; fontlar yerel dosyalardan yüklendi.
- `node tools/export-samples.cjs`: 24 render ve GLB üretildi. Renderlar üzerinde temsili köken etiketi var.
- GLB dosya başlığı ve JSON içeriği okundu: 25 semantik grup mevcut, dosya 5.515.080 bayt.
- Eşleştirme dosyasındaki 17 dolu rapor alanının kaynak katalogda mevcut olduğu doğrulandı. Kalan 8 parça için eşleştirme kasıtlı olarak boş bırakıldı.
- `npm.cmd run build`: üretim derlemesi başarılı; uygulama dosyaları ve GLTFExporter ayrı paketlere ayrıldı.

## Test kapsamı

Windows üzerinde Microsoft Edge headless, yazılımsal WebGL; masaüstü 1440 × 1000, mobil emülasyonu 390 × 844. Görseller ayrıca 1600 px masaüstü genişliğinde incelendi. Yükleme testindeki görüntü sentetik test dosyasıdır; gerçek kaporta kanıtı değildir. Testler ayrı tarayıcı bağlamlarında çalıştı.

Bu sonuçlar gerçek telefon kamerası, iOS Safari, fiziksel boya ölçer, canlı Ototr yetkilendirmesi, teknik onay API'si, gerçek araç fotoğrafı veya fotogrametri başarısının doğrulandığı anlamına gelmez. Gerçek cihaz ve saha pilotu entegrasyon planında ayrıca tanımlandı.

## Kanıt dosyaları

`.local/interface-results.json`, `.local/studio-desktop.png`, `.local/mobile-report.png`, `.local/mobile-capture.png`, `.local/mobile-plan.png`.

İlk arayüz test koşusunda asenkron yerel kayıt tamamlanmadan sonuç okunduğu için test bekleme hatası oluştu. Test, diyalog kapanışını bekleyecek şekilde düzeltildi; sonraki tam koşuda 24 kontrol geçti.

- Hazır statik derlemede model yüzeyine tıklama doğrulandı: kaput, ön cam ve sol arka kapı seçilebildi. Yerel fontlar yüklendi, kırık görünür görsel ve runtime hatası yok.
