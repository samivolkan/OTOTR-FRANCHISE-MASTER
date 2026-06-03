# Mobile Report Design V1

Status date: 2026-06-03

This document defines the first mobile design direction for building the OTOTR branch app around the imported Otorapor inspection point catalog.

## Source Catalog

The mobile report flow must use the imported Otorapor-derived catalog as the source of truth:

- Flutter asset: `apps/mobile-branch/data/inspection_schema_normalized.json`
- Loader: `apps/mobile-branch/lib/data/services/report_template_asset_loader.dart`
- Repository: `AssetReportTemplateRepository`
- Current catalog facts:
  - 12 report groups
  - 265 inspection points
  - 1253 options
  - source report ID: `2614045`

The app must not hardcode mechanic, body paint, OBD or other inspection point lists in screens. Screens should render groups, points, options, input fields and media requirements from the catalog.

## Group Coverage

| Order | Code | Display name | Items | Options | Inputs | Primary owner |
| --- | --- | --- | ---: | ---: | ---: | --- |
| 1 | `WORK_ORDER_ACCEPTANCE` | Is Emri / Arac Kabul | 5 | 9 | 0 | Sekreterya |
| 2 | `VEHICLE_FILE_CHECK` | Arac Dosya Ekspertizi | 9 | 12 | 2 | Sekreterya |
| 3 | `MOTOR_CHECKUP` | Motor Ekspertiz ve Check-up | 37 | 138 | 2 | Mekanik Usta |
| 4 | `MECHANICAL_CHECKUP` | Alt / On / Mekanik Ekspertiz | 40 | 179 | 0 | Mekanik Usta |
| 5 | `BODY_PAINT_CHECKUP` | Kaporta ve Boya Ekspertizi | 59 | 540 | 14 | Kaporta Ustasi |
| 6 | `OBD_ECU_TEST` | OBD / Beyin Testi | 10 | 26 | 0 | OBD Ustasi |
| 7 | `BRAKE_SUSPENSION_TEST` | Fren / Suspansiyon Testi | 9 | 23 | 0 | Test Operatoru |
| 8 | `DYNO_ROAD_TEST` | Dyno / Yol Testi | 5 | 12 | 1 | Test Operatoru |
| 9 | `EXTERIOR_CONDITION` | Genel Kondisyon / Dis Ekspertiz | 35 | 122 | 8 | Kaporta Ustasi |
| 10 | `INTERIOR_CHECKUP` | Ic Ekspertiz | 46 | 156 | 0 | Kaporta Ustasi |
| 11 | `AIRBAG_CHECK` | Airbag Kontrol Testi | 9 | 33 | 1 | OBD Ustasi |
| 12 | `HEAD_GASKET_LEAK_TEST` | Conta Kacak Testi | 1 | 3 | 0 | Mekanik Usta |

Note: Turkish display names above are ASCII-normalized in this document only. The JSON source keeps Turkish labels.

## Mobile Flow

1. Vehicle intake creates or opens a work order.
2. Secretary-owned groups capture customer, vehicle, consent and document readiness.
3. Technician work screen shows only the groups relevant to the current user's role and assigned tasks.
4. Group detail renders every inspection point from the catalog.
5. Each point form stores:
   - selected option IDs and labels,
   - measurement/input values,
   - technician description,
   - photo or media references when required,
   - technician ID, role and timestamps.
6. Group progress is calculated from completed point answers.
7. Final report preview combines all completed answers with missing point warnings.
8. Final report can be locked only when required groups, evidence and gate checks pass.

## Screen Design Principles

- The first screen for a technician should be a work queue, not a static module list.
- Inside a work order, groups should be shown as operational tasks: title, owner role, completed count, missing evidence count and status.
- Inside a group, inspection points should be scannable rows with current answer summary, evidence state and completion state.
- Point detail should be a bottom sheet or full screen form depending on complexity:
  - simple option-only point: compact bottom sheet,
  - measurement-heavy point: full screen form,
  - body paint/micron entry: optimized batch entry with per-panel overrides,
  - photo-required finding: camera action must be visible before completion.
- "Tum Noktalar Iyi" may stay, but it must never bypass required measurements or evidence.

## Report Data Contract

The user-facing term is work order. The database root currently uses `expertise_case_id`.

Required mapping:

| App term | Database term | Notes |
| --- | --- | --- |
| `workOrderId` | `expertise_case_id` | Same operational report root. |
| `templateId` | `report_templates.id` | Derived from source report ID/version. |
| `groupId` | `report_template_groups.id` | Otorapor catalog group. |
| `itemId` | `report_template_items.id` | Stable point ID. |
| `noktaId` | `legacy_nokta_id` | Original Otorapor point number. |
| `selectedOptionIds` | `selected_option_ids` | Persist IDs, not only labels. |
| `inputValues` | `input_values` | Measurement and extra form values. |
| `imageUrls` | `work_order_report_files` or answer image refs | Final approach must be standardized. |

## Gate Rules

Final report must stay blocked when:

- any required catalog point is incomplete,
- an option-required point has no selected option,
- a required input or measurement is empty,
- a risky/negative result lacks required description,
- a risky/negative result lacks required photo/media where catalog or rule requires it,
- secretary gates, KVKK/consent, payment gate or external query gate is blocked,
- pending local sync items exist,
- a manager-returned task is unresolved.

## Implementation Direction

Near-term changes should be made in this order:

1. Keep `inspection_schema_normalized.json` as the mobile report source of truth.
2. Add a formal report contract document or types file for `workOrderId` to `expertise_case_id` mapping.
3. Refine technician report entry UI around the 12 catalog groups and role ownership.
4. Improve body paint batch input for 59 points and micron measurements.
5. Standardize evidence persistence so final report preview and PDF output can show the same media references.
6. Add widget tests for group rendering, point completion, required inputs, risky findings and final lock blocking.

## Risks

- The current app already has both task/checklist models and report-template models. These must be reconciled instead of duplicated.
- The report preview currently summarizes answers, but it is not yet a production PDF contract.
- Storage and answer-level `imageUrls` need one final decision before customer report/PDF generation.
- Production database migrations must not be run until the reviewed local/staging chain is tested.
