# Kaporta 360 operasyon pilotu

Kullanıcı, ERP’ye yayınlanan gerçek fotoğraflı Kaporta 360 demosunu ekspertizde kullanılabilir hale getirmeyi onayladı ("yapalım", "devam edelim"). İlk uygulama kapsamı: atanmış iş emri, 24 çevre + 4 üst açı, parça/ölçüm/yüzey bulgusu/kanıt, ayrı teknik inceleme ve nihai ERP raporuna bağlı müşteri bağlantısı.

Kaynak `apps/web/vehicle-3d`; ERP menüsü personel için `kaporta-360/pilot.html` açar. Eski fotoğraf demosu `kaporta-360/index.html` altında ayrı ve temsili kalır. Yayın hedefi mevcut GitHub Pages Ototr reposudur; başka hosting hesabı/proje oluşturulmaz.

Bağlı Supabase projesinin araçta görünen adı `ototr-staging` olarak doğrulandı. İncelenmiş iki additive migration, `packages/database/reviewed-migrations` zincirine alınıp PGlite/PostgreSQL rol ve RLS testlerinden geçirildi. Yalnız `k360_*` tabloları, kaporta_private yardımcıları, özel storage ve kaporta-360-report endpoint’i eklendi. Mevcut müşteri/iş emri kayıtlarına test verisi yazılmadı.

Mevcut görev sahibi, bayi, işe başlama, revizyon ve kilit koşulları korunur. Müdür teknik veri yazamaz; hazırlayan kendi kaydını onaylayamaz. Kaporta onayı ERP görevlerini veya master rapor cevaplarını otomatik tamamlamaz. Müşteri paylaşımı, aynı revizyondaki kilitli/onaylı nihai ERP raporunu ayrıca gerektirir. Böylece bu pilot görsel rapor eki olarak çalışır.

Asıllar özel depoda korunur; fotoğraf üstü işaretler ayrı koordinat verisidir. Kuyruk cihazda kullanıcıya göre ayrılır, başarısız yüklemeler tamamlandı sayılmaz. Müşteri linki 7 gün, imzalı fotoğraf URL’si 120 saniye geçerlidir. İade, nihai rapor revizyon/kilit değişimi ve paylaşım iptali sonraki erişimi kapatır. Anonim tablo erişimi yoktur.

Bu aşama gerçek fotogrametri, AI hasar tespiti, Bluetooth ölçüm, tarihçe veya VIN’den kesin karoser eşleme içermez. Genel parça şablonları ve beyan edilen ölçümler uzman yorumuyla kullanılır. Fiziksel telefon ve gerçek araçla iki personelli saha kabulü yapılmadan production-ready denmez. Ayrıntılı kullanım, veri sınırları ve kontroller modülün `docs/KAPORTA-360-KULLANIM.md` dosyasındadır.

Geri alma: menüyü önceki örneğe yönlendirmek ve pilotun yeni yazma/paylaşım erişimini kapatmak; kaydedilmiş asıl fotoğraf, rapor ve denetim verilerini silmemek.
