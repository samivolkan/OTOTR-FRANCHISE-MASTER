(() => {
  'use strict';
  const query = new URLSearchParams(location.search);
  if (query.get('financeDemo') !== '1') return;
  const scope = Object.freeze({
    legalEntityId: '11111111-1111-4111-8111-111111111111',
    dealerAccountId: '22222222-2222-4222-8222-222222222222',
    branchId: '33333333-3333-4333-8333-333333333333',
  });
  globalThis.OTOTR_SUPABASE_CONFIG = Object.freeze({url: location.origin, publishableKey: `sb_publishable_${'d'.repeat(32)}`});
  globalThis.OTOTR_FINANCE_AUTH = Object.freeze({getAccessToken: () => `synthetic-demo-token-${'x'.repeat(32)}`});
  globalThis.OTOTR_FINANCE_CONTEXT = scope;
  document.documentElement.dataset.financeDemo = 'synthetic';
  addEventListener('DOMContentLoaded', () => {
    const badge = document.querySelector('[data-finance-environment]');
    if (badge) badge.textContent = 'SENTETİK DEMO · CANLI VERİ DEĞİL';
    const banner = document.querySelector('.finance-safety-banner');
    if (banner) banner.innerHTML = '<strong>Sentetik test ortamı.</strong> Bu sayfadaki kişiler, tutarlar ve işlemler kurgusaldır; canlı sisteme yazılmaz.';
  }, {once:true});
})();
