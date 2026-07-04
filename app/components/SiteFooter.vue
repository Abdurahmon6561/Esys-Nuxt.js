<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const localePath = useLocalePath();
const { open: openContact } = useContactModal();

// Brand + contact.
const brand = "Evolution Systems";
const watermark = "ESYS";
const email = "hi@esys.pro";

// Social links — update handles to the real accounts.
const socials = [
  {
    name: "Telegram",
    href: "https://t.me/esyspro",
    path: "M21.94 4.6 18.9 19.2c-.23 1.02-.84 1.27-1.7.79l-4.7-3.47-2.27 2.18c-.25.25-.46.46-.94.46l.34-4.78L18.6 6.3c.38-.34-.08-.53-.6-.19L7.27 13.04l-4.66-1.46c-1.01-.32-1.03-1.01.21-1.5L20.64 3.2c.84-.31 1.58.2 1.3 1.4Z",
  },
  {
    name: "Instagram",
    href: "https://instagram.com/esys.pro",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 1.62c-3.15 0-3.5.01-4.74.07-1.14.05-1.76.24-2.18.4-.55.22-.94.47-1.35.88-.41.41-.66.8-.88 1.35-.16.42-.35 1.04-.4 2.18-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.14.24 1.76.4 2.18.22.55.47.94.88 1.35.41.41.8.66 1.35.88.42.16 1.04.35 2.18.4 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.14-.05 1.76-.24 2.18-.4.55-.22.94-.47 1.35-.88.41-.41.66-.8.88-1.35.16-.42.35-1.04.4-2.18.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.14-.24-1.76-.4-2.18-.22-.55-.47-.94-.88-1.35-.41-.41-.8-.66-1.35-.88-.42-.16-1.04-.35-2.18-.4-1.24-.06-1.59-.07-4.74-.07Zm0 2.76a5.46 5.46 0 1 1 0 10.92 5.46 5.46 0 0 1 0-10.92Zm0 9a3.54 3.54 0 1 0 0-7.08 3.54 3.54 0 0 0 0 7.08Zm6.95-9.2a1.28 1.28 0 1 1-2.55 0 1.28 1.28 0 0 1 2.55 0Z",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/esys",
    path: "M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.3 8.48h3.3V21H3.3V8.48Zm5.41 0h3.16v1.71h.05c.44-.83 1.51-1.71 3.11-1.71 3.33 0 3.94 2.19 3.94 5.04V21h-3.3v-5.79c0-1.38-.02-3.16-1.93-3.16-1.93 0-2.23 1.51-2.23 3.06V21h-3.3V8.48Z",
  },
  {
    name: "Email",
    href: `mailto:${email}`,
    path: "M3 5h18c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1Zm9 7.13 7.6-4.97c.07-.36-.2-.66-.6-.66H5c-.4 0-.67.3-.6.66L12 12.13Zm0 1.92L4 8.84V18h16V8.84l-8 5.21Z",
  },
];

const links = [
  { label: "footer.links.portfolio", to: "/portfolio" },
  { label: "footer.links.blog", to: "/blog" },
  { label: "footer.links.contact", to: "/contact" },
];

const year = new Date().getFullYear();

// Spotlight follows cursor.
const sectionRef = ref(null);

const onPointerMove = (e) => {
  const el = sectionRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
  el.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
};

const onPointerLeave = () => {
  const el = sectionRef.value;
  if (!el) return;
  el.style.setProperty("--mx", "50%");
  el.style.setProperty("--my", "50%");
};

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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

<template>
  <footer ref="sectionRef" class="footer">
    <ClientOnly>
      <UiMeshGradientBg
        :colors="['#05050f', '#0a0a2e', '#13244a', '#1b3a6b']"
        :speed="0.35"
      />
    </ClientOnly>

    <!-- Top fade — eases the portfolio solid bg into the footer mesh -->
    <div class="footer__fade" aria-hidden="true" />
    <div class="footer__noise" aria-hidden="true" />
    <div class="footer__spotlight" aria-hidden="true" />

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
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #05051a;
  color: #eef1f7;
  --mx: 50%;
  --my: 50%;
}

/* Top fade — blends the Portfolio solid bg (#05051a) into the footer mesh
   so the seam between sections disappears. Mirrors the hero's bottom fade. */
.footer__fade {
  position: absolute;
  inset: 0 0 auto 0;
  z-index: 1;
  height: 28vh;
  pointer-events: none;
  background: linear-gradient(to bottom, #05051a 0%, rgba(5, 5, 26, 0) 100%);
}

.footer__noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url("/images/noise-bg.png");
  background-size: 200px;
  background-repeat: repeat;
  opacity: 0.2;
  mix-blend-mode: overlay;
}

.footer__spotlight {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    420px circle at var(--mx) var(--my),
    rgba(169, 214, 229, 0.18),
    rgba(169, 214, 229, 0) 70%
  );
  mix-blend-mode: screen;
  transition: background 0.12s ease-out;
}

.footer__inner {
  position: relative;
  z-index: 3;
  max-width: 1100px;
  margin: 0 auto;
  padding: 4.5rem 1.5rem 1.75rem;
}

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

@media (max-width: 640px) {
  .footer__bar {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
}

/* ── Watermark ── */
.footer__mark {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2rem 0 0.5rem;
  min-height: clamp(90px, 13vw, 180px);
}

.footer__watermark {
  font-size: clamp(4.5rem, 22vw, 17rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  white-space: nowrap;
  color: transparent;
  background: linear-gradient(
    180deg,
    rgba(238, 241, 247, 0.16),
    rgba(238, 241, 247, 0.02) 70%,
    transparent
  );
  -webkit-background-clip: text;
  background-clip: text;
  user-select: none;
}

/* ── Bottom bar ── */
.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  text-align: center;
}

.footer__copy {
  margin: 0;
  font-size: 0.8125rem;
  color: rgba(238, 241, 247, 0.5);
}

@media (max-width: 560px) {
  .footer__bottom {
    justify-content: center;
    text-align: center;
  }
}

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
</style>
