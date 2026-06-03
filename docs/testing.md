# Testing

Current validation summary is stored in `TEST_RESULTS.md`.

## Core Test Commands

### Flutter Branch App

Use the short Windows junction because Flutter tooling can crash on the Turkish-character workspace path:

```powershell
cd C:\ototr_master\apps\mobile-branch
flutter analyze
flutter test
```

### Expo Technician App

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER\apps\mobile-technician
npm.cmd run typecheck
```

### Admin Prototype

```powershell
cd C:\Users\Samivolkannnn\Documents\OTOTR_HAZİRAN\OTOTR-FRANCHISE-MASTER\apps\admin\prototype
node tools\test-demo-data.mjs
node tools\test-vin-service.mjs
node tools\test-index.mjs
```

## Test Rules

- Run relevant tests after every code import/refactor.
- Log results in `TEST_RESULTS.md` and `MIGRATION_LOG.md`.
- Do not accept a refactor as complete without a smoke test for the touched app surface.
- Database migrations require local/staging validation before production planning.

## Known Warnings

- Expo dependency chain currently reports moderate npm audit warnings.
- Do not run `npm audit fix --force` blindly.
- Flutter direct path under `OTOTR_HAZİRAN` can trigger analysis server path issues; use `C:\ototr_master`.
