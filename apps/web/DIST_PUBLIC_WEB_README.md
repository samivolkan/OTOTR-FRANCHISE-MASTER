# OTOTR Public Web Upload Package

Clean static production upload package:

`apps/web/dist-public-web`

Upload only these files to the hosting public root:

- `ototr-web.html`
- `index.html`
- `robots.txt`
- `sitemap.xml`
- `_headers`
- `_redirects`

Do not add reference or test files such as `web2.html` or `ototr-android-firebase-test.html` to the production package.

If the hosting provider does not support `_headers` or `_redirects`, keep them in the repository for reference but do not upload them as public documents.
