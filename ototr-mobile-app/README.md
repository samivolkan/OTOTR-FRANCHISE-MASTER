# OTOTR Usta Mobil Uygulamasi

Faz 1 hedefi, yeni `ototr-mobile-app` klasorunde temiz ve bagimsiz bir mobil altyapi kurmaktir.

## Teknoloji Karari

- Stack: vanilla PWA, Capacitor-ready config.
- Gerekce: aktif repo icinde mevcut Capacitor altyapisi bulunmadi; mevcut Flutter/Expo mobil klasorleri bu Faz icin hedef disi ve referans-only kabul edildi.
- Bu Fazda dependency eklenmedi. `capacitor.config.json` ileride Android hedefi eklenirken kullanilacak.

## Faz 1 Kapsami

- Light-only design token sistemi.
- App shell ve safe-area uyumlu mobil layout.
- Reusable component iskeleti.
- Mock data ve is kurali kaynak dosyalari.
- Alt navigasyon: Ana Sayfa, Islerim, Tara, Bildirimler, Profil.
- Ortada yukseltilmis kirmizi Tara butonu.

## Calistirma

```powershell
cd ototr-mobile-app
npm.cmd run validate
npm.cmd run start
```

Local preview:

```text
http://127.0.0.1:5178
```

## Kapsam Disi

- Backend/API entegrasyonu.
- Canli Supabase, odeme, SMS veya WhatsApp baglantisi.
- Google/Apple login.
- Kayit ol akisi.
- Koyu tema.
- Faz 2 ekran uygulamalari.
