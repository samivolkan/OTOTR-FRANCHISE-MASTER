# Usta Mobile Phase 1 Target

Date: 2026-06-05

Decision: create a new clean `ototr-mobile-app` root folder for OTOTR Usta Mobil Uygulamasi Phase 1.

Technology: vanilla PWA with Capacitor-ready configuration.

Rationale:

- The active repository has Flutter and Expo mobile apps, but the current task explicitly excludes using existing mobile folders as the Phase 1 active target.
- No active Capacitor infrastructure was found in the repository.
- A PWA-first scaffold keeps dependencies at zero for Phase 1 while preserving a clear path to Capacitor/Android in later phases.

Boundaries:

- Do not modify archive mobile snapshots.
- Do not use `apps/mobile-ototr-pro` as the target for this Phase.
- Do not connect backend/API/live services in Phase 1.
- Keep the theme light-only.
