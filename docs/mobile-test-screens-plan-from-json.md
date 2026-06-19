# Mobile Test Screens Plan From JSON

Status date: 2026-06-14

This plan defines how the OTOTR mobile report/test screens should be structured from the active inspection catalog JSON.

## Source Of Truth

- Catalog: `apps/mobile-branch/data/inspection_schema_normalized.json`
- Loader: `apps/mobile-branch/lib/data/services/report_template_asset_loader.dart`
- Current entry screen: `apps/mobile-branch/lib/features/technician/report_entry/report_entry_screen.dart`
- Current point form: `apps/mobile-branch/lib/features/technician/report_entry/report_item_form_sheet.dart`

The screen layer must not hardcode inspection groups, points, or option lists. It should render groups, points, options, input fields, media requirements, negative/risky option behavior, and package visibility from the JSON-derived template model.

Catalog facts:

- 12 test groups
- 265 inspection points
- 1253 selectable options
- Source report ID: `2614045`
- Input field types present: `text`, `number`, `date`, `year`
- Media requirement model exists per point with `maxImages`, `requiredImageCount`, and severity-based media rules.

## Screen Stack

1. `Technician Work Queue`
   - Shows assigned work orders only.
   - Entry point for the technician; no technician creates a new work order here.
   - Each card shows plate, customer, package, status, due time, and missing report count.

2. `Work Order Test Dashboard`
   - Shows vehicle header, overall report progress, missing required points, missing evidence, and final report gate status.
   - Lists the 12 catalog groups as operational tasks.
   - Each group card shows total points, completed points, input count, media/evidence count, risky findings, and owner role.

3. `Group Test Screen`
   - Opens one catalog group.
   - Uses group-specific layout only where the data shape requires it.
   - Always supports filters: all, missing, completed, measurement/input, evidence, risk.

4. `Point Test Form`
   - Opens one inspection point as a bottom sheet for simple option-only points.
   - Opens as a full screen for measurement-heavy, evidence-heavy, or batch-entry points.
   - Saves draft separately from completed answer.

5. `Evidence Album`
   - Central place for all work-order media.
   - Point forms can add evidence inline, but the album must show media grouped by test group and point.

6. `Final Gate Screen`
   - Lists every blocker before final report creation.
   - Blocks final report when required options, required inputs, required descriptions, evidence, secretary gates, payment gate, sync state, or technical approval are missing.

7. `Final Preview`
   - Customer-readable report preview grouped by the same 12 catalog groups.
   - Risky findings must be written in clear customer language, not raw technician shorthand.

## Group Screen Matrix

| Order | Code | Screen pattern | Points | Options | Inputs | Primary owner | Notes |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | `WORK_ORDER_ACCEPTANCE` | Intake checklist | 5 | 9 | 0 | Secretary / branch desk | Customer, vehicle, consent, and acceptance readiness. |
| 2 | `VEHICLE_FILE_CHECK` | Document verification | 9 | 12 | 2 | Secretary / branch desk | Date fields and document status must be explicit. |
| 3 | `MOTOR_CHECKUP` | Mechanical diagnostic group | 37 | 138 | 2 | Mechanical technician | Needs quick inputs for antifreeze/battery-style measurements and risk filter. |
| 4 | `MECHANICAL_CHECKUP` | Mechanical underside/front group | 40 | 179 | 0 | Mechanical technician | High scan speed; evidence and risk filter matter more than measurement entry. |
| 5 | `BODY_PAINT_CHECKUP` | Batch body/paint panel entry | 59 | 540 | 14 | Body paint technician | Needs panel sections, micron batch entry, quick chips, and draft lock when micron is missing. |
| 6 | `OBD_ECU_TEST` | Diagnostic focused test | 10 | 26 | 0 | OBD technician | Fault/no-fault choices, evidence for fault records, technical note when risky. |
| 7 | `BRAKE_SUSPENSION_TEST` | Device/result focused test | 9 | 23 | 0 | Test operator | Should support result-photo evidence and pass/warn/fail summary. |
| 8 | `DYNO_ROAD_TEST` | Road/dyno focused test | 5 | 12 | 1 | Test operator | Numeric measurement and road-test notes must be visible. |
| 9 | `EXTERIOR_CONDITION` | Exterior condition batch scan | 35 | 122 | 8 | Body/exterior technician | Tire/year/text inputs and visible condition filters. |
| 10 | `INTERIOR_CHECKUP` | Interior condition checklist | 46 | 156 | 0 | Interior/body technician | Fast checklist with defect/evidence emphasis. |
| 11 | `AIRBAG_CHECK` | Safety diagnostic focused test | 9 | 33 | 1 | OBD/safety technician | Date field and risky option evidence/description must be enforced. |
| 12 | `HEAD_GASKET_LEAK_TEST` | Single critical test | 1 | 3 | 0 | Mechanical technician | Should be surfaced as a critical standalone result, not buried. |

## Point Form Rules

Every point form must derive controls from the JSON model:

- `options`: render selectable chips or a compact list; persist option IDs, not only labels.
- `inputFields`: render by type:
  - `number`: numeric keypad, unit label, min/max validation when present.
  - `year`: numeric year input.
  - `date`: date picker or date-formatted input.
  - `text`: text input with placeholder.
- `requiresDescription` and option-level `requiresDescription`: require customer-readable note before completion.
- `requiresMedia`, option-level `requiresMedia`, and severity media rules: require evidence before completion.
- `isNegative`, `severity`, `riskCategory`, and `scoreImpact`: mark risky findings and feed final gate/summary.
- `packageAvailability`: hide or lock points that are not part of the selected report package.
- `isVisibleInReport`: do not show internal-only points in the customer final preview.

Draft and completion behavior:

- `Kaydet` can save partial data.
- `Tamamlandı` must validate required options, fields, descriptions, and evidence.
- Quick positive actions can complete only when no required input or evidence is skipped.
- Negative/risky selections stay draft until description/evidence rules pass.

## Group-Level UX Rules

- Group cards must show `completed / total`, missing required count, evidence missing count, measurement count, and risk count.
- Group details must support filter chips with counts.
- Empty filter states need a one-tap reset.
- Long groups must be sectioned:
  - body/paint by body panels,
  - exterior by condition areas,
  - mechanical by underside/front/mechanical subareas,
  - focused tests by device/test result sections.
- The user should never scroll through all 265 points as one flat list.

## Final Report Gate

Final report creation must be blocked when:

- a required catalog point is incomplete,
- an option-required point has no selected option,
- a required input field is empty,
- a risky/negative selection has no required description,
- a risky/negative selection has no required evidence where the catalog demands it,
- secretary acceptance/document gates are incomplete,
- required local media has not synced,
- a manager-returned item is unresolved,
- technical approval is pending.

## Implementation Phases

1. Validate the current template loader still imports all 12 groups, 265 points, and 1253 options.
2. Freeze this screen matrix as the UX contract for report/test entry.
3. Audit the existing `ReportEntryScreen` against this matrix.
4. Fill gaps group by group, starting with gate visibility and final blocker details.
5. Add widget/service tests for:
   - catalog group rendering,
   - option/input rendering,
   - draft versus completed saves,
   - risky finding description gate,
   - media/evidence gate,
   - package visibility,
   - final report blocking.
6. Run Flutter validation through the short Windows path:
   - `cd C:\ototr_master\apps\mobile-branch`
   - `flutter analyze`
   - `flutter test`

## Immediate Next Work

The next coding step should be a gap audit, not a redesign:

1. Compare `ReportEntryScreen` and `ReportItemFormSheet` against the rules above.
2. List missing UI states and validations.
3. Implement the smallest missing gate or screen state first.
4. Verify with Flutter tests before moving to the next group.
