# Periyodik Franchise Bedeli Olay Sözleşmesi

`PERIODIC_FRANCHISE` varsayılan olarak kapalıdır. Yalnız onaylı ve sürümlü sözleşme kuralı etkin olduğunda ERP zamanlayıcısı `franchise-period.due` olayını güvenilir sunucu portuna verir.

Olay yalnız şube, sözleşme sürümü, bedel kuralı, dönem başlangıç/bitiş ve gerçekleşme zamanını taşır. Tutar, oran, KDV, müşteri veya kart verisi kabul edilmez; hesaplama aktif sözleşme kuralından sunucu tarafında çözülür.

Adaptör İstanbul iş gününü gerçekleşme zamanından üretir, onaylı kesim tarihinden önceki olayları işleme almaz ve şube kapsamı uyuşmazlığında kapalı davranır. Olay kimliği sözleşme sürümü, bedel kuralı, şube ve dönemden deterministik SHA-256 tabanlı UUID olarak üretilir; aynı dönem tekrarları aynı idempotency kimliğine gider.

Bu sözleşme ticari sıklık, tutar, oran, vade veya vergi kararı vermez. FIN-C12 ve ilgili FIN-G01/FIN-G02 onayları tamamlanmadan staging kuralı etkinleştirilemez.
