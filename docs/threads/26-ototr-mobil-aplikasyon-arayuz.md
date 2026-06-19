# 26 - OTOTR Mobil Aplikasyon Arayüz

Bu başlık, OTOTR mobil uygulamasının sıfırdan yeniden tasarlanması ve çalışır APK olarak teslim edilmesi için ayrılmıştır.

## Çalışma Alanı

Ana proje:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

Yeni uygulama hedef klasörü:

`apps/mobile-ototr-pro`

Eski mobil uygulama kaynak arşivi:

`archive/mobile-legacy-2026-06-05`

## Kapsam

- Chat içinde hazırlanacak nihai OTOTR mobil arayüz tasarımını uygulamaya dönüştür.
- Eski Otorapor benzeri akışlardan gerekli iş mantığını al, ama eski mobil uygulamanın UI yapısını ana kaynak kabul etme.
- Usta/teknisyen iş akışını baştan kur:
  - giriş ve oturum
  - şube / görev listesi
  - iş emri detayı
  - modül listesi
  - test/madde girişi
  - fotoğraf ve kanıt
  - eksik/uyarı yönetimi
  - final kontrol
  - rapor onaya gönderme
- APK üret.
- Android emülatörde dokunulabilir tüm ana alanları test et.
- Test sonucunda APK yolunu, çalıştırılan komutları ve kalan riskleri raporla.

## Kurallar

- Eski mobil uygulama klasörleri referans/geri dönüş kaynağıdır; yeni UI işi için aktif geliştirme hedefi değildir.
- Arşivdeki dosyaları silme veya değiştirme.
- Gizli veri, token, API key veya canlı müşteri verisi yazdırma.
- Canlı servis, ödeme, SMS, WhatsApp veya production deploy işlemi yapmadan önce açık uyarı ver.
- Önce mevcut dokümanları oku, sonra kontrollü ilerle.
- APK teslim edilmeden önce en az şu kontroller yapılmalı:
  - `flutter analyze` veya seçilen teknolojiye denk statik kontrol
  - ilgili widget/flow testleri
  - Android build
  - emülatör install/launch smoke testi

## Başlangıçta Okunacak Dosyalar

- `AGENTS.md`
- `PROJECT_MEMORY.md`
- `OTOTR_PROJECT_AUDIT.md`
- `OTOTR_MIGRATION_PLAN.md`
- `NEXT_PHASES.md`
- `TEST_RESULTS.md`
- `docs/mobile-import-plan.md`
- `docs/mobile-final-design-proposal.md`
- `docs/mobile-otorapor-reference-blend.md`
- `archive/mobile-legacy-2026-06-05/ARCHIVE_MANIFEST.md`

## Yeni Codex Sohbeti İçin Başlangıç Promptu

OTOTR Mobil Aplikasyon Arayüz çalışmasıdır.

Çalışma alanı:
`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

Önce yukarıdaki başlangıç dosyalarını oku. Eski mobil uygulama kaynakları `archive/mobile-legacy-2026-06-05` altında arşivlenmiştir; bunları yalnızca referans olarak kullan. Yeni uygulamayı `apps/mobile-ototr-pro` altında sıfırdan geliştir.

Hedef: Chat içinde verilecek nihai OTOTR mobil arayüz tasarımını tamamlayıp çalışan APK üretmek, emülatörde ana kullanıcı akışlarını dokunarak test etmek ve APK yolunu teslim etmek.
