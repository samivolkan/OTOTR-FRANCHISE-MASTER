# Finans Kural İstisnası ve Öncelik Politikası

Bu politika, franchise bedel kurallarına tanımlanan istisnaların sunucu tarafında nasıl seçileceğini ve hesaplama bağlamına nasıl uygulanacağını belirler. Tarayıcı veya ERP istemcisi kazanan istisnayı seçemez.

## Seçim sırası

1. Yalnız `ACTIVE` durumundaki ve işlem tarihinde geçerli istisnalar değerlendirilir.
2. En yüksek `priority` kazanır.
3. Öncelik eşitse kapsam özgüllüğü kullanılır: `BRANCH > DEALER > CONTRACT > LEGAL_ENTITY > GLOBAL`.
4. Koşul özgüllüğü aynı kapsam içinde `SOURCE_ATTRIBUTE > CONTRACT_AGE > DATE_RANGE` sırasındadır.
5. Öncelik ve özgüllük puanı eşit birden fazla kazanan varsa hesaplama durdurulur; kayıt sırası veya UUID ile sessiz seçim yapılmaz.

## Desteklenen koşullar

- `DATE_RANGE`: tablo üzerindeki `effective_from` / `effective_to` tarihleri uygulanır.
- `CONTRACT_AGE`: `minDays` ve/veya `maxDays` ile sözleşme sürümünün başlangıcından itibaren gün sayısı denetlenir.
- `SOURCE_ATTRIBUTE`: yalnız tek seviyeli, güvenli alan adı ve skaler `equals` karşılaştırması kabul edilir.

`USAGE_VOLUME` gibi henüz atomik sayaç ve snapshot gerektiren koşullar desteklenmiş gibi davranılmaz; işlem `feature_not_supported` ile kapalı kalır.

## Desteklenen sonuçlar

- `RATE_OVERRIDE`: hesaplama yöntemini yüzdeye ve oranı onaylı istisna değerine çevirir.
- `FIXED_AMOUNT_OVERRIDE`: hesaplama yöntemini sabit tutara çevirir.
- `EXEMPT`: tutarı sıfırlar.
- `LIMIT_OVERRIDE`: minimum ve/veya maksimum sınırı değiştirir; minimum maksimumu aşamaz.

Kazanan kaydın kimliği, kodu, sürümü, önceliği ve özgüllük puanı hesaplama snapshotına eklenir. Ham kapsam, koşul ve override tanımları kullanıcı arayüzüne açılmaz.

## Güvenlik ve denetim ilkeleri

- Geçersiz UUID, sayı veya tanım reddedilir.
- Desteklenmeyen kapsam, koşul ve override türleri reddedilir.
- Hesaplama bağlamı ve kazanan istisna calculation snapshot ile saklanır.
- Canlı ve shadow çalıştırma aynı deterministik çözümleyiciyi kullanır.
- Kural veya istisna değişikliği maker-checker süreci tamamlanmadan `ACTIVE` olamaz.
