# Pricing module

The implementation spans `esys` (Nuxt) and `../admin.esys` (Laravel). Prices are not stored in frontend translations. `database/seeders/pricing.json` in the admin repository is the initial, editable draft with eight packages and independent Russian, Uzbek Latin and English content.

## Local verification

- Frontend: `npm test`, `npm run build`.
- Admin: `php artisan test --filter=Pricing`, `npm run build`.
- Laravel tests use **admin_esys_testing**, not the application database. HTTP/channel dependencies are mocked in automated tests. Browser submission checks must intercept lead delivery to avoid sending real enquiries.

## Initial installation

1. Deploy both repository changes together using the project's deploy workflow. Run `php artisan migrate` in the admin repository.
2. Run `php artisan db:seed --class=PricingSeeder`. This is idempotent: it creates an initial draft only and never replaces an existing page or publishes prices.
3. Assign explicit access: `php artisan pricing:role editor@example.com editor` or `pricing:role manager@example.com manager`. Roles: `viewer`, `editor`, `seo_editor`, `manager`, `admin`. Existing accounts default to Viewer; pricing roles cannot be assigned through content API payloads.
4. Confirm `FRONTEND_URL`, `services.frontend_cache.url/token` on Laravel and `NUXT_CACHE_INVALIDATE_TOKEN` on Nuxt. Existing server-only Basic Auth proxy configuration continues to apply. Configure the Telegram channel as for the existing contact form.
5. Open `/pricing` **in the admin panel**. Check prices, translations, timelines, service links and case selection. The seed links matching existing website/mobile/CRM/branding services and named portfolio records by alias; IDs are never guessed. SaaS/support links require editorial selection if a matching service exists. At least 3 relevant cases, task/solution/features and translated case text must be reviewed in the admin. Missing relationships produce warnings. No case prices or unverified case outcomes are invented.
6. Review the draft diff, save, prepare preview, open each available locale, approve that saved version, review the publication diff, and explicitly publish. Editing resets approval. Preview tokens expire after 30 minutes and are bound to the draft content: approval keeps them valid, any content edit invalidates them. A failed live verification returns the page to its previous workflow stage (normally `approved`), so publishing can be retried without re-approval.
7. Live verification must succeed. It checks HTTP, SEO, canonical/hreflang, Open Graph, sitemap, FAQ HTML, schema and actual displayed price/Offer correspondence. A failed check restores the preceding live snapshot and records a failed revision; it is never reported as successful publication.

Public URLs return 404 until an initial snapshot is published. There is no static-price fallback. Only published locales are advertised in sitemap/hreflang. Pricing pages use a 300 s SWR SSR cache (errors are never cached); the page cache, sitemap XML and resolved URL caches are purged on publication, rollback, failed verification and recovery. Preview is noindex/no-store and uses a no-referrer policy.

## Editing with MCP

Read `show_pricing_page` (`id`) to obtain `version`, the draft, published snapshot and validation status. All mutations require `page_id` and `expected_version`; stale requests fail. All mutation tools default to `dry_run=true`.

```json
{
  "page_id": 1,
  "expected_version": 1,
  "changes": {"items": [{"id": 1, "price_from": 5000000}]},
  "dry_run": true,
  "reason": "Approved commercial price revision"
}
```

After reviewing the diff, repeat with `dry_run=false`. Re-read version after every successful mutation.

1. `show_pricing_page`
2. `update_pricing_page` dry-run → review → write
3. `validate_pricing_page`
4. `preview_pricing_page` dry-run → write → open returned locale URLs
5. `approve_pricing_page` dry-run → write (Manager/Admin)
6. `publish_pricing_page` dry-run → review → `confirm=true, dry_run=false`
7. `inspect_pricing_page`, followed by the existing `audit_page_content` and `validate_page_schema` with `entity_type=page, entity_id=pricing, locale=ru|uz|en`.
8. `get_pricing_history` supports page/item/actor/type/date filters and pagination.

`rollback_pricing_page` restores the snapshot that the current live revision replaced; repeated rollbacks keep walking back through history (they do not toggle) and fail with 422 when no earlier snapshot exists. It requires Manager/Admin, an explicit confirmation and nonempty reason, and supports a dry-run diff. The draft is also restored after a successful rollback. Records are hidden/archived, never deleted by this module. Route, currency, robots and canonical cannot be patched through pricing tools.

Partial patches merge only supplied fields within the item selected by ID. Omitted items/fields remain unchanged. Lists (included scope, case IDs) are replaced as lists. `null` clears optional fields such as `price_to` or `service_id`; required fields reject null. Content is plain text, stripped of HTML, and rendered through Vue escaping. Structured case summaries live in each item's `translations.<locale>.case_studies.<case_id>` (`task`, `solution`, `features`).

## Publication and delivery details

Publishing temporarily points the public API to a candidate revision while checks run. During this short verification window visitors may see the candidate. Edits/publications are blocked until verification finishes. On failure, the old pointer is restored and sitemap caches are purged again. Interrupted verification is recovered after 15 minutes by `pricing:recover`, scheduled every five minutes through the existing Laravel scheduler. Recovery restores the preceding snapshot, invalidates the version and writes an audit event. The command can also be run manually after that timeout. There is no claim of a distributed atomic commit across Laravel and Nuxt.

Lead submissions are persisted first in `pricing_leads`, then sent to Telegram. A channel outage does not turn a stored enquiry into a failure that invites duplicate submissions. Manager/Admin can inspect the latest 50 leads in the pricing admin page; notification failures are logged with lead ID and no contact payload. Telegram text is bounded to fit channel limits. Configure the existing analytics accounts to receive the `pricing_*` events; no personal contact data is sent to analytics.

The module's integrity checks are automated release checks, not a substitute for editorial review or a browser audit. Server production deployment, first publication and GA4/Metrika dashboard configuration are separate operational steps.

## Pricing data rules

- `typical_from` must be at least `price_from`; `price_to` (optional) is shown as a range `X–Y` and published as `priceSpecification.maxPrice`.
- `billing_period` (`project`, `month`, `hour`, `custom`) is independent of the service key; the matching `/month`, `/hour` suffix is rendered and verified live. Project items must not mention a period suffix in their text.
- Offers carry `price` (starting price, required by the validator) plus `priceSpecification.minPrice`.
- Lead submissions are throttled to 5 per minute per visitor: the Nuxt proxy forwards the visitor address as `X-Client-IP` (the endpoint is reachable only with server-side Basic Auth).
