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
  const state = root.querySelector('[data-finance-state]');
  const environment = root.querySelector('[data-finance-environment]');
  const contextFields = {
    legalEntityId: root.querySelector('[data-finance-legal-entity]'),
    dealerAccountId: root.querySelector('[data-finance-dealer]'),
    branchId: root.querySelector('[data-finance-branch]'),
  };
  const freshness = root.querySelector('[data-finance-freshness]');
  const period = root.querySelector('[data-finance-period]');
  const kpis = Object.fromEntries([...root.querySelectorAll('[data-finance-kpi]')].map(node => [node.dataset.financeKpi, node]));
  const overdue = root.querySelector('[data-finance-overdue]');
  const connectButton = root.querySelector('[data-finance-connect]');
  const contextStatus = root.querySelector('[data-finance-context-status]');
  const statement = root.querySelector('[data-finance-statement]');
  const statementStatus = root.querySelector('[data-finance-statement-status]');
  const statementRefreshButton = root.querySelector('[data-finance-statement-refresh]');
  const statementMoreButton = root.querySelector('[data-finance-statement-more]');
  const statementState = root.querySelector('[data-finance-statement-state]');
  const statementTable = root.querySelector('[data-finance-statement-table]');
  const statementBody = root.querySelector('[data-finance-statement-body]');
  const statementCount = root.querySelector('[data-finance-statement-count]');
  const paymentDetail = root.querySelector('[data-finance-payment-detail]');
  const paymentCloseButton = root.querySelector('[data-finance-payment-close]');
  const paymentState = root.querySelector('[data-finance-payment-state]');
  const paymentContent = root.querySelector('[data-finance-payment-content]');
  const paymentAmount = root.querySelector('[data-finance-payment-amount]');
  const paymentUnallocated = root.querySelector('[data-finance-payment-unallocated]');
  const paymentStatus = root.querySelector('[data-finance-payment-status]');
  const paymentReference = root.querySelector('[data-finance-payment-reference]');
  const paymentMethod = root.querySelector('[data-finance-payment-method]');
  const paymentDate = root.querySelector('[data-finance-payment-date]');
  const paymentAllocations = root.querySelector('[data-finance-payment-allocations]');
  const accrualDetail = root.querySelector('[data-finance-accrual-detail]');
  const accrualCloseButton = root.querySelector('[data-finance-accrual-close]');
  const accrualState = root.querySelector('[data-finance-accrual-state]');
  const accrualContent = root.querySelector('[data-finance-accrual-content]');
  const accrualAmount = root.querySelector('[data-finance-accrual-amount]');
  const accrualStatus = root.querySelector('[data-finance-accrual-status]');
  const accrualJournal = root.querySelector('[data-finance-accrual-journal]');
  const accrualDate = root.querySelector('[data-finance-accrual-date]');
  const accrualSource = root.querySelector('[data-finance-accrual-source]');
  const accrualRule = root.querySelector('[data-finance-accrual-rule]');
  const accrualLines = root.querySelector('[data-finance-accrual-lines]');
  let scopeReady = false;
  let statementRowCount = 0;

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
    statement.hidden = id !== 'SCR-07';
  };

  const canonicalDecimal = value => {
    const text = String(value ?? '');
    if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(text)) throw new Error('INVALID_FINANCE_DECIMAL');
    const [whole, fraction = ''] = text.split('.');
    return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${fraction ? `,${fraction}` : ''}`;
  };

  const money = breakdown => {
    if (!breakdown || typeof breakdown !== 'object' || typeof breakdown.grossAmount !== 'string' || !/^[A-Z]{3}$/.test(breakdown.currency || '')) throw new Error('INVALID_FINANCE_MONEY');
    return `${canonicalDecimal(breakdown.grossAmount)} ${breakdown.currency}`;
  };

  const amount = (value, currency) => {
    if (typeof value !== 'string' || !/^[A-Z]{3}$/.test(currency || '')) throw new Error('INVALID_FINANCE_MONEY');
    return `${canonicalDecimal(value)} ${currency}`;
  };

  const statementStatuses = Object.freeze({OPEN:'Açık',PARTIALLY_ALLOCATED:'Kısmi tahsis',CLOSED:'Kapalı',DISPUTED:'İtirazlı',REVERSED:'Ters kayıt'});
  const paymentStatuses = Object.freeze({PENDING_VERIFICATION:'Doğrulama bekliyor',VERIFIED:'Doğrulandı',PARTIALLY_ALLOCATED:'Kısmi tahsis',ALLOCATED:'Tam tahsis',REVERSED:'Ters kayıt',REJECTED:'Reddedildi'});
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const cell = text => {
    const td = document.createElement('td');
    td.textContent = text;
    return td;
  };
  const setStatementState = (next, message) => {
    if (!['EMPTY','LOADING','READY','ERROR'].includes(next)) throw new Error('INVALID_FINANCE_STATEMENT_STATE');
    statement.dataset.state = next;
    statementState.textContent = message || ({EMPTY:'Kayıt bulunamadı.',LOADING:'Yetkili ekstre yükleniyor…',READY:'Ekstre yüklendi.',ERROR:'Ekstre yüklenemedi.'})[next];
    statementState.hidden = next === 'READY' && statementRowCount > 0;
    statementRefreshButton.disabled = !scopeReady || next === 'LOADING';
    statementStatus.disabled = !scopeReady || next === 'LOADING';
    if (next === 'LOADING') statementMoreButton.disabled = true;
  };
  const resetStatement = message => {
    statementBody.replaceChildren();
    statementRowCount = 0;
    statementTable.hidden = true;
    statementMoreButton.hidden = true;
    statementMoreButton.disabled = true;
    statementCount.textContent = '0 kayıt';
    setStatementState('EMPTY', message || 'Henüz yetkili ekstre isteği yapılmadı.');
  };
  const renderStatementPage = (payload, {append = false} = {}) => {
    if (!payload || !Array.isArray(payload.items) || typeof payload.hasMore !== 'boolean' || !(payload.nextCursor === null || payload.nextCursor === undefined || typeof payload.nextCursor === 'string')) throw new Error('INVALID_FINANCE_STATEMENT');
    const rows = payload.items.map(item => {
      if (!item || typeof item !== 'object' || !uuidPattern.test(item.recordId || '') || typeof item.recordType !== 'string' || !statementStatuses[item.status] || !/^\d{4}-\d{2}-\d{2}$/.test(item.businessDate || '') || typeof item.feeCode !== 'string' || !item.feeCode || !item.totals || item.currencyCode !== item.totals.currency || (item.paymentIds !== undefined && (!Array.isArray(item.paymentIds) || item.paymentIds.some(id => !uuidPattern.test(id))))) throw new Error('INVALID_FINANCE_STATEMENT_ITEM');
      const tr = document.createElement('tr');
      const fee = document.createElement('div'); fee.className = 'finance-statement-fee'; fee.textContent = item.feeCode;
      const source = document.createElement('small'); source.textContent = item.sourceReference || 'Kaynak referansı yok';
      const descriptor = document.createElement('td'); descriptor.append(fee, source);
      const statusCell = document.createElement('td');
      const badge = document.createElement('span'); badge.className = `finance-statement-status is-${item.status.toLowerCase()}`; badge.textContent = statementStatuses[item.status]; statusCell.appendChild(badge);
      if (item.paymentIds?.length) {
        const paymentButton = document.createElement('button'); paymentButton.type = 'button'; paymentButton.className = 'finance-inline-action'; paymentButton.dataset.financePaymentId = item.paymentIds[0]; paymentButton.textContent = item.paymentIds.length > 1 ? `Ödemeyi aç (+${item.paymentIds.length - 1})` : 'Ödemeyi aç'; statusCell.appendChild(paymentButton);
      }
      if (item.recordType === 'ACCRUAL') {
        const accrualButton = document.createElement('button'); accrualButton.type = 'button'; accrualButton.className = 'finance-inline-action'; accrualButton.dataset.financeAccrualId = item.recordId; accrualButton.textContent = 'Tahakkuk izini aç'; statusCell.appendChild(accrualButton);
      }
      tr.append(cell(new Intl.DateTimeFormat('tr-TR').format(new Date(`${item.businessDate}T00:00:00Z`))), descriptor, cell(money(item.totals)), cell(amount(item.allocatedAmount, item.currencyCode)), cell(amount(item.openAmount, item.currencyCode)), statusCell);
      return tr;
    });
    if (!append) { statementBody.replaceChildren(); statementRowCount = 0; }
    statementBody.append(...rows);
    statementRowCount += rows.length;
    statementCount.textContent = `${statementRowCount} kayıt`;
    statementTable.hidden = statementRowCount === 0;
    statementMoreButton.hidden = !payload.hasMore;
    statementMoreButton.disabled = !payload.hasMore;
    statementMoreButton.dataset.cursor = payload.nextCursor || '';
    setStatementState(statementRowCount ? 'READY' : 'EMPTY', statementRowCount ? 'Ekstre yüklendi.' : 'Seçili filtrelerde kayıt bulunamadı.');
  };
  const getStatementFilters = () => Object.freeze({status: statementStatus.value || undefined, limit: 25});

  const setPaymentState = (next, message) => {
    if (!['EMPTY','LOADING','READY','ERROR'].includes(next)) throw new Error('INVALID_FINANCE_PAYMENT_STATE');
    paymentDetail.hidden = false;
    paymentDetail.dataset.state = next;
    paymentState.hidden = next === 'READY';
    paymentState.textContent = message || ({EMPTY:'Ödeme seçilmedi.',LOADING:'Yetkili ödeme detayı yükleniyor…',READY:'Ödeme detayı yüklendi.',ERROR:'Ödeme detayı yüklenemedi.'})[next];
    paymentContent.hidden = next !== 'READY';
  };
  const resetPayment = () => {
    paymentDetail.hidden = true;
    paymentContent.hidden = true;
    paymentAllocations.replaceChildren();
  };
  const renderPaymentDetail = payload => {
    const payment = payload?.payment;
    const unallocated = payload?.unallocatedAmount;
    const allocations = payload?.allocations;
    if (!payment || !uuidPattern.test(payment.paymentId || '') || !paymentStatuses[payment.status] || !payment.amount || !unallocated || payment.amount.currency !== unallocated.currency || !Array.isArray(allocations)) throw new Error('INVALID_FINANCE_PAYMENT');
    const rows = allocations.map(allocation => {
      if (!allocation || !uuidPattern.test(allocation.allocationId || '') || !uuidPattern.test(allocation.openItemId || '') || !allocation.amount || allocation.amount.currency !== payment.amount.currency || typeof allocation.status !== 'string') throw new Error('INVALID_FINANCE_PAYMENT_ALLOCATION');
      const tr = document.createElement('tr'); tr.append(cell(allocation.allocationId),cell(allocation.openItemId),cell(amount(allocation.amount.amount,allocation.amount.currency)),cell(allocation.status)); return tr;
    });
    paymentAmount.textContent = amount(payment.amount.amount,payment.amount.currency);
    paymentUnallocated.textContent = amount(unallocated.amount,unallocated.currency);
    paymentStatus.textContent = paymentStatuses[payment.status];
    paymentReference.textContent = payment.externalReference || payment.paymentId;
    paymentMethod.textContent = payment.paymentMethodCode || 'Belirtilmedi';
    paymentDate.textContent = payment.paymentDate || 'Belirtilmedi';
    paymentAllocations.replaceChildren(...rows);
    if (!rows.length) { const tr=document.createElement('tr'); const td=cell('Henüz tahsis yok'); td.colSpan=4; tr.appendChild(td); paymentAllocations.appendChild(tr); }
    setPaymentState('READY');
  };
  const setAccrualState = (next, message) => {
    if (!['EMPTY','LOADING','READY','ERROR'].includes(next)) throw new Error('INVALID_FINANCE_ACCRUAL_STATE');
    accrualDetail.hidden = false;
    accrualDetail.dataset.state = next;
    accrualState.hidden = next === 'READY';
    accrualState.textContent = message || ({EMPTY:'Tahakkuk seçilmedi.',LOADING:'Yetkili tahakkuk izi yükleniyor…',READY:'Tahakkuk izi yüklendi.',ERROR:'Tahakkuk izi yüklenemedi.'})[next];
    accrualContent.hidden = next !== 'READY';
  };
  const resetAccrual = () => { accrualDetail.hidden = true; accrualContent.hidden = true; accrualLines.replaceChildren(); };
  const renderAccrualDetail = payload => {
    const calculation = payload?.calculation;
    const journal = payload?.journalEntry;
    const amounts = calculation?.amounts;
    const lines = journal?.lines;
    if (!uuidPattern.test(payload?.accrualId || '') || typeof payload.status !== 'string' || !amounts || typeof amounts.grossAmount !== 'string' || !/^[A-Z]{3}$/.test(amounts.currency || '') || !journal || !uuidPattern.test(journal.journalEntryId || '') || journal.currency !== amounts.currency || !Array.isArray(lines) || lines.length < 2) throw new Error('INVALID_FINANCE_ACCRUAL');
    const rows = lines.map(line => {
      if (!line || typeof line.accountCode !== 'string' || !['DEBIT','CREDIT'].includes(line.direction) || typeof line.amount !== 'string') throw new Error('INVALID_FINANCE_JOURNAL_LINE');
      const tr=document.createElement('tr'); tr.append(cell(line.accountCode),cell(line.direction === 'DEBIT' ? 'Borç' : 'Alacak'),cell(amount(line.amount,journal.currency)),cell(line.description || line.accountCode)); return tr;
    });
    accrualAmount.textContent = amount(amounts.grossAmount,amounts.currency);
    accrualStatus.textContent = `${payload.status} · ${calculation.status || 'Hesaplandı'}`;
    accrualJournal.textContent = journal.entryNumber || journal.journalEntryId;
    accrualDate.textContent = journal.postingDate || 'Belirtilmedi';
    accrualSource.textContent = journal.source?.sourceType || payload.sourceEventId || 'Belirtilmedi';
    accrualRule.textContent = payload.feeRuleId || 'Kural referansı yok';
    accrualLines.replaceChildren(...rows);
    setAccrualState('READY');
  };

  const resetAmounts = () => {
    Object.values(kpis).forEach(node => { node.textContent = '—'; });
    overdue.textContent = 'Açık kalem projectionı yok';
  };

  const setConnectionState = (next, message) => {
    const states = {
      UNCONFIGURED: ['ADAY UI · LIVE BAĞLANTI KAPALI', 'EMPTY · SOURCE UNCONFIGURED'],
      LOADING: ['LIVE · YETKİLİ İSTEK', 'LOADING · FINANCE API'],
      READY: ['LIVE · YETKİLİ VERİ', 'READY · LEDGER PROJECTION'],
      ERROR: ['LIVE · BAĞLANTI HATASI', 'ERROR · FAIL CLOSED'],
    };
    if (!states[next]) throw new Error('INVALID_FINANCE_UI_STATE');
    [environment.textContent, state.textContent] = states[next];
    description.textContent = message || (next === 'READY' ? 'Yetkili finans projectionı yüklendi.' : 'Yetkili finans API bağlantısı bekleniyor; demo veya tahmini tutar gösterilmiyor.');
    if (next !== 'READY') resetAmounts();
  };

  const renderSummary = (summary, scope) => {
    if (!summary || typeof summary !== 'object') throw new Error('INVALID_FINANCE_SUMMARY');
    for (const key of ['legalEntityId','dealerAccountId','branchId']) {
      if (summary[key] !== scope[key]) throw new Error('FINANCE_SCOPE_MISMATCH');
      contextFields[key].textContent = summary[key];
    }
    kpis.accrued.textContent = money(summary.accrued);
    kpis.invoiced.textContent = money(summary.invoiced);
    kpis.collected.textContent = money(summary.collected);
    kpis.open.textContent = money(summary.open);
    overdue.textContent = `Geciken: ${money(summary.overdue)}`;
    const calculatedAt = summary.calculatedAtUtc ? new Date(summary.calculatedAtUtc) : null;
    if (calculatedAt && Number.isNaN(calculatedAt.getTime())) throw new Error('INVALID_FINANCE_TIMESTAMP');
    freshness.textContent = calculatedAt ? calculatedAt.toLocaleString('tr-TR') : 'Bilinmiyor';
    period.textContent = summary.asOf || 'Seçilmedi';
    setConnectionState('READY');
  };

  const setScopeContext = scope => {
    const ready = scope && ['legalEntityId','dealerAccountId','branchId'].every(key => typeof scope[key] === 'string' && scope[key]);
    for (const key of ['legalEntityId','dealerAccountId','branchId']) contextFields[key].textContent = ready ? scope[key] : 'Seçilmedi';
    scopeReady = Boolean(ready);
    connectButton.disabled = !ready;
    statementRefreshButton.disabled = !ready;
    statementStatus.disabled = !ready;
    contextStatus.textContent = ready ? 'KAPSAM HAZIR · SUNUCU ONAYI GEREKİR' : 'KAPSAM BEKLENİYOR';
    contextStatus.classList.toggle('is-ready', Boolean(ready));
    resetStatement(ready ? 'Henüz yetkili ekstre isteği yapılmadı.' : 'Kapsam ve yetkili bağlantı bekleniyor.');
    if (!ready) setConnectionState('UNCONFIGURED', 'ERP kimlik köprüsünden tüzel kişi, bayi hesabı ve şube kapsamı bekleniyor.');
    return Boolean(ready);
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
  statementBody.addEventListener('click', event => {
    const button = event.target.closest('[data-finance-payment-id]');
    if (button) window.dispatchEvent(new CustomEvent('ototr:finance-payment-requested',{detail:{paymentId:button.dataset.financePaymentId}}));
    const accrualButton = event.target.closest('[data-finance-accrual-id]');
    if (accrualButton) window.dispatchEvent(new CustomEvent('ototr:finance-accrual-requested',{detail:{accrualId:accrualButton.dataset.financeAccrualId}}));
  });
  paymentCloseButton.addEventListener('click', resetPayment);
  accrualCloseButton.addEventListener('click', resetAccrual);

  selectScreen(screens[0]);
  window.OTOTRFinanceUI = Object.freeze({setConnectionState, setScopeContext, renderSummary, setStatementState, renderStatementPage, resetStatement, getStatementFilters, setPaymentState, renderPaymentDetail, resetPayment, setAccrualState, renderAccrualDetail, resetAccrual, connectButton, statementRefreshButton, statementMoreButton, statementStatus});
})();
