# OTOTR Mobil Tasarim Alternatifleri

Tarih: 2026-06-03

Bu dokuman OTOTR mobil uygulamasinin yeni tasarimini mevcut uygulama kodundan ayri ilerletmek icin hazirlandi. Kodlama baslamadan once tasarim dili, tema secenekleri ve ilk akisin onaylanmasi hedeflenir.

## Incelenen Tasarim Yonu

Paylasilan gorsellerden 5 ana yon cikiyor:

1. Premium Kurumsal
2. Operasyon Odakli
3. Minimal Modern
4. Koyu Tema Hibrit
5. Teknik Uzman

## Onerilen Ana Yon

Ana urun tasarimi icin en iyi taban:

**Premium Kurumsal + Operasyon Odakli + Teknik Uzman**

Neden:

- Sahada teknisyen icin beyaz/acik ekran daha okunakli.
- Operasyon odakli ekranlarda is emri, eksik, kanit ve modul bilgileri daha hizli taraniyor.
- Teknik Uzman alternatifindeki parca bazli kontrol, fotograf ve final kontrol akisi ekspertiz isi icin daha guclu.
- Koyu Tema Hibrit guzel ve premium gorunuyor, fakat uzun kontrol listelerinde goz yorabilir. Opsiyonel tema olarak tutulmali.

## Tema Secenekleri

### Tema A - Premium Kurumsal

Kullanim:

- Varsayilan tema.
- Bayi, sube, teknisyen ve yonetici kullanimi icin uygun.

Ozellikler:

- Koyu lacivert ust alan.
- Beyaz kartlar.
- Mavi ana aksiyon.
- Yesil tamamlandi.
- Turuncu uyari.
- Kirmizi kritik.

Avantaj:

- Kurumsal, guvenilir, temiz.
- Uzun sureli saha kullanimi icin daha okunabilir.

Risk:

- Cok sade kalirsa OTOTR marka gucu zayif gorunebilir. Logo, plaka ve status rozetleri guclu tutulmali.

### Tema B - Operasyon Odakli

Kullanim:

- Teknisyen is emri listesi.
- Gunluk operasyon ve hizli tarama ekranlari.

Ozellikler:

- Daha kompakt liste.
- Daha fazla sayisal durum.
- Arama, filtre, eksik ve kanit sayilari onde.

Avantaj:

- Saha hizini artirir.
- Eksik ve geciken isler daha hizli fark edilir.

Risk:

- Fazla bilgi kalabaligi olusabilir. Mobilde kart yogunlugu kontrol edilmeli.

### Tema C - Minimal Modern

Kullanim:

- Giriş, profil, bildirimler, genel ozet ekranlari.

Ozellikler:

- Beyaz zemin.
- Bol bosluk.
- Az renk.
- Net hiyerarsi.

Avantaj:

- Temiz ve modern.
- Musteri veya bayi yoneticisi ekranlari icin uygun.

Risk:

- Teknisyenin hizli is akisi icin fazla sakin kalabilir.

### Tema D - Koyu Tema Hibrit

Kullanim:

- Opsiyonel dark mode.
- Gece vardiyasi.
- Premium sunum ve demo.

Ozellikler:

- Gece mavisi zemin.
- Cam efektli koyu kartlar.
- Kobalt mavi aksiyon.
- Yuksek kontrast.

Avantaj:

- Cok guclu marka algisi.
- Premium ve teknolojik gorunum.

Risk:

- Uzun listelerde ve yogun formlarda goz yorabilir.
- Fotograf ve rapor dogrulama ekranlarinda beyaz tema kadar net olmayabilir.

### Tema E - Teknik Uzman

Kullanim:

- Kaporta kontrolu.
- Parca bazli ekspertiz.
- Fotograf & kanit.
- Final kontrol.

Ozellikler:

- Arac krokisi veya parca haritasi.
- Parca listesi.
- Durum rozetleri.
- Kanit galerisi.
- Teknik not ve rapor onayi.

Avantaj:

- Ekspertiz isi icin en dogru is akisi.
- Parca, olcum, kanit ve sonuc arasinda net bag kurar.

Risk:

- Ilk surumde tam arac krokisi hazirlamak zaman alabilir. MVP icin parca listesiyle baslanabilir.

## Secilecek Ana Tasarim

Onerilen karar:

- Varsayilan tema: **Tema A - Premium Kurumsal**
- Is emri listesi: **Tema B - Operasyon Odakli**
- Kontrol, fotograf, final: **Tema E - Teknik Uzman**
- Opsiyonel tema: **Tema D - Koyu Tema Hibrit**
- Yardimci sade ekranlar: **Tema C - Minimal Modern**

## Ilk Tasarim Akisi

Koddan ayri olarak once su ekranlar tasarlanacak:

1. Giris ekrani
2. Ana sayfa / gunluk ozet
3. Is emri listesi
4. Is emri detayi
5. Modul secimi
6. Madde listesi
7. Madde detayi
8. Fotograf & kanit
9. Fotograf cekimi
10. Fotograf onay
11. Eksik & uyari
12. Final kontrol

## MVP Tasarim Kriterleri

- Teknisyen 3 dokunusta goreve baslayabilmeli.
- Eksik, uyari ve kritik durumlari ekrana bakinca anlasilmali.
- Plaka her is akisi ekraninda gorunmeli.
- Kanit eksigi saklanmamali, net uyarilmali.
- Final kontrol rapor onayindan once zorunlu adim olmali.
- Kucuk telefonlarda metinler tasma yapmamali.
- Her ana aksiyon tek ve net olmali.
