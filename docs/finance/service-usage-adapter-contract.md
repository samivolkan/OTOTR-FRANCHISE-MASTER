# Sorgu ve Harici Hizmet Olay Sözleşmesi

Adaptör `query.completed` ve `external-service.delivered` olaylarını şube kapsamında kabul eder. Kanonik payload yalnızca hizmet kodu, sağlayıcı kodu, dış referans, sağlayıcı maliyeti, para birimi, ücretsiz hak ve teknik tekrar işaretlerini içerir.

- Müşteri veya araç verisi kabul edilmez.
- Worker service-role ile çalışır; entegrasyon aktörü ve şube yetkisi sunucuda doğrulanır.
- `sourceSystem + eventId` aynı hash ile `REPLAY`, farklı hash ile `CONFLICT` üretir.
- Ücretsiz hak ve teknik tekrar bilgisi kaynak gerçeği olarak saklanır; fiyat/tahakkuk sonucu kaynak tarafından gönderilemez.
- Dönem kilitliyse olay reddedilir. Hesaplama ve KDV, yayınlanmış sözleşme kuralı tarafından ayrı aşamada yapılır.

Staging kabulünde ücretli sorgu, ücretsiz hak, teknik tekrar, başarısız hizmet, duplicate, conflict ve yanlış şube senaryoları imzalanır.
