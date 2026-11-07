# FIN-G10 Operasyon Politikası Onayı

OTOTR vardiya sistemi kullanmaz. İlk 24 saat planı bir vardiya modülü değil; birincil/yedek sorumluların, devir zamanının ve eskalasyon sahibinin yazılı sorumluluk planıdır.

`operations-policy.json` içinde alarm ve destek kanallarının yalnız secret-manager adları, birincil/yedek nöbetçi kimliklerinin SHA-256 izleri, destek SLA belgesi, ilk 24 saat sorumluluk planı ve altı tatbikatın azami süreleri kaydedilir. Özel kanal adresi, telefon, e-posta, webhook veya secret değeri depoya yazılmaz.

Operasyon Lideri ve Finans Operasyon farklı kimliklerle imzalamadan politika `APPROVED` yapılamaz. Staging tatbikat sonucu bu politikanın hash'ini taşır ve altı süre hedefini birebir eşler; sonradan hedef gevşetilmesi FIN-G10'u geçiremez.
