# Karar: C# WhatsApp Müşteri Hizmetleri Sınırı

Tarih: 2026-07-12

## Karar

- Mevcut OtoTR WhatsApp numarası korunacak.
- WhatsApp Business Platform / Cloud API entegrasyonu C# ASP.NET Core Web API üzerinden yapılacak.
- Web, bayi portalı ve mobil uygulamalar Meta API'ye veya SQL Server'a doğrudan bağlanmayacak.
- WhatsApp konuşmaları ve mesaj durumları SQL Server içinde `crm` şemasında tutulacak.
- Paket, şube, randevu, rapor, garanti, destek ve franchise lead verileri ERP'nin iç servislerinden dinamik alınacak.
- Statik paket/araç JSON verisi kullanılmayacak.
- Supabase ve Docker bu entegrasyonun parçası değildir.
- Canlı temsilci ekranı ERP JWT rolleriyle korunacak.
- Gerçek Meta tokenları ve database bilgileri secret store dışında tutulmayacak.
- Production database üzerinde otomatik destructive migration çalıştırılmayacak.

## Uygulama Alanları

- `apps/api/OtoTr.WhatsApp.Api`
- `apps/api/OtoTr.WhatsApp.Api.Tests`
- `apps/admin/prototype/whatsapp-customer-service`
- `docs/whatsapp-customer-service.md`

## Canlı Aktivasyon Bağımlılıkları

Meta yönetici girişi, mevcut numaraya gelen SMS/sesli OTP, Meta işletme doğrulaması ve üretim secret değerleri yalnızca hesap sahibi tarafından tamamlanabilir. Kod tarafı bu değerleri repository içine almadan ortam değişkenlerinden okuyacak şekilde hazırlanmıştır.
