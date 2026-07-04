# Footer CTA Redesign + Portfolio Bento Cards — Design

Date: 2026-07-04
Scope: `app/components/SiteFooter.vue`, `app/components/Portfolio.vue`, `i18n/locales/{ru,en,uz}.json`

## Goal

1. Footer becomes conversion-focused: a large CTA scene ("discuss your project") on top of the existing mesh background.
2. Homepage portfolio cards become image-first bento cards with text overlaid on a gradient scrim.

## 1. Footer (`SiteFooter.vue`)

Background layers unchanged: `UiMeshGradientBg`, top fade, noise, cursor spotlight.

New structure, top to bottom:

### 1.1 CTA scene (centered)

- Eyebrow: small caps line, new i18n key `footer.ctaEyebrow` (ru: «Готовы начать?»).
- Headline: existing key `footer.prompt` rendered as `<h2>`, size `clamp(2.2rem, 6vw, 4.5rem)`, gradient text (white → muted).
- Buttons row (wraps on mobile):
  - **Primary pill** — new key `footer.cta` (ru: «Обсудить проект»). Light fill `#eef1f7`, dark text, inline arrow icon. Hover/focus: cyan glow + slight scale. Click → `useContactModal().open()`.
  - **Ghost** — existing key `footer.email` («Написать нам»). Transparent, 1px border, `mailto:hi@esys.pro`.

### 1.2 Compact link bar

- Hairline divider above.
- Desktop: logo left (~28px tall), nav links center (portfolio/blog/contact, existing keys), social icons right (existing 4 icons).
- Mobile (<640px): stacked, centered.

### 1.3 Watermark + copyright

- `ESYS` watermark kept but reduced (`min-height` smaller than current).
- Copyright line directly below, existing key `footer.rights`.

### Removed

- Tagline paragraph (`footer.tagline`) removed from template; JSON key stays untouched.

### Accessibility / motion

- `prefers-reduced-motion`: no glow/scale transitions; spotlight already disabled.
- Buttons: visible `:focus-visible` rings.

### i18n additions (all three locales)

| Key | ru | en | uz |
|---|---|---|---|
| `footer.ctaEyebrow` | Готовы начать? | Ready to start? | Boshlashga tayyormisiz? |
| `footer.cta` | Обсудить проект | Discuss a project | Loyihani muhokama qilish |

## 2. Portfolio (`Portfolio.vue`)

Data fetching, error/empty states, section reveal — unchanged.

### 2.1 Card: image-first

- Image fills entire card: `position: absolute; inset: 0; object-fit: cover`.
- Content pinned to bottom over gradient scrim: `linear-gradient(to top, rgba(5,5,26,.92), transparent)`.
- Content order: tag pills, title, short text (1–2 lines, revealed on hover via max-height/opacity), arrow circle bottom-right.
- Cyan hairline top sweep on hover kept (brand accent). Grid spotlight dimming of siblings kept.
- Hover: image `scale(1.06)`, scrim darkens.

### 2.2 Bento grid (≥900px)

- 3 columns.
- Repeating pattern per 6 items: item 1 (featured) `grid-column: span 2; grid-row: span 2` (~560px tall); one item per six gets `grid-row: span 2` (tall); rest standard (~340px).
- Mobile: single column, all cards ~380px.

### 2.3 Section footer link

- `UiArrowLink` `direction="forward"`, text from new key `portfolio.all` → `/portfolio`.

### 2.4 Skeletons / motion

- Skeleton blocks match new heights (featured tall, standard, tall variant).
- `prefers-reduced-motion`: no zoom, short text always visible.

### i18n additions (all three locales)

| Key | ru | en | uz |
|---|---|---|---|
| `portfolio.all` | Все проекты | All projects | Barcha loyihalar |

## Out of scope

- `/portfolio` page itself, contact modal internals, API changes, other sections.

## Testing

No test runner configured in repo. Verification: `npm run dev`, manual check of the three locales, hover states, mobile layout, reduced-motion emulation, and `npm run build` passes.
