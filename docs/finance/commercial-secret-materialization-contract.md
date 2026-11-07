# Ticari secret materializasyon sözleşmesi

`finance-commercial-secret-config.mjs`, kullanıcı tarafından kararlaştırılan varsayılan royalty oranını, sorgu tutarlarını ve genel merkez masrafı hizmet oranını yalnız sunucu tarafındaki secret sağlayıcıdan okur. Tarayıcı, public projeksiyon, log ve hata metni ticari değeri alamaz.

| Kural | Secret adı | Motor yöntemi |
|---|---|---|
| Varsayılan royalty oranı | `FINANCE_ROYALTY_DEFAULT_RATE_PERCENT` | `PERCENTAGE` |
| TRAMER sorgusu | `FINANCE_QUERY_TRAMER_TRY_AMOUNT` | `FIXED` |
| KM sorgusu | `FINANCE_QUERY_KM_TRY_AMOUNT` | `FIXED` |
| TRAMER 360 sorgusu | `FINANCE_QUERY_TRAMER_360_TRY_AMOUNT` | `FIXED` |
| Genel merkez masrafı hizmet oranı | `FINANCE_PASS_THROUGH_MARKUP_RATE_PERCENT` | `COST_PLUS` |

Oran secret'ları yüzde biçimindedir; materializasyon katmanı hesaplama motorunun kesirli oranına dönüştürür. Tutarlar pozitif, oranlar `0 < oran < 100` olmak zorundadır. Eksik, geçersiz ve bilinmeyen hizmet kodu fail-closed reddedilir. Şube bazındaki onaylı farklı oranlar sözleşme kuralı/istisna yaşam döngüsünde tutulur; varsayılan secret bu kayıtların yerine geçmez.

ERP tarayıcısı `materializeCommercialFeeRule` komutunda yalnız `SERVER_COMMERCIAL_CONFIG` kaynağını, kural ailesini ve onaylı hizmet kodunu gönderir. Tutar ve oran istemciden kabul edilmez. `finance-command`, mevcut `finance.fee-rules.update` yetkisini doğruladıktan sonra kuralı sunucuda materyalize eder ve aynı service-role-only kayıt, idempotency, optimistic concurrency ve maker-checker yaşam döngüsünü kullanır. Resolver veya secret yapılandırması kullanılamazsa komut `COMMERCIAL_CONFIG_UNAVAILABLE` ile 503 döner; hata cevabı secret değerini içermez.

Bu katman vergi kodu belirlemez. Hesaplama kuralının yayımlanması için onaylı vergi kodu sürümü, yürürlük tarihi, vade, maker-checker ve kanıt belgesi ayrıca zorunludur. Yerel testteki %20 oran yalnız kullanıcı kararının sentetik hesap doğrulamasıdır; mali müşavir onayı yerine geçmez.

Staging kurulumu `scripts/Set-FinanceCommercialSecrets.ps1` ile yapılır. Araç beş değeri yalnız process environment değişkenlerinden alır, geçici env dosyasını `finally` bloğunda siler, Supabase CLI v3 için hedefi açıkça `--remote=<project-ref>` olarak belirtir ve çıktı/kanıtta yalnız Secret adlarını tutar. `-ValidateOnly` uzaktaki projeyi değiştirmeden sözleşmeyi doğrular. Hosted uygulama için en dar kapsamlı token üzerinde `edge_functions_secrets_write`, envanter doğrulaması için `edge_functions_secrets_read` yetkileri gerekir.
