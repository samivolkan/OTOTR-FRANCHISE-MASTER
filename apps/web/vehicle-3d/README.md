# OTOTR VISION — 3D ekspertiz örnek projesi

6 Eylül 2026 · Fotoğraf prototipleri ve ERP’ye bağlı kullanım pilotu

**Personel pilotu:** [Kaporta 360 — iş emirleri](https://samivolkan.github.io/Ototr/kaporta-360/pilot.html). ERP menüsünde **Ekspertiz & Rapor → Kaporta 360**. Mevcut Supabase Auth hesabı ve atanmış kaporta göreviyle çalışır. 24 çevre + 4 üst açı, özel asıl fotoğraf deposu, parça/kanıt/ölçüm kayıtları, teknik inceleme ve nihai ERP onayıyla açılabilen süreli müşteri bağlantısı içerir. Bağlı proje `ototr-staging`; saha kabulü tamamlanmış üretim sürümü değildir. [Pilot kullanım ve sınırlar](docs/KAPORTA-360-KULLANIM.md).

**Örnek tasarım:** [24 gerçek fotoğraflı demo](https://samivolkan.github.io/Ototr/kaporta-360/). Bu ayrı girişte veriler kurgusaldır ve ERP kayıtlarına yazılmaz. Aşağıdaki eski 3D/yerel demo açıklamaları bu örneklere aittir; personel pilotunun güvenlik ve asıl fotoğraf davranışı farklıdır. Yayın için `npm.cmd run build:erp`; `dist-erp/` ERP kökünün `kaporta-360/` altına konur. Yerel eski alternatifler için `npm.cmd run build` kullanılır.

OTOTR markası için iki ayrı tasarım alternatifi: gerçek fotoğraflarla 360° araç turu ve semantik 3D model üzerinde kaporta anlatımı.

**Yeni alternatif — gerçek fotoğraf:** `http://127.0.0.1:4318/real-360.html`. Aynı Opel ADAM'ın 24 farklı gerçek karesi, sürükleyerek dönüş, yakınlaştırma, 23 dış parça rehberi ve düzenlenebilir örnek açıklamalar. Fotoğraflar SpinFrame / WebRotate 360 örnek setinden; ticari kullanım izni doğrulanmış değil. Yerel tasarım referansıdır. Bulgular ve ölçümler kurgusaldır. Ayrıntı: [Gerçek fotoğraf alternatifi](docs/GERCEK-FOTOGRAF-ALTERNATIFI.md).

**İlk alternatif — semantik 3D:** `/index.html`. Kodla hazırlanmış temsili sedan, 25 seçilebilir parça ve aynı modelden üretilmiş 24 etiketli render. Aşağıdaki çekim/yükleme ve GLB özellikleri bu ilk alternatife aittir.

Her iki alternatif de fotoğraflardan geometri üretmez; gerçek hasar veya fotogrametri doğruluğu iddiası taşımaz. Yeni alternatifte görüntü gerçek fotoğraftır, dönüş 24 kareli fotoğraf dizisi üzerinden yapılır.

## Açılış

Hazır derlemeyi çalıştırmak için bu klasörde:

```powershell
node tools/serve.cjs
```

Ardından `http://127.0.0.1:4318/` adresini açın. `BASLAT.cmd` de aynı işlemi yapar. Sunucu yalnız bu bilgisayardan erişilebilen 127.0.0.1 adresini dinler.

Gerçek fotoğraflı alternatif için `http://127.0.0.1:4318/real-360.html` adresini veya `GERCEK-FOTOGRAF-BASLAT.cmd` dosyasını kullanın. İki tasarım arasında üst menüden geçilebilir.

Kaynak kod geliştirme:

```powershell
npm.cmd ci
npm.cmd run dev
```

Geliştirme adresi `http://127.0.0.1:4317/`. Dosyayı `file://` ile açmayın; JavaScript modülleri ve yerel kayıt için HTTP gerekir. Node sürümü Vite paketinin `engines` koşulunu karşılamalıdır.

## Örnekte yapılabilenler

- 3D aracı sürükleyerek döndürme, yakınlaştırma, üstten bakış ve parçaları ayırarak gösterme.
- Model üzerinde veya klavyeyle kullanılabilen parça listesinde 25 dış parçadan birini seçme.
- Orijinal / boyalı / lokal boyalı / değişen / onarım izli / incelenmedi durumları.
- Metal parçaya birden fazla µm değeri ve uzman açıklaması girme.
- İlgili görselleri büyütme ve farklı çekim açılarından modele bakma.
- Müşteri görünümü önizlemesi; düzenleme kontrolleri gizlenir. Bu bir güvenlik veya yetkilendirme katmanı değildir.
- 24 açılık çekim rehberi; mobil cihazlarda dosya seçici üzerinden arka kamerayı öneren `capture` alanı.
- JPG/PNG/WebP yükleme; 20 MB, en az 720 px kısa kenar ve aynı dosyanın farklı pozlarda tekrarını kontrol etme.
- Fotoğrafları ve bulguları IndexedDB ile aynı tarayıcıda saklama.
- JSON rapor taslağı ve semantik GLB araç modeli indirme.
- Ekipman, yazılım ve uygulama planını arayüzde inceleme.

## Önemli kullanım sınırları

Yüklenen fotoğraf geometriyi değiştirmez. 3D görünümdeki boya/değişen renkleri uzman tarafından girilen bulgulardır; yapay zekâ tespiti değildir. Boya kalınlığı otomatik olarak bir hasar kararına dönüştürülmez.

Gerçek fotoğraf sayısı sadece `kind: photo` yüklemelerini sayar; renderlar bu sayıya dahil edilmez. Yükleme açı/netlik/araç kimliği kontrolü anlamına gelmez. Teknik onay veya müşteri yayını yoktur.

25 parça dış yüzey kapsamındadır. Şasi, podye, direk içleri, taban, sökülmeden görülmeyen alanlar ve aracın bütün mekanik bileşenleri bu modelde temsil edilmez. Tüm gerçek ekspertiz kapsamı için mevcut OTOTR kontrol listesi korunmalıdır.

Yerel örnek, tek oturum kaydı tutar. “Boş çekim başlat” mevcut yerel kaydın yerini alır ve bunu onaylatır. Tarayıcı verisinin silinmesi kaydı silebilir; bu üretim yedeği değildir. JSON dosyası fotoğraf asıllarını içermez. Önizleme için yüklenen görüntü 1.800 px uzun kenara küçültülür, yeni JPEG olarak saklanır; asıl dosya saklanmaz. SHA-256 özgün dosyanın özetidir ve küçültülmüş önizlemenin özeti değildir. Üretimde özgün kanıt ayrıca ve değişmez olarak saklanmalıdır.

Uygulama kendi dosyalarını ve yazı tiplerini yerelden sunar; fotoğraflar bir sunucuya veya harici yapay zekâ hizmetine gönderilmez. Sistem & kurulum ekranındaki kaynak bağlantılarına tıklamak ilgili dış siteyi açar.

## Dosyalar

| Konum | İçerik |
| --- | --- |
| `real-360.html`, `src/real-spin.js`, `src/real-spin.css` | Gerçek fotoğraflı alternatif ekran ve etkileşimleri |
| `src/spin-domain.js` | 24 kare sırası, bu kasaya uygun 23 parça ve elle yerleştirilmiş işaretler |
| `public/real-car/` | 24 kaynak JPG ve URL/ölçü/SHA-256 bilgilerini içeren `source.json` |
| `src/main.js` | Türkçe arayüz, çekim ve rapor etkileşimleri |
| `src/car.js` | 25 semantik parça, raycasting, kameralar ve GLB dışa aktarma |
| `src/domain.js` | Parça sözlüğü, 24 çekim pozu, doğrulama, rapor sözleşmesi |
| `src/storage.js` | IndexedDB ve yerel fotoğraf doğrulama |
| `public/sample-renders/` | 24 etiketli temsili görüntü, köken açıklaması |
| `public/ototr-semantik-sedan.glb` | Blender/Three.js için 25 parça kimliğini koruyan model |
| `docs/PILOT-PROJESI.md` | Ekipman listesi, yöntem seçimi, saha çekimi ve pilot kabul ölçütleri |
| `docs/OTOTR-ENTEGRASYON.md` | Mevcut Ototr alanlarına bağlantı, iş emri ve onay akışı |
| `integration/part-map.json` | Kaynaktan doğrulanan rapor alanı eşleştirmeleri |
| `tests/domain.test.mjs` | Geometri, veri doğrulama ve örnek/gerçek ayrımı kontrolleri |
| `tools/check-interface.cjs` | Gerçek arayüz, yükleme, kayıt ve mobil kontrolleri |

## Kontrol komutları

```powershell
npm.cmd test
npm.cmd run build
node tools/check-interface.cjs
node tools/check-real-spin.cjs
```

`check-interface.cjs` ilk tasarım için 4317 geliştirme sunucusunu; `check-real-spin.cjs` yeni tasarım için 4318 statik sunucusunu kullanır. Tarayıcı kontrolleri Playwright ve Microsoft Edge gerektirir; ilk tasarımın görsel kontrolleri ayrıca Sharp kullanır. Bu çalışma ortamındaki hazır araçlar kullanıldı. Başka bir bilgisayarda bu araçlar ayrıca sağlanmalıdır. Kanıt görselleri ve sonuçlar `.local/` içindedir; müşteri verisi içermezler.

Örnek render ve GLB varlıklarını yeniden üretmek için geliştirme sunucusu açıkken `node tools/export-samples.cjs` çalıştırılır. Bu işlem `.local/` ve `public/` altındaki bu projeye ait örnek çıktıları günceller.

## Yayına alma ve geri dönüş

Ana Ototr uygulaması, veritabanı ve canlı müşteri raporu değiştirilmedi. Çalışma `apps/web/vehicle-3d` altında ayrı tutuldu. Önerilen entegrasyon bir özellik bayrağı arkasından yapılır. Geri dönüşte 3D girişini kapatıp mevcut iki boyutlu/standart raporu sunmak yeterli olmalıdır; kaynak kanıt ve rapor kayıtları korunmalıdır.

Three.js MIT lisanslıdır. Kullanılan DM Sans ve Manrope yazı tipleri SIL Open Font License ile dağıtılır; lisans metinleri `public/fonts/` içinde bulunur. Temsili sedan geometrisi ve renderlar bu proje için hazırlanmıştır, gerçek bir üretici modeline uygunluk iddiası taşımaz.
