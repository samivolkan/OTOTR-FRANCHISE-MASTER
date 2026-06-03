# Public Web Supabase Staging

Date: 2026-06-03

## Purpose

Public OTOTR forms run as a static GitHub Pages site and submit to a Supabase Edge Function.

## Staging Project

- Supabase project name: `ototr-staging`
- Project ref: `bsjkohwbtrfwrqcyhsfz`
- Public API base:
  `https://bsjkohwbtrfwrqcyhsfz.supabase.co/functions/v1/public-api`

## GitHub Secrets Required

Do not store real values in the repository.

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

Use `bsjkohwbtrfwrqcyhsfz` for `SUPABASE_PROJECT_ID` in the staging repository settings.

## Public API Routes

- `GET /branches`
- `GET /stats`
- `GET /reports/verify?query=...&verifyCode=...`
- `POST /appointments`
- `POST /franchise-applications`
- `POST /complaints`

## Security Notes

- The Edge Function is public because the website visitor is not logged in.
- Browser clients do not receive the service-role key.
- Tables have RLS enabled and anon/authenticated access revoked.
- The function has CORS origin checks for localhost, GitHub Pages and OTOTR domains.
- Honeypot submissions are accepted but not inserted.

## Test Record

Staging report verification sample:

- Report no: `OTR-2026-1842`
- Plate: `34 OTR 360`
- Verify code: `1842`

This record is for staging smoke tests only.
