# OTOTR AI Project Memory

Use this file as the source of truth between ChatGPT, Codex, and GitHub.

## Current project decision

- Build OTOTR in a clean master repo, using old files only as references.
- Mobile technician flow is the first operational priority.
- Dealer portal remains the control center for customer reception, work order creation, and branch cockpit.
- Android/APK can initially be delivered from web/PWA/Capacitor where possible.

## Current screen groups

### Group 1 — Core shell and navigation
- Login
- Branch selection if needed
- Home cockpit
- Work order list
- Work order detail
- Bottom navigation
- Global states: loading, empty, error, offline

### Group 2 — Work start and ownership
- Start proof
- Task heading list
- Claim task
- View-only locked task
- Relinquish task
- Manager takeover

### Group 3 — Inspection forms
- Body panel inspection
- Mechanical checks
- Electrical checks
- Interior/exterior condition
- Road test
- Notes and media evidence

### Group 4 — Summary and approval
- Customer summary
- Internal technical notes
- Critical findings
- Report preview
- Approval sent/waiting
- PDF/export states

### Group 5 — Production hardening
- Auth
- Permissions
- Offline sync
- Storage
- API contracts
- Tests
- APK/PWA build
