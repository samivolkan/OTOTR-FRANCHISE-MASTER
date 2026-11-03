# 2026-11-03 — GM İK Sistemi güvenli pilot entegrasyonu

## Karar

Kullanıcının sağladığı Claude HTML İK prototipi, OTOTR Genel Merkez ERP’ye bağımsız `gm-ik/` modülü olarak bağlanır. ERP sol menüsünde ayrı **GM İK Sistemi** başlığı ve **İK Yönetim Merkezi** bağlantısı bulunur.

## Sınır

- Yayın, iş akışı ve tasarım değerlendirmesi için güvenli pilottur.
- Gerçek çalışan, aday, maaş, sağlık, disiplin, kimlik veya bordro verisi kullanılmaz.
- Yerel rol seçici ve `localStorage` üretim yetkilendirmesi/veritabanı değildir.
- Mevcut ERP `hr` route’u kaldırılmaz; üretimde iki yüzey aynı kanonik API/veri modeline bağlanır.
- Auth/RLS, private storage, audit, KVKK ve bordro/SGK köprüleri ayrı migration ve staging kabul süreci tamamlanmadan aktif edilmez.
- GitHub Pages iş akışının eklediği ortak ERP oturum kapısı korunur. Pilot CSP'si yalnızca bu kapının mevcut OTOTR Supabase HTTPS/WSS uçlarına izin verir; yeni bir dış servis eklenmez.

## Kanonik kaynak

- Modül: `apps/admin/prototype/gm-ik/index.html`
- ERP menü bağı: `apps/admin/prototype/gm-ik/erp-nav-integration.js`
- Analiz: `docs/hr/GM_HR_SYSTEM_ANALYSIS_2026-11-03.md`
- Test: `apps/admin/prototype/tools/test-gm-hr.mjs`

## Yayın

- ERP: `https://samivolkan.github.io/Ototr/index.html#dashboard`
- Pilot: `https://samivolkan.github.io/Ototr/gm-ik/`
- GitHub Pages deposu: `samivolkan/Ototr`, `main`.

## Geri dönüş

Yayın commit’i revert edilir. Bu işlem ERP menü script etiketini ve `gm-ik/` yayın dosyalarını kaldırır; kanonik geliştirme kaynağı korunur.
