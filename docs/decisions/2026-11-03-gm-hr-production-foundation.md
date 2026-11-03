# Karar: GM İK üretim temeli ve gerçek veri kilidi

Tarih: 2026-11-03
Karar: Kabul edildi; production aktivasyonu yapılmadı.

## Bağlam

Claude tarafından hazırlanan tek HTML İK prototipi geniş süreç kapsamına sahipti ancak `localStorage`, kullanıcı tarafından değiştirilebilen rol seçici ve tarayıcı içi filtrelerle çalışıyordu. Kullanıcı, önceki eksik listesindeki 2. madde hariç diğer alanların tamamlanmasını ve kabul testinden sonra push edilmesini istedi.

## Karar

- Kanonik İK verisi private `hr` şemasında tutulur; tablolara Data API üzerinden doğrudan grant verilmez.
- İstemci yalnız incelenmiş public RPC sözleşmelerini kullanır.
- Aktör Supabase Auth ve `app_users.auth_user_id` üzerinden çözülür.
- HR görev rolleri mevcut ERP DB rolünden ayrıdır ve dört-göz onayıyla atanır.
- İşveren/şube kapsamı tarihsel mapping ile korunur.
- Bordro yalnız sentetik gölge ve mutabakat akışıdır; ödeme veya yasal hesap motoru değildir.
- SGK için resmi işlem iddiası üretilmez; doğrulayan kişi ve harici referans hash'i saklanır.
- Audit satırları hash zincirli ve immutable'dır.
- KVKK/veri sınıflandırması kapsam dışı bırakıldığı için gerçek kişi ve hassas belge yazımı veritabanında engellenir; production kapısı blokludur.
- Browser köprüsü yalnız salt-okunur readiness/dashboard RPC'leriyle başlar; yerel demo otomatik import edilmez.

## Kabul kanıtı

`npm run test:gm-hr` sentetik PostgreSQL 17/PGlite ortamında şema, RLS/grant, storage, rol/şube izolasyonu, idempotency, onay ayrılığı, yaşam döngüsü, izin, zaman, zimmet, sertifika, performans, iki gölge bordro dönemi, audit değişmezliği ve dump/load restore senaryolarını çalıştırır.

## Sonuç ve sınırlamalar

Bu karar üretim kod temelini hazırlar fakat canlı veritabanını değiştirmez. Docker/Supabase yerel stack bulunmadığı için kabul PGlite üzerinde yapılmıştır. Staging migration geçmişi uzlaştırılmadan uzak push yapılmaz. 2. madde tamamlanmadan gerçek veri kullanımı, production onayı ve hassas belge akışı teknik olarak kapalı kalır.
