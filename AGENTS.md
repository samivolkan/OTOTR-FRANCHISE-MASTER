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


## AI Automation / Codex Issue Runner

Bu repo ChatGPT + GitHub Issues + Codex kontrollu otomasyon akisini kullanir.

### Uygulama sinirlari

- ChatGPT karar/analiz uretir; GitHub Issue is takibi icin kullanilir; Codex sadece issue kapsamina gore kod degisikligi yapar.
- Otomatik merge, otomatik production deploy veya destructive migration yapilmaz.
- Codex gorevleri kucuk PR'lar halinde kalmalidir.
- Codex her gorev sonunda degisen dosyalari, test sonucunu, riskleri ve etkilenen ekran/route'lari raporlamalidir.

### OTOTR is kurallari

1. Sekreterya is emirlerini bayi/dealer portalinda acar; usta mobil akisi musteri karsilama ile baslamaz.
2. Usta kendisine dusen is emirlerini gorur, ise baslama kaniti verir, sonra tekil is basliklarini sahiplenir.
3. Bir is basligini ayni anda sadece bir usta duzenleyebilir; digerleri sadece goruntuler.
4. `Görevi devret` akisi korunur.
5. Mudur zorla devralma veya yeniden atama yapabilir.
6. Teknik onay ve rapor onay akislari bypass edilmez.
7. Yerlesmis stabil UI kararlarini, issue acikca istemedikce bastan yazma.
8. Navigasyon standardi: `Görevler / İşlerim`, ortada Home-Tara aksiyonu, `Eksikler / Profil`.
9. Turkce UI metinlerini Ingilizceye cevirme.
10. ERP/CRM/web dosyalarina issue kapsaminda degilse dokunma.

### Otomasyon dosyalari

- `docs/AI_PROJECT_MEMORY.md`: ChatGPT/Codex ortak proje hafizasi.
- `docs/AI_INBOX.md`: ChatGPT kararlarinin issue'a donusmeden once toplandigi alan.
- `docs/ROADMAP_1000.md`: 1000 kalemlik yol haritasi takip modeli.
- `scripts/ototr-orchestrator.mjs`: AI Inbox notlarini GitHub Issue taslaklarina boler.
- `.github/workflows/codex-issue-task.yml`: `/codex-run` yorumuyla Codex uygulama akisini baslatir.
- `.github/workflows/codex-pr-review.yml`: PR acilinca Codex kalite kontrol yorumu uretir.
