(() => {
  'use strict';

  const screens = [
    ['SCR-01','Genel Merkez Finans Özeti',['Dönem filtresi','Tahakkuk / fatura / tahsilat / açık bakiye','Bedel ailesi kırılımı','Bayi sıralaması','İstisna ve onaylar','Veri tazeliği'],['Bayi detayını aç','İstisna kuyruğunu aç','Yetkili özeti dışa aktar']],
    ['SCR-02','Bayi Finans Özeti',['Kapsam ve sözleşme','Operasyon geliri','Bedel kırılımı','Ödenen / açık / geciken','Operasyonel katkı','Şube kırılımı'],['Ekstreyi aç','Açık kalemleri aç','İtiraz başlat','Ekstre indir']],
    ['SCR-03','Sözleşme ve Kural Sürümleri',['Sözleşme listesi','Sürüm zaman çizgisi','Kural aileleri','Geçerlilik','Onay kanıtı','Etki önizleme'],['Taslak oluştur','Onaya gönder','Onayla / reddet','Sürüm karşılaştır']],
    ['SCR-04','Bedel Kataloğu ve Kural Simülasyonu',['Bedel ailesi','Kapsam ve tetikleyici','Matrah ve hesaplama','Vergi ve vade','İptal / iade','Muhasebe eşlemesi'],['Taslağı düzenle','Sentetik simülasyon','Onaya gönder','Yayınla']],
    ['SCR-05','Tahakkuklar',['Filtreler','Kaynak olay','Bedel ailesi','Net / KDV / brüt','Fatura ve açık kalem durumu','Dönem ve istisna'],['Detayı aç','Ters kayıt talep et','İtiraz başlat','Yetkili seçimi dışa aktar']],
    ['SCR-06','Tahakkuk ve Hesaplama İzi',['Kaynak olay','Sözleşme ve kural sürümü','Matrah bileşenleri','Hesaplama adımları','Defter ve açık kalem','Ters kayıt zinciri'],['Açıklamayı indir','Kaynağı aç','Sözleşme sürümünü aç','İtiraz başlat']],
    ['SCR-07','Bayi Ekstresi ve Açık Kalemler',['Açılış bakiyesi','Hareket ve yürüyen bakiye','Açık kalemler','Yaşlandırma','Ödeme ve tahsisler','Kapanış bakiyesi'],['Filtrele','CSV indir','Ekstre indir','İtiraz başlat']],
    ['SCR-08','Ödeme ve Tahsis',['Ödeme listesi','Doğrulama kanıtı','Dağıtılmamış bakiye','Aday açık kalemler','Tahsis geçmişi','Ters kayıt zinciri'],['Ödeme kaydet','Doğrula','Tahsis et','Tahsis geri al']],
    ['SCR-09','Sorgu ve Harici Hizmet Kullanımları',['Kullanım durumu','Sağlayıcı maliyeti','Bayi fiyatı','Ücretsiz hak','Teknik tekrar','Marj ve tahakkuk bağlantısı'],['Kullanımı aç','Tahakkuku aç','İstisna oluştur','Yetkili seçimi dışa aktar']],
    ['SCR-10','Masraf Yansıtma ve Paylaştırma',['Kaynak belge','Sözleşmesel dayanak','Dağıtım yöntemi','Bayi payları','Yuvarlama farkı','Onay ve tahakkuk'],['Taslak oluştur','Belge ekle','Önizleme hesapla','Onayla ve kaydet','Ters kayıt']],
    ['SCR-11','İtiraz Yönetimi',['Bağlı finans satırı','İtiraz tutarı','Gerekçe ve kanıt','SLA','Sahiplik','Karar ve finansal sonuç'],['Gönder','Kanıt iste','Ata','Kabul / kısmi kabul / ret']],
    ['SCR-12','Dönem, Mutabakat ve Kilit',['Dönem durumu','Kaynak dondurma','Kapanış ön kontrolleri','Bayi mutabakatı','İstisnalar','Onay ve yeniden açma'],['Ön kontrol çalıştır','Mutabakat gönder','Kilitle','Yeniden açma talep et']],
    ['SCR-13','Faturalama ve Muhasebe Export Paketleri',['Uygun tahakkuklar','Paket kontrol toplamları','Eşleme sürümü','Export durumu','Harici fatura geri bildirimi','Mutabakat farkı'],['Paket oluştur','Doğrula','Export et','Idempotent tekrar','Geri bildirim kaydet']],
    ['SCR-14','Entegrasyon İzleme ve Hata Kuyruğu',['Inbox / outbox','Gecikme','Retry','Dead-letter','Şema sürümü','Correlation izi'],['Maskeli payload incele','Tekrar dene','Çöz','Ata','Maskeli tanı indir']],
    ['SCR-15','Onay İş Listesi',['Risk seviyesi','Tutar','Talep sahibi','Kapsam','Kanıt','Politika sürümü','Karar geçmişi'],['Onayla','Reddet','Kanıt iste','Kaynak kaydı aç']],
    ['SCR-16','Audit ve Değişiklik İzi',['Aktör','Aksiyon','Varlık','Zaman','Gerekçe','Correlation','Bütünlük zinciri'],['Filtrele','Correlation izini aç','Yetkili seçimi dışa aktar']],
    ['SCR-17','Müşteri İadeleri ve Royalty Ters Kayıtları',['İade olayı','Orijinal tahsilat','Orijinal royalty tahakkuku','İade edilen KDV dahil matrah','Ters hesaplama','Dönem provenance'],['Orijinal tahsilatı aç','Orijinal tahakkuku aç','Ters kaydı aç','İtiraz başlat']]
  ];

  const root = document.getElementById('financePage');
  if (!root) return;
  const nav = root.querySelector('[data-finance-screen-nav]');
  const code = root.querySelector('[data-finance-screen-code]');
  const title = root.querySelector('[data-finance-screen-title]');
  const description = root.querySelector('[data-finance-screen-description]');
  const sections = root.querySelector('[data-finance-sections]');
  const actions = root.querySelector('[data-finance-actions]');

  const renderList = (target, items) => {
    target.replaceChildren(...items.map(item => {
      const li = document.createElement('li');
      li.textContent = item;
      return li;
    }));
  };

  const selectScreen = screen => {
    const [id, name, screenSections, screenActions] = screen;
    nav.querySelectorAll('.finance-screen-button').forEach(button => {
      const selected = button.dataset.financeScreen === id;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-current', selected ? 'page' : 'false');
    });
    code.textContent = id;
    title.textContent = name;
    description.textContent = 'Yetkili finans API bağlantısı bekleniyor; demo veya tahmini tutar gösterilmiyor.';
    renderList(sections, screenSections);
    renderList(actions, screenActions);
  };

  screens.forEach(screen => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'finance-screen-button';
    button.dataset.financeScreen = screen[0];
    const id = document.createElement('span');
    id.textContent = screen[0];
    const label = document.createElement('b');
    label.textContent = screen[1];
    button.append(id, label);
    button.addEventListener('click', () => selectScreen(screen));
    nav.appendChild(button);
  });

  selectScreen(screens[0]);
})();
