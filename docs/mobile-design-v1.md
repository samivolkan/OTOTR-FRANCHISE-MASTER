# OTOTR Mobil Tasarim V1 Hazirlik Notu

Tarih: 2026-06-03

Bu dokuman OTOTR mobil uygulamalarinin sifirdan tasarim yonunu ve ilk urun akisini netlestirmek icin olusturuldu.

## Tasarim Karari

Mevcut eski OtoRapor ekranlarindan is akisi mantigi alinacak; gorsel tasarim birebir kopyalanmayacak.

Alinacak is mantigi:

- Arac bazli is emri merkezi.
- Ekspertiz modul kartlari.
- Modul icinde kontrol noktalari.
- Fotograf ve kanit zorunluluklari.
- Eksik, uyari, tamamlandi ve sure takibi.
- Teknik onaya gondermeden once final kontrol.

Yeni OTOTR tasarim dili:

- Koyu lacivert ust alan.
- Beyaz, temiz ve operasyon odakli icerik alanlari.
- Mavi ana aksiyon butonlari.
- Yesil tamamlandi durumu.
- Turuncu uyari ve eksik durumlari.
- Kirmizi kritik durumlari.
- Kartlar sade, 8px-12px radius araliginda, hafif golgeli.
- Ekranlar teknisyen icin hizli okunabilir ve hizli dokunulabilir olacak.

## Referanslardan Cikan Yon

Eski OtoRapor ekranlari:

- Liste ve kontrol mantigi guclu.
- Fotograf cekme zorunlulugu net.
- Sure ve tamamlanan madde sayisi operasyon icin faydali.
- Gorsel dil eski, fazla kaba ve yogun.

Yeni OTOTR mockup ekranlari:

- Islerim, Is Emri Detayi, Gorev Modulleri, Fotograf & Kanit, Final Kontrol, Bildirimler ve Profil ekranlari tasarim yonu icin daha uygun.
- Plaka, is emri, arac ve teknisyen sahipligi net gorunuyor.
- Modul sahiplenme ve devam et akisina uygun.

## Ana Kullanici Rolleri

### Teknisyen / Usta

Ana hedef:

- Kendisine atanan isleri gormek.
- Modul sahiplenmek.
- Kontrol noktasini doldurmak.
- Fotograf ve kanit yuklemek.
- Eksiklerini kapatmak.
- Raporu teknik onaya gondermek.

### Bayi / Sube Operasyon

Ana hedef:

- Gunluk randevulari ve is emirlerini gormek.
- Arac kabul surecini baslatmak.
- Teknisyenlerin durumunu takip etmek.
- Eksik ve geciken isleri izlemek.
- Rapor durumunu ve teslim akisini kontrol etmek.

## Ilk Ekran Seti

### 1. Islerim / Ana Sayfa

Icerik:

- Teknisyen adi ve rol.
- Aktif is emri sayisi.
- Bugun tamamlanan is emri sayisi.
- Eksik adim sayisi.
- Is emri kartlari.
- Her kartta plaka, arac, km, durum, ilerleme, gorev sayisi, eksik sayisi.

Ana aksiyon:

- Is emri detayina git.

### 2. Is Emri Detayi

Icerik:

- Is emri no.
- Teknik giris durumu.
- Oncelik.
- Arac gorseli.
- Marka, model, yil, km, yakit, vites, randevu.
- Toplam tamamlanma.
- Gecen sure.
- Acik eksik madde.
- Modul listesi.

Ana aksiyonlar:

- Goreve basla.
- Eksikleri gor.

### 3. Gorev Modulleri

Icerik:

- Is emri ve arac ozeti.
- Toplam modul, tamamlanan modul, eksik/uyari, son guncelleme.
- Modul listesi:
  - Kaporta Kontrolu
  - Motor Kontrolu
  - Mekanik Test
  - Elektronik / OBD
  - Airbag Testi
  - Ic Mekan Kontrolu

Modul durumlari:

- Bosta.
- Sahiplenilmemis.
- Devam ediyor.
- Tamamlandi.
- Eksik var.

Ana aksiyonlar:

- Sahiplen.
- Devam et.
- Detay.
- Devralma talebi.

### 4. Kontrol Giris Ekrani

Icerik:

- Modul stepper.
- Parca listesi.
- Durum secimi.
- Not butonu.
- Mikron olcum girisi.

Kaporta ornek durumlari:

- Orijinal.
- Boyali.
- Degisen.

Mekanik / motor ornek durumlari:

- Iyi.
- Uyari.
- Kritik.
- Kontrol edilemedi.

Ana aksiyonlar:

- Taslak kaydet.
- Devam et.

### 5. Fotograf & Kanit

Icerik:

- Zorunlu kanitlar.
- Ek kanitlar.
- Fotograf, video, dosya ekleme.
- Not alani.
- Yuklendi / eksik durumlari.

Zorunlu kanit ornekleri:

- Arac on gorunum.
- Arac arka gorunum.
- Sasi etiketi.
- Boya olcum ekrani.
- Hasarli bolge fotografi.
- Km kadrani.
- Plaka resmi.

Ana aksiyonlar:

- Geri.
- Tamamla.

### 6. Final Kontrol & Tamamlama

Icerik:

- Genel tamamlanma yuzdesi.
- Teknik giris hazir durumu.
- Modul tamamlanma listesi.
- Eksik ve uyari sayisi.
- Yuklenen kanit sayisi.
- Calisma suresi.
- Teknik not.
- Musteri icin ozet.

Ana aksiyonlar:

- Taslak olarak kaydet.
- Raporu teknik onaya gonder.

## Component Sistemi

Temel componentler:

- App header.
- Compact vehicle header.
- Plate badge.
- Work order card.
- Module card.
- Status chip.
- Progress bar.
- Progress ring.
- Segmented status control.
- Evidence card.
- Metric card.
- Bottom navigation.
- Primary button.
- Secondary outline button.
- Warning action button.
- Notes input.

## Navigasyon

Teknisyen app icin alt menu:

- Ana Sayfa.
- Islerim.
- Bildirimler.
- Profil.

Bayi / sube app icin ileride genisletilecek menu:

- Panel.
- Randevular.
- Is Emirleri.
- Raporlar.
- Musteriler.

## Teknik Uygulama Notu

Ilk prototip Flutter `apps/mobile-branch` icinde hazirlanmali.

Neden:

- Mevcut Flutter uygulama testleri gecmis durumda.
- Bayi ve operasyon uygulamasi icin daha merkezi aday.
- Expo teknisyen uygulamasi referans olarak korunabilir.

Expo teknisyen uygulamasi simdilik silinmeyecek veya tasinmayacak.

## Ilk Prototip Kapsami

Kodlamaya baslarken ilk hedef:

1. Yeni tema ve component altyapisi.
2. Islerim ekran prototipi.
3. Is emri detayi ekran prototipi.
4. Gorev modulleri ekran prototipi.
5. Kontrol giris ekran prototipi.
6. Fotograf & kanit ekran prototipi.

Bu prototipte backend baglantisi zorunlu degil. Once tasarim ve akis dogrulanacak, sonra veri baglantisi yapilacak.

## Acik Kararlar

- Flutter ana mobil uygulama olarak kesinlesecek mi?
- Expo teknisyen uygulamasi ayri kalacak mi, yoksa ileride Flutter icine mi tasinacak?
- Bayi ve teknisyen uygulamasi tek app icinde role gore mi ayrilacak, yoksa iki app olarak mi kalacak?
- Ilk MVP kullanicisi teknisyen mi, bayi operasyon mu olacak?
- OTOTR logo ve marka fontlari kesin kaynak dosyalari nerede tutulacak?
