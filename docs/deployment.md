# Deployment

Deployment is not finalized.

Known existing deployment trace:

- `C:\Users\Samivolkannnn\Documents\ototr_25052026\.github\workflows\deploy-pages.yml`

## Public Web Deployment Preparation

Prepared static source package:

`apps/web/public-prototype`

Clean production upload package:

`apps/web/dist-public-web`

Primary page:

`apps/web/public-prototype/ototr-web.html`

Deployment support files:

- `index.html`
- `robots.txt`
- `sitemap.xml`
- `_headers`
- `_redirects`
- `DEPLOYMENT_CHECKLIST.md`

Important:

- `ototr-android-firebase-test.html` and `web2.html` are reference/test files and should not be published as public entry points.
- Hosting providers that do not support `_headers` and `_redirects` must exclude those two files from the production upload package.
- Public web frontend is wired to Supabase staging API: `https://bsjkohwbtrfwrqcyhsfz.supabase.co/functions/v1/public-api`.
- Current staging backend routes are documented in `docs/public-web-supabase-staging.md`.

## GitHub Deployment Plan

GitHub Pages workflow:

- `.github/workflows/deploy-public-web.yml`
- Publishes `apps/web/dist-public-web`.

Supabase staging workflow:

- `.github/workflows/deploy-supabase.yml`
- Requires GitHub repository secrets:
  - `SUPABASE_ACCESS_TOKEN`
  - `SUPABASE_DB_PASSWORD`
  - `SUPABASE_PROJECT_ID`

Production deployment can proceed only after domain, SSL, backend endpoint and analytics ownership checks in `apps/web/public-prototype/DEPLOYMENT_CHECKLIST.md`.
