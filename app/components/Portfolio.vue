<script setup>
const { portfolioApi } = useApiService();
const { locale } = useI18n();

// Refetches when locale changes — API returns content in the active language.
const { data, pending, error } = await useAsyncData(
  "portfolios",
  () => portfolioApi.getPortfolios(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

// Scroll-reveal: fade-up section once it enters the viewport.
const root = ref(null);
const revealed = ref(false);
let observer = null;

onMounted(() => {
  if (!root.value) return;

  // Respect reduced-motion: show immediately, skip animation.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealed.value = true;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        revealed.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.15 }
  );
  observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section
    ref="root"
    class="portfolio"
    :class="{ 'is-revealed': revealed }"
    id="portfolio"
  >
    <div class="portfolio__inner">
      <header class="portfolio__head">
        <p class="portfolio__eyebrow">{{ $t("portfolio.eyebrow") }}</p>
        <h2 class="portfolio__title">{{ $t("portfolio.title") }}</h2>
        <p class="portfolio__subtitle">{{ $t("portfolio.subtitle") }}</p>
      </header>

      <p v-if="error" class="portfolio__error">{{ $t("portfolio.error") }}</p>

      <div v-else-if="pending" class="portfolio__grid">
        <div v-for="n in 6" :key="n" class="card card--skeleton" />
      </div>

      <div v-else class="portfolio__grid">
        <article v-for="item in items" :key="item.alias" class="card">
          <div class="card__media">
            <img
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              class="card__img"
            />
            <div class="card__overlay" aria-hidden="true" />
          </div>
          <div class="card__body">
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
            <ul v-if="item.services?.length" class="card__tags">
              <li v-for="srv in item.services" :key="srv" class="tag">
                {{ srv }}
              </li>
            </ul>
          </div>
        </article>
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

/* Scroll-reveal: fade + rise on enter */
.portfolio__inner {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.portfolio.is-revealed .portfolio__inner {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .portfolio__inner {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.portfolio__inner {
  max-width: 1200px;
  margin: 0 auto;
}

.portfolio__head {
  max-width: 60ch;
  margin: 0 auto 4rem;
  text-align: center;
}

.portfolio__eyebrow {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.portfolio__title {
  margin: 0 0 1rem;
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.portfolio__subtitle {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.5;
  color: #c3cad8;
}

.portfolio__error {
  text-align: center;
  color: #ffb4b4;
}

.portfolio__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
  gap: 2rem;
}

/* Card */
.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgba(238, 241, 247, 0.04);
  border: 1px solid rgba(238, 241, 247, 0.08);
  border-radius: 1.25rem;
  transition: transform 0.3s ease, border-color 0.3s ease,
    background 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-6px);
  border-color: rgba(169, 214, 229, 0.45);
  background: rgba(238, 241, 247, 0.07);
  box-shadow: 0 18px 40px -24px rgba(42, 111, 151, 0.6);
}

.card__media {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #0a0a2e;
}

.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.card:hover .card__img {
  transform: scale(1.06);
}

/* Bottom gradient overlay — depth + text legibility on hover */
.card__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(5, 5, 26, 0.55) 0%,
    rgba(5, 5, 26, 0) 45%
  );
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.card:hover .card__overlay {
  opacity: 1;
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.75rem;
}

.card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.card__title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.25;
}

.card__arrow {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: #a9d6e5;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.3);
  transform: translate(4px, -2px);
  opacity: 0.55;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
}

.card:hover .card__arrow {
  transform: translate(0, 0);
  opacity: 1;
  background: rgba(42, 111, 151, 0.35);
}

.card__text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #c3cad8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
}

.tag {
  padding: 0.3rem 0.75rem;
  font-size: 0.8125rem;
  color: #a9d6e5;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.35);
  border-radius: 999px;
}

/* Skeleton */
.card--skeleton {
  min-height: 440px;
  background: rgba(238, 241, 247, 0.04);
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.85;
  }
}
</style>
