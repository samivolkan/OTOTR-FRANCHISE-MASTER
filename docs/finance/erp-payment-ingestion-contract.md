# ERP Ödeme Alım Sözleşmesi

Bu worker, bayinin GM'ye yaptığı ödeme bildirimini farklı ERP/muhasebe programlarından tek kanonik olaya dönüştürür. Kayıt doğrudan muhasebeleşmez; `PENDING_VERIFICATION` durumunda oluşur ve bağımsız GM Finans checker'ı banka kanıtıyla doğrulamadan bakiyeyi etkilemez.

Zorunlu alanlar: `actorId`, `legalEntityId`, `dealerAccountId`, `branchId`, `sourceSystem`, `sourceMessageId`, `paymentDate`, `valueDate`, `amount`, `currencyCode`, `paymentMethodCode`, `externalReference`. `bankTransactionReference` boş olabilir.

- Worker sadece service-role kimliğiyle çalışır.
- Şube kapsamı ve entegrasyon aktörü sunucuda tekrar doğrulanır.
- Idempotency anahtarı `sourceSystem + sourceMessageId` üzerinden deterministiktir.
- Aynı olay tekrarı yeni ödeme oluşturmaz; değiştirilmiş tekrar çakışma olarak reddedilir.
- Müşteri, fatura satırı, kart/PAN veya banka sırrı kabul edilmez.
- ERP olayı belge yüklemez. Kanıt, ayrı kontrollü storage akışından kaydedilir.

Staging kabulünde her sağlayıcı için başarılı olay, tekrar, değiştirilmiş tekrar, yanlış şube ve timeout/retry senaryoları çalıştırılır. GM Finans checker imzası olmadan FIN-G05 geçmez.
