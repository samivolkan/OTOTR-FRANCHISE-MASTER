# GM İK rol ve yetki matrisi kabulü

Tarih: 2026-11-04  
Test: `npm run test:gm-hr`  
Veri: yalnız PGlite üzerinde sentetik kullanıcılar ve sentetik HR kayıtları

## Test hesapları ve beklenen kapsam

| Test hesabı | Uygulama rolü | İK rolü | Beklenen kapsam |
|---|---|---|---|
| GM | `GENERAL_MANAGER` | HQ yetkisi | İK rol talebi açma/onaylama, tüm işveren kapsamı, gölge bordro onayı |
| İK uzmanı | `CRM_AGENT` | `HR_ADMIN` | Aday/çalışan, onboarding/offboarding ve merkez İK işlemleri |
| Şube İK | `BRANCH_MANAGER` | `BRANCH_HR_MANAGER` | Kendi şubesi ve atanmış hedef şube işlemleri |
| Bordro | `FINANCE` | `PAYROLL_OPERATOR` | Puantaj kilidi ve gölge bordro hazırlama |
| Denetçi | `AUDITOR` | `AUDITOR` | Salt-okunur dashboard/context; aday, bordro ve rol mutasyonu yok |
| Çalışan | `INSPECTION_TECHNICIAN` | `EMPLOYEE_SELF_SERVICE` | Kendi izin, puantaj ve yetkili belge görünümü |

## Kabul sonuçları

- Altı ayrı sentetik hesapla `hr_my_context()` rol ve İK rolü eşleşmesi doğrulandı.
- Altı hesabın `hr_dashboard()` okuması doğrulandı.
- Denetçinin aday oluşturma mutasyonu reddedildi.
- Çalışanın gölge bordro dönemi oluşturma mutasyonu reddedildi.
- Çalışanın izin talebi kabul edildi; yönetici ve İK bağımsız onay zinciri korundu.
- Bordro kullanıcısının puantaj kilidi doğrulandı; onaylayan kullanıcının kilitlemesi reddedildi.
- GM rol talebi onayladı; self-service ve denetçi rolleri ayrı atama kayıtlarıyla etkinleştirildi.
- Doğrudan HR tablo erişimi, anonim RPC ve gerçek kişi/sensitive belge yazımı önceki kabul testlerindeki gibi reddedildi.

## Sınır

Bu sonuç, hosted Supabase staging üzerinde gerçek Auth hesaplarıyla yapılmış bir üretim testi değildir. Migration henüz uzak veritabanına uygulanmadığı için hesaplar PGlite sentetik fixture'larıdır. Staging migration uygulandıktan sonra aynı matris, altı ayrı staging Auth hesabıyla tekrar çalıştırılmalıdır.
