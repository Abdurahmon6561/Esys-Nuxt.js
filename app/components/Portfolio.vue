<script setup>
const { portfolioApi } = useApiService();
const { locale } = useI18n();
const localePath = useLocalePath();
const { data, pending, error } = await useAsyncData(
  "portfolios", () => portfolioApi.getPortfolios(), { watch: [locale] },
);
// A short homepage selection; the complete catalogue stays on /portfolio.
const items = computed(() => (data.value?.data ?? []).slice(0, 3));
const failedImages = ref(new Set());
const imageFailed = (alias) => { failedImages.value = new Set([...failedImages.value, alias]); };
watch(locale, () => { failedImages.value = new Set(); });
const cardClass = (index) => ({ "card--featured": index === 0 });
const initials = (title) => title.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("");
</script>

<template>
  <section class="portfolio" id="portfolio">
    <div class="portfolio__inner">
      <UiSectionHead
        :title="$t('portfolio.title')"
        :subtitle="$t('portfolio.subtitle')"
      />

      <p v-if="error" class="portfolio__error">{{ $t("portfolio.error") }}</p>

      <div v-else-if="pending" class="portfolio__grid">
        <div
          v-for="n in 3"
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
            <div class="card__media">
              <div class="card__fallback" aria-hidden="true">
                <span class="card__monogram">{{ initials(item.title) }}</span>
                <span v-if="failedImages.has(item.alias) || !item.image" class="card__fallback-label">{{ $t('portfolio.openCase') }}</span>
              </div>
              <NuxtImg
                v-if="item.image && !failedImages.has(item.alias)"
                :src="item.image"
                :alt="item.title"
                loading="eager"
                width="960"
                height="720"
                format="webp"
                sizes="100vw md:66vw lg:800px"
                @error="imageFailed(item.alias)"
                class="card__img"
              />
            </div>
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
              <div class="card__text-wrap">
                <p class="card__text">{{ plainText(item.short_text) }}</p>
              </div>
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
  scroll-margin-top: 5rem;
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
  min-height: 0;
}

@media (min-width: 900px) {
  .portfolio__grid {
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: minmax(380px, auto);
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

/* ---------- Card: image-first ---------- */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0b1023;
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

/* Captions have their own opaque surface; artwork never sits behind text. */
.card__media {
  position: relative;
  flex: 1 0 180px;
  min-height: 180px;
  overflow: hidden;
}
@media (max-width: 899px) {
  .card__media { flex: none; aspect-ratio: 16 / 10; }
}

.card__fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 1rem;
  padding: 2rem;
  background: #101d31;
  color: #a9d6e5;
}
.card__monogram { font-size: clamp(3rem, 7vw, 5rem); font-weight: 700; letter-spacing: -0.03em; }
.card__fallback-label { font-size: 0.875rem; }

/* ---------- Content ---------- */
.card__content {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  background: #0b1023;
  border-top: 1px solid rgba(169, 214, 229, 0.14);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 1.25rem;
}

.card--featured .card__content {
  padding: 2rem;
}

.card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.card__title {
  margin: 0;
  font-size: 1.125rem;
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
  opacity: 1;
  transition: transform 0.3s ease, opacity 0.3s ease, background 0.3s ease;
}

.card:hover .card__arrow {
  transform: translate(0, 0);
  opacity: 1;
  background: rgba(42, 111, 151, 0.45);
}

.card__text {
  margin: 0;
  overflow: hidden;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #c3cad8;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
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
  background: #142139;
  border: 1px solid rgba(42, 111, 151, 0.45);
  border-radius: 999px;
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
  .card::before {
    transition: none;
  }
  .card:hover {
    transform: none;
  }
  .card:hover .card__img {
    transform: none;
  }
  .card--skeleton {
    animation: none;
  }
}
</style>