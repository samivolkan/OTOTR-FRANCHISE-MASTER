# OTOTR Pro Usta Mobil - Nihai Tasarim Onerisi

Tarih: 2026-06-04

Bu dokuman, OtoRapor referans ekranlari, kullanicinin paylastigi OTOTR tasarim alternatifleri ve Figma Make `Premium Mobile Inspection App` akisi birlikte degerlendirilerek hazirlandi.

## Nihai Tasarim Karari

Secilecek ana yon:

**OTOTR Pro Light Operation**

Bu tasarim, OtoRapor'un sahada anlasilir kontrol mantigini korur; Figma'daki premium beyaz-kurumsal ekran dili, hizli saha akisi ve teknik uzman kontrol yapisi ile birlestirir.

Kopyalanmayacak kisim:

- OtoRapor'un birebir gri/kirmizi kaba liste dili.
- Eski tip buyuk siyah ayiricili kontrol satirlari.
- Gereksiz buyuk logo/header bosluklari.

Korunacak kisim:

- Bekleyen arac karti.
- Plaka merkezli is emri akisi.
- Modul bazli test mantigi.
- Kontrol noktasi listesi.
- Mikron/olcum secimi.
- Tum noktalar iyi durumda hizli aksiyonu.
- Fotograf/kanit zorunlulugu.
- Final kontrol ve teknik onay.

## Gorsel Kimlik

### Ana Tema

- Zemin: `#F5F7FB` acik operasyon gri.
- Header: koyu lacivert `#071B3D`.
- Ana aksiyon: kobalt mavi `#0057FF`.
- Kritik/eksik: OTOTR kirmizi `#E51E2A`.
- Tamamlandi: yesil `#0F9D58`.
- Uyari: turuncu `#F97316`.
- Metin: koyu lacivert/siyah `#101828`.
- Kartlar: beyaz, hafif golge, 12-16 radius.

### Ikincil Tema

**OTOTR Dark Command** opsiyonel kalacak.

Kullanim:

- Gece vardiyasi.
- Demo/sunum.
- Premium algi gereken ekranlar.

Varsayilan tema olmamali; uzun kontrol listeleri ve fotograf inceleme icin light tema daha okunabilir.

## Ekran Akisi

Nihai ana akïs:

1. Giris
2. Ana Sayfa / Gunluk Ozet
3. Is Emirleri
4. Is Emri Detayi
5. Gorev Modulleri
6. Test Girisi / Kontrol Maddeleri
7. Madde Detayi
8. Fotograf & Kanit
9. Eksik & Uyari Merkezi
10. Final Kontrol
11. Teknik Onaya Gonderildi
12. Bildirimler / Profil

Bu akïs, Figma'daki 12 ekranli profesyonel set ile OtoRapor'un mevcut mobil is mantigini ayni hatta toplar.

## Ekran Bazli Nihai Karar

### 1. Giris

Kaynak: Figma Premium / Executive Clean.

Karar:

- Koyu lacivert marka paneli.
- Beyaz login karti.
- Telefon/e-posta, sifre, sube secimi.
- "Giris Yap" ana mavi CTA.
- Teknik destek ikincil buton.
- Gercek musteri verisi olmadan test/demo giris lokal kalacak.

### 2. Ana Sayfa / Gunluk Ozet

Kaynak: Executive Clean + Field Fast Flow.

Karar:

- Ustte teknisyen kimligi: Ahmet Usta, sube, vardiya.
- 4 metrik: Aktif is, bugun tamamlanan, eksik/uyari, teknik onayda.
- One cikan is emri karti.
- Bugunku plan listesi.
- Hizli islemler: Islerim, Eksikler, Kanitlar, Raporlar.

### 3. Is Emirleri

Kaynak: Field Fast Flow.

Karar:

- Arama ve filtre zorunlu.
- Sekmeler: Tum, Devam Eden, Randevulu, Eksik, Tamamlanan.
- Her is emri kartinda:
  - Plaka
  - Marka/model/yil
  - Km
  - Durum rozeti
  - Ilerleme yuzdesi
  - Kanit/modul/eksik sayaci
  - Son guncelleme

### 4. Is Emri Detayi

Kaynak: Technical Specialist + OtoRapor arac bilgi ekrani.

Karar:

- Plaka buyuk ve ilk bakista gorunur.
- Arac resmi veya siluet.
- Paket/yil, km, yakit, vites, randevu, sasi no.
- Ilerleme karti.
- Modul ozeti.
- Fotograf & kanit ve notlar kisayolu.
- "Devam Et" ana CTA.

### 5. Gorev Modulleri

Kaynak: OtoRapor modul listesi + Technical Specialist.

Karar:

- Moduller kart/list hibriti olacak.
- Her modulde:
  - ikon
  - durum
  - tamamlanan/toplam
  - eksik/uyari
  - sahiplenen usta
  - ilerleme cubugu
- Modul kilitleme ve sahiplenme sonraki surum icin hazir component olarak planlanacak.

### 6. Test Girisi / Kontrol Maddeleri

Kaynak: OtoRapor kontrol listesi + Field Fast Flow.

Karar:

- Ustte kompakt plaka header.
- Aktif modul basligi.
- Stepper: Giris, Kontrol, Kanit, Sonuc.
- Kontrol maddeleri sade satirlar halinde.
- Durum renkleri:
  - Orijinal / iyi: yesil
  - Boyali / uyari: turuncu
  - Degisen / kritik: kirmizi
  - Kontrol edilmedi: gri
- "Tumunu iyi isaretle" butonu kalacak, ama onay modalindan sonra bos maddelere uygulanacak.

### 7. Madde Detayi

Kaynak: Figma madde detay + Technical Specialist.

Karar:

- Madde adi ve parca konumu.
- Segmented status: Orijinal, Boyalı, Değişen, Sök-Tak, Hasarlı, Kontrol Edilmedi.
- Mikron degeri ve olcum rehberi.
- Not alani.
- Zorunlu fotograf kutusu.
- "Kaydet ve Sonraki" ana CTA.
- "Kaydet" ve "Iptal" ikincil aksiyonlar.

### 8. Fotograf & Kanit

Kaynak: OtoRapor fotograf kartlari + Figma kanit grid.

Karar:

- Zorunlu kanitlar grid/list yapisi.
- Her kanit kartinda:
  - bolge adi
  - ornek poz
  - durum: yuklendi/eksik
  - tekrar cek
  - not/etiket
- Ek kanitlar: fotograf, video, dosya.
- Kamera cekimi siyah full-screen; cekim sonrasi fotograf onay ekrani.

### 9. Eksik & Uyari Merkezi

Kaynak: Figma Issues.

Karar:

- Eksikler, uyarilar, kritikler sekmeleri.
- Her satir hangi modul/maddeye ait oldugunu gosterir.
- "Eksikleri sirayla gider" ana CTA.
- Teknik onaya gondermeden once bu ekran zorunlu kontrol noktasi olur.

### 10. Final Kontrol

Kaynak: Figma Final + Technical Specialist.

Karar:

- Buyuk tamamlanma yuzdesi.
- Zorunlu alan kontrol listesi.
- Modul ozetleri.
- Teknik not.
- Musteri ozeti.
- Eksik yoksa: "Raporu Teknik Onaya Gonder".
- Eksik varsa: "Eksikleri Tamamla".

## Component Sistemi

Ilk component set:

- `AppShell`
- `TopBar`
- `PlateHeader`
- `WorkOrderCard`
- `MetricCard`
- `StatusBadge`
- `ModuleCard`
- `InspectionRow`
- `SegmentedStatusControl`
- `EvidenceCard`
- `BottomNav`
- `PrimaryActionButton`
- `SecondaryActionButton`
- `ConfirmSheet`

## Uygulama Hissi

Hedef his:

- OtoRapor kadar sahada anlasilir.
- Figma Premium kadar modern.
- Technical Specialist kadar teknik.
- Field Fast Flow kadar hizli.
- OTOTR markasi kadar kurumsal ve guvenilir.

Kisa tarif:

**"Acik temali, plaka merkezli, modul ve kanit odakli, teknik onayla biten premium saha uygulamasi."**

## Uygulama Sirasina Gore Ilk Faz

Ilk kodlama fazi su ekrani nihai hale getirmeli:

1. Giris
2. Is emirleri / bekleyen araclar
3. Is emri detayi
4. Gorev modulleri
5. Test girisi
6. Fotograf & kanit
7. Final kontrol

Bildirimler, profil, kamera onay, eksik merkezi ikinci fazda tamamlanabilir; fakat ilk fazda rotalari ve placeholder degil, calisan temel halleri bulunmali.
