# OTOTR Project Execution Tracker

Status date: 2026-06-04

This is the central execution list for all OTOTR topic conversations. Remove or mark items as done only after implementation and validation evidence exists in `TEST_RESULTS.md`, a topic summary, or a clearly named artifact.

Legend:

- `[ ]` Open
- `[x]` Done
- `[~]` Blocked / waiting

## Current Main Priority

**Tek bayi uctan uca MVP akisi**

Target flow:

1. Secretary opens first customer/work order from dealer portal.
2. Work order is assigned to a technician.
3. Technician sees the work order in mobile/tablet flow.
4. Technician completes inspection entries and evidence.
5. Dealer portal sees the updated status.
6. Report preview/print output is generated for the customer.

Primary topics for this milestone:

- `15 - OTOTR Bayii Portali`
- `02 - OTOTR Mobil Aplikasyon`
- `13 - OTOTR Ekspertiz Raporlari`
- `09 - OTOTR Bug Fix ve Testler`

Keep out of this milestone unless required:

- full ERP expansion,
- customer complaints,
- legal/KVKK full wording,
- Academy enforcement,
- finance, stock and advanced integrations.

## Progress Snapshot

- [x] Master folder and source archive established.
- [x] Topic conversations created from `00` through `27`.
- [x] Public web staging/live preview QA completed.
- [x] Backend public API read-only smoke completed.
- [x] Local Supabase full stack and RLS role smoke completed.
- [x] Mobile branch app baseline analyze/test passed.
- [x] Expo technician app baseline typecheck passed.
- [x] Admin prototype baseline smoke tests passed.
- [~] Previous ERP MVP slice was withdrawn on 2026-06-04 and must not be treated as the active dealer portal MVP.

## Remaining Work By Topic

### 00 - OTOTR Proje Hafizasi ve Ana Kararlar

- [ ] Keep this tracker updated after every completed topic batch.
- [ ] Record permanent product decisions in `PROJECT_MEMORY.md` only after validation.
- [ ] Maintain a short weekly project status summary with completed, open and blocked items.
- [ ] Keep old folders as reference only; no delete/move operations.

### 01 - OTOTR Web Sitesi

Current status: public web staging/live preview QA has passed. Remaining work is polish and release readiness.

- [ ] Lock final public website copy, SEO title/description and brand language.
- [ ] Recheck live preview after any visual or form change.
- [ ] Prepare final deployment checklist and rollback note with `11 - Deployment`.

### 02 - OTOTR Mobil Aplikasyon

Current status: baseline Flutter analyze/test and Expo typecheck passed. Main remaining work is E2E dealer-work-order integration.

- [ ] Decide which mobile app handles the first technician MVP: Flutter branch app or Expo technician app.
- [ ] Show assigned dealer work order in technician mobile/tablet screen.
- [ ] Implement or confirm technician task entry for required inspection modules.
- [ ] Sync technician completion status back to dealer portal data/state.
- [ ] Run mobile validation after changes: Flutter analyze/test or Expo typecheck, depending on chosen app.

### 03 - OTOTR Admin Panel

Current status: admin prototype smoke tests pass. Active dealer portal work should not depend on the full admin ERP.

- [ ] Keep admin prototype smoke tests passing after dealer portal changes.
- [ ] Avoid adding full ERP complexity into this phase.
- [ ] Preserve admin prototype as reference for dashboard/report/quality ideas.

### 04 - OTOTR Franchise / Bayi Paneli

Current status: franchise/business model exists as source material. First MVP should use one existing demo branch only.

- [ ] Define the single demo branch profile used in the MVP.
- [ ] Keep franchise onboarding/contract complexity out of first work-order flow.
- [ ] Document which franchise concepts are postponed to later phases.

### 05 - OTOTR Backend API

Current status: public API and mobile/bayi API contracts have progressed. Main remaining work is dealer-work-order integration support.

- [ ] Confirm the minimal API/RPC contract for creating and assigning a dealer work order.
- [ ] Confirm the minimal API/RPC contract for technician task completion and report readiness.
- [ ] Add backend smoke checks only if the MVP uses live Supabase/API rather than local prototype state.

### 06 - OTOTR Database / Supabase / Migration

Current status: local Supabase stack, reviewed migrations, contract verification and RLS role smoke passed.

- [ ] Confirm the tables/RPCs needed for the single dealer work-order MVP.
- [ ] Add deterministic seed data for one branch, two secretaries, technicians, one customer, one vehicle and one work order.
- [ ] Re-run local DB reset, expected contract verification and RLS checklist after any migration change.

### 07 - OTOTR Auth ve Yetkilendirme

Current status: auth contracts and local role smoke passed.

- [ ] Confirm secretary, branch manager and technician permissions for the first MVP.
- [ ] Ensure technician can only see assigned same-branch work orders.
- [ ] Re-run role-session smoke when MVP data access changes.

### 08 - OTOTR UI UX Tasarim

- [ ] Define the dealer portal MVP screen layout: customer intake, work order queue, technician assignment, report status.
- [ ] Define the mobile technician MVP layout: assigned job, module checklist, evidence, submit.
- [ ] Verify desktop/mobile no-overflow screenshots after UI changes.

### 09 - OTOTR Bug Fix ve Testler

- [ ] Create the first E2E MVP smoke script: customer intake -> assign -> technician completion -> report ready.
- [ ] Keep existing admin, VIN and demo-data tests passing.
- [ ] Keep mobile app validation passing after integration.
- [ ] Add a final MVP validation entry to `TEST_RESULTS.md`.

### 10 - OTOTR Codex Gorevleri

- [ ] Convert this tracker into small implementation batches before editing code.
- [ ] Keep each batch tied to one topic and one validation command set.
- [ ] Update this tracker when items are completed or deliberately postponed.

### 11 - OTOTR Yayinlama / Deployment

- [ ] Define MVP preview route or deployment target for the dealer portal demo.
- [ ] Prepare env checklist for local/staging/prod without exposing secrets.
- [ ] Do not publish production until the single dealer MVP test passes.

### 12 - OTOTR CRM / Satis ve Lead Yonetimi

- [ ] Keep CRM minimal for first MVP: customer record and appointment/work-order source only.
- [ ] Decide whether first customer comes from direct intake or converted appointment.
- [ ] Postpone full sales funnel, campaigns and lead scoring.

### 13 - OTOTR Ekspertiz Raporlari

- [ ] Select one report template for the first dealer MVP.
- [ ] Map technician entries to report sections.
- [ ] Add missing-field gate before report print.
- [ ] Build or verify report preview/print/PDF output.
- [ ] Validate report print path from dealer portal after technician completion.

### 14 - OTOTR ERP / Tum Operasyon Yonetimi

Current status: broad ERP planning exists; previous ERP MVP slice was withdrawn.

- [ ] Keep ERP scope limited to the single dealer flow until MVP is proven.
- [ ] Do not reintroduce the withdrawn MVP panel as active work.
- [ ] Use ERP contracts only where they support dealer work order, technician task and report readiness.

### 15 - OTOTR Bayii Portali

This is the primary active topic.

- [ ] Rebuild the active dealer portal MVP around the real target flow, not the withdrawn ERP panel.
- [ ] Add secretary customer intake screen or flow.
- [ ] Add first work-order creation from customer and vehicle data.
- [ ] Add technician assignment from the dealer portal.
- [ ] Add work-order status board: waiting, assigned, in progress, report ready, delivered.
- [ ] Show technician completion reflected in dealer portal.
- [ ] Add report preview/print entry point.
- [ ] Run dealer portal desktop and mobile smoke tests.

### 16 - OTOTR Musteri Portali / Online Randevu

- [ ] Keep customer portal out of first MVP unless appointment conversion is needed.
- [ ] Confirm one future customer-facing report verification path.
- [ ] Postpone full customer self-service portal.

### 17 - OTOTR Finans / Muhasebe / Tahsilat

- [ ] Use only a simple payment/readiness status in first MVP if required.
- [ ] Postpone invoice, collection, current account and royalty flows.

### 18 - OTOTR Stok / Satin Alma / Tedarik

- [ ] Postpone inventory/purchasing until dealer work-order MVP is stable.
- [ ] Keep equipment/device references as optional report or branch metadata only.

### 19 - OTOTR Entegrasyonlar / Bildirimler

- [ ] Postpone real SMS, WhatsApp, payment and e-invoice integrations.
- [ ] Use local UI notification/status labels for MVP.
- [ ] Document required integration events after the dealer MVP passes.

### 20 - OTOTR Analitik / BI / KPI

- [ ] Keep KPI limited to work-order count/status in first MVP.
- [ ] Postpone BI dashboards until live operational data exists.

### 21 - OTOTR Destek / Ticket / Cagri Merkezi

- [ ] Postpone customer complaint/ticket workflows until after first report delivery flow.
- [ ] Keep complaint links only as report/legal future notes.

### 22 - OTOTR Hukuk / KVKK / Sozlesmeler

- [ ] Use only minimal consent/scope placeholder for first MVP.
- [ ] Postpone final legal wording and contract workflow until product flow is stable.

### 23 - OTOTR Kalite / Denetim / Itibar

- [ ] Use only basic report completeness gate in first MVP.
- [ ] Postpone audits, findings, reputation and Google review workflows.

### 24 - OTOTR Academy / Egitim / Sertifika

- [ ] Postpone Academy enforcement until technician workflow is stable.
- [ ] Keep Academy source files as reference for later technician certification rules.

### 25 - OTOTR IK / Personel / Yetkinlik

- [ ] Use only demo users and roles for first MVP.
- [ ] Postpone full HR, shift, onboarding and offboarding workflows.

### 26 - OTOTR Dokuman / Evrak / Duyuru Yonetimi

- [ ] Postpone document archive and announcement workflows.
- [ ] Keep report output and branch source documents separate.

### 27 - OTOTR Garanti / Sigorta / Itiraz Yonetimi

- [ ] Use only optional guarantee/scope placeholder in first report if required.
- [ ] Postpone warranty, insured model and dispute workflow until after report MVP.

## Immediate Execution Order

1. `15 - Bayii Portali`: rebuild first work-order dealer portal flow.
2. `02 - Mobil Aplikasyon`: make assigned work order visible and completable by technician.
3. `13 - Raporlar`: generate report preview/print from technician entries.
4. `09 - Testler`: create and run E2E smoke.
5. `06/07`: touch database/auth only if the MVP needs schema/RLS changes.

## Open Item Count

Open items in this tracker: 85.
