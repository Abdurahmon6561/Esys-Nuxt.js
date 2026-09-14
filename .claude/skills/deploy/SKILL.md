---
name: deploy
description: Deploy esys frontend (Nuxt) and/or admin (Laravel) to production server. Use when user asks to deploy, ship, release, or push to production.
---

# Deploy

Production server: `root@109.199.108.93` (SSH key auth already configured).

| Target | Server path | Method |
|---|---|---|
| frontend (this repo) | `/var/www/esys.pro` | git pull → npm ci → nuxt build → `pm2 restart esys-app` |
| admin (`../admin.esys`) | `/var/www/admin.esys.pro` | git pull → composer install → vite build → artisan migrate + optimize |

## How to deploy

All logic lives in `./deploy.sh` (gitignored, repo root). Run ONE command — do not SSH manually or replicate its steps:

```bash
./deploy.sh frontend   # frontend only
./deploy.sh admin      # admin only
./deploy.sh all        # both
```

## Rules

- **Push first.** Server deploys via `git pull --ff-only` — unpushed commits will not deploy. Check `git status` / push before running.
- Admin repo (`../admin.esys`) pushes to Bitbucket; frontend to GitHub. Push whichever target(s) you're deploying.
- Script is quiet by design (token economy): success prints `✓ ... deployed`; on failure it prints last 30 log lines. Full log path printed at end — read it only if debugging.
- Do NOT run build steps locally as part of deploy; the server builds.
- If `deploy.sh` is missing (fresh clone), recreate it from this skill's spec or ask the user — it is intentionally not committed.
- `admin` target also restarts the demo-platform queue worker (`sudo -u www-data pm2 restart admin-esys-queue`) when it exists — keep that in any recreated script, or deploys silently stop processing.

## Demo deploy platform (one-time server setup)

The Vercel-like demo platform (`<slug>-demo.esys.pro`, lives in admin) needs one-time server setup before first use. Runbook: `../admin.esys/docs/demo-deploy-server-setup.md` — follow its "Release order" table (merge branch → push → server steps 0–6 → `.env` → `./deploy.sh admin` → queue worker/grant/webhook/firewall → smoke test). Server steps need root SSH and secrets (Cloudflare token, Origin CA key) — confirm with the user before running them; never paste secrets into chat or commits.
