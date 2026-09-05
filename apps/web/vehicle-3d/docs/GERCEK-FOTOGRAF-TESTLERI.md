# Gerçek fotoğraflı alternatif — Kontrol sonucu

6 Eylül 2026 · Microsoft Edge headless · yerel statik derleme · 127.0.0.1:4318

- `npm.cmd test`: 9/9 başarılı. İlk tasarımın 6 testi ve fotoğraf kaynağı/kare/parça eşleştirmesinin 3 testi.
- `npm.cmd run build`: başarılı; iki tasarım aynı dağıtımda.
- `node tools/check-real-spin.cjs`: 19/19 başarılı, tarayıcı runtime hatası 0, harici ağ isteği 0.
- `node tools/check-static.cjs`: ilk 3D ekranın parça seçimi, görselleri ve yerel fontları başarılı.

19 arayüz kontrolü: tüm karelerin hazır olması ve 23 parça; 24/1 sarma; klavye; sürükleme; otomatik dönüş ve durma; 24 kare galeri seçimi; parça ve görünmeyen taraf; yakınlaştırma sıfırlaması; tavan ek kanıt uyarısı; genişletme ve Escape; geçersiz ölçüm reddi; güvenli not gösterimi ve yenileme sonrası kayıt; bulgu filtreleri; JSON sınır bayrakları; iki farklı çekim protokolü açıklaması; 390px mobil galeri; mobil rehber; eski/yeni tasarım geçişi; hata/ağ kontrolü.

Kaynak fotoğrafların 24'ü de 1072×586; dosya başına SHA-256 manifest ile eşleşiyor ve tüm özetler farklı. Fotoğrafların aynı araç turu olduğu kaynak sayfa, sıralı XML ve görsel temas sayfasıyla kontrol edildi. Bu, aracın ekspertiz doğruluğunu veya ticari kullanım hakkını doğrulamaz.

Masaüstü 1600×1080 ve mobil 390×844 ekranları gözle incelendi; yatay sayfa taşması yok. Görseller ve ayrıntılı JSON kontrol sonucu `.local/real-spin-*` altında. Fiziksel telefon dokunması/kamera, gerçek araç çekimi, tüm tarayıcılar ve production API kontrol edilmedi. İlk koşudaki yalnız test aracına ait asenkron sayfa açılış beklemesi düzeltildi; son koşu çıkış kodu 0.
