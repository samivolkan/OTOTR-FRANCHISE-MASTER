# Body Paint Report Output Contract

Status date: 2026-06-03

This document defines the first customer-report output contract for `BODY_PAINT_CHECKUP`.

## Source

- Mobile source template: `apps/mobile-branch/data/inspection_schema_normalized.json`
- App model: `ReportTemplateItem`
- Answer model: `WorkOrderReportAnswer`
- Final draft payload: `FinalReportDraft.toPayload()`

## Required Output Fields

Each body paint report row must preserve:

- `workOrderId`
- `templateId`
- `groupId`
- `groupTitle`
- `itemId`
- `noktaId`
- `title`
- selected option IDs and labels
- input values, especially micron values
- technician description
- image/media references
- answered technician user ID and role
- completion timestamp

## Customer Report Grouping

Body paint output should be grouped as:

- Genel Kontroller
- Ön Bölüm
- Sol Yan
- Sağ Yan
- Arka Bölüm
- Tavan ve Camlar
- Şasi ve İç Yapı
- Diğer Kaporta Noktaları

The mobile final preview now follows this grouping for body paint answers.

## Gate Rules

The body paint section cannot be considered production-ready when:

- a required micron/input value is empty,
- a required evidence item has no media reference,
- a negative finding has no customer-friendly note,
- a negative finding has no photo evidence where media is available,
- local/offline sync is pending,
- manager/quality return is unresolved.

## PDF Direction

The future PDF should render:

- a short body paint summary,
- sectioned panel table,
- micron values beside panel status,
- negative/risky findings first,
- evidence photo references or thumbnails,
- technician and branch approval metadata.

## Current Limits

- This contract documents the mobile/final-preview output shape only.
- PDF rendering and QR/public verification are still separate work items.
- Live Supabase schema must expose `required_image_count` or an equivalent media requirement field before production parity.
