# Interactive Mesh Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a non-standard interactive "mesh canvas" footer with a live WebGL gradient, cursor spotlight, tilting glass card, and an oversized email link.

**Architecture:** One self-contained presentational component `app/components/SiteFooter.vue` mounted globally in `app.vue`. Reuses the existing `UiMeshGradientBg` (WebGL, client-only) as the background; cursor interactivity is an overlay layer (spotlight + card tilt), NOT shader surgery. No data fetching.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, `@nuxtjs/i18n`, `@paper-design/shaders` (via existing `UiMeshGradientBg`), Poppins, scoped CSS.

## Global Constraints

- **No test runner exists** in this project. Verification cycle per task = `npm run build` (must succeed, no SSR/hydration errors) + `npm run dev` visual check at `http://localhost:6561`.
- **Branch first:** `master` is the default branch — do all work on `feat/mesh-footer`, never commit directly to `master`.
- Palette only: `#0a0a2e`, `#1b3a6b`, `#2a6f97`, `#a9d6e5`, text `#eef1f7`, muted `#c3cad8`, base `#05051a`.
- WebGL mesh MUST stay inside `<ClientOnly>` (matches `Hero.vue`).
- Contact values are placeholders, each flagged `// TODO: real contact value`.
- No copyright bar, no nav links, no socials, no language switch in the footer.
- i18n: every user-facing string added to all three locales `en`, `ru`, `uz`.

---

### Task 0: Branch

- [ ] **Step 1: Create and switch to feature branch**

```bash
git checkout -b feat/mesh-footer
```

Expected: `Switched to a new branch 'feat/mesh-footer'`

---

### Task 1: Footer i18n strings

**Files:**
- Modify: `i18n/locales/en.json`
- Modify: `i18n/locales/ru.json`
- Modify: `i18n/locales/uz.json`

**Interfaces:**
- Produces: i18n keys `footer.prompt`, `footer.email`, `footer.phone` in all locales. `footer.prompt` = eyebrow line; `footer.email` / `footer.phone` = aria-labels for the links. Task 2 consumes these via `$t(...)`.

- [ ] **Step 1: Add `footer` block to `en.json`**

Add after the `portfolio` block (before `cookie`), keeping valid JSON (note the trailing comma on the preceding `}`):

```json
  "footer": {
    "prompt": "Let's build something great",
    "email": "Email us",
    "phone": "Call us"
  },
```

- [ ] **Step 2: Add `footer` block to `ru.json`** (same position)

```json
  "footer": {
    "prompt": "Давайте создадим нечто большее",
    "email": "Написать нам",
    "phone": "Позвонить"
  },
```

- [ ] **Step 3: Add `footer` block to `uz.json`** (same position)

```json
  "footer": {
    "prompt": "Keling, ajoyib narsa yaratamiz",
    "email": "Bizga yozing",
    "phone": "Qo'ng'iroq qiling"
  },
```

- [ ] **Step 4: Verify JSON is valid**

Run: `node -e "['en','ru','uz'].forEach(l=>{require('./i18n/locales/'+l+'.json').footer.prompt})"`
Expected: no output, exit 0 (throws if any `footer.prompt` missing or JSON malformed).

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/en.json i18n/locales/ru.json i18n/locales/uz.json
git commit -m "feat: add footer i18n strings for en/ru/uz"
```

---

### Task 2: SiteFooter component (static) + mount

Deliver the footer rendering below page content on every route, all locales, with working email/phone links and the layered mesh/noise/glass visuals — **no interactivity yet**.

**Files:**
- Create: `app/components/SiteFooter.vue`
- Modify: `app/app.vue` (mount after `<NuxtPage />`)

**Interfaces:**
- Consumes: `UiMeshGradientBg` (auto-imported, props `colors`, `speed`, `distortion`, `swirl`); `footer.*` i18n keys from Task 1.
- Produces: global `<SiteFooter />` component. Task 3 adds `sectionRef`/`cardRef` logic into this same file.

- [ ] **Step 1: Create `app/components/SiteFooter.vue`**

```vue
<script setup>
// Contact values — placeholders until real ones are provided.
const email = "hello@evolution-systems.uz"; // TODO: real contact value
const phoneDisplay = "+998 (00) 000-00-00";  // TODO: real contact value
const phoneHref = "+998000000000";           // TODO: real contact value
</script>

<template>
  <section class="footer">
    <ClientOnly>
      <UiMeshGradientBg
        :colors="['#0a0a2e', '#1b3a6b', '#2a6f97', '#a9d6e5']"
        :speed="0.25"
        :distortion="1.0"
        :swirl="0.7"
      />
    </ClientOnly>

    <div class="footer__noise" aria-hidden="true" />
    <div class="footer__spotlight" aria-hidden="true" />

    <div class="footer__card">
      <p class="footer__eyebrow">{{ $t("footer.prompt") }}</p>
      <a
        class="footer__email"
        :href="`mailto:${email}`"
        :aria-label="$t('footer.email')"
      >
        {{ email }}
      </a>
      <a
        class="footer__phone"
        :href="`tel:${phoneHref}`"
        :aria-label="$t('footer.phone')"
      >
        {{ phoneDisplay }}
      </a>
    </div>
  </section>
</template>

<style scoped>
.footer {
  position: relative;
  width: 100%;
  min-height: 70vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1.5rem;
  background: #05051a;
  color: #eef1f7;
  --mx: 50%;
  --my: 50%;
}

.footer__noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url("/images/noise-bg.png");
  background-size: 200px;
  background-repeat: repeat;
  opacity: 0.22;
  mix-blend-mode: overlay;
}

.footer__spotlight {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    340px circle at var(--mx) var(--my),
    rgba(169, 214, 229, 0.25),
    rgba(169, 214, 229, 0) 70%
  );
  mix-blend-mode: screen;
  transition: background 0.12s ease-out;
}

.footer__card {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 560px;
  padding: 2.75rem 2.5rem;
  text-align: center;
  border-radius: 1.5rem;
  background: rgba(16, 22, 40, 0.45);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  transform: perspective(900px) rotateX(0deg) rotateY(0deg);
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
}

.footer__eyebrow {
  margin: 0 0 1.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.footer__email {
  display: inline-block;
  position: relative;
  font-size: clamp(1.75rem, 5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #eef1f7;
  text-decoration: none;
  background-image: linear-gradient(#a9d6e5, #a9d6e5);
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 0% 2px;
  transition: background-size 0.35s ease, color 0.35s ease;
}

.footer__email:hover,
.footer__email:focus-visible {
  color: #a9d6e5;
  background-size: 100% 2px;
}

.footer__phone {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 500;
  color: #c3cad8;
  text-decoration: none;
  transition: color 0.25s ease;
}

.footer__phone:hover,
.footer__phone:focus-visible {
  color: #eef1f7;
}

.footer__email:focus-visible,
.footer__phone:focus-visible {
  outline: 2px solid #a9d6e5;
  outline-offset: 4px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  .footer__spotlight {
    display: none;
  }
  .footer__card {
    transition: none;
  }
}
</style>
```

- [ ] **Step 2: Mount in `app/app.vue`**

Change the template so it reads exactly:

```vue
<template>
  <Navbar />
  <NuxtPage />
  <SiteFooter />
  <ClientOnly>
    <CookieBanner />
  </ClientOnly>
</template>
```

- [ ] **Step 3: Build to verify SSR/hydration safety**

Run: `npm run build`
Expected: build completes, exit 0, no "Hydration" or "window is not defined" errors.

- [ ] **Step 4: Visual check in dev**

Run: `npm run dev`, open `http://localhost:6561`, scroll to bottom.
Expected: footer renders below `Portfolio`; animated mesh gradient visible; glass card centered with large email + phone; clicking email opens mail client. Check `/en` and `/uz` — eyebrow text changes per locale.

- [ ] **Step 5: Commit**

```bash
git add app/components/SiteFooter.vue app/app.vue
git commit -m "feat: add static mesh footer component and mount globally"
```

---

### Task 3: Cursor spotlight + card tilt interactivity

Add pointer-driven spotlight and 3D card tilt, gated behind `prefers-reduced-motion`. Modifies only `app/components/SiteFooter.vue`.

**Files:**
- Modify: `app/components/SiteFooter.vue` (`<script setup>` only; template/CSS from Task 2 already support it via `ref`s and `--mx`/`--my`)

**Interfaces:**
- Consumes: `.footer` CSS vars `--mx`/`--my` and `.footer__card` transform (defined in Task 2 CSS).
- Produces: none (terminal task).

- [ ] **Step 1: Replace `<script setup>` with the interactive version**

Replace the entire `<script setup>` block from Task 2 with:

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Contact values — placeholders until real ones are provided.
const email = "hello@evolution-systems.uz"; // TODO: real contact value
const phoneDisplay = "+998 (00) 000-00-00";  // TODO: real contact value
const phoneHref = "+998000000000";           // TODO: real contact value

const TILT_MAX = 6; // degrees

const sectionRef = ref(null);
const cardRef = ref(null);

const onPointerMove = (e) => {
  const el = sectionRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Spotlight follows cursor (percent of section).
  el.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
  el.style.setProperty("--my", `${(y / rect.height) * 100}%`);

  // Card tilts toward cursor.
  const card = cardRef.value;
  if (!card) return;
  const ry = ((x - rect.width / 2) / (rect.width / 2)) * TILT_MAX;
  const rx = -((y - rect.height / 2) / (rect.height / 2)) * TILT_MAX;
  card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
};

const onPointerLeave = () => {
  const el = sectionRef.value;
  if (el) {
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  }
  const card = cardRef.value;
  if (card) {
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }
};

onMounted(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) return;

  const el = sectionRef.value;
  if (!el) return;
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerleave", onPointerLeave);
});

onBeforeUnmount(() => {
  const el = sectionRef.value;
  if (!el) return;
  el.removeEventListener("pointermove", onPointerMove);
  el.removeEventListener("pointerleave", onPointerLeave);
});
</script>
```

- [ ] **Step 2: Wire the refs in the template**

Add `ref="sectionRef"` to the `<section class="footer">` opening tag and `ref="cardRef"` to the `<div class="footer__card">` opening tag. Nothing else in the template changes.

```vue
  <section ref="sectionRef" class="footer">
```
```vue
    <div ref="cardRef" class="footer__card">
```

- [ ] **Step 3: Build to verify SSR safety**

Run: `npm run build`
Expected: exit 0. (`window.matchMedia` is inside `onMounted`, so it is client-only and safe.)

- [ ] **Step 4: Visual check — interactivity**

Run: `npm run dev`, open `http://localhost:6561`, scroll to footer, move cursor across it.
Expected: a soft cyan spotlight glow tracks the cursor; the glass card tilts toward the cursor and springs back flat when the cursor leaves the footer.

- [ ] **Step 5: Visual check — reduced motion**

In DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload, move cursor over footer.
Expected: no spotlight, no tilt; card stays flat. Email/phone links still work.

- [ ] **Step 6: Commit**

```bash
git add app/components/SiteFooter.vue
git commit -m "feat: add cursor spotlight and card tilt to mesh footer"
```

---

## Self-Review

**Spec coverage:**
- Component `SiteFooter.vue` + mount in `app.vue` → Task 2 ✓
- Mesh layer (hero colors, speed 0.25, distortion/swirl) → Task 2 ✓
- Noise overlay → Task 2 ✓
- Cursor spotlight via `--mx`/`--my` → CSS Task 2, JS Task 3 ✓
- Glass card + tilt toward cursor (cap 6°) → CSS Task 2, JS Task 3 ✓
- Oversized email (`mailto`, clamp, underline-wipe) + phone (`tel`) → Task 2 ✓
- Placeholders flagged `// TODO` → Task 2 & 3 ✓
- No copyright/nav/socials/lang → honored (absent) ✓
- i18n `footer` block en/ru/uz → Task 1 ✓
- reduced-motion kills spotlight + tilt → CSS Task 2, JS guard Task 3 ✓
- client-only mesh + interactivity → `<ClientOnly>` + `onMounted` ✓
- semantic focusable links + focus ring → Task 2 CSS ✓

**Placeholder scan:** Contact values are intentional, flagged placeholders (per spec). No plan-level TBD/TODO-without-code. All code steps show full code.

**Type/name consistency:** `sectionRef`/`cardRef`, `--mx`/`--my`, `phoneHref`/`phoneDisplay`/`email`, class names `.footer__*` consistent across Task 2 CSS and Task 3 JS. Task 3 `<script setup>` re-declares the same contact constants as Task 2 (full-block replace — intentional, not a divergence).

**No spec requirement left unimplemented.**
