# Müşteri Cirosu Adaptör Sözleşmesi

Bu adaptör, her şubenin kendi muhasebe/ERP sisteminden yalnızca günlük toplamları GM Finans'a taşır. Müşteri, fatura veya tahsilat satırı gönderilmez ve saklanmaz.

## Kanonik olay

Zorunlu alanlar: `actorId`, `legalEntityId`, `dealerAccountId`, `branchId`, `sourceSystem`, `sourceMessageId`, `asOf`, `currencyCode`, `collectedGrossAmount`, `refundedGrossAmount`, `sourceRecordCount`, `payloadHash`, `adapterContractVersion`.

- Tutarlar KDV dahil brüt tahsilat ve iade toplamlarıdır.
- Net müşteri cirosu `collectedGrossAmount - refundedGrossAmount` olarak sunucuda hesaplanır.
- Aynı `sourceSystem + sourceMessageId + payloadHash` tekrarı `REPLAY`; farklı hash `CONFLICT` üretir.
- Worker sadece service-role kimliğiyle çalışır. Tarayıcı veya bayi kullanıcısı bu RPC'yi çağıramaz.
- Ham müşteri kaydı, belge içeriği veya kişisel veri kabul edilmez.

## Operasyonel katkı

`net müşteri cirosu - GM brüt tahakkukları` formülüyle, aynı şube/tarih/para biriminde hesaplanır. Bu değer maliyet, vergi, personel, amortisman ve diğer muhasebe kalemlerini içermediği için **muhasebe kârı değildir**. Eşleşen snapshot yoksa sistem tahmin yapmaz ve `SOURCE_NOT_CONNECTED` döner.

## Canlıya geçiş kapısı

Her bayi yazılımı bu kanonik olaya ayrı bir eşleme ile bağlanabilir. Staging ortamında imzalı sentetik olay, tekrar, çakışma, gün sonu toplamı ve iade senaryoları doğrulanmadan canlı veri kabulü açılmaz.
