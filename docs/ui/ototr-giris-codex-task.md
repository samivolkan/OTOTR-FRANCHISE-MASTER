Görev: OTOTR mobil uygulamasında Giriş & Oturum modülünü final tasarım kararına göre uygula.

Ana kaynak:
- docs/ui/ototr-giris-codex-spec.md

Referans görseller:
- docs/design/ototr-login-soft-corporate-reference.png
- docs/design/ototr-existing-auth-flow-reference.png

Önemli kararlar:
- Artık 16:9 sunum tasarımı uygulanmayacak.
- Gerçek mobil aplikasyon ekranı uygulanacak.
- Hedef tasarım genişliği 390 px, yükseklik 844 px, responsive aralık 360–430 px.
- Tema: kırık beyaz + grafit + siyah + kurumsal kırmızı.
- Giriş ekranı aşırı karanlık olmayacak.
- Google / Apple / sosyal giriş olmayacak.
- Kullanıcı adı/şifre bayi portalı üzerinden tanımlanır.
- Usta tipi kullanıcı tarafından seçilmeyecek; hesap/personel bilgisinden gelecek.
- Şifremi unuttum akışı personel telefonu/e-posta doğrulamasıyla ilerleyecek.

Uygulanacak ekranlar:
1. Splash Ekranı
2. Giriş Yap
3. Şube Seçimi
4. Şifre Sıfırlama — Telefon/E-posta Doğrulama
5. Kod Doğrulama
6. Yeni Şifre Oluşturma
7. Hatalı Şifre
8. İnternet Bağlantısı Yok
9. Oturum Süresi Doldu
10. Yetkisiz Kullanıcı
11. Offline Giriş Mümkün Değil

Uygulama talimatları:
1. Önce mevcut repo mimarisini incele.
2. Framework, navigation, theme, auth ve component yapısını tespit et.
3. Benden teknoloji sorma; repo yapısından karar ver.
4. Mevcut yapıya minimum müdahale ile ilerle.
5. Backend/API uydurma. Mevcut auth varsa koru, yoksa mock auth state kullan.
6. Yeni dependency ekleme.
7. Mevcut asset varsa kullan, yoksa dışarıdan asset indirme.
8. Kırmızı dalga/geçiş efektini basit SVG/CSS/Canvas ya da framework'ün doğal çizim sistemiyle üret.
9. Mobil safe area ve küçük ekran taşmalarını düzelt.
10. Lint/typecheck/test çalıştır.
11. En sonda kısa rapor ver: değişen dosyalar, çalıştırılan komutlar, kalan riskler.

Önce en fazla 8 maddelik kısa plan yaz, sonra onay beklemeden uygulamaya geç.
