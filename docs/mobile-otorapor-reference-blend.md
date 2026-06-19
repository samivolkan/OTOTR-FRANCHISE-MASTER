# OTOTR Mobil - OtoRapor Referans Harmanlama Plani

Tarih: 2026-06-04

Bu dokuman, kullanicinin paylastigi OtoRapor mobil ekranlari ve chat notu temel alinarak OTOTR mobil uygulamasinin yeni tasarim ve is akisi yonunu netlestirmek icin olusturuldu.

## Ana Karar

OtoRapor mobil uygulamasindaki operasyon akisi referans alinacak, fakat arayuz birebir kopyalanmayacak.

Sebep:

- Ekspertiz sektorunde OtoRapor akisi sahada denenmis ve anlasilir.
- Kullanici OTOTR icin benzer bir temel is akisi istiyor.
- Birebir gorsel kopya marka, telif ve ayirt edicilik acisindan risklidir.
- OTOTR kendi marka dili, renk sistemi, component yapisi ve daha profesyonel bilgi hiyerarsisi ile ayrismali.

## Alinacak OtoRapor Is Akisi Mantigi

### 1. Arac Bekleyen Is Emri Ekrani

Referans ozellikler:

- Ustte logo/header.
- Bekleyen arac sayisi.
- Arac karti.
- Plaka, sasi no, is emri no, motor no.
- Marka, model, yil.
- Arac fotograf durum uyarisi.
- Alt navigasyon.

OTOTR yorumu:

- Bu ekran "Is Emirleri / Bekleyen Araclar" olarak tasarlanacak.
- Plaka ve is emri no daha modern kart icinde gosterilecek.
- Fotograf eksigi kirmizi CTA olarak kalacak.
- Sube/teknisyen rolune gore kart aksiyonlari degisecek.

### 2. Arac Bilgi ve Modul Listesi

Referans ozellikler:

- Plaka, model ve marka bilgisi.
- Onceki raporlar butonu.
- Yil ve yakit bilgisi.
- Tramer sorgusu.
- Ekspertiz modulleri:
  - Kaporta - Boya
  - Ic Ekspertiz
  - Alt / On / Mekanik
  - Motor
  - Genel Kondisyon / Dis
  - OBD / Beyin
  - Airbag
  - Dyno / Yol Testi
  - Conta Kacak Testi
- Her modulde tamamlanan/gonderilen sayisi ve sure.

OTOTR yorumu:

- Bu ekran "Is Emri Detayi" ve "Gorev Modulleri" olarak ikiye ayrilacak.
- Sure, gonderilen madde, eksik madde ve modul durumu korunacak.
- Modern OTOTR kart yapisi kullanilacak.
- "Onceki Raporlar" korunacak ama daha kurumsal sekilde "Gecmis Raporlar" olarak adlandirilabilir.

### 3. Test Baslatma / Birakma

Referans ozellikler:

- Kirmizi modul basligi.
- "Test noktalarini doldurmaya baslayabilirsiniz."
- Testi Birak butonu.
- Modul icindeki kontrol noktalarinin listesi.

OTOTR yorumu:

- Modul baslayinca ustte kompakt plaka header'i gorunecek.
- "Testi Birak" yerine "Modulu Birak" veya "Calismayi Duraklat" kullanilacak.
- Kirmizi sadece kritik/aktif test vurgusu icin sinirli kullanilacak.
- Ana aksiyon mavi, kritik uyarilar kirmizi olacak.

### 4. Kontrol Noktasi Listesi

Referans ozellikler:

- Her satirda buyutec ikonu.
- Uzun ve dokunulabilir kontrol maddeleri.
- Siyah ayirici cizgiler.
- Altta "Tum Noktalar Iyi Durumda" butonu.
- Kaporta icin "Mikron Secin" butonu.

OTOTR yorumu:

- Buyutec ikonu yerine madde tipi/detay ikonu veya status ikonu kullanilacak.
- Satirlar daha modern ve daha az kaba olacak.
- "Tum Noktalar Iyi Durumda" korunacak, fakat onay gerektiren toplu islem olarak tasarlanacak.
- "Mikron Secin" korunacak, kaporta akisi icinde olcum ekranina baglanacak.

### 5. Madde Detayi

Referans ekranlardan cikarim:

- Maddeler tek tek dolduruluyor.
- Durum, fotograf, not ve olcum ihtiyaci var.

OTOTR yorumu:

- Her madde icin detay ekraninda:
  - Durum secimi
  - Not
  - Fotograf
  - Mikron/olcum
  - Kaydet ve sonraki madde
- Teknisyenin surekli geri donmeden ilerlemesi hedeflenecek.

### 6. Fotograf / Kanit Ekrani

Referans ozellikler:

- Buyuk koyu kartlar.
- Fotograf cekilecek bolge adi.
- Ornek gorsel.
- Kamera ikonu.
- Cekilenleri gonder butonu.
- Genel resim cek butonu.

OTOTR yorumu:

- Bu akis ayni mantikta korunacak.
- Kartlar modernize edilecek.
- Her kanit icin:
  - Zorunlu / opsiyonel etiketi
  - Ornek poz
  - Cekildi / eksik durumu
  - Tekrar cek
  - Onayla
- "Cekilenleri Gonder" yerine "Kanitlari Kaydet" veya "Kanitlari Gonder" kullanilacak.

### 7. Toplu Iyi Durum

Referans ozellikler:

- "Tum Noktalar Iyi Durumda" butonu.

OTOTR yorumu:

- Bu buton kritik bir hizlandirici olarak korunacak.
- Basildiginda modaldan onay alinacak:
  - "Bu moduldeki tum bos maddeler iyi olarak isaretlenecek."
- Daha once sorunlu isaretlenen maddeler otomatik degistirilmeyecek.

## OTOTR'ye Ozgu Gelistirmeler

OtoRapor temel akisi uzerine eklenecek farklar:

- Daha net is emri sahiplenme.
- Teknisyen bazli modul kilitleme.
- Eksik ve uyari merkezi.
- Kanit kalite kontrolu.
- Final teknik onay.
- Musteri icin ozet.
- Cevrimdisi calisma hazirligi.
- Rapor onayi oncesi zorunlu kontrol listesi.
- Rol bazli bayi/sube ve teknisyen ayrimi.

## Tasarim Dili Karari

Uygulama iki modlu tasarlanacak:

### Varsayilan Mod - OTOTR Light Operation

Kullanim:

- Gunluk saha kullanimi.
- Uzun kontrol listeleri.
- Fotograf ve rapor dogrulama.

Ozellikler:

- Acik gri zemin.
- Beyaz kartlar.
- Koyu lacivert ust alan.
- Mavi ana aksiyon.
- Yesil tamamlandi.
- Turuncu uyari.
- Kirmizi kritik.

### Opsiyonel Mod - OTOTR Dark Command

Kullanim:

- Premium demo.
- Gece vardiyasi.
- Kullanici tercihi.

Kaynak:

- Chat notundaki "Alternatif 4 - Koyu Tema Hibrit" spec'i.

Ozellikler:

- Derin lacivert/gece mavisi.
- Cam efektli koyu kartlar.
- Kobalt mavi CTA.
- Yuksek kontrast.

## Ilk Uygulanacak Ekran Sirasi

1. Bekleyen arac / Is emirleri listesi
2. Arac bilgi ve modul listesi
3. Modul test giris ekrani
4. Kontrol noktasi listesi
5. Madde detay ekrani
6. Fotograf / kanit ekrani
7. Genel resim cekme akisi
8. Eksikler ve uyarilar
9. Final kontrol
10. Teknik onaya gonderme

## Ilk Prototip Kurali

Once koddan bagimsiz veya mock data ile calisan tasarim prototipi yapilacak.

Backend, Supabase, gercek API veya production veri baglantisi yapilmayacak.

## Uygulama Guvenlik Notu

- Mobil uygulamaya service_role veya gizli anahtar konmayacak.
- Gercek musteri, plaka, sasi veya rapor verisi demo prototipte kullanilmayacak.
- Ekranlarda paylasilan referanslar demo veriyle temsil edilecek.

