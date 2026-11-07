# FIN-G09 Performans Hedef Onayı

Kanonik kayıt `performance-targets.json` dosyasıdır. Dört iş yükü için veri hacmi, eşzamanlı kullanıcı, toplam istek, P95, P99, azami hata oranı ve timeout bütçesi Platform Lideri tarafından doldurulur; ERP Teknik Lideri ayrıca onaylar.

Değerler yerel 2.000 satırlık ölçümden türetilmez. Hedeflerin tümü pozitif olmalı; P99, P95'ten küçük olamaz; timeout bütçesi P99'dan küçük olamaz; hata oranı yüzde 0–100 aralığında olmalıdır. Kimlikler farklı ve SHA-256 biçiminde olmalı, imzalı onay kanıtı depo içindeki göreli bir yolda hash ile sabitlenmelidir.

Staging performans sonucu yalnız kendi içindeki hedefleri geçmekle yetinmez. `staging-performance-evidence.json`, onaylı hedef kaydının SHA-256 değerini taşır ve her iş yükündeki hedefleri kanonik kayıtla birebir eşleştirir. Bu bağ kurulmadan FIN-G09 kapatılamaz.
