# AGENTS.md

Bu klasor OTOTR Franchise Sistemi icin yeni ana kaynak alandir.

## Oturum Baslangici

Her yeni Codex calismasinda once su dosyalari oku:

1. `PROJECT_MEMORY.md`
2. `OTOTR_PROJECT_AUDIT.md`
3. `OTOTR_MIGRATION_PLAN.md`
4. `AGENTS.md`
5. Ilgili konu dosyasi: `docs/architecture.md`, `docs/database.md`, `docs/auth-and-roles.md`, `docs/testing.md` veya `docs/CHATGPT_WORKFLOW.md`

## Ana Kural

Bu proje icin tek dogru kaynak:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

Eski klasorler sadece referans/arsivdir. Eski klasorlerde dosya silme, tasima veya uzerine yazma yapma.

## Guvenlik

- Gercek `.env` degerlerini, API key, token, database sifresi veya service role key'i ciktiya yazma.
- Mobil uygulamalara kesinlikle Supabase `service_role` koyma.
- Production database uzerinde destructive islem yapma.
- `drop database`, `drop table`, `truncate`, destructive migration veya toplu silme yapma.
- `manual-only` migration dosyalarini otomatik production zincirine alma.
- Riskli islemde kullanici onayi al.

## Calisma Duzeni

- Yeni gelistirme `OTOTR-FRANCHISE-MASTER` altinda yapilacak.
- Import edilen kaynaklar icin `IMPORT_MANIFEST.md` takip edilecek.
- Islem ve test sonucu `MIGRATION_LOG.md` ve `TEST_RESULTS.md` icine yazilacak.
- Database calismasi `packages/database` altinda reviewed migration zincirine donusturulmeden calistirilmayacak.
- Web, mobil, admin, franchise-panel, API, database ve auth ayrimini koru.
- Kod degistirmeden once etkilenen alanlari ve geri alma yolunu netlestir.
- Kalici kararlar PROJECT_MEMORY.md veya `docs/decisions` icin ozetlenmeli.
- Her tasima/import/refactor icin MIGRATION_LOG.md guncellenmeli.

## ChatGPT / Codex Prensibi

Tek proje, coklu konu sohbeti, tek ana hafiza, tek ana klasor, tek ana database karari.

Konu bazli sohbet duzeni `docs/CHATGPT_WORKFLOW.md` icindedir.

## Test Komutlari

Flutter yol karakteri nedeniyle kisa junction kullan:

```powershell
cd C:\ototr_master\apps\mobile-branch
flutter analyze
flutter test
```

Expo technician:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER\apps\mobile-technician
npm.cmd run typecheck
```

Admin prototype:

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER\apps\admin\prototype
node tools\test-demo-data.mjs
node tools\test-vin-service.mjs
node tools\test-index.mjs
```
