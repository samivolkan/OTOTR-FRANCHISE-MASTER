# OtoTR WhatsApp Müşteri Hizmetleri

## Amaç

Mevcut OtoTR WhatsApp numarasını koruyarak müşteri, bayi/servis ve bayilik adaylarının tek numara üzerinden otomatik akışlara ve gerektiğinde canlı temsilciye yönlendirilmesi.

Bu çalışma WhatsApp Business Platform / Cloud API için hazırlanmıştır. Mobil ve web istemcileri doğrudan SQL Server'a veya Meta API'ye bağlanmaz. Tüm iletişim C# Web API sınırından geçer.

## Eklenen Alanlar

- `apps/api/OtoTr.WhatsApp.Api`
  - Meta webhook doğrulaması ve imza kontrolü
  - Gelen mesaj ayrıştırma
  - SQL Server konuşma ve mesaj kayıtları
  - Otomatik menü ve randevu akış motoru
  - ERP paket, şube, randevu, rapor, garanti, destek ve bayilik başvurusu bağlantıları
  - Canlı temsilci devri
  - JWT korumalı müşteri hizmetleri API'si
  - 24 saatlik müşteri hizmetleri penceresi kontrolü
  - Onaylı şablon gönderme endpoint'i
- `apps/admin/prototype/whatsapp-customer-service/index.html`
  - Gelen kutusu
  - Bekleyen/botta/temsilcide/kapanan filtreleri
  - Mesaj ekranı
  - Görüşmeyi üzerine alma
  - Botu durdurma/yeniden başlatma
  - Şablon gönderme
  - Görüşmeyi kapatma
- `apps/api/OtoTr.WhatsApp.Api/sql/001_create_whatsapp_customer_service.sql`
  - Silme veya tablo düşürme içermeyen SQL Server kurulum betiği

## Otomatik Konuşma Akışları

### İlk Karşılama

1. OtoTR karşılama mesajı
2. WhatsApp aydınlatma metni bağlantısı
3. Rol seçimi:
   - Müşteriyim
   - Bayi / Servis
   - Bayilik Başvurusu

Aydınlatma metni ile pazarlama izni aynı onaya bağlanmaz. Kampanya/ticari ileti izni gerekiyorsa ayrı bir izin kaydı ve ayrı mesaj akışı kurulmalıdır.

### Müşteri

- Ekspertiz randevusu al
  - şehir
  - şube
  - aktif paket
  - tarih
  - boş saat
  - plaka
  - özet/onay
  - ERP randevu kaydı ve randevu numarası
- Paket ve fiyatları incele
- Randevu sorgulama destek kaydı
- Plaka veya rapor numarasıyla rapor sorgulama
- Konum veya şehirle en yakın şube
- Garanti kapsam sorgulama
- Şikâyet/destek kaydı
- Canlı temsilci
- Ana menü / sohbeti bitir

### Bayi / Servis

- Teknik destek
- Operasyon desteği
- Finans ve mutabakat
- Akademi/eğitim
- Canlı temsilci

Her işlem ERP'de destek kaydı oluşturur ve görüşme ilgili kuyruğa aktarılır.

### Bayilik

- Genel bayilik bilgisi
- Ön başvuru oluşturma
  - ad soyad
  - şehir/bölge
  - yatırım aralığı
  - CRM lead kaydı
- Franchise yetkilisine aktarım

## ERP İç Servis Sözleşmeleri

WhatsApp API aşağıdaki C# ERP endpoint'lerini bekler. Endpoint'ler internetten anonim erişime açık olmamalıdır; servis anahtarı veya servis kimliğiyle korunmalıdır.

```text
GET  /internal/whatsapp/branches?city={city}
GET  /internal/whatsapp/branches/{branchId}/packages
GET  /internal/whatsapp/appointment-slots?branchId={id}&packageId={id}&date=yyyy-MM-dd
POST /internal/whatsapp/appointments
GET  /internal/whatsapp/reports/lookup?phone={phone}&value={plateOrReportNo}
GET  /internal/whatsapp/guarantees/lookup?phone={phone}&value={plateOrReportNo}
POST /internal/whatsapp/support-tickets
POST /internal/whatsapp/franchise-leads
```

Paket, fiyat, şube ve saat verileri dinamik olarak ERP'den gelir. Statik araç/paket JSON verisi kullanılmaz.

## Mevcut Numara ile Aktivasyon

Numara değiştirilmeyecektir. Meta onboarding ekranında mevcut WhatsApp Business uygulaması numarası için birlikte kullanım seçeneği sunuluyorsa bu yol tercih edilir. Bu seçenek hesapta sunulmuyorsa numara Cloud API'ye taşınır. Hangi seçeneğin kullanılabileceği Meta Business hesabındaki onboarding ekranında kesinleşir.

Aktivasyon sırasında yalnızca hesap sahibi tarafından yapılabilecek adımlar:

1. Mevcut WhatsApp Business sohbetlerinin ve medya dosyalarının yedeğini alın.
2. Şirketin Meta Business Portfolio yöneticisiyle giriş yapın.
3. WhatsApp Business Account oluşturun veya mevcut hesabı seçin.
4. Mevcut OtoTR numarasını girin.
5. SMS veya sesli aramayla gelen doğrulama kodunu girin.
6. Meta uygulamasında WhatsApp ürününü açın.
7. Aşağıdaki değerleri parola/secret kasasına kaydedin:
   - Graph API sürümü
   - Phone Number ID
   - WhatsApp Business Account ID
   - kalıcı sistem kullanıcısı access token
   - Meta App Secret
   - webhook verify token
8. Webhook URL'sini tanımlayın:

```text
https://api.ototr.com.tr/api/integrations/whatsapp/webhook
```

9. Webhook alanlarında en az `messages` aboneliğini etkinleştirin.
10. Randevu hatırlatma, rapor hazır, destek kaydı ve garanti bilgilendirme şablonlarını Meta onayına gönderin.

Gerçek token, app secret, doğrulama tokenı, SQL Server parolası ve ERP servis anahtarı GitHub'a yazılmamalıdır.

## Yapılandırma

`appsettings.example.json` yalnızca örnektir. Üretim değerleri ortam değişkeni veya secret kasasından verilmelidir.

Örnek ortam değişkenleri:

```text
ConnectionStrings__OtoTrSqlServer
WhatsApp__GraphApiVersion
WhatsApp__PhoneNumberId
WhatsApp__WhatsAppBusinessAccountId
WhatsApp__AccessToken
WhatsApp__AppSecret
WhatsApp__WebhookVerifyToken
WhatsApp__PrivacyNoticeUrl
Erp__BaseUrl
Erp__ServiceApiKey
Auth__Authority
Auth__Audience
Cors__AllowedOrigins__0
```

## Kurulum Sırası

1. SQL betiğini geliştirme/staging SQL Server'da inceleyin ve çalıştırın.
2. ERP iç servis endpoint'lerini mevcut C# API'ye ekleyin.
3. WhatsApp API uygulamasına secret değerlerini verin.
4. Uygulamayı HTTPS alan adına yayınlayın.
5. `/health/live` ve `/health/ready` kontrollerini doğrulayın.
6. Meta webhook doğrulamasını tamamlayın.
7. Test numarasından aşağıdaki E2E senaryolarını çalıştırın.
8. Sonuçlar başarılıysa mevcut OtoTR numarasını aktive edin.

Otomatik database migration veya production üzerinde destructive işlem yapılmaz.

## Zorunlu Testler

- Geçersiz `X-Hub-Signature-256` isteği 401 dönmeli.
- Geçerli webhook doğrulama tokenı challenge değerini döndürmeli.
- Aynı Meta Message ID ikinci kez işlendiğinde yeni mesaj/randevu oluşmamalı.
- Müşteri menüsü 10 satır sınırını aşmamalı.
- Randevu yalnızca ERP'nin döndürdüğü aktif şube, paket ve boş saatle oluşturulmalı.
- ERP hatasında bot görüşmeyi canlı temsilci kuyruğuna aktarmalı.
- Temsilci devraldığında bot cevap vermemeli.
- 24 saatlik pencere kapandığında normal mesaj engellenmeli ve şablon istenmeli.
- Yetkisiz kullanıcı müşteri hizmetleri endpoint'lerine erişememeli.
- Rapor bağlantısı yalnızca müşterinin telefon/plaka/rapor yetkisi doğrulandıktan sonra dönmeli.
- KVKK aydınlatması ve ticari ileti izni ayrı tutulmalı.

## Canlıya Alma Öncesi Eksik Dış Bilgiler

Kod tarafı numaradan bağımsızdır. Canlı bağlantının tamamlanması için aşağıdaki değerler hesap sahibinden alınmalıdır:

- kullanılacak mevcut telefon numarası
- Meta Business Portfolio yönetici erişimi
- SMS/sesli doğrulama kodu
- şirket unvanı ve Meta işletme doğrulama belgeleri
- yayınlanmış WhatsApp/KVKK aydınlatma URL'si
- üretim API, ERP ve portal alan adları
- ERP JWT issuer/audience değerleri

Bu bilgiler alınmadan gerçek numara Meta'ya bağlanamaz; kod ve ekranlar staging ortamında test edilebilir.
