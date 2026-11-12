# Verification — 12 November 2026

- `npm test`: 104 passed.
- Admin `php artisan test --filter='Pricing|SeoTargetsPublicUrlsTest|PublicSeoApiTest'`: 32 passed, 148 assertions.
- Frontend `npm run build`: passed.
- Admin `npm run build`: passed.
- `git diff --check` in both repositories: passed.

Chrome browser checks used the production Nuxt build against Laravel with isolated `admin_esys_testing` fixtures. No production prices were changed. Lead delivery was intercepted in the browser; backend persistence and notification failure were tested separately with a mocked Telegram channel.

Verified RU/UZ/EN responses return 200, eight prices match the initial specification, ten FAQ entries are present in raw SSR HTML, canonical/hreflang match each locale, and the 320px viewport has no horizontal overflow. EN/UZ main content has no Cyrillic text. No browser page errors occurred. Selecting the mobile application card carried its ID and service key into the form payload; a successful response displayed the receipt message.

Admin browser verification: manager login, editor rendering, price diff (4,500,000 → 4,600,000), draft save, unchanged public snapshot, and preview link generation all passed without JavaScript errors.

Runtime sitemap verification: unpublished pricing was absent, published pricing was present, preview was excluded, and the pricing invalidation request removed seven sitemap cache entries with zero rejected paths. Preview responded 200 with no-store/noindex and contained cards without Offer markup.

The release still requires the operational installation and editorial review described in README.md: database migration/seed, explicit roles, service/case associations, reviewed case descriptions, configured notification/analytics accounts, and the first approved production publication. Production HTTP verification cannot be claimed before deployment.
