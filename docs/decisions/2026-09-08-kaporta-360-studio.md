# Kaporta 360 — source-bound presentation studio

## Scope and decision

User requested an advanced implementation for impressive customer inspection presentations using original vehicle photographs. They accepted preparing the reference vehicle while actual pilot make/model/body year/door count is pending. Existing publication authorization covers the Kaporta 360 ERP module.

Implement authored photograph cutouts, capture checks, measurement location pins and evidence-linked narration as an additive work-order workflow. Do not equate 24 photographs, a generic shell or an authored reference shell with a measured 3D reconstruction. No generated damage evidence, automatic paint/replacement classification, manufacturer asset library or physical pilot approval is claimed.

## Routes and workflow

- `kaporta-360/studio.html`: public reference preparation example. Six steps: setup, capture, mapping, story, preview, technical delivery. Reference state is in memory, never saved to the ERP, and cannot submit/approve.
- `studio.html#session=<uuid>`: authenticated existing work-order preparation. Existing ERP login, actor, assignment and state rules remain authoritative. No lookup of private cases in the public demo.
- `pilot.html#session=<uuid>`: direct technical review of the same session after authentication. The reviewer can open the studio in read-only mode to check contours and narration.
- `sunum.html#rapor=<capability>`: approved customer snapshot. Prepared contours, pins and narration are available only when their source references validate. Existing reports with no studio plan retain their original behavior.
- `studio-guide.html`: Turkish operating guide, equipment criteria, field acceptance and next-stage model contract. Printable in the browser. No customer data.

## Evidence and geometry contract

Each binding stores `{partId, photoId, sha256, points, reviewed}`. Points use normalized original image coordinates, are bounded to 0–1, contain 3–40 vertices, enclose a nontrivial area and cannot self-intersect. Up to 50 bindings per session. The source photo belongs to the same session. Ring/upper bindings must use the current slot; a detail binding must be part evidence. The same profile or vehicle name does not authorize reusing another car's contour.

SVG clips display the source pixels at the original aspect ratio. Bounds, anchors and explode offsets scale to the original dimensions. The empty original location is a neutral guide, not inferred internal anatomy. Generic 3D describes part location; only the exact unchanged reference set enables the authored photographic shell.

Pins store `{partId, photoId, measurementIndex, value, x, y}`. Up to 100 per session; a pin references existing part evidence and the exact saved measurement. Changed or reordered measurements invalidate affected pins during plan validation and at technical submission/approval. Pins are not new measurements or automatic surface diagnoses.

Tour stores up to 12 unique parts: `{partId, photoId, seconds, view, caption}`. Each part has a recorded non-unchecked outcome and linked evidence. Duration is integer 5–20 seconds. Cutout mode requires a reviewed binding for the same part/photo. Caption is up to 400 characters; overall scope up to 600. The customer display retains the caption throughout the selected stop, opens its evidence, and uses its saved view/duration.

## Capture controls

Existing required set remains 24 ring + 4 upper angles, with detail evidence for recorded defects/non-original work. File validation retains the existing 20 MB, 60 MP and 720 px minimum dimensions. Local image advice samples a central ROI and reports edge variance, clipped bright pixels and dark pixels. Thresholds are provisional heuristics, not calibrated confidence or pass/fail decisions. Three manual checks (identity, angle, quality) reference the source SHA and must be true for every current required shot before an enabled studio plan can reach technical review.

Direct camera uses an explicit getUserMedia permission request and a framing guide, captures JPEG, then follows the original upload/registration path. Camera tracks are stopped on close, visibility loss and pagehide. Files also work without camera permission. The studio requires a live connection for upload/save; the existing pilot page retains its durable offline upload queue. No undocumented claim of offline studio persistence.

Retaking preserves the original evidence object, changes the active slot, and clears the local old-frame checks/contours. Server approval validation rejects stale stored bindings if the user attempts to submit from another screen before saving the corrected plan. Existing old photographs may remain linked as historical evidence; they never silently become the new active spin frame.

## Database change

Reviewed migration: `20260908104520_kaporta_360_presentation_studio.sql`, generated using Supabase CLI 2.117.0 and copied byte-for-byte to the reviewed chain after local PostgreSQL tests.

- Adds `k360_sessions.studio jsonb NOT NULL DEFAULT '{}'`.
- Adds authenticated-only `k360_save_studio(uuid,int,jsonb)` and private validators. Empty search paths; no anonymous execution; private helpers not callable by clients.
- Checks active actor, case scope, technician/supervisor role, branch, task ownership, OPEN task, unlocked eligible case, draft/returned session and expected revision. Session UPDATE lock followed by case/task SHARE locks, matching the existing mutation protocol.
- Strict JSON key allowlists, bounded size and arrays, model key restricted to `generic:<profile>` for actual sessions. No arbitrary photo URL, model URL, capability or equipment secret field is accepted.
- An additive trigger validates an enabled prepared plan on transition to review or approval, including submissions made from the old pilot UI. Approval's snapshot insert is in the same transaction; validation failure rolls back the entire operation.
- Existing load automatically includes the new column. Existing approval snapshots freeze the whole session, so the reviewed plan is immutable with that report.
- Studio edits append the actor to session editors and record a `studio` event with counts/revision. The preparer cannot approve their own capture. No changes to ERP task, final report lock or capability gates.

Legacy sessions default to `{}`. A valid plan may be explicitly disabled by an authorized caller; this removes the optional enhanced presentation checks but never removes existing expert evidence, technical review or final ERP approval requirements. The current UI prepares enabled plans.

## Customer API and privacy

The existing Edge Function resolves a 256-bit capability in the request body through its server-only resolver. JWT verification stays disabled because this endpoint uses custom capability authentication; work RPCs remain authenticated. It signs only photo paths in the approved snapshot, for 120 seconds, and exposes approved studio fields plus dimensions/hash. Equipment, capture check internals, paths, actor/editor IDs, session ID and service credentials are omitted.

The browser validates prepared fields again. Invalid preparations fail closed to ordinary approved photos/records; reference photos never fill customer gaps. Private photo previews use revocable object URLs. Authorization is rechecked on visibility return and at 60-second intervals; access failure clears work-order content and images. Save rechecks authorization/revision server-side. Customer capability refresh retains existing 90-second refresh and closes on access loss.

JSON preparation export contains model/profile, contour data, measurement references, narration and photo IDs/hashes/dimensions. It excludes originals, signed URLs, tokens, credentials and plate/work-order identifiers. No JSON import is implemented. Only a local Turkish speech voice may read the selected preview caption; there is no cloud speech request or video export.

SHA and dimensions are client declarations registered against an immutable Storage object, as in the existing pilot. This is source-binding integrity, not server recomputation or forensic authenticity verification. A later media-verification worker would be required to strengthen that boundary.

## Next-stage vehicle asset contract (not implemented)

A per-body asset needs licensed GLB geometry, stable semantic part IDs matching the profile, unit/axis conventions, panel pivots, explode directions, bounds, UV/source mapping, uncaptured-surface flags and a version/hash. Metadata must include make/model, body generation/year range, door count, origin and usage rights, source photo IDs, operator and independent reviewer. Loading must reject mismatched profile/door count and unsupported part IDs. Unknown variants stay generic until physically accepted.

The first physical pilot should establish capture duration, contour preparation time, retake rate, reviewer corrections, mobile responsiveness and customer comprehension before selecting performance targets or buying a turntable/scanner. Actual model identity, authorized photos, field measurement verification and Android/iPhone hardware acceptance remain pending.

## Verification and rollback

Tests cover exact PostgreSQL migration execution, RLS/ownership/state/revision, cross-session references, source mismatch, crossing polygons, changed measurements, incomplete capture checks, independent approval, immutable snapshots and final report gates. Domain/image-advice tests use synthetic fixtures. Browser checks cover reference studio, editing/pins/exports, authenticated mocked work orders, read-only review, stale saves, access revocation, source-specific approved customer presentation, all mobile steps and existing photographic/WebGL/pilot regressions. Automated fixtures are not real customer cases.

Rollback is additive and non-destructive: restore previous frontend/Edge Function commits and revoke authenticated execution of the new save RPC if writes must stop. Keep studio column, immutable approved snapshots, audit events and original photos. Existing complete studio plans can still be read through stored reports; removing data or disabling safety checks is not the rollback strategy. Production-wide rollout follows separate physical acceptance; this delivery targets the existing verified staging pilot and authorized GitHub Pages module.
