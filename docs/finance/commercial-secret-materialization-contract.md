# Ticari secret materializasyon sözleşmesi

`finance-commercial-secret-config.mjs`, kullanıcı tarafından kararlaştırılan sorgu tutarlarını ve genel merkez masrafı hizmet oranını yalnız sunucu tarafındaki secret sağlayıcıdan okur. Tarayıcı, public projeksiyon, log ve hata metni ticari değeri alamaz.

| Kural | Secret adı | Motor yöntemi |
|---|---|---|
| TRAMER sorgusu | `FINANCE_QUERY_TRAMER_TRY_AMOUNT` | `FIXED` |
| KM sorgusu | `FINANCE_QUERY_KM_TRY_AMOUNT` | `FIXED` |
| TRAMER 360 sorgusu | `FINANCE_QUERY_TRAMER_360_TRY_AMOUNT` | `FIXED` |
| Genel merkez masrafı hizmet oranı | `FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT` | `COST_PLUS` |

Oran secret'ı yüzde biçimindedir; materializasyon katmanı hesaplama motorunun kesirli oranına dönüştürür. Tutarlar pozitif, hizmet oranı `0 < oran < 100` olmak zorundadır. Eksik, geçersiz ve bilinmeyen hizmet kodu fail-closed reddedilir.

Bu katman vergi kodu belirlemez. Hesaplama kuralının yayımlanması için onaylı vergi kodu sürümü, yürürlük tarihi, vade, maker-checker ve kanıt belgesi ayrıca zorunludur. Yerel testteki %20 oran yalnız kullanıcı kararının sentetik hesap doğrulamasıdır; mali müşavir onayı yerine geçmez.
