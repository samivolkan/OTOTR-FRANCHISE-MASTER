# Kaporta 360: gerçek fotoğraftan ayrılan parçalar

Kullanıcı, genel 3D gövde yerine gerçek araç görsellerindeki parçaların ayrılmasını istedi. Mevcut referans fotoğraflar korunarak, tam kaynak piksel koordinatlarına göre elle hazırlanmış SVG konturları ve etkileşimli fotoğraf katmanları uygulandı. Fotoğraf dosyaları değiştirilmez; aynı görselin maskelenmiş bölgeleri tarayıcıda ayrı katmanlar halinde hareket eder.

Sekiz açı desteklenir: 1, 4, 7, 10, 13, 16, 19 ve 22. Ara açılar 24 fotoğraflık özgün turda kalır; doğrulanmamış konturlar bu karelere interpolasyonla taşınmaz. Tekerlekler çamurluk maskesinden, yan camlar kapı sacından ayrılır. Belirsiz veya görünmeyen alanlara maske uydurulmaz. Boşalan alan nötr konum şemasıdır; iç mekanizma veya parçanın arka yüzü olarak sunulmaz.

Varsayılan sunum fotoğraf katmanlarıdır. Eski genel geometri “3D şema” olarak ayrıca açılabilir. “Birleştir” özgün hizaya döner; “Tek parça” görünür fotoğraf kesitini büyütür. Sekiz açı düğmesi, ayrılma mesafesi, saydam bağlam ve bulgu turu uzman notu/fotoğraf paneline bağlanır. Azaltılmış hareket tercihinde animasyon ve otomatik açı değişimi bastırılır.

Konturlar yalnız bilinen demo kimliği, kare kimliği, kaynak URL'si ve temsili kaynak işaretiyle eşleşirse kullanılır. `fromApprovedReport` müşteri verisini daima onaylı türde döndürür; müşteri arabasının kasa tipi veya aynı fotoğraf sırası referans konturlarının kullanılmasına yetmez. Gerçek rapor, kendisine ait onaylı fotoğraflarla açılır. Mevcut serviste araca özel kontur/onay alanı olmadığı için bu özellik gerçek müşteri raporunda kapalıdır; 24 fotoğraf ve 3D şema kullanılabilir. Yeni kontur veri modeli veya sunucu izni eklenmedi.

Kaynaklar `src/photo-masks-{left,right,ends}.js`, `src/photo-mask-domain.js` ve `src/photographic-car.js`. Fotoğraf SHA-256 manifesti değiştirilmedi. Kaynak lisansı ve temsili bulgu uyarıları korunur. Geri dönüş sunum girişini önceki derlenmiş sürüme almakla sınırlıdır; hiçbir ekspertiz kaydı yazılmadı/değiştirilmedi.
