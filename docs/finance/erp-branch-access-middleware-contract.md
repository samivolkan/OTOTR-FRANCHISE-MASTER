# ERP Şube Finans Erişim Middleware Sözleşmesi

ERP backend içindeki her şube operasyon rotası, işleyiciden önce `createBranchFinanceRouteGuard` ile sarılmalıdır. Bağlam `actorId`, `legalEntityId`, `dealerAccountId`, `branchId`, `capability` ve İstanbul iş tarihini içerir. Kapsam kullanıcı girdisinden değil, doğrulanmış ERP oturumu ve sunucu eşlemelerinden türetilir.

Karar servisi yanıt vermediğinde, zaman aşımında veya sözleşme dışı yanıt verdiğinde middleware fail-closed davranır ve `ACCESS_DECISION_UNAVAILABLE` üretir. `LOCKED_OVERDUE` durumunda yalnız `PAYMENT`, `INVOICE_READ`, `STATEMENT_READ`, `SUPPORT` ve `LOGOUT` yetenekleri karar motoru tarafından açık bırakılır. Middleware bu listeyi kendi içinde tekrar tanımlamaz; sunucu kararını uygular.

`SUPABASE_SERVICE_ROLE_KEY` veya servis erişim tokenı browser/mobil pakete konulamaz. Middleware yalnız ERP server/BFF katmanında çalışır. Her rota eşlemesi staging’de en az izin, ret, başka şube/IDOR, servis kesintisi ve ödeme istisnası senaryolarıyla doğrulanmalıdır.

Referans uygulama entegrasyon kanıtıdır fakat mevcut statik ERP sayfalarını tek başına güvenli hale getirmez. FIN-G05 ancak gerçek ERP server rotaları bu guard ile sarılıp staging kanıtı üretildiğinde kapanır.

`finance-erp-operation-guard-registry.mjs`, ERP sunucu framework'ünün bağlayacağı kapalı rota kaydını sağlar. Her rota önceden sabit bir capability ile ilan edilir; kayıtsız, handlersız veya mükerrer rota uygulama başlangıcında reddedilir. Actor ve şube kapsamı request body/query/header içinden alınmaz, yalnız doğrulanmış ERP oturum çözücüsünden gelir. Bu kayıt gerçek framework bağlantısının yerine geçmez; entegrasyon sırasında `assertComplete()` başarılı olmadan sunucu başlatılmamalıdır.

`finance-erp-session-scope-resolver.mjs`, bearer kullanıcı JWT'sini Supabase Auth üzerinden doğrular ve yalnız service-role erişimli `resolve_erp_session_branch_finance_scope` RPC'si ile tek aktif ERP şube eşlemesini çözer. RPC; pasif, bilinmeyen, şube yöneticisi olmayan veya sıfır/çoklu eşleşmeli kullanıcıda `null` döner. Publishable/service anahtarlarının kullanıcı tokenı gibi sunulması ve actor uyuşmazlığı fail-closed reddedilir. Service anahtarı hiçbir browser paketine eklenemez.
