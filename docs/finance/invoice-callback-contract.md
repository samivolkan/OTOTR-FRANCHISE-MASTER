# Fatura Callback Adaptör Sözleşmesi

Şube kendi muhasebe programında faturayı kestikten sonra sonuç bu server-only worker'a bildirilir. Tarayıcı veya bayi kullanıcısı callback RPC'lerine erişemez.

Kabul edilen durumlar `ISSUED`, `REJECTED`, `CANCELLED` ve `CREDITED` ile sınırlıdır. `ISSUED` için fatura numarası ve tarihi zorunludur. Geçiş kuralları sağlayıcıdan alınmaz; worker mevcut sunucu durumundan `APPLY` veya `STATE_NOOP` kararını kendisi üretir.

- `providerId + externalEventId` tekrarı `DUPLICATE` döner.
- Eski sürüm callback'i `VERSION_CONFLICT` ile reddedilir.
- Yasak durum geçişi HTTP 409 döner.
- Ham müşteri/fatura satırı kabul edilmez; yalnızca dış fatura kimliği, durum, numara, tarih ve güvenli kanıt referansı taşınır.
- Fatura GM tarafından kesilmez; bu adaptör şubenin kendi sistemindeki sonucu GM Finans paketine bağlar.

Staging kabulünde her muhasebe programı için kesildi, reddedildi, iptal/kredi, duplicate, version conflict ve timeout/retry senaryoları imzalanır.
