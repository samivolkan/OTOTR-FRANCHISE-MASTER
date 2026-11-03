# Şube Ödeme Gecikmesi Erişim Sözleşmesi

## Amaç ve sınır

Bu sözleşme, GM tarafından şube adına oluşturulan royalty faturasının vadesinde tam ödenmemesi halinde şube operasyon ekranlarının sunucu tarafında kilitlenmesini tanımlar. Tarayıcıdaki menü gizleme tek başına güvenlik kontrolü değildir. Kokpit veya şubenin kullandığı muhasebe programı karar kaynağı değildir; karar GM Finans kanonik kayıtlarından üretilir.

Royalty kredi bakiyesi nakit ödenmez; yalnız aynı şubenin sonraki uygun royalty borçlarına mahsup edilir.

## Kanonik karar girdileri

- Kapsam: `legal_entity_id + dealer_account_id + branch_id`.
- Borç: `ROYALTY` bedel ailesine bağlı, faturalanmış ve `ISSUED` durumundaki dış fatura satırının açık `DEBIT` kalemi.
- Vade: ilgili açık kalemin `due_date` değeri; kural gereği fatura tarihini izleyen takvim günü.
- Ödenmemiş tutar: `open_amount > 0` ve durum `OPEN` veya `PARTIALLY_ALLOCATED`.
- Tam ödeme: yalnız ödeme kuruluşundan doğrulanmış ödeme kaydı ve bu kaydın açık kaleme yaptığı aktif tahsis sonucunda `open_amount = 0` olması.
- Kart verisi: PAN, CVV, son kullanma tarihi veya ham kart formu GM Finans’ta tutulmaz; yalnız sağlayıcı tokenı ve güvenli işlem referansı işlenir.

## Durum makinesi

```text
OPEN
  └─ vade geçti + açık tutar var ─► LOCKED_OVERDUE

LOCKED_OVERDUE
  ├─ kısmi veya doğrulanmamış ödeme ─► LOCKED_OVERDUE
  └─ doğrulanmış tam ödeme + açık tutar sıfır ─► OPEN
```

Durum şube bazındadır. Bir şubenin borcu başka şubeyi kilitlemez. Aynı şubenin birden fazla gecikmiş faturası varsa tüm engelleyici açık kalemler kapanmadan kilit açılmaz.

## Kilitliyken izin verilen işlemler

Yalnız aşağıdaki yetenekler açık kalır:

- `PAYMENT`: güvenli ödeme sayfası ve sağlayıcı yönlendirmesi,
- `INVOICE_READ`: fatura ve ödeme gerektiren belge görüntüleme,
- `STATEMENT_READ`: şube ekstresi ve borç kaynağı,
- `SUPPORT`: destek talebi,
- `LOGOUT`: güvenli oturum kapatma.

Bunların dışındaki ekspertiz, iş emri, müşteri, rapor üretimi, randevu, stok, personel ve diğer operasyon yazma/okuma yetenekleri kilitliyken sunucuda reddedilir.

## Sunucu entegrasyon sözleşmesi

ERP API Gateway veya ortak yetkilendirme katmanı, korunan her istekte aşağıdaki kanonik kararı çağırmalıdır:

```json
{
  "operationId": "authorizeBranchOperationAccess",
  "scope": {
    "legalEntityId": "uuid",
    "dealerAccountId": "uuid",
    "branchId": "uuid"
  },
  "capability": "WORK_ORDER_WRITE",
  "businessDate": "YYYY-MM-DD",
  "correlationId": "uuid"
}
```

Güvenli yanıt yalnız karar için gerekli alanları taşır:

```json
{
  "allowed": false,
  "accessState": "LOCKED_OVERDUE",
  "reasonCode": "ROYALTY_INVOICE_OVERDUE",
  "paymentRequired": true,
  "blockingInvoiceCount": 1,
  "currency": "TRY",
  "evaluatedAtUtc": "ISO-8601",
  "correlationId": "uuid"
}
```

Ham ödeme sağlayıcı cevabı, kart verisi, müşteri kaydı veya muhasebe payloadı bu yanıtta yer alamaz.

## Fail-closed kuralları

- Kapsam eşleşmiyorsa erişim reddedilir.
- Karar motoru, veritabanı veya ödeme sağlayıcı doğrulaması ulaşılamıyorsa korunan operasyon reddedilir.
- Durum kaydı güncel iş günü için değerlendirilmemişse korunan operasyon reddedilir.
- İstemcinin `ödendi`, `başarılı` veya benzeri beyanı kilit açmaz.
- Kısmi ödeme kilit açmaz.
- Callback tekrarları idempotent olmalı; aynı sağlayıcı olay kimliği ikinci finansal hareket oluşturmamalıdır.
- Geri tarihli veya farklı şubeye ait ödeme kilit açamaz.

## Audit ve olaylar

Her durum değişimi aşağıdaki değişmez izleri üretir:

- `BRANCH_OPERATIONS_LOCKED_OVERDUE`,
- `BRANCH_OPERATIONS_UNLOCKED_PAYMENT_VERIFIED`.

Audit kaydında şube kapsamı, karar nedeni, engelleyici fatura sayısı, önceki/yeni durum, ödeme sağlayıcı güvenli referansı veya hash’i ve correlation ID bulunur. Ham kart ya da kişisel müşteri verisi bulunmaz.

## Kabul kriterleri

1. Vade gününde gün sonuna kadar açık tutar varsa politika tarafından belirlenen anda kilit oluşur.
2. Kilitli şubede sıradan operasyon isteği `403 BRANCH_FINANCE_LOCKED` ile reddedilir.
3. `PAYMENT`, `INVOICE_READ`, `STATEMENT_READ`, `SUPPORT` ve `LOGOUT` çalışmaya devam eder.
4. Kısmi ödeme sonrası kilit devam eder.
5. Doğrulanmamış veya imzası geçersiz callback hiçbir durumu değiştirmez.
6. Doğrulanmış tam ödeme ve tam tahsis sonrası kilit otomatik açılır.
7. Callback tekrarı yeni ödeme, tahsis, audit veya kilit açma kaydı üretmez.
8. Şube A borcu Şube B erişimini etkilemez.
9. Yetkili kullanıcı dahi doğrudan kilit durumunu elle değiştiremez.
10. ERP API Gateway entegrasyonu kaldırılır veya karar servisi ulaşılamaz hale gelirse korunan operasyonlar fail-closed kalır.

## Pre-production kanıtı

Bu sözleşme tek başına UAT geçiş kanıtı değildir. `UAT-FIN-16` ancak sunucu karar motoru, ödeme callback adaptörü, ERP ortak yetkilendirme entegrasyonu, çapraz şube red testi ve Bilgi Güvenliği imzası birlikte tamamlandığında `AUTOMATED_LOCAL_VERIFIED` ve sonrasında staging onaylı seviyeye çıkarılabilir.
