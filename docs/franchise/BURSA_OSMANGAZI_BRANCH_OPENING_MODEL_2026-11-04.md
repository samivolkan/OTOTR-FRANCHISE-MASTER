# Bursa Osmangazi franchise başvurusu ve şube açılış modeli

Tarih: 2026-11-04  
Senaryo: `FR-DEMO-20261104-OSMANGAZI`  
Durum: Sentetik pilot hazır; gerçek üretim açılışı KVKK kapısında bloklu

## 1. Başvuru hattı

1. Franchise başvurusu alınır: Bursa / Osmangazi, sentetik aday.
2. Ön inceleme tamamlanır.
3. Finans incelemesi tamamlanır.
4. Lokasyon incelemesi onaylanır.
5. Hukuk incelemesi tamamlanır.
6. Franchise sözleşmesi imzalanır.
7. Başvuru `APPROVED`, adım `ONBOARDING` olur.

Başvuru gerçek kişi verisi içermediği için yalnızca sentetik kabul testinde kullanılır.

## 2. Şube modeli

| Alan | Değer |
|---|---|
| Şube adı | OTOTR Bursa Osmangazi |
| Şube kodu | `BURSA-OSM` |
| İl/ilçe | Bursa / Osmangazi |
| Hedef açılış | 2026-12-01 |
| İlk durum | `PRE_OPENING` |
| Pilot sonucu | `PILOT_READY_PRODUCTION_BLOCKED` |

## 3. Kadro ve rol eşlemesi

| Kadro | Ürün rolü | Mevcut DB rolü | Şube kapsamı |
|---|---|---|---|
| Şube sahibi | `BRANCH_OWNER` | `BRANCH_MANAGER` | Yalnız Bursa Osmangazi |
| Şube müdürü | `BRANCH_MANAGER` | `BRANCH_MANAGER` | Yalnız Bursa Osmangazi |
| Kaporta elemanı 1 | `BODY_TECHNICIAN` | `INSPECTION_TECHNICIAN` | Atanmış görevler |
| Kaporta elemanı 2 | `BODY_TECHNICIAN` | `INSPECTION_TECHNICIAN` | Atanmış görevler |
| Sekreter | `RECEPTION_STAFF` | `BRANCH_MANAGER` | Şube içi resepsiyon/intake kapsamı |

Şube sahibi ve sekreter için mevcut veritabanı rolü geçici ürün eşlemesidir. Ayrı `BRANCH_OWNER` ve `RECEPTION_STAFF` veritabanı rolleri açılmadan yeni yetki verilmez; UI etiketi tek başına erişim sağlamaz.

## 3A. Merkez organizasyon yapısı

Şube açılışının üzerinde, alt kadroların sonradan eklenebileceği dört merkez birimi bulunur:

| Merkez birimi | İlk sorumlu pozisyonu | Sorumluluk kodu | Alt kadro örnekleri |
|---|---|---|---|
| Hukuk ve Uyum Merkezi | Sorumlu Avukat | `LEGAL_RESPONSIBLE` | Hukuk uzmanı, sözleşme/KVKK uzmanı |
| Muhasebe Merkezi | Yeminli Müşavir | `ACCOUNTING_RESPONSIBLE` | Muhasebe uzmanı, tahsilat/bordro uzmanı |
| İK Operasyon Merkezi | İK Operasyon Sorumlusu | `HR_OPERATIONS_RESPONSIBLE` | İK uzmanı, işe alım/özlük uzmanı |
| Bilgi Teknolojileri Merkezi | BT Sorumlusu | `IT_RESPONSIBLE` | Uygulama destek, altyapı ve güvenlik uzmanı |

Merkez sorumluluk kodları ürün organizasyon kodlarıdır; mevcut veritabanı rolüyle otomatik olarak yeni yetki kazanmaz. Özellikle Hukuk ve BT sorumluları için ayrı yetki rolü açılmadan `AUDITOR`/`HR_ADMIN` gibi mevcut roller doğrudan kopyalanmayacaktır. Yetki ataması yine GM onayı ve dört göz kuralıyla yapılacaktır.

Her merkez birimi `headcountLimit=1` sorumlu pozisyonuyla açılır; alt kadrolar yeni pozisyon satırları olarak eklenir. Böylece yeni birim açmadan ekip büyütülebilir.

## 4. Açılış checklist'i

- Franchise sözleşmesi
- Vergi levhası
- Ticaret sicil belgesi
- Tabela/işyeri ruhsatı
- İşyeri ve sorumluluk sigortası
- Ölçüm ekipmanı kalibrasyon planı
- İki kaporta çalışma istasyonu
- Beş personel davet ve rol ataması
- Academy eğitimlerinin tamamlanması
- Sentetik test iş emrinin uçtan uca tamamlanması

Bu modelde checklist tamamlanmış görünse de **KVKK/veri sınıflandırması onayı tamamlanmadığı için gerçek üretim açılış kapısı açılmaz**. Şube yalnızca sentetik pilot/staging için hazır kabul edilir.

## 5. Kabul komutu

```powershell
npm run test:franchise-branch-opening
```

Beklenen sonuç:

- Başvuru `APPROVED`.
- 10/10 açılış gate'i tamam.
- Kadro 5 kişi: 1 sahip, 1 müdür, 2 kaporta, 1 sekreter.
- Tüm kullanıcılar aynı şube kapsamına bağlı.
- Üretim kapısı `BLOCKED_UNTIL_PRIVACY_POLICY_APPROVED`.

## 6. Gerçek staging'e geçişten önce

1. Başvuru ve şube tablolarının staging migration geçmişiyle uzlaştırılması.
2. Gerçek olmayan altı test hesabı: franchise sahibi, şube müdürü, iki teknisyen, sekreter ve HQ onaycısı.
3. Auth → `app_users` eşlemesi ve şube kapsamı testi.
4. Sözleşme, belge, ekipman, eğitim ve ilk test iş emri kanıtlarının Storage/RLS üzerinden doğrulanması.
5. KVKK onayı olmadan gerçek personel, müşteri veya finans kaydı açılmaması.
