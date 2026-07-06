<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

const { portfolioApi } = useApiService();
const { locale } = useI18n();
const localePath = useLocalePath();

// Refetches when locale changes - API returns content in the active language.
const { data, pending, error } = await useAsyncData(
  "portfolios",
  () => portfolioApi.getPortfolios(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

// Bento rhythm: per 6 items - first is featured (2×2). No vertical/tall cards.
const cardClass = (index) => ({
  "card--featured": index % 6 === 0,
});

// GSAP scroll-reveal: stagger cards in as they enter the viewport. Cards are
// rendered after async data resolves, so batch is wired once items populate.
const root = ref(null);
let scope = null;
let stopWatch = null;

onMounted(() => {
  scope = useGsapScope(({ gsap, ScrollTrigger, isReducedMotion }) => {
    if (isReducedMotion) return;

    const wireBatch = () => {
      ScrollTrigger.batch(".portfolio__grid .card:not(.card--skeleton)", {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.from(batch, {
            opacity: 0,
            y: 40,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            overwrite: true,
          }),
      });
      // Cards + images land after async data: recalc trigger positions so
      // reveals fire at the right scroll offsets.
      ScrollTrigger.refresh();
    };

    // Cards already in DOM (cached data) → wire now. Otherwise wait for the
    // watch fired by useAsyncData resolving.
    if (items.value.length) {
      nextTick(wireBatch);
    } else {
      stopWatch = watch(
        items,
        (vals) => {
          if (vals?.length) {
            nextTick(() => {
              wireBatch();
              stopWatch?.();
              stopWatch = null;
            });
          }
        },
        { immediate: true }
      );
    }
  }, root);
});

onBeforeUnmount(() => {
  stopWatch?.();
  scope?.revert();
  scope = null;
});
</script>

<template>
  <section ref="root" class="portfolio" id="portfolio">
    <div class="portfolio__inner">
      <UiSectionHead
        :eyebrow="$t('portfolio.eyebrow')"
        :title="$t('portfolio.title')"
        :subtitle="$t('portfolio.subtitle')"
      />

      <p v-if="error" class="portfolio__error">{{ $t("portfolio.error") }}</p>

      <div v-else-if="pending" class="portfolio__grid">
        <div
          v-for="n in 6"
          :key="n"
          class="card card--skeleton"
          :class="cardClass(n - 1)"
        />
      </div>

      <p v-else-if="!items.length" class="portfolio__empty">
        {{ $t("portfolio.empty") }}
      </p>

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
    </div>
  </section>
</template>

<style scoped>
.portfolio {
  position: relative;
  width: 100%;
  /* Pull up under the hero's bottom fade so the seam disappears */
  margin-top: -1px;
  padding: 6rem 1.5rem;
  background: #05051a;
  color: #eef1f7;
}

.portfolio__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.portfolio__error {
  text-align: center;
  color: #ffb4b4;
}

.portfolio__empty {
  padding: 4rem 0;
  text-align: center;
  color: #c3cad8;
}

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

/* Cyan hairline sweep - signature accent on hover */
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

/* Keyboard navigation: visible ring + same lift as hover */
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

/* Scrim - text legibility over the image */
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

/* Short text - collapsed, revealed on hover/focus */
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

@keyframes portfolio-shimmer {
  to {
    background-position: -200% 0;
  }
}

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
</style>