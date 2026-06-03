# OTOTR Public Web Deployment Checklist

## Publish Target

Deploy from:

`apps/web/dist-public-web`

Primary page:

`ototr-web.html`

Root support files:

- `index.html`
- `robots.txt`
- `sitemap.xml`
- `_headers`
- `_redirects`

Source workspace remains:

`apps/web/public-prototype`

## Do Not Publish As Public Entry Points

These files are preserved as reference/test material, but should not be promoted as live site URLs:

- `ototr-android-firebase-test.html`
- `web2.html`

If the hosting provider does not support `_redirects` and `_headers`, exclude those two files from the production upload package.

## Required Backend Endpoints

The frontend is prepared for:

- `POST /api/public/appointments`
- `GET /api/public/reports/verify?query=...&verifyCode=...`
- `POST /api/public/complaints`
- `GET /api/public/branches`
- `GET /api/public/stats`

Until these endpoints are live, production users should use WhatsApp or the visible contact flow when a request cannot be submitted.

## Pre-Go-Live Checks

- Confirm `https://www.ototr.com.tr/` points to the public web package.
- Confirm SSL is active.
- Confirm `/robots.txt` and `/sitemap.xml` are reachable.
- Confirm root URL renders the OTOTR site, not a directory listing.
- Confirm `ototr-android-firebase-test.html` and `web2.html` are not indexed or are excluded.
- Confirm API endpoints return production-safe responses and do not expose secrets.
- Confirm Google Search Console and analytics tags are added only after account ownership is verified.
