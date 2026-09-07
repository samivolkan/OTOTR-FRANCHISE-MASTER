# Kaporta 360: parçalı müşteri sunumu

Kullanıcı mevcut parçaları ayırma etkileşimini geliştirmeyi ve etkileyici ekspertiz sunumu yapmayı istedi. Mevcut çekim/teknik inceleme akışına dokunmadan ayrı `sunum.html` girişi eklendi.

Yeni 3D renderer, mevcut proje geometrisini kullanır; üç kapılı araçta 23 semantik parça sağlar. Diğer profiller genel 25 parçalı anlatım şablonudur. Seçim, mesafeli ayrılma, saydam/tek parça modu ve kamera hareketleri gerçek fotoğraf, ölçüm, bulgu ve uzman notuna bağlandı. Referans demo ile onaylı müşteri kaydı ayrı veri dönüşümleridir; hatalı token veya eksik kayıt demo sonucuna dönüşmez.

Onaylı raporun mevcut capability endpoint’i yeniden kullanılır. Yeni RPC, tablo, migration veya auth yetkisi yoktur. Sunum veritabanına yazmaz. 90 saniyelik/sekme dönüşü kontrolü başarısızsa içerik kaldırılır. Personel girişi ve referans demo sunuma bağlandı; onaylı müşteri raporu kendi token’ıyla yeni ekranı açar.

Kaynak `apps/web/vehicle-3d`; dağıtım `apps/admin/prototype/kaporta-360` ve Ototr yayın deposunun aynı modülü. Eski hash’li dosyalar önbellek uyumluluğu için korunur; yeni girişler güncel bundle’ı kullanır. Geri dönüş, yeni sunum bağlantıları ve girişini önceki sürüme almakla sınırlıdır; kanıt/rapor verisi değişmez.

Doğrulama ve saha sınırları ilgili `TEST_RESULTS.md` kaydında; kullanıcı akışı `apps/web/vehicle-3d/docs/KAPORTA-360-SUNUM.md` içindedir.
