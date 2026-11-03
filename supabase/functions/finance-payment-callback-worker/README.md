# finance-payment-callback-worker

Ödeme kuruluşundan gelen tam GM faturası kart tahsilatını HMAC-SHA256 ile doğrular. Kart numarası, CVV veya müşteri verisi kabul etmez. Tek veritabanı transaction'ında ödeme kaydı, doğrulama, fatura açık kalem tahsisi ve şube erişim durumunun yeniden değerlendirilmesini yürütür.

Gerçek sağlayıcı adaptörü staging ortamında bu kanonik sözleşmeye çevrilmelidir. Callback secret ve sistem aktörleri yalnız secret manager'da tutulur.
