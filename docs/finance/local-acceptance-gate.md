# Yerel Finans Kabul Kapısı

`scripts/Test-FinanceLocalAcceptance.ps1`, finans migration paketi veya uygulama portları değiştikten sonra çalıştırılması gereken tek yerel kabul komutudur.

Kapsam:

- migration manifest bütünlüğü;
- temiz yerel PostgreSQL replay sonrası şema, RLS, grant ve ERP kimlik köprüsü kontrolleri;
- KDV dahil kısmi tahsilata bağlı royalty ve oransal iade;
- giriş franchise, sorgu, harici hizmet ve opsiyonel hizmet tahakkukları;
- masraf yansıtma, dağıtım, onay, muhasebeleştirme ve ters kayıt;
- itiraz üzerinden maker-checker kredi düzeltmesi;
- ödeme oluşturma, doğrulama, kısmi mahsup ve mahsup iptali.
- kilitli dönem faturalama paketi, harici fatura callback mutabakatı ve muhasebe aktarım paketi.
- kaynak snapshot dondurma, eksik işte bekleme ve dönem hesaplama finalizasyonu;
- maker-checker dönem kapanışı, mutabakat kilidi ve belgeye dayalı kontrollü yeniden açma.
- bayi finans özeti, cursor tabanlı hesap ekstresi ve çapraz bayi kapsam izolasyonu.

Çalıştırma:

```powershell
pwsh -NoProfile -File scripts/Test-FinanceLocalAcceptance.ps1
```

Kapı yalnızca tüm alt kontroller geçtiğinde başarılıdır. Bütün E2E testleri sentetik veri kullanır, PostgreSQL transaction içinde çalışır ve `ROLLBACK` sonrası kalıntı olmadığını ayrıca sorgular.

Bu kapının geçmesi staging, UAT veya pre-production kabulü anlamına gelmez. Kabul paketi pre-production kapı belgesini de her çalıştırmada doğrular ve eksik kurumsal kanıt varken kararı `NO_GO` tutar. Ticari oranlar, vergi kararları, vadeler, gerçek ERP adaptörleri, kullanıcı imzaları ve operasyon tatbikatları ayrıca tamamlanmalıdır.
