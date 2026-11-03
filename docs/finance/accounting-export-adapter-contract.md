# Muhasebe Export Sağlayıcı Sözleşmesi

Worker yalnızca `EXPORT_QUEUED` durumundaki, hedef adaptör kodu eşleşen muhasebe paketini service-role projectionından alır. Paket; hesap kodu, şube/bayi kapsamı, borç/alacak tutarları ve hash içerir; ham müşteri verisi içermez.

- Sağlayıcı hedefi yalnızca ortam ayarından gelir ve HTTPS olmak zorundadır.
- Kimlik bilgisi olay gövdesinden alınmaz veya loglanmaz.
- `batchId + contentHash` sağlayıcı idempotency anahtarıdır.
- Sağlayıcı yanıtı aynı `contentHash` değerini döndürmek zorundadır.
- Sonuç `ACCEPTED`, `PARTIALLY_ACCEPTED` veya `REJECTED` olabilir; paket bazlı sonuçlar veritabanında tekrar doğrulanır.
- Timeout veya geçici hata finansal durumu ilerletmez. Aynı idempotency anahtarıyla güvenli tekrar yapılır.

Staging kabulü; gerçek test endpoint'i, kimlik bilgisi rotasyonu, başarılı/kısmi/red yanıtları, timeout, duplicate, hash uyuşmazlığı ve geri bildirim imzasını kapsar.
