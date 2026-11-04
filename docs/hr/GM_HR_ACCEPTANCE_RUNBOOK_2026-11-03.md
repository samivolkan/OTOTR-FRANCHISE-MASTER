# GM İK kabul, staging ve geri alma runbook'u

Tarih: 2026-11-03
Kapsam: `20261103003922_gm_hr_production_foundation.sql`
Durum: Kod ve sentetik kabul tamamlandı; staging/production migration uygulanmadı.

## Değişmez güvenlik sınırı

- 2. madde kapsam dışıdır; `PRIVACY_POLICY_APPROVED` yalnız daha sonra incelenecek ayrı bir migration ile değişebilir.
- `PRODUCTION_APPROVED` blokajı kaldırılamaz.
- Gerçek aday/çalışan, maaş, kimlik, sağlık veya disiplin verisi kullanılmaz.
- İstemci yalnız `sb_publishable_` anahtar kullanır; service-role anahtarı istemciye konmaz.
- Bu paket ödeme/bordro hesaplama veya SGK resmi işlemi yapmaz.

## Yerel kabul

```powershell
npm ci
npm run test:gm-hr
git diff --check
```

Beklenen özet:

- 28 HR tablosu ve 28 RLS,
- 0 doğrudan `authenticated` HR tablo grant'i,
- 31 incelenmiş authenticated RPC (tarayıcı başlangıç allowlist'i yalnız dört salt-okunur RPC),
- private `gm-hr-private` bucket ve SELECT/INSERT/UPDATE/DELETE politikaları,
- şube dışı erişim, anonim RPC, öz-onay ve gerçek kişi yazımı reddi,
- iki bağımsız mutabakatlı gölge dönem,
- hash zincirli ve değiştirilemez audit,
- sentetik dump/load geri yükleme,
- privacy `EXCLUDED_BY_SCOPE`, production `BLOCKED`.

## Staging ön koşulları

1. Staging projesi production değildir ve yalnız sentetik veri içerir.
2. Staging migration geçmişi kaynak zinciriyle uzlaştırılmıştır; beklenmeyen remote-only/local-only kayıt yoktur.
3. Staging'in güncel yedeği ve geri yükleme hedefi doğrulanmıştır.
4. Altı ayrı staging Auth hesabı hazırdır: GM, İK uzmanı, şube İK, bordro, denetçi ve çalışan.
5. Auth kullanıcıları `public.app_users.auth_user_id` ile eşlenmiştir.
6. Uygulama runtime config'i yalnız staging URL ve publishable key içerir.

## Staging uygulama sırası

Komutlar yalnız incelenmiş staging bağlantısında çalıştırılır:

```powershell
npx supabase@3.0.0 migration list --linked
npx supabase@3.0.0 db push --dry-run --linked
npx supabase@3.0.0 db push --linked
```

Dry-run yalnız beklenen GM İK migration'ını göstermiyorsa işlem durdurulur. Production bağlantısında bu komutlar çalıştırılmaz.

Uygulama sonrası:

1. `hr_acceptance_snapshot()` HQ test oturumuyla çağrılır.
2. Auth/RLS matrisi iki şube ve çalışan self-servis oturumlarıyla yeniden çalıştırılır.
3. Private Storage upload/upsert için INSERT + SELECT + UPDATE politikaları sınanır.
4. Sentetik işe giriş/çıkış, izin, puantaj, görevlendirme ve iki gölge bordro dönemi tamamlanır.
5. Staging yedeği ayrı restore hedefine geri yüklenir; audit sayısı, iki `RECONCILED` dönem ve bloklu üretim kapısı karşılaştırılır.
6. Supabase security/performance advisor bulguları kaydedilir ve yeni hata bırakılmaz.

Rol matrisi kabul sırası `docs/hr/GM_HR_ROLE_MATRIX_ACCEPTANCE_2026-11-04.md` içindeki altı hesap ve negatif yetki kontrolleriyle birebir uygulanır.

## Yayın davranışı

`gm-ik/hr-live-controller.mjs` yalnız şu salt-okunur RPC'leri çağırır:

- `hr_my_context`
- `hr_dashboard`
- `hr_readiness_snapshot`
- `hr_acceptance_snapshot`

Migration uygulanmamışsa veya kullanıcı yetkisizse arayüz fail-closed mesaj gösterir ve yerel sentetik demoya düşer. Tarayıcıdaki demo veri sunucuya otomatik aktarılmaz.

## Geri alma

Bu migration additive olduğu için veri tablolarını düşüren otomatik down migration yoktur.

1. Önce arayüz yayın commit'i revert edilir veya canlı bağlantı config'i boşaltılır.
2. Acil durumda yeni, incelenmiş bir migration ile `authenticated` rolünden GM İK public RPC execute izinleri geri alınır.
3. Private bucket public yapılmaz; kayıtlar korunur ve erişim kapalı kalır.
4. Hata kanıtı, correlation ID ve audit zinciri export edilir; kişisel veri ticket/log içine kopyalanmaz.
5. Düzeltme yeni ileri migration ile yapılır; uygulanmış migration dosyası değiştirilmez.

## Production için kapanmayan kapılar

Bu teslimle production aktivasyonu istenemez. En az şu kanıtlar ayrıca gerekir:

- 2. maddenin Hukuk/KVKK onayı ve veri sınıflandırma/saklama-imha migration'ı,
- gerçek organizasyon/işveren/şube sahiplerinin yazılı rol matrisi,
- staging Supabase Auth/RLS ve hosted restore kanıtı,
- mali müşavir/bordro sağlayıcısı sözleşmesi ve gerçek olmayan paralel dönem kabulü,
- olay müdahalesi, izleme ve destek sahipleri,
- yönetim go-live kararı.

Bu kapılar tamamlanana kadar gerçek çalışan verisi girilmez ve `PRODUCTION_APPROVED=BLOCKED` kalır.
