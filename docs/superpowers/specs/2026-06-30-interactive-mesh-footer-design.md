# Interactive Mesh Footer — Design

**Date:** 2026-06-30
**Status:** Approved
**Scope:** Add a non-standard, interactive footer to the esys Nuxt 4 marketing site.

## Goal

Replace the absence of a footer with a distinctive "interactive mesh canvas"
footer: a live WebGL mesh-gradient surface that reacts to the cursor, with a
floating glass contact card whose hero element is an oversized email link.

Breaks the standard link-row footer mold while staying inside the existing
visual language (dark navy palette, glass morphism, noise overlay, Poppins).

## Visual Language (existing, reused)

- Palette: `#0a0a2e`, `#1b3a6b`, `#2a6f97`, `#a9d6e5`, text `#eef1f7`, muted `#c3cad8`.
- Glass: `backdrop-filter: blur(...) saturate(...)`, translucent navy fill,
  hairline white border, soft shadow (see `Navbar.vue` `.lang__menu`).
- Noise: `/images/noise-bg.png`, `background-size: 200px`, `opacity ~0.25`,
  `mix-blend-mode: overlay` (see `Hero.vue` `.noise`).
- Font: Poppins (global, `app.vue`).

## Architecture

New single component: `app/components/SiteFooter.vue`.
Mounted in `app/app.vue` after `<NuxtPage />`:

```
<Navbar />
<NuxtPage />
<SiteFooter />
<ClientOnly><CookieBanner /></ClientOnly>
```

The footer is one cohesive unit. Responsibility: render the contact surface.
No data fetching, no API calls. Pure presentational + pointer interaction.

### Layers (bottom → top, within `<section class="footer">`)

1. **Mesh gradient** — `<ClientOnly><UiMeshGradientBg ... /></ClientOnly>`.
   - `:colors="['#0a0a2e','#1b3a6b','#2a6f97','#a9d6e5']"` (hero colors).
   - `:speed="0.25"` (slower, moodier than hero's 0.35).
   - `:distortion="1.0"`, `:swirl="0.7"` (heavier warp for footer mood).
   - WebGL, client-only — same constraint as hero.

2. **Noise overlay** — `<div class="footer__noise" aria-hidden="true" />`.
   - Identical technique to `Hero.vue` `.noise`.

3. **Cursor spotlight** — `<div class="footer__spotlight" aria-hidden="true" />`.
   - `radial-gradient` glow positioned via CSS custom props `--mx`, `--my`
     (percentages) updated on `pointermove` over the section.
   - Soft additive light (`mix-blend-mode: screen` or low-opacity white→transparent).
   - This is the "live mesh reacts to me" feel — achieved as an overlay,
     NOT by editing the shader (shader exposes no mouse uniform).

4. **Glass card** — `<div class="footer__card" ref="cardRef">`.
   - Centered, max-width ~560px, glass panel.
   - Subtle 3D tilt toward cursor: `transform: rotateX/rotateY` driven by
     pointer position relative to card center, capped at ~6°,
     `transition` for smooth return on leave.

### Card content (email + phone only)

- **Prompt line** — small uppercase eyebrow, `$t('footer.prompt')`
  (e.g. "Let's build something").
- **Email** — hero element. `<a :href="'mailto:' + email">`.
  - `font-size: clamp(1.75rem, 5vw, 3.25rem)`, weight 700.
  - Hover: underline-wipe (animated `background-size` underline or
    `::after` scaleX), color shift toward `#a9d6e5`.
- **Phone** — `<a :href="'tel:' + phoneHref">`, lighter (weight 500,
  `#c3cad8`), smaller. Hover → `#eef1f7`.

NO copyright / bottom bar. NO nav links. NO socials. NO language switch.

### Placeholders

```js
const email = "hello@evolution-systems.uz";      // placeholder
const phone = "+998 (00) 000-00-00";              // display, placeholder
const phoneHref = "+998000000000";                // tel: href, placeholder
```

Marked with `// TODO: real contact value` comments so they're easy to find.

## Interaction Detail

- `pointermove` listener on the section root (not window) sets `--mx`/`--my`
  for the spotlight and computes card tilt.
- `pointerleave` resets tilt to flat and parks the spotlight at center.
- All pointer interaction is client-side; listeners attached in `onMounted`,
  removed in `onBeforeUnmount`.

## Accessibility & Performance

- `prefers-reduced-motion: reduce`:
  - Disable spotlight tracking and card tilt (no transform updates).
  - Mesh gradient still mounts (it's the static-feeling background); acceptable.
- Mesh + interactivity are client-only — no SSR/hydration cost for WebGL.
- Email and phone are real semantic `<a>` links (`mailto:` / `tel:`),
  keyboard-focusable, visible focus ring.
- `pointermove` handler is lightweight (CSS var writes + one transform);
  no layout thrash, no rAF loop required.

## Internationalization

Add a `footer` block to `i18n/locales/{en,ru,uz}.json`:

```json
"footer": {
  "prompt": "...",   // eyebrow line above email
  "email": "...",    // optional aria-label / "Email us"
  "phone": "..."     // optional aria-label / "Call us"
}
```

Email and phone VALUES are constants in the component (not translated).
Only surrounding copy is translated.

## Files Touched

| File | Change |
|---|---|
| `app/components/SiteFooter.vue` | New component |
| `app/app.vue` | Mount `<SiteFooter />` after `<NuxtPage />` |
| `i18n/locales/en.json` | Add `footer` block |
| `i18n/locales/ru.json` | Add `footer` block |
| `i18n/locales/uz.json` | Add `footer` block |

## Out of Scope

- Real contact values (placeholders until provided).
- Shader-level mouse distortion (overlay spotlight approximates the feel).
- Nav links, socials, language switch, copyright bar.
- Any test runner (project has none configured).

## Success Criteria

- Footer renders on every page below page content.
- Live mesh gradient visible; cursor produces a visible spotlight glow and
  a subtle card tilt on desktop.
- Email click opens mail client; phone click dials on mobile.
- Reduced-motion users get a calm, non-tracking version.
- Renders correctly in all three locales.
- No console errors, no hydration warnings.
