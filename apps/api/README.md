# OTOTR API Workspace

Bu klasör OTOTR Franchise System için sunucu tarafı C# Web API uygulamalarının aktif çalışma alanıdır.

## Güncel Karar

- Üretim backend sınırı C# / ASP.NET Core Web API'dir.
- Mobil ve web uygulamaları SQL Server'a doğrudan bağlanmaz.
- İstemciler yalnızca HTTPS API adresi ve JWT oturumu üzerinden çalışır.
- Supabase üretim backend'i olarak kullanılmaz.
- Docker zorunlu değildir ve bu çalışma kapsamında kullanılmaz.
- Gerçek connection string, access token, API key veya secret değeri GitHub'a yazılmaz.

## Aktif Servisler

- `OtoTr.WhatsApp.Api`
  - WhatsApp Business Platform / Cloud API webhook'u
  - otomatik müşteri hizmetleri akışları
  - ERP randevu, paket, rapor, garanti ve destek entegrasyonu
  - SQL Server konuşma kayıtları
  - JWT korumalı canlı temsilci API'si

Ayrıntılı kurulum ve mevcut numara aktivasyon planı:

- `docs/whatsapp-customer-service.md`

## Güvenlik Kuralları

- Mobil veya tarayıcı kaynak koduna SQL Server kullanıcı adı/parolası koyma.
- Meta access token, App Secret, webhook verify token veya ERP servis anahtarını commit etme.
- Production database üzerinde otomatik destructive migration çalıştırma.
- Webhook isteklerinde `X-Hub-Signature-256` doğrulamasını kapatma.
- Müşteri hizmetleri ekranlarını JWT rol politikası olmadan yayınlama.
