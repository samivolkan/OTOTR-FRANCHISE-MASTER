# ChatGPT Workflow

This document defines how OTOTR Franchise Master should be managed across ChatGPT/Codex conversations.

Core principle:

> Tek proje. Coklu konu sohbeti. Tek ana hafiza. Tek ana klasor. Tek ana database karari. Mevcut isleri koru. Yeni isleri duzenli ekle.

## Main Project

Main ChatGPT project name:

`OTOTR Franchise Master`

Main local source folder:

`C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER`

Permanent source files:

- `PROJECT_MEMORY.md`
- `OTOTR_PROJECT_AUDIT.md`
- `OTOTR_MIGRATION_PLAN.md`
- `AGENTS.md`
- `MIGRATION_LOG.md`
- `IMPORT_MANIFEST.md`
- `TEST_RESULTS.md`
- `docs/PROJECT_EXECUTION_TRACKER.md`
- `docs/thread-sources/README.md`

## Topic-Based Conversations

Use one main project, but separate conversations by topic:

| Chat name | Purpose |
| --- | --- |
| `00 - OTOTR Proje Hafizasi ve Ana Kararlar` | Permanent decisions, product memory, architecture decisions, scope changes. |
| `01 - OTOTR Web Sitesi` | Public website, landing pages, franchise application pages, SEO, responsive web and public deployment. |
| `02 - OTOTR Mobil Aplikasyon` | Flutter branch app, Expo technician app, mobile UX, notifications, customer/branch mobile flows. |
| `03 - OTOTR Admin Panel` | HQ ERP/CRM admin, dashboard, franchise funnel, finance, quality, academy and operations screens. |
| `04 - OTOTR Franchise / Bayi Paneli` | Branch portal, dealer daily operations, staff tasks, work orders and branch-scoped workflows. |
| `05 - OTOTR Backend API` | API contracts, service layer, server-only operations, integrations, validation and error handling. |
| `06 - OTOTR Database / Supabase / Migration` | PostgreSQL/Supabase schema, migrations, RLS, seeds, local/staging migration testing. |
| `07 - OTOTR Auth ve Yetkilendirme` | Roles, permissions, session model, RLS role matrix, admin/branch/customer separation. |
| `08 - OTOTR UI UX Tasarim` | UI system, layouts, app navigation, design QA, accessibility and responsive behavior. |
| `09 - OTOTR Bug Fix ve Testler` | Defects, regression tests, smoke tests, test strategy and QA evidence. |
| `10 - OTOTR Codex Gorevleri` | Codex task prompts, refactoring plans, terminal workflows and safe implementation batches. |
| `11 - OTOTR Yayinlama / Deployment` | Hosting, CI/CD, domains, environment split, deployment checklist and rollback. |
| `12 - OTOTR CRM / Satis ve Lead Yonetimi` | Lead, customer, appointment, sales funnel, offers, campaigns and CRM handoff. |
| `13 - OTOTR Ekspertiz Raporlari` | Report templates, PDF/output, technical approval, customer report and report data contracts. |
| `14 - OTOTR ERP / Tum Operasyon Yonetimi` | Full ERP scope, work orders, capacity, operations planning, resource tracking and process control. |
| `15 - OTOTR Bayii Portali` | Dealer portal product screens, branch dashboard, dealer users, branch reports and portal tests. |
| `16 - OTOTR Musteri Portali / Online Randevu` | Customer self-service, online appointment, service selection, quote view and report access. |
| `17 - OTOTR Finans / Muhasebe / Tahsilat` | Payment, collection, invoice, current account, franchise rights, revenue/cost and finance reports. |
| `18 - OTOTR Stok / Satin Alma / Tedarik` | Equipment, devices, consumables, suppliers, purchasing, branch inventory and service supplies. |
| `19 - OTOTR Entegrasyonlar / Bildirimler` | SMS, email, push, WhatsApp, payment, e-invoice, map, plate/VIN and external APIs. |
| `20 - OTOTR Analitik / BI / KPI` | KPI, analytics dashboard, branch comparison, sales/operations metrics and BI data models. |
| `21 - OTOTR Destek / Ticket / Cagri Merkezi` | Support tickets, call center, customer/dealer complaints, SLA and support panel workflows. |
| `22 - OTOTR Hukuk / KVKK / Sozlesmeler` | Legal scope, KVKK, consent, dealer contracts, report legal terms and legal risk workflows. |
| `23 - OTOTR Kalite / Denetim / Itibar` | Quality audits, findings, reputation, Google reviews, complaint root cause and corrective actions. |
| `24 - OTOTR Academy / Egitim / Sertifika` | Academy content, role-based paths, exams, certificates, permission locks and retraining triggers. |
| `25 - OTOTR IK / Personel / Yetkinlik` | HR, personnel, role competence, shift, onboarding/offboarding, performance and authority links. |
| `26 - OTOTR Dokuman / Evrak / Duyuru Yonetimi` | Branch documents, document archive, announcements, read tracking, versioning and approvals. |
| `27 - OTOTR Garanti / Sigorta / Itiraz Yonetimi` | Warranty, insured expertise model, objections, guarantee certificate and customer scope summary. |

## What Stays Together

Keep these in the same conversation:

- A small feature and its tests.
- A database decision and its migration review, when no app code is changed.
- One app surface refactor, such as only `apps/admin/prototype` or only `apps/mobile-branch`.
- A bug reproduction and its fix.

## What Moves To A Separate Conversation

Move these to a separate topic conversation:

- Database schema changes that affect web/mobile/admin.
- Auth/RLS changes.
- Production deployment.
- Payment, external API or secret handling.
- Major UI redesign.
- Migration chain construction.
- App-to-app architecture decisions.

## Standard Conversation Starter

Use this for any topic:

```text
Bu sohbet OTOTR Franchise Master projesinin bir alt calisma alanidir.

Ana kaynaklar:
- PROJECT_MEMORY.md
- OTOTR_PROJECT_AUDIT.md
- OTOTR_MIGRATION_PLAN.md
- AGENTS.md

Bu sohbette yalnizca su konu uzerinde calisacagiz:
[KONU ADI]

Lutfen mevcut proje hafizasini dikkate al.
Daha once alinmis mimari, database, franchise modeli ve is kurallarini bozma.
Yeni oneriler sunarken mevcut yapiyi koru.
Riskli degisikliklerde once uyar.
Kod, database veya klasor yapisi onerirken geri alinabilir adimlar ver.
Bu sohbet sonunda PROJECT_MEMORY.md dosyasina eklenmesi gereken kararlari ayrica listele.
```

## Web Site Starter

```text
Bu sohbet OTOTR Franchise Master projesinin web sitesi calisma alanidir.

Ana kaynaklar:
- PROJECT_MEMORY.md
- OTOTR_PROJECT_AUDIT.md
- OTOTR_MIGRATION_PLAN.md
- AGENTS.md

Bu sohbette yalnizca OTOTR web sitesi uzerinde calisacagiz:
- ana sayfa
- kurumsal sayfalar
- franchise basvuru sayfasi
- arac listeleme sayfalari
- SEO
- responsive tasarim
- web deployment

Mobil uygulama, backend veya database kararlarini degistirme.
Bu alanlarda ihtiyac dogarsa sadece not dus ve ayri sohbette ele alinmasi gerektigini belirt.
Bu sohbet sonunda PROJECT_MEMORY.md dosyasina eklenecek kalici kararlari listele.
```

## Mobile App Starter

```text
Bu sohbet OTOTR Franchise Master projesinin mobil aplikasyon calisma alanidir.

Ana kaynaklar:
- PROJECT_MEMORY.md
- OTOTR_PROJECT_AUDIT.md
- OTOTR_MIGRATION_PLAN.md
- AGENTS.md

Bu sohbette yalnizca OTOTR mobil uygulamasi uzerinde calisacagiz:
- musteri mobil deneyimi
- bayi/franchise mobil kullanimi
- giris/kayit
- bildirimler
- arac goruntuleme
- basvuru akislari
- mobil UI/UX

Mevcut database ve backend kararlarini bozma.
Yeni ihtiyac cikarsa bunu API veya Database sohbetine aktarilacak karar olarak not et.
Bu sohbet sonunda PROJECT_MEMORY.md dosyasina eklenecek kalici kararlari listele.
```

## Database Starter

```text
Bu sohbet OTOTR Franchise Master projesinin database, Supabase ve migration calisma alanidir.

Ana kaynaklar:
- PROJECT_MEMORY.md
- OTOTR_PROJECT_AUDIT.md
- OTOTR_MIGRATION_PLAN.md
- AGENTS.md

Bu sohbette yalnizca database, tablo iliskileri, migration, RLS, Supabase, auth ve veri guvenligi uzerinde calisacagiz.
Production database uzerinde destructive islem onermeden once acik uyari ver.
Migration onerilerinde geri alma stratejisi yaz.
Web, mobil veya admin panel kodlarini degistirme.
Bu sohbet sonunda PROJECT_MEMORY.md dosyasina eklenecek kalici kararlari listele.
```

## Codex Tasks Starter

```text
Bu sohbet OTOTR Franchise Master projesinin Codex gorevleri calisma alanidir.

Ana kaynaklar:
- PROJECT_MEMORY.md
- OTOTR_PROJECT_AUDIT.md
- OTOTR_MIGRATION_PLAN.md
- AGENTS.md

Bu sohbette Codex'e verilecek gorevleri, promptlari, klasor duzenleme adimlarini, refactoring planlarini ve terminal komutlarini hazirlayacagiz.
Kod veya database degisikliginde once riskleri cikar.
Her gorevi kucuk, geri alinabilir ve test edilebilir parcalara bol.
Bu sohbet sonunda PROJECT_MEMORY.md dosyasina eklenecek kalici kararlari listele.
```

## End-of-Conversation Memory Update

At the end of each topic conversation, summarize:

- decisions made,
- files changed,
- tests run,
- risks discovered,
- open questions,
- decisions that should be added to `PROJECT_MEMORY.md`.

Do not paste full logs into `PROJECT_MEMORY.md`; add concise permanent decisions only.

## Cross-Topic Rules

- Web work must not change database/auth without a database/auth review.
- Mobile work must not introduce backend contracts without API/database notes.
- Admin panel work must preserve franchise, branch, CRM, finance and quality business rules.
- Database work must not run production/destructive migrations.
- Codex task conversations must keep tasks small, reversible and testable.
