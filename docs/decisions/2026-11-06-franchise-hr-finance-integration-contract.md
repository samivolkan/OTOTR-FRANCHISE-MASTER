# Franchise–İK–Finans entegrasyon sözleşmesi

Tarih: 2026-11-06
Durum: Yerel sentetik sözleşme kabulü geçti; canlı Franchise runtime ve staging kabulü açık gate

## Karar

Franchise, İK ve Finans aynı kanonik `branchId` kimliğini kullanır. Ortak kimlik ayrıca `branchCode`, `dealerAccountId`, bayi tüzel kişisi, GM tüzel kişisi ve İK `employerCode` alanlarını taşır. Modüller kendi kayıtlarını bu kimliğe bağlar; birbirlerinin tablolarına doğrudan yazmaz.

`branch.opening.ready` yalnız başvuru, finansal yeterlilik, lokasyon ve sözleşme kapıları açık olduğunda üretilebilir. Franchise adaptörü bu olayı:

1. mevcut İK RPC/veri sınırına uygun, sentetik ve ayrı `BRANCH` organizasyonu provisioning isteğine;
2. mevcut Finans `branch.opened`/ENTRY_FRANCHISE ingestion sınırına dönüştürür.

Mevcut `hr.*` tabloları, `finance-read`, `finance-command`, `finance_api.authorize_scope`, sözleşme, tahakkuk, ödeme, mutabakat, export ve audit yapıları yeniden yazılmaz.

## Kimlik ve kapsam kuralları

- `branchId` bütün modüllerde aynı UUID olmalıdır; adaptör kapsam uyuşmazlığında fail-closed davranır.
- Şube kadrosu merkez organizasyon ağacına eklenmez. İK isteği `organizationScope=BRANCH` ve `parentCentralDepartmentId=null` taşır.
- Bursa Osmangazi kadrosu yalnız sentetiktir: şube sahibi, şube müdürü, iki kaporta elemanı ve sekreter.
- Ürün rolleri mevcut DB rollerine geçici olarak eşlenir; bu eşleme yeni RLS yetkisi oluşturmaz.
- `PRIVACY_POLICY_APPROVED=EXCLUDED_BY_SCOPE` ve `PRODUCTION_APPROVED=BLOCKED` değişmeden kalır.

## İdempotency, correlation ve audit

- Kaynak `eventId` değişmez ve iki adaptörde tekrar anahtarıdır.
- İK anahtarı `franchise-hr:{eventId}`, Finans kaynak olayı aynı `eventId` ile teslim edilir.
- Finans veritabanındaki şube başına tek özgün ENTRY_FRANCHISE kısıtı ikinci tahakkuku engelleyen son savunma hattıdır.
- Tek `correlationId` Franchise, İK, Finans ve ortak güvenli audit kayıtlarında korunur.
- Audit bağlamı kişi/ödeme/bordro verisi içermez; yalnız şube kodu, sentetik bayrağı, kadro sayısı, bedel ailesi ve sonuç tutulur.

## Entegrasyon kapıları

| Gate | Durum | Açılması için gereken |
|---|---|---|
| Franchise runtime event producer | `CONTRACT_ONLY` | Aktif Franchise çalışmasının `branch.opening.ready` olayını bu sözleşmeyle üretmesi |
| Franchise ana veri eşlemesi | `BLOCKED` | Yetkili branch/dealer/legal-entity kaynaklarının staging eşlemesi |
| İK staging provisioning | `BLOCKED` | Migration-history uzlaştırması, Auth/RLS ve ayrı demo hesap kabulü |
| Finans staging delivery | `BLOCKED` | Kesim tarihi, gerçek ERP server handler, UAT-FIN-05 ve yetkili onaylar |
| KVKK / gerçek personel | `EXCLUDED_BY_SCOPE` | Ayrı hukuk/KVKK kararı ve reviewed migration |
| Üretim | `NO_GO` | İK ve Finans readiness gate'lerinin imzalı staging kanıtları |

Franchise kodu tamamlanmış varsayılmaz. Bu dosyadaki portlar aktif çalışma hazır olduğunda bağlanacak sınırdır; adapter testi canlı entegrasyon kanıtı değildir.

## Kabul

```powershell
npm run test:franchise-hr-finance
npm run test:franchise-branch-opening
```

İlk komut ortak kimlik, kapsam reddi, İstanbul kesim tarihi, merkez ağacı snapshot'ı, sentetik beşli kadro, aynı `branchId`, tek ENTRY_FRANCHISE ve ortak correlation/audit davranışını doğrular.

## Geri alma

Bu kararın yeni ortak paket/adaptör/test dosyaları ve `package.json` scriptleri revert edilir. Mevcut İK migration'ı, GM İK ağacı ve Finans migration zinciri değiştirilmediği için veri geri alma işlemi yoktur.
