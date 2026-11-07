# GM Finans — Ticari ve Mali Konfigürasyon Girdi Formu

Bu belge FIN-G01 ve FIN-G02 için karar toplama formudur. Boş alanlardan oran, KDV, vade veya muhasebe hesabı tahmin edilmez. Her kuralın başlangıç tarihi ve onay sahibi bulunmalıdır.

Makinece doğrulanan ana kayıt `docs/finance/commercial-configuration.json` dosyasıdır. Bu formdaki kararlar o kayda işlenmeden, `Test-FinanceCommercialConfiguration.ps1 -RequireApproved` geçmeden ve imzalı kanıt hash'i eklenmeden FIN-G01/FIN-G02 kapatılamaz.

## Bedel ailesi entegrasyon kodları

ERP ve kullanıcı arayüzünde iş adı `DEDUCTION_CREDIT` olarak kullanılır. Mevcut finans defterindeki teknik saklama kodu `ADJUSTMENT` olarak korunur. Bu ikisi aynı anlamdaki kesinti/kredi ailesidir; adaptörler `feeFamilyStorageMapping` kaydını kullanır ve yeni bir dokuzuncu bedel ailesi oluşturmaz. Diğer yedi ailenin iş ve saklama kodları aynıdır.

## 1. Genel kararlar

| Alan | Karar | Onaylayan | Geçerlilik başlangıcı |
|---|---|---|---|
| Varsayılan para birimi | Bekleniyor | Finans Direktörü | Bekleniyor |
| Tutar hassasiyeti | 8 ondalık saklama, 2 ondalık belge gösterimi önerisi | Mali Müşavir | Bekleniyor |
| Yuvarlama yöntemi | Bekleniyor | Mali Müşavir | Bekleniyor |
| Varsayılan vade başlangıcı | Fatura tarihini izleyen takvim günü; Europe/Istanbul | Finans Direktörü | Şube kuralı aktivasyonu |
| Tahsilat sıralama politikası | Bekleniyor | Finans Kontrol | Bekleniyor |
| İtiraz süresi | Bekleniyor | Hukuk | Bekleniyor |

## 2. Bedel ailesi karar matrisi

Her satır için `UYGULANMAZ` veya açık değer girilmelidir.

| Bedel ailesi | Tetikleyici | Hesaplama | KDV dahil mi? | KDV oranı/kodu | Vade | İade/iptal davranışı | Fatura satır kodu |
|---|---|---|---|---|---|---|---|
| ROYALTY | Kesinleşmiş tahsilat parçası | Varsayılan oran kararı alındı; değer yalnız secret manager'da tutulacak; şube bazında esnetilebilir | Evet, tahsil edilen KDV dahil brüt matrah; hesaplanan royalty bedeline ayrıca %20 KDV | Oran %20 onaylandı; muhasebe vergi kodu eşlemesi bekliyor | Ertesi takvim günü | İade oranında ters kayıt; orijinal dönem/tahakkuk korunur | ROYALTY_SERVICE_FEE — Royalty Hizmet Bedeli |
| ENTRY_FRANCHISE | Şube açılışında, açılış referansıyla şube başına tek sefer; tekrar reddedilir, geriye dönük oluşturulmaz | Sabit/kademeli tutar bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| PERIODIC_FRANCHISE | Varsayılan kapalı; yalnız onaylı sürümlü sözleşme kuralıyla dönemsel tetiklenir | Sabit/oransal yöntem bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Sıklık ve iptal kuralı bekleniyor | Bekleniyor |
| QUERY | Başarılı ücretli sorgu | TRAMER, KM ve TRAMER 360 için sabit TRY tutarları kullanıcı tarafından kararlaştırıldı; değerler public repoya yazılmadan secret manager'da tutulacak | Bekleniyor | Bekleniyor | Bekleniyor | Teknik tekrar/ücretsiz hak kararı bekleniyor | Bekleniyor |
| EXTERNAL_SERVICE | Başarılı hizmet kullanımı | Sağlayıcı maliyeti + yüzdesel hizmet bedeli + hizmet bedeline ayrıca KDV onaylandı; oran bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Sağlayıcı iptal/iade kuralı bekleniyor | Bekleniyor |
| OPTIONAL_PRODUCT_SERVICE | Satış/kullanım | Ürün bazlı fiyat bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| PASS_THROUGH_EXPENSE | Onaylı kaynak masraf | Kaynak masraf + güvenli backend oranından hizmet bedeli + %20 KDV; kaynak, hizmet ve vergi şubeye ayrı gösterilir. Şubeler arası dağıtım anahtarı bekleniyor | Hayır; KDV hizmet bedeline ayrı eklenir | Oran %20 onaylandı; muhasebe vergi kodu bekleniyor | Bekleniyor | Belge ve maker-checker ile ters kayıt | Bekleniyor |
| DEDUCTION/CREDIT | Onaylı itiraz/karar | Sabit veya bağlı kalem oranı bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Doğrudan bakiye düzenleme yasak | Bekleniyor |

## 3. Royalty için zorunlu cevaplar

1. Varsayılan royalty oranı nedir; bayi/şube/sözleşme bazında değişebilir mi? **Karar alındı; oran değeri public repoya yazılmaz, `FINANCE_ROYALTY_DEFAULT_RATE_PERCENT` secret'ından server-side okunur; şube açılışında şube bazında esnetilebilir.**
2. Oran değişikliği hangi tarihten itibaren uygulanır; geçmiş işlemler yeniden hesaplanır mı? **Şube açılışında ticari değer/oran ve süre manuel seçilir; açılış tarihinden ileriye uygulanır. Geçmiş tahsilatlar yeniden hesaplanmaz; değişiklikler yalnız ileri tarihli yeni sürümle yapılır.**
3. Kredi kartı komisyonu veya başka kesintiler royalty matrahından düşer mi? **Hayır. Royalty her durumda müşteriden tahsil edilen KDV dahil brüt tutarın tamamı üzerinden hesaplanır.**
4. Tahsilat iptali ile müşteri iadesi aynı finansal davranışı mı izler?
5. Fazla iade girişimi reddedilecek mi; istisna için kim onay verebilir?
6. Royalty tahakkukunun şubeye fatura edilme periyodu nedir? **Şube açılışında günlük, haftalık veya aylık seçeneklerinden biri manuel seçilir. Tahakkuk her kesinleşen tahsilatta anlık oluşur; periyot yalnız fatura paketlemesini belirler ve geçmiş tahakkukları yeniden paketlemez.**

### Ödeme ve erişim kararı

- Oluşan royalty faturası, fatura tarihini izleyen takvim günü şube ekranından kredi kartıyla ödenir.
- Kart numarası, CVV veya ham kart verisi ERP'de saklanmaz; yalnız ödeme kuruluşu tokenı ve doğrulanmış callback sonucu işlenir.
- Vade geldiğinde tam ödeme doğrulanmadıysa şubenin operasyon ekranları fail-closed kilitlenir.
- Kilitliyken ödeme, fatura/ekstre görüntüleme, destek ve güvenli çıkış açık kalır; diğer şube operasyonları kapalıdır.
- Erişim yalnız ödeme kuruluşundan doğrulanmış tam ödeme callback'i geldikten sonra açılır; kart formunun gönderilmesi yeterli değildir.
- Seçilen fatura dönemindeki royalty tahakkukları faturada `Royalty Hizmet Bedeli` adıyla tek satırda toplanır; satırın alt tahakkuk ve ekstre izleri korunur.
- Müşteri iadesinden oluşan royalty ters kayıtları sonraki faturadaki aynı `Royalty Hizmet Bedeli` satırında eksi tutar olarak mahsup edilir; orijinal tahakkuk ve iade izi korunur.
- Eksi royalty tutarı dönem pozitif royalty toplamını aşarsa kalan kısım aynı şubenin sonraki uygun faturalarına kredi olarak devreder; süresi dolmaz ve başka şube/bayiye aktarılamaz.

### Onaylanan royalty muafiyet politikası

- Yeni şube için açılış kararına göre ilk 6 ay veya ilk 12 ay royalty alınmayabilir.
- Zarar ettiği değerlendirilen şube için Finans Direktörü ve Franchise Yönetimi maker-checker onayıyla, başlangıç ve bitiş tarihi bulunan geçici muafiyet uygulanabilir.
- Muafiyet doğrudan kayıt silmez; şube kapsamlı, tarih aralıklı `EXEMPT` kural istisnası üretir ve audit izi korunur.
- Vardiya sistemi royalty hesaplama veya muafiyet koşulu değildir.

## 4. Muhasebe eşleme matrisi

Mali müşavir her satır için borç hesabı, alacak hesabı, vergi hesabı, belge tipi ve ters kayıt yöntemini onaylamalıdır.

| İşlem | Borç hesabı | Alacak hesabı | Vergi hesabı | Belge tipi | Ters kayıt tarihi politikası |
|---|---|---|---|---|---|
| Royalty tahakkuku | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Açık dönem; orijinal referans korunur |
| Giriş franchise bedeli | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| Sorgu/hizmet bedeli | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| Masraf yansıtma | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| Bayi tahsilatı | Bekleniyor | Bekleniyor | Uygulanmaz/Bekleniyor | Bekleniyor | Bekleniyor |
| İtiraz kredi düzeltmesi | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |

## 5. İmza kaydı

- Finans Direktörü: Bekleniyor
- Mali Müşavir: Bekleniyor
- Franchise Yönetimi: Bekleniyor
- Hukuk: Bekleniyor
- İmzalı kanıt yolu ve SHA-256: Bekleniyor

