# GM Finans — Ticari ve Mali Konfigürasyon Girdi Formu

Bu belge FIN-G01 ve FIN-G02 için karar toplama formudur. Boş alanlardan oran, KDV, vade veya muhasebe hesabı tahmin edilmez. Her kuralın başlangıç tarihi ve onay sahibi bulunmalıdır.

Makinece doğrulanan ana kayıt `docs/finance/commercial-configuration.json` dosyasıdır. Bu formdaki kararlar o kayda işlenmeden, `Test-FinanceCommercialConfiguration.ps1 -RequireApproved` geçmeden ve imzalı kanıt hash'i eklenmeden FIN-G01/FIN-G02 kapatılamaz.

## 1. Genel kararlar

| Alan | Karar | Onaylayan | Geçerlilik başlangıcı |
|---|---|---|---|
| Varsayılan para birimi | Bekleniyor | Finans Direktörü | Bekleniyor |
| Tutar hassasiyeti | 8 ondalık saklama, 2 ondalık belge gösterimi önerisi | Mali Müşavir | Bekleniyor |
| Yuvarlama yöntemi | Bekleniyor | Mali Müşavir | Bekleniyor |
| Varsayılan vade başlangıcı | Bekleniyor | Finans Direktörü | Bekleniyor |
| Tahsilat sıralama politikası | Bekleniyor | Finans Kontrol | Bekleniyor |
| İtiraz süresi | Bekleniyor | Hukuk | Bekleniyor |

## 2. Bedel ailesi karar matrisi

Her satır için `UYGULANMAZ` veya açık değer girilmelidir.

| Bedel ailesi | Tetikleyici | Hesaplama | KDV dahil mi? | KDV oranı/kodu | Vade | İade/iptal davranışı | Fatura satır kodu |
|---|---|---|---|---|---|---|---|
| ROYALTY | Kesinleşmiş tahsilat parçası | Varsayılan oran kararı alındı; değer yalnız secret manager'da tutulacak; bayi bazında esnetilebilir | Evet, tahsil edilen KDV dahil brüt matrah; hesaplanan royalty bedeline ayrıca KDV | KDV oranı/kodu Mali Müşavir onayı bekliyor | Bekleniyor | İade oranında ters kayıt; orijinal dönem/tahakkuk korunur | Bekleniyor |
| ENTRY_FRANCHISE | Sözleşme/şube aktivasyonu | Sabit/kademeli tutar bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| QUERY | Başarılı ücretli sorgu | Hizmet bazlı fiyat bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Teknik tekrar/ücretsiz hak kararı bekleniyor | Bekleniyor |
| EXTERNAL_SERVICE | Başarılı hizmet kullanımı | Hizmet bazlı fiyat/marj bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Sağlayıcı iptal/iade kuralı bekleniyor | Bekleniyor |
| OPTIONAL_PRODUCT_SERVICE | Satış/kullanım | Ürün bazlı fiyat bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor |
| PASS_THROUGH_EXPENSE | Onaylı kaynak masraf | Dağıtım anahtarı bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Belge ve maker-checker ile ters kayıt | Bekleniyor |
| DEDUCTION/CREDIT | Onaylı itiraz/karar | Sabit veya bağlı kalem oranı bekleniyor | Bekleniyor | Bekleniyor | Bekleniyor | Doğrudan bakiye düzenleme yasak | Bekleniyor |

## 3. Royalty için zorunlu cevaplar

1. Varsayılan royalty oranı nedir; bayi/şube/sözleşme bazında değişebilir mi? **Karar alındı; oran değeri public repoya yazılmaz, `FINANCE_ROYALTY_DEFAULT_RATE_PERCENT` secret'ından server-side okunur; bayi bazında esnetilebilir.**
2. Oran değişikliği hangi tarihten itibaren uygulanır; geçmiş işlemler yeniden hesaplanır mı?
3. Kredi kartı komisyonu veya başka kesintiler royalty matrahından düşer mi?
4. Tahsilat iptali ile müşteri iadesi aynı finansal davranışı mı izler?
5. Fazla iade girişimi reddedilecek mi; istisna için kim onay verebilir?
6. Royalty tahakkukunun şubeye fatura edilme periyodu nedir?

### Onaylanan royalty muafiyet politikası

- Yeni bayi için sözleşme kararına göre ilk 6 ay veya ilk 12 ay royalty alınmayabilir.
- Zarar ettiği değerlendirilen bayi için Finans Direktörü ve Franchise Yönetimi maker-checker onayıyla, başlangıç ve bitiş tarihi bulunan geçici muafiyet uygulanabilir.
- Muafiyet doğrudan kayıt silmez; bayi kapsamlı, tarih aralıklı `EXEMPT` kural istisnası üretir ve audit izi korunur.
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

