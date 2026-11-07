# Finans iki-rol staging UAT koşusu

Workflow: `.github/workflows/finance-staging-authenticated-uat.yml`

`ototr-staging` GitHub Environment alanında Supabase yayınlanabilir anahtarı otomatik olarak yapılandırılmıştır. Aşağıdaki dört demo rol bilgisi yetkili kişi tarafından eklenir. Değerler loga, artifact'a veya repository dosyasına yazılmaz:

- `OTOTR_FINANCE_UAT_FINANCE_EMAIL`
- `OTOTR_FINANCE_UAT_FINANCE_PASSWORD`
- `OTOTR_FINANCE_UAT_BRANCH_MANAGER_EMAIL`
- `OTOTR_FINANCE_UAT_BRANCH_MANAGER_PASSWORD`

Workflow ayrıca önceden yapılandırılmış `OTOTR_FINANCE_UAT_PUBLISHABLE_KEY` değerini kullanır.

Merkez Finans ve Şube Yöneticisi farklı Auth kullanıcıları olmalıdır. Workflow yalnız manuel `workflow_dispatch` ile çalışır; repository içeriğini değiştirme yetkisi yoktur. Parolalar Supabase Auth üzerinden kısa ömürlü oturumlara çevrilir, access tokenlar kanıta alınmaz ve koşu sonunda iki oturum için local logout çağrısı yapılır.

Başarılı koşu iki aggregate-only artifact üretir:

- `scope-b2-authenticated-uat.json`: Merkez Finans iki şubeyi, Şube Yöneticisi yalnız SCOPE-B2'yi görür; çapraz istek `403`; 600 + 400 tahsilat ve 200 iade sonrası iki rolde 96 TRY.
- `authenticated-security-uat.json`: IDOR, export kapsamı, anonim erişim, origin ve veri minimizasyonu kontrolleri.

Artifact sonucu tek başına FIN-G04/07/08 kapılarını geçirmez. Yetkili rol sahiplerinin kanıt hashlerini incelemesi, tarayıcı ekran kabulü ve imzası gerekir.

Workflow, yüklemeden önce `Test-FinanceHostedAuthenticatedUatEvidence.ps1` ile iki rolün farklılığını, şube matrisini, 600/400/200 işlem sırasını, 96 TRY bakiyeyi, çapraz şube `403` sonucunu ve güvenlik kontrollerini doğrular. Kanıt dosyaları için ayrıca `evidence.sha256` manifesti oluşturulur. İçerik doğrulaması veya hash üretimi başarısızsa artifact kabul edilmez.
