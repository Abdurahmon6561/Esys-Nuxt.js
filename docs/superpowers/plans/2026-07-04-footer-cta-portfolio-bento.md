# Footer CTA + Portfolio Bento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the site footer into a CTA-first conversion scene and rebuild homepage portfolio cards as image-first bento cards.

**Architecture:** Two self-contained Vue SFC rewrites (`SiteFooter.vue`, `Portfolio.vue`) plus i18n key additions in three locale files. Footer keeps its existing background layers (mesh, noise, spotlight) and gains a CTA scene wired to the existing global `useContactModal()` singleton. Portfolio keeps its data fetching and reveal logic; only template + styles change.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, scoped CSS (no Tailwind in these components), @nuxtjs/i18n.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-04-footer-portfolio-design.md`
- No test runner configured — verification is `npm run build` (must succeed) + manual dev-server checks.
- Literal `@` in locale JSON must be escaped as `{'@'}` (i18n build rule).
- All three locales (`ru`, `en`, `uz`) must receive every new key.
- `prefers-reduced-motion` must disable transforms/reveals in both components.
- Nuxt auto-import naming: `app/components/ui/ArrowLink.vue` → `<UiArrowLink>`.
- Commit messages: conventional commits, no attribution footer.

---

### Task 1: i18n keys

**Files:**
- Modify: `i18n/locales/ru.json` (footer block ~line 15, portfolio block ~line 8)
- Modify: `i18n/locales/en.json` (same blocks)
- Modify: `i18n/locales/uz.json` (same blocks)

**Interfaces:**
- Produces: translation keys `footer.ctaEyebrow`, `footer.cta`, `portfolio.all` — consumed by Tasks 2 and 3 via `$t()`.

- [ ] **Step 1: Add keys to ru.json**

In the `"portfolio"` object, after `"empty"`, add:

```json
    "all": "Все проекты"
```

In the `"footer"` object, after `"prompt"`, add:

```json
    "ctaEyebrow": "Готовы начать?",
    "cta": "Обсудить проект",
```

(Keep valid JSON commas — `"all"` needs a comma after `"empty"`'s value.)

- [ ] **Step 2: Add keys to en.json**

Portfolio object:

```json
    "all": "All projects"
```

Footer object, after `"prompt"`:

```json
    "ctaEyebrow": "Ready to start?",
    "cta": "Discuss a project",
```

- [ ] **Step 3: Add keys to uz.json**

Portfolio object:

```json
    "all": "Barcha loyihalar"
```

Footer object, after `"prompt"`:

```json
    "ctaEyebrow": "Boshlashga tayyormisiz?",
    "cta": "Loyihani muhokama qilish",
```

- [ ] **Step 4: Verify JSON validity**

Run: `node -e "['ru','en','uz'].forEach(l=>JSON.parse(require('fs').readFileSync('i18n/locales/'+l+'.json')))" && echo OK`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/ru.json i18n/locales/en.json i18n/locales/uz.json
git commit -m "feat: add footer CTA and portfolio i18n keys for en/ru/uz"
```

---

### Task 2: SiteFooter.vue CTA-first redesign

**Files:**
- Modify: `app/components/SiteFooter.vue` (full rewrite of template + styles; script gets one addition)

**Interfaces:**
- Consumes: `footer.ctaEyebrow`, `footer.cta` keys from Task 1; existing `useContactModal()` composable (`app/composables/useContactModal.js`, auto-imported); existing keys `footer.prompt`, `footer.email`, `footer.links.*`, `footer.rights`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add contact modal to script**

In `<script setup>`, after `const localePath = useLocalePath();`, add:

```js
const { open: openContact } = useContactModal();
```

Keep everything else in the script (socials array, links, year, spotlight pointer handlers) unchanged. Delete nothing from the script.

- [ ] **Step 2: Replace the `.footer__inner` template block**

Replace the entire `<div class="footer__inner">…</div>` with:

```html
    <div class="footer__inner">
      <!-- CTA scene -->
      <div class="footer__cta">
        <p class="footer__eyebrow">{{ $t("footer.ctaEyebrow") }}</p>
        <h2 class="footer__prompt">{{ $t("footer.prompt") }}</h2>
        <div class="footer__actions">
          <button type="button" class="footer__btn footer__btn--primary" @click="openContact">
            <span>{{ $t("footer.cta") }}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <a :href="`mailto:${email}`" class="footer__btn footer__btn--ghost">
            {{ $t("footer.email") }}
          </a>
        </div>
      </div>

      <!-- Compact link bar -->
      <div class="footer__bar">
        <img
          src="/images/logo.webp"
          :alt="brand"
          class="footer__brand-logo"
          width="294"
          height="94"
          loading="lazy"
        />
        <nav class="footer__nav" :aria-label="brand">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="localePath(link.to)"
            class="footer__link"
          >
            {{ $t(link.label) }}
          </NuxtLink>
        </nav>
        <ul class="footer__socials">
          <li v-for="s in socials" :key="s.name">
            <a
              :href="s.href"
              class="footer__social"
              :aria-label="s.name"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path :d="s.path" fill="currentColor" />
              </svg>
            </a>
          </li>
        </ul>
      </div>

      <!-- Watermark -->
      <div class="footer__mark" aria-hidden="true">
        <span class="footer__watermark">{{ watermark }}</span>
      </div>

      <!-- Bottom bar -->
      <div class="footer__bottom">
        <p class="footer__copy">© {{ year }} {{ $t("footer.rights") }}</p>
      </div>
    </div>
```

Notes: tagline paragraph is gone; background layers (`UiMeshGradientBg`, `.footer__fade`, `.footer__noise`, `.footer__spotlight`) above `.footer__inner` stay exactly as they are.

- [ ] **Step 3: Replace the styles between `.footer__inner` and `.footer__mark`**

Delete the rules `.footer__head`, `.footer__tagline` and the old `.footer__brand-logo`, `.footer__socials`, `.footer__social`, `.footer__nav`, `.footer__link` blocks. In their place (after the `.footer__inner` rule) add:

```css
/* ── CTA scene ── */
.footer__cta {
  text-align: center;
  padding: 1.5rem 0 3.5rem;
}

.footer__eyebrow {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(169, 214, 229, 0.75);
}

.footer__prompt {
  margin: 0 auto;
  max-width: 18ch;
  font-size: clamp(2.2rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: transparent;
  background: linear-gradient(180deg, #ffffff 0%, rgba(238, 241, 247, 0.55) 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.footer__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.875rem;
  margin-top: 2.25rem;
}

.footer__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1.9rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.footer__btn--primary {
  border: none;
  background: #eef1f7;
  color: #05051a;
}

.footer__btn--primary:hover,
.footer__btn--primary:focus-visible {
  transform: scale(1.04);
  box-shadow: 0 0 32px rgba(70, 230, 225, 0.45);
}

.footer__btn--ghost {
  background: transparent;
  border: 1px solid rgba(238, 241, 247, 0.25);
  color: rgba(238, 241, 247, 0.85);
}

.footer__btn--ghost:hover,
.footer__btn--ghost:focus-visible {
  border-color: rgba(169, 214, 229, 0.6);
  color: #ffffff;
}

.footer__btn:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

/* ── Link bar ── */
.footer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer__brand-logo {
  display: block;
  height: 28px;
  width: auto;
}

.footer__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.75rem;
}

.footer__link {
  font-size: 0.9375rem;
  font-weight: 500;
  color: rgba(238, 241, 247, 0.7);
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer__link:hover,
.footer__link:focus-visible {
  color: #ffffff;
}

.footer__socials {
  display: flex;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer__social {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  color: rgba(238, 241, 247, 0.55);
  transition: color 0.25s ease, background 0.25s ease, transform 0.25s ease;
}

.footer__social:hover,
.footer__social:focus-visible {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  outline: none;
}

@media (max-width: 640px) {
  .footer__bar {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
}
```

- [ ] **Step 4: Shrink the watermark block and update reduced-motion**

In `.footer__mark`, change `margin: 2.5rem 0 1rem;` → `margin: 2rem 0 0.5rem;` and `min-height: clamp(120px, 18vw, 240px);` → `min-height: clamp(90px, 13vw, 180px);`.

Delete the unused `.footer__logo` and `.footer__logo img` rules.

Extend the reduced-motion block at the end of the styles to:

```css
@media (prefers-reduced-motion: reduce) {
  .footer__spotlight {
    display: none;
  }
  .footer__social,
  .footer__btn {
    transition: none;
  }
  .footer__btn--primary:hover,
  .footer__btn--primary:focus-visible {
    transform: none;
    box-shadow: none;
  }
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0, no Vue compile errors.

- [ ] **Step 6: Commit**

```bash
git add app/components/SiteFooter.vue
git commit -m "feat: redesign footer with CTA-first layout and contact modal trigger"
```

---

### Task 3: Portfolio.vue bento cards

**Files:**
- Modify: `app/components/Portfolio.vue` (script: add one helper; template: rewrite card markup; styles: rewrite grid/card CSS)

**Interfaces:**
- Consumes: `portfolio.all` key from Task 1; existing `UiArrowLink` component (`app/components/ui/ArrowLink.vue`, props `to`, `text`, `direction`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add bento class helper to script**

After `const items = computed(...)`, add:

```js
// Bento rhythm: per 6 items — first is featured (2×2), fourth is tall (1×2).
const cardClass = (index) => ({
  "card--featured": index % 6 === 0,
  "card--tall": index % 6 === 3,
});
```

Leave fetching and reveal logic untouched.

- [ ] **Step 2: Rewrite the grids in the template**

Replace the skeleton grid with:

```html
      <div v-else-if="pending" class="portfolio__grid">
        <div
          v-for="n in 6"
          :key="n"
          class="card card--skeleton"
          :class="cardClass(n - 1)"
        />
      </div>
```

Replace the items grid + card markup with:

```html
      <div v-else class="portfolio__wrap">
        <div class="portfolio__grid">
          <NuxtLink
            v-for="(item, index) in items"
            :key="item.alias"
            :to="localePath(`/portfolio/${item.alias}`)"
            class="card"
            :class="cardClass(index)"
          >
            <img
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              class="card__img"
            />
            <div class="card__scrim" aria-hidden="true" />
            <div class="card__content">
              <ul v-if="item.services?.length" class="card__tags">
                <li v-for="srv in item.services" :key="srv" class="tag">
                  {{ srv }}
                </li>
              </ul>
              <div class="card__top">
                <h3 class="card__title">{{ item.title }}</h3>
                <span class="card__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <p class="card__text">{{ item.short_text }}</p>
            </div>
          </NuxtLink>
        </div>

        <div class="portfolio__more">
          <UiArrowLink
            to="/portfolio"
            :text="$t('portfolio.all')"
            direction="forward"
          />
        </div>
      </div>
```

- [ ] **Step 3: Rewrite grid + card styles**

Replace everything from the `/* ---------- Grid ... */` comment down to (but not including) the `/* ---------- Skeleton ... */` comment with:

```css
/* ---------- Bento grid ---------- */
.portfolio__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.portfolio__grid .card {
  min-height: 380px;
}

@media (min-width: 900px) {
  .portfolio__grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 280px;
    grid-auto-flow: dense;
  }
  .portfolio__grid .card {
    min-height: 0;
  }
  .card--featured {
    grid-column: span 2;
    grid-row: span 2;
  }
  .card--tall {
    grid-row: span 2;
  }
}

.portfolio__more {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

/* ---------- Spotlight: hovering the grid dims non-hovered cards ---------- */
.portfolio__grid .card {
  transition: transform 0.4s ease, border-color 0.4s ease,
    box-shadow 0.4s ease, opacity 0.4s ease;
}

@media (hover: hover) {
  .portfolio__grid:hover .card {
    opacity: 0.42;
  }
  .portfolio__grid:hover .card:hover {
    opacity: 1;
  }
}

/* ---------- Card: image-first ---------- */
.card {
  position: relative;
  display: block;
  overflow: hidden;
  background: #0a0a2e;
  border: 1px solid rgba(238, 241, 247, 0.08);
  border-radius: 1.25rem;
  text-decoration: none;
  color: inherit;
}

/* Cyan hairline sweep — signature accent on hover */
.card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, #46e6e1, rgba(70, 230, 225, 0));
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.card:hover::before {
  transform: scaleX(1);
}

.card:hover {
  transform: translateY(-6px);
  border-color: rgba(169, 214, 229, 0.45);
  box-shadow: 0 18px 40px -24px rgba(42, 111, 151, 0.6);
}

.card:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
  border-color: rgba(169, 214, 229, 0.45);
}

.card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.card:hover .card__img {
  transform: scale(1.06);
}

/* Scrim — text legibility over the image */
.card__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(5, 5, 26, 0.92) 0%,
    rgba(5, 5, 26, 0.4) 45%,
    rgba(5, 5, 26, 0) 70%
  );
  transition: opacity 0.3s ease;
}

.card:hover .card__scrim {
  opacity: 1;
}

/* ---------- Content ---------- */
.card__content {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1.5rem;
}

.card--featured .card__content {
  padding: 2rem;
}

.card__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.card__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.01em;
}

.card--featured .card__title {
  font-size: clamp(1.6rem, 2.4vw, 2rem);
}

.card__arrow {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: #a9d6e5;
  background: rgba(42, 111, 151, 0.28);
  border: 1px solid rgba(42, 111, 151, 0.4);
  transform: translate(4px, -2px);
  opacity: 0.55;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
}

.card:hover .card__arrow {
  transform: translate(0, 0);
  opacity: 1;
  background: rgba(42, 111, 151, 0.45);
}

/* Short text — collapsed, revealed on hover/focus */
.card__text {
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #c3cad8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: max-height 0.4s ease, opacity 0.4s ease;
}

.card:hover .card__text,
.card:focus-visible .card__text {
  max-height: 3.2em;
  opacity: 1;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tag {
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
  color: #a9d6e5;
  background: rgba(5, 5, 26, 0.55);
  border: 1px solid rgba(42, 111, 151, 0.45);
  border-radius: 999px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
```

- [ ] **Step 4: Update skeleton + reduced-motion styles**

Replace the `.card--skeleton` / `.card--featured-skel` block with:

```css
/* ---------- Skeleton: shimmer sweep, heights come from the bento grid ---------- */
.card--skeleton {
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.04) 40%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 60%
  );
  background-size: 200% 100%;
  animation: portfolio-shimmer 1.4s ease infinite;
}
```

(Keep the `@keyframes portfolio-shimmer` block.)

Replace the final reduced-motion block with:

```css
/* ---------- Reduced motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .card,
  .card__img,
  .card__arrow,
  .card__text,
  .card::before {
    transition: none;
  }
  .card:hover {
    transform: none;
  }
  .card:hover .card__img {
    transform: none;
  }
  .card__text {
    max-height: 3.2em;
    opacity: 1;
  }
  .portfolio__grid:hover .card {
    opacity: 1;
  }
  .card--skeleton {
    animation: none;
  }
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
git add app/components/Portfolio.vue
git commit -m "feat: rebuild homepage portfolio as image-first bento grid"
```

---

### Task 4: Manual verification

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1–3.

- [ ] **Step 1: Start dev server**

Run: `npm run dev` (serves at http://localhost:6561).

- [ ] **Step 2: Verify checklist on `/`, `/en/`, `/uz/`**

- Footer: eyebrow + big headline render translated; primary button opens contact modal; ghost button is `mailto:hi@esys.pro`; link bar shows logo / nav / socials; watermark + copyright below.
- Portfolio: cards are image-filled with bottom scrim text; first card spans 2×2 at ≥900px; every 4th-of-six card is tall; hover reveals short text and zooms image; «Все проекты» arrow link navigates to `/portfolio`.
- Mobile width (<640px): footer bar stacks centered; portfolio single column.
- DevTools → emulate `prefers-reduced-motion: reduce`: no zoom/lift, card text visible immediately.

- [ ] **Step 3: Fix any issues found, amend relevant commits or add fix commits**
