# finance-branch-access

ERP ortak yetkilendirme katmanının her şube operasyonundan önce çağırdığı servis-kimlikli, fail-closed karar ucudur. Ham kart veya müşteri verisi kabul etmez. Vadesi geçmiş royalty faturası bulunduğunda yalnız `PAYMENT`, `INVOICE_READ`, `STATEMENT_READ`, `SUPPORT` ve `LOGOUT` yetenekleri açık kalır.

Bu uç karar motorunu erişilebilir kılar; ERP rotalarının bu uca bağlandığı staging kanıtı ayrıca gereklidir.
