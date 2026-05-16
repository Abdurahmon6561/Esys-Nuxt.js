# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:6561
npm run build      # Build for production
npm run generate   # Static site generation
npm run preview    # Preview production build
```

No test runner or linter is configured. Prettier is installed but `.prettierrc` is empty (no enforced style rules beyond defaults).

## Architecture

This is a **Nuxt 4** marketing/portfolio site for Evolution Systems (a Tashkent web agency). All application code lives under `app/` (Nuxt 4 convention).

### Routing & Pages

Six pages with file-based routing: `index`, `blog`, `blog-view`, `projects`, `view`, `contact`. The `view` and `blog-view` pages are detail views (portfolio and blog entries respectively) fetched by alias from the API.

### Component Organization

Components are co-located by domain:
- `app/components/` — top-level homepage sections (Hero, Line, Projects, Services, Users, VantaDots)
- `app/components/blog/` — blog list and detail components
- `app/components/project/` — portfolio list and detail components
- `app/components/video/` — video section components with scroll-pinning (BenefitSection, ClipPathTitle, VideoPinSection)

### Composables

- **`useAuth`** — builds Basic Auth headers from `runtimeConfig` and injects the active i18n locale as `Content-Language`. Called internally by `useApiService`.
- **`useApiService`** — wraps Nuxt's `$fetch` with auth headers. Exposes `blogApi` (getBlogs, getBlog, getBlogByAlias, getBlogsWithPagination), `portfolioApi` (getPortfolios, getPortfolio, getPortfolioByAlias), and a generic `api` object (get/post/put/delete).
- **`useCustomCursor`** — custom cursor behavior.
- **`useWaveTransition`** — composable wrapper around the wave transition animation.

### Plugins

- **`fontawesome.js`** — registers FontAwesome icon library globally.
- **`wave-transition.client.js`** (client-only) — GSAP-powered full-screen clip-path wave animation on every page navigation. Intercepts all internal `<a>` and NuxtLink clicks via a MutationObserver, plays wave-in/wave-out, then navigates. Also exposes `window.waveTransition` and `$waveTransition` globally. Uses `circle()` clip-path expanding from the bottom and collapsing from the top.

### Internationalization

Three locales in `i18n/locales/`: Russian (`ru`, default), English (`en`), Uzbek (`uz`). Strategy is `prefix_except_default` — Russian URLs have no prefix, others use `/en/` and `/uz/`. The current locale is automatically sent as `Content-Language` on every API request.

### Styling & Animations

- **Tailwind CSS** via `@nuxtjs/tailwindcss` — primary utility framework.
- **`app/assets/css/main.css`** — global custom styles.
- **GSAP** — page transitions (wave plugin) and scroll animations. Added to `build.transpile`.
- **Three.js + Vanta** — animated dot/particle background in `VantaDots.vue`.
- **FontAwesome** — icon set (solid, regular, brands).

### API Integration

The backend is a REST API authenticated with HTTP Basic Auth. Base URL comes from `NUXT_PUBLIC_API_URL` (public, client-accessible). Credentials come from `NUXT_API_USERNAME` / `NUXT_API_PASSWORD` (server-only). Copy `.env.example` to `.env` to configure.

### Environment Variables

| Variable | Side | Purpose |
|---|---|---|
| `NUXT_PUBLIC_API_URL` | public | Backend API base URL (include trailing `/`) |
| `NUXT_PUBLIC_SITE_URL` | public | Canonical site URL |
| `NUXT_API_USERNAME` | server | Basic Auth username |
| `NUXT_API_PASSWORD` | server | Basic Auth password |

### Page Transitions

Nuxt page/layout transitions (`name: "page"`, `mode: "out-in"`) are configured but the primary visual transition is the custom GSAP wave handled by `wave-transition.client.js`. Both systems run together.
