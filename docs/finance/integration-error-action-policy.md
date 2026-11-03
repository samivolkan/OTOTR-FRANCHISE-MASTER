# OTOTR GM Finans — Entegrasyon Hatası Aksiyon Politikası

Politika sürümü: `INTEGRATION_ERROR_ACTION_V1`

Bu politika entegrasyon hata kuyruğundaki atama, retry ve çözüm kararlarını tanımlar. Ham payload, erişim anahtarı veya serbest metin notu finans tablolarına yazılmaz; notun yalnız SHA-256 izi audit kaydında tutulur.

## Yetki ve kapsam

- Aksiyon yalnız ERP kimliği aktif `CEO`, `GENERAL_MANAGER`, `FINANCE` veya kendi eşleşmiş şubesindeki `BRANCH_MANAGER` tarafından başlatılabilir.
- Tarayıcı yalnız yetki sorgusu yapar. Kalıcı mutation, `finance-command` servis rolünden yapılır.
- Tüm komutlarda beklenen sürüm, idempotency anahtarı, intent hash ve correlation ID zorunludur.

## Aksiyon matrisi

| Aksiyon | Geçerli durum | Sonuç | Zorunlu alanlar |
|---|---|---|---|
| Ata | `OPEN`, `RETRY_SCHEDULED` | Durum değişmez; sahip rolü ve politika sürümü kaydedilir | Sahip rolü, neden, not izi |
| Retry | `OPEN` ve `retryable=true` | `RETRY_SCHEDULED`; aynı idempotency sözleşmesiyle outbox işi | Neden, not izi |
| Çöz | `OPEN`, `RETRY_SCHEDULED` | `RESOLVED` | Çözüm kodu, not izi |
| Yok say | Yalnız onaylı maker-checker kararı | `IGNORED_WITH_APPROVAL` | Ayrı onay talebi ve kanıt |

Sahip rolleri: `FINANCE_OPERATIONS`, `ERP_INTEGRATION`, `BRANCH_OPERATIONS`.

Çözüm kodları: `FIXED_EXTERNALLY`, `DATA_CORRECTED`, `SUPERSEDED`, `FALSE_POSITIVE`.

Kaynak outbox kaydı `DEAD_LETTER` durumundaysa yalnız `FIXED_EXTERNALLY` veya `DATA_CORRECTED` ile çözüm verilebilir. `SUPERSEDED` ve `FALSE_POSITIVE` dead-letter olayını sessizce kapatamaz. Yok sayma bu sürümde doğrudan komut değildir; maker-checker akışı tamamlanmadan durum değişmez.

## Audit zorunluluğu

Atama ve çözüm; aktör, kapsam, önceki/yeni sürüm, politika sürümü, neden veya çözüm kodu, not hash'i ve correlation ID ile zincirli audit olayı üretir. Finansal veya entegrasyon kaydı silinmez.
