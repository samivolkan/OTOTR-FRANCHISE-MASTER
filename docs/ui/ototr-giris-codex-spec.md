# OTOTR Mobil Uygulama — Giriş & Oturum Tasarım Spec

## Tasarım Kararı

Bu modülün ana tasarım dili: **Soft Corporate Premium**.

Amaç, önceki koyu tasarımın premium hissini korurken ekranı daha ferah, kurumsal ve elit göstermek. Siyah zemin tamamen terk edilmeyecek; siyah/grafit ana tonlar kırık beyaz yüzeyler, açık gri servis atmosferi ve kırmızı marka geçişleriyle dengelenecek.

## Mobil Ölçü Kararı

Tasarım artık 16:9 sunum formatında değil, gerçek mobil aplikasyon ekranı olarak uygulanacak.

Hedef ekran:
- Ana tasarım genişliği: 390 px
- Ana tasarım yüksekliği: 844 px
- Responsive aralık: 360–430 px genişlik
- Safe area destekli
- Dikey scroll destekli
- Android ve iOS görünüme uyumlu

## Ana Renkler

- Ana zemin: #F4F5F7, #EEF0F3, #FFFFFF
- Grafit: #101216
- Koyu yüzey: #171A20
- Kırmızı: #D60812
- Koyu kırmızı: #A6000B
- Metin ana: #111827
- Metin ikincil: #5F6673
- Border: #D9DEE7
- Input border: #CDD3DE
- Kırmızı glow: rgba(214, 8, 18, 0.18)
- Siyah overlay: rgba(16, 18, 22, 0.72)

## Genel Görsel Dil

- Kurumsal, sade, premium, otomotiv odaklı.
- Aşırı karanlık görünüm yok.
- Üst veya orta alanda premium araç görseli/silueti kullanılacak.
- Aracın altında kırmızı çizgi/dalga geçişleri bulunacak.
- Form alanı açık veya yarı açık kurumsal kart içinde olacak.
- Sosyal giriş olmayacak.
- Google / Apple giriş butonları eklenmeyecek.
- Kullanıcı bilgileri bayi portalından tanımlanır.
- Usta tipi kullanıcı tarafından seçilmeyecek. Usta/personel tipi sistemden, hesap bilgisinden okunacak.

## Ortak Bileşenler

Aşağıdaki bileşenleri mevcut mimariye göre oluştur veya genişlet:

1. AuthLayout
   - Safe area
   - Logo alanı
   - Araç görsel alanı
   - Kırmızı dalga/çizgi dekoru
   - Alt versiyon bilgisi

2. AuthCard
   - Açık/kırık beyaz kart
   - Büyük radius
   - Hafif gölge
   - Kurumsal border

3. AuthInput
   - Telefon / E-posta
   - Şifre
   - İkonlu input
   - Şifre göster/gizle ikonu

4. PrimaryRedButton
   - Kırmızı gradient
   - Beyaz yazı
   - Sağ ok ikonu opsiyonel

5. SecondarySupportButton
   - Açık yüzey
   - Grafit metin
   - Kulaklık/teknik destek ikonu

6. RememberForgotRow
   - Beni Hatırla checkbox
   - Şifremi Unuttum linki

7. BranchCard
   - Şube adı
   - Lokasyon açıklaması
   - Seçili durum
   - Kırmızı check veya pin

8. SessionStateScreen
   - Hata/durum ikonu
   - Başlık
   - Açıklama
   - Primary action
   - Secondary link

## Ekranlar

### 1. Splash Ekranı

İçerik:
- OTOTR logo
- Tarafsız Araç Ekspertizi
- Premium araç görseli veya silueti
- Araç altında kırmızı dalga geçişleri
- Güvenli bağlantı kuruluyor...
- Küçük progress/loading göstergesi
- v2.4.1

Tasarım:
- Açık grafit ve kırık beyaz dengesi.
- Çok siyah görünmeyecek.
- Logo güçlü ve merkezde.
- Alt kırmızı dalga efekti marka imzası gibi kullanılacak.

### 2. Giriş Yap

İçerik:
- OTOTR logo
- Tarafsız Araç Ekspertizi
- Başlık: Hesabınıza Giriş Yapın
- Açıklama: Bayi portalı üzerinden tanımlanan kullanıcı bilgilerinizle giriş yapın.
- Telefon / E-posta input
- Şifre input
- Beni Hatırla
- Şifremi Unuttum
- Giriş Yap butonu
- Teknik Destek butonu
- Alt bilgi: Kullanıcı bilgileriniz bayi portalı üzerinden tanımlanır.
- v2.4.1

Kurallar:
- Google ve Apple girişleri kesinlikle yok.
- Usta tipi seçimi bu ekranda yok.
- Usta/personel tipi sistemdeki hesap bilgisinden gelir.
- Şifremi Unuttum tıklanınca şifre sıfırlama doğrulama ekranına gider.
- Giriş başarılıysa şube seçimi ekranına gider.

### 3. Şube Seçimi

İçerik:
- Başlık: Çalışacağınız Şubeyi Seçin
- Açıklama: Lütfen çalışmak istediğiniz şubeyi seçiniz.
- Varsayılan seçili şube: Bursa Küçük Sanayi
- Diğer örnek şubeler:
  - İstanbul Avrupa Yakası
  - İzmir Şube
  - Ankara Şube
- Şube değiştir
- Varsayılan şube seç
- Devam Et butonu

Kurallar:
- İlk girişte gösterilir.
- Sonraki girişlerde varsayılan şube kayıtlıysa doğrudan ana sayfaya geçilebilir.

### 4. Şifre Sıfırlama — Doğrulama

İçerik:
- Başlık: Hesabınızı Doğrulayın
- Açıklama: Şifrenizi sıfırlamak için kayıtlı telefon numaranızı veya e-posta adresinizi girin.
- Telefon / E-posta segment kontrolü
- Telefon input veya e-posta input
- Doğrulama Kodu Gönder butonu
- Giriş ekranına dön

Kurallar:
- Personel cep telefonu kullanılabilir.
- E-posta da desteklenebilir.

### 5. Kod Doğrulama

İçerik:
- Başlık: Doğrulama Kodunu Girin
- Açıklama: Telefonunuza gönderilen 6 haneli kodu girerek devam edin.
- 6 kutulu OTP input
- Kodu tekrar gönder sayacı
- Doğrula butonu
- Geri dön

### 6. Yeni Şifre Oluşturma

İçerik:
- Başlık: Yeni Şifrenizi Oluşturun
- Yeni Şifre
- Yeni Şifre Tekrar
- Şifre gereksinimleri:
  - En az 8 karakter
  - 1 büyük harf
  - 1 küçük harf
  - 1 rakam
- Şifreyi Güncelle butonu
- Giriş ekranına dön

### 7. Hatalı Şifre

İçerik:
- Başlık: Hatalı Şifre
- Açıklama: Girdiğiniz şifre hatalı. Lütfen tekrar deneyin.
- Tekrar Dene
- Şifremi Unuttum
- Kalan deneme bilgisi gösterilebilir.

### 8. İnternet Yok

İçerik:
- Başlık: İnternet Bağlantısı Yok
- Açıklama: Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.
- Tekrar Dene
- Giriş ekranına dön

### 9. Oturum Süresi Doldu

İçerik:
- Başlık: Oturum Süresi Doldu
- Açıklama: Güvenliğiniz için oturumunuz sonlandırıldı. Lütfen tekrar giriş yapın.
- Tekrar Giriş Yap

### 10. Yetkisiz Kullanıcı

İçerik:
- Başlık: Erişim Yetkiniz Bulunmuyor
- Açıklama: Bu hesaba erişim yetkiniz bulunmamaktadır. Lütfen bayi yöneticiniz ile iletişime geçin.
- Teknik Destek
- Giriş ekranına dön

### 11. Offline Giriş Mümkün Değil

İçerik:
- Başlık: Offline Giriş Mümkün Değil
- Açıklama: Güvenlik gereği uygulamayı kullanmak için internet bağlantısı gereklidir.
- Tekrar Dene

## Navigation

- Splash > Giriş Yap
- Giriş Yap > Şube Seçimi
- Giriş Yap > Şifremi Unuttum > Şifre Sıfırlama Doğrulama
- Doğrulama > Kod Doğrulama
- Kod Doğrulama > Yeni Şifre Oluşturma
- Yeni Şifre Oluşturma > Giriş Yap
- Şube Seçimi > Ana Sayfa
- Oturum hataları ilgili ekranlara yönlenir.

## Uygulama Kuralları

- Backend yoksa mock auth state kullan.
- Mevcut auth sistemi varsa bozma, sadece UI/UX tarafını güncelle.
- API endpoint uydurma.
- Google/Apple/social login ekleme.
- Usta tipi seçimi ekleme.
- Personel tipi hesap bilgisinden okunacak şekilde modelde yer bırak.
- Mevcut mimariye uy.
- Yeni dependency ekleme.
- Görsel asset indirme.
- SVG/CSS/Canvas ile basit kırmızı dalga efekti oluşturabilirsin.
- Var olan araç asseti varsa kullan; yoksa stilize araç placeholder/silhouette oluştur.
- Lint/typecheck/test çalıştır.

## Kabul Kriterleri

- Mobil ekran ölçüsünde uygulanmış olmalı.
- 360–430 px genişlikte taşma olmamalı.
- Giriş ekranı açık/grafit/kırmızı dengesiyle karanlık hissi kırmalı.
- Premium ve kurumsal görünmeli.
- Giriş, şube seçimi, şifre sıfırlama ve oturum durumları tamamlanmalı.
- Google/Apple girişi olmamalı.
- Usta tipi manuel seçimi olmamalı.
- Şifremi unuttum personel telefon/e-posta doğrulama akışına gitmeli.
- Kod hatasız derlenmeli.
