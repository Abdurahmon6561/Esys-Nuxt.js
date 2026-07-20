<script setup>
// Background: CSS layers (grain + glow + scrim) over a Three.js cosmos
// (starfield + rocket) rendered by UiCosmosScene. Content unchanged.
// Motion: GSAP entrance timeline for text + scrub parallax on bg layers.
import { ref, onMounted, onBeforeUnmount } from "vue";

const localePath = useLocalePath();
const { open: openContact } = useContactModal();

const hero = ref(null);
const title = ref(null);
const subtitle = ref(null);
const actions = ref(null);
let scope = null;

onMounted(() => {
  scope = useGsapScope(({ gsap, isReducedMotion }) => {
    // Always keep content visible under reduced motion — no tween, no parallax.
    if (isReducedMotion) return;

    // Entrance: stagger headline → subtitle → actions.
    gsap.timeline({ delay: 0.2 }).from(
      [title.value, subtitle.value, actions.value],
      {
        opacity: 0,
        y: 28,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.14,
      }
    );

    // Parallax: bg layers drift up as the hero scrolls away. scrub ties
    // the tween to scroll position instead of time. Targets static divs
    // only — the cosmos canvas animates itself.
    const parallax = (sel, y) =>
      gsap.to(sel, {
        y,
        ease: "none",
        scrollTrigger: {
          trigger: hero.value,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

    parallax(".hero__glow", -60);
    parallax(".hero__grain", -40);
  }, hero);
});

onBeforeUnmount(() => {
  scope?.revert();
  scope = null;
});
</script>

<template>
  <section ref="hero" class="hero">
    <!-- Heavy procedural film grain (SVG noise) - textures the gradient -->
    <div class="hero__grain" aria-hidden="true" />

    <!-- Teal glow concentrated at bottom-left + bottom-right corners -->
    <div class="hero__glow" aria-hidden="true" />

    <!-- Top darkening - fades into near-black at the top -->
    <div class="hero__scrim" aria-hidden="true" />

    <!-- Three.js cosmos: realistic starfield + rocket with logo -->
    <ClientOnly>
      <UiCosmosScene class="hero__cosmos" />
    </ClientOnly>

    <!-- Bottom fade - melts hero into the Portfolio section below -->
    <div class="hero__fade" aria-hidden="true" />

    <!-- Content -->
    <div class="hero__content">
      <div class="hero__text">
        <h1 ref="title" class="hero__title">{{ $t("hero.title") }}</h1>
        <p ref="subtitle" class="hero__subtitle">{{ $t("hero.subtitle") }}</p>
      </div>

      <div ref="actions" class="hero__actions">
        <NuxtLink :to="localePath('/portfolio')" class="btn btn--primary">
          {{ $t("hero.cta_projects") }}
        </NuxtLink>
        <button type="button" class="btn btn--ghost" @click="openContact">
          {{ $t("hero.cta_contact") }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  /* Deep matte black base */
  background:
    radial-gradient(120% 80% at 50% 120%, #0a0a0a 0%, #050505 60%, #050505 100%),
    #050505;
  color: #eef1f7;
}

/* ---------- Film grain (procedural SVG noise, high density) ---------- */
.hero__grain {
  position: absolute;
  inset: -50%;
  z-index: 1;
  width: 200%;
  height: 200%;
  pointer-events: none;
  opacity: 0.38;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 220px 220px;
  will-change: transform;
  animation: grain 7s steps(8) infinite;
}

@keyframes grain {
  0% { transform: translate3d(0, 0, 0); }
  10% { transform: translate3d(-3%, -2%, 0); }
  20% { transform: translate3d(2%, 3%, 0); }
  30% { transform: translate3d(-1%, 1%, 0); }
  40% { transform: translate3d(3%, -3%, 0); }
  50% { transform: translate3d(-2%, 2%, 0); }
  60% { transform: translate3d(1%, -1%, 0); }
  70% { transform: translate3d(-3%, 3%, 0); }
  80% { transform: translate3d(2%, -2%, 0); }
  90% { transform: translate3d(-1%, -3%, 0); }
  100% { transform: translate3d(0, 0, 0); }
}

/* ---------- Teal glow at bottom-left + bottom-right corners (screen) ---------- */
.hero__glow {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: screen;
  background:
    radial-gradient(
      70% 55% at 4% 104%,
      rgba(70, 230, 225, 0.55) 0%,
      rgba(40, 175, 190, 0.28) 30%,
      rgba(15, 90, 110, 0.08) 58%,
      rgba(0, 0, 0, 0) 78%
    ),
    radial-gradient(
      70% 55% at 96% 104%,
      rgba(70, 230, 225, 0.55) 0%,
      rgba(40, 175, 190, 0.28) 30%,
      rgba(15, 90, 110, 0.08) 58%,
      rgba(0, 0, 0, 0) 78%
    );
  will-change: opacity;
  animation: glowPulse 7s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.92; }
  50% { opacity: 1; }
}

/* ---------- Top darkening - fades into near-black at the top (multiply) ---------- */
.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: multiply;
  background: linear-gradient(
    to bottom,
    #000000 0%,
    rgba(0, 0, 0, 0.85) 18%,
    rgba(0, 0, 0, 0.35) 45%,
    rgba(0, 0, 0, 0) 72%,
    rgba(0, 0, 0, 0) 100%
  );
}

/* ---------- Three.js cosmos layer (starfield + rocket) ---------- */
.hero__cosmos {
  z-index: 1;
}

/* ---------- Content (unchanged layout/typography) ---------- */
.hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 100vh;
  min-height: 100svh;
  padding: 6rem 1.5rem;
  text-align: center;
}

.hero__text {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.hero__title {
  max-width: 24ch;
  margin: 0;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.hero__subtitle {
  max-width: 60ch;
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.375rem);
  line-height: 1.5;
  color: #c3cad8;
}

/* Actions */
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  font-family: inherit;
  line-height: 1.2;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn--primary {
  background: #eef1f7;
  color: #0a0a2e;
}

.btn--primary:hover {
  background: #fff;
}

.btn--ghost {
  background: transparent;
  color: #eef1f7;
  border: 1px solid rgba(238, 241, 247, 0.4);
}

.btn--ghost:hover {
  border-color: #eef1f7;
  background: rgba(238, 241, 247, 0.08);
}

/* ---------- Bottom fade into Portfolio (#05051a) ---------- */
.hero__fade {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 1;
  height: 34vh;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    rgba(5, 5, 5, 0) 0%,
    rgba(5, 5, 26, 0.55) 45%,
    #05051a 100%
  );
}

/* Respect reduced-motion: keep background visible, freeze animation.
   The cosmos canvas handles its own reduced-motion (static frame). */
@media (prefers-reduced-motion: reduce) {
  .hero__grain,
  .hero__glow {
    animation: none;
  }
}
</style>