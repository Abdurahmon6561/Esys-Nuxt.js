# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Nuxt 4 marketing/portfolio site for Evolution Systems (a Tashkent web agency). Dev server: `npm run dev` → http://localhost:6561. No test runner or linter is configured.

## Deployment

Use the `deploy` project skill (`.claude/skills/deploy/`), which wraps the gitignored `./deploy.sh frontend|admin|all`. Server pulls from git — **push before deploying**. Frontend remote is GitHub, admin remote is Bitbucket.

## Backend

- Admin panel + API source lives in sibling repo `../admin.esys` (Laravel 12 + Inertia/Vue). Public REST endpoints: `routes/api.php` (BasicAuth-guarded). Admin panel: `routes/web.php`. See that repo's `CLAUDE.md` for models, controllers, conventions.
- Basic Auth credentials (`NUXT_API_USERNAME` / `NUXT_API_PASSWORD`) are server-only — never expose them to client code. `NUXT_PUBLIC_API_URL` must include a trailing `/`.
- The active i18n locale (ru default and unprefixed, en, uz) is sent to the API as `Content-Language`.
