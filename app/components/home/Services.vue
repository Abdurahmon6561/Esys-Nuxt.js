<script setup>
// Homepage services grid: pulls the same CMS list as /services, but renders
// a compact 5-card teaser with h3 titles linking to the service pages.
const { servicesApi } = useApiService();
const { locale } = useI18n();
const localePath = useLocalePath();

// getServices() → { data: [{ title, alias, short_text, image }] }.
const { data, pending, error } = await useAsyncData(
  "home-services",
  () => servicesApi.getServices(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

const SKELETON_COUNT = 5;
const STAGGER_MS = 80;

// short_text arrives as rich text from the CMS - strip markup for display.
const cardText = (item) => plainText(item.short_text);
</script>

<template>
  <section class="hservices">
    <div class="hservices__inner">
      <UiSectionHead
        :eyebrow="$t('homeServices.eyebrow')"
        :title="$t('homeServices.title')"
        :subtitle="$t('homeServices.subtitle')"
      />

      <p v-if="error" class="hservices__error">
        {{ $t("homeServices.error") }}
      </p>

      <div
        v-else-if="pending"
        class="hservices__grid hservices__grid--five"
      >
        <div
          v-for="n in SKELETON_COUNT"
          :key="n"
          class="hservices__skeleton"
        />
      </div>

      <template v-else>
        <UiReveal
          tag="div"
          class="hservices__grid"
          :class="{ 'hservices__grid--five': items.length === 5 }"
        >
          <NuxtLink
            v-for="(item, index) in items"
            :key="item.alias"
            :to="localePath(`/services/${item.alias}`)"
            class="hservices__card"
          >
            <span class="hservices__top">
              <span class="hservices__num">
                {{ String(index + 1).padStart(2, "0") }}
              </span>
              <span class="hservices__more" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </span>
            <h3 class="hservices__title">{{ item.title }}</h3>
            <p class="hservices__text">{{ cardText(item) }}</p>
          </NuxtLink>
        </UiReveal>

        <UiReveal class="hservices__footer">
          <NuxtLink :to="localePath('/services')" class="hservices__all">
            {{ $t("homeServices.all_link") }}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </NuxtLink>
        </UiReveal>
      </template>
    </div>
  </section>
</template>

<style scoped>
.hservices {
  background: var(--color-ground, #05051a);
  color: var(--color-text-primary, #eef1f7);
}

.hservices__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.hservices__error {
  margin: 0;
  color: #ffb4b4;
}

/* Mobile-first. Placement rules live only inside their own range: a span
   leaking into a narrower grid creates implicit columns. Five services get
   3+3 / 2+2+2 on desktop and 2 / 1+1 / 1+1 on tablets - no lone last card. */
.hservices__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

.hservices__grid > * {
  min-width: 0;
}

@media (min-width: 641px) and (max-width: 1100px) {
  .hservices__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hservices__grid--five > :first-child {
    grid-column: span 2;
  }

  .hservices__grid--five > .hservices__card:first-child .hservices__title {
    font-size: clamp(1.375rem, 1.2rem + 0.5vw, 1.5rem);
  }

  .hservices__grid--five > .hservices__card:first-child .hservices__text {
    max-width: 46ch;
  }
}

@media (min-width: 1101px) {
  .hservices__grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .hservices__grid > * {
    grid-column: span 2;
  }

  .hservices__grid--five > :nth-child(-n + 2) {
    grid-column: span 3;
  }

  .hservices__grid--five > .hservices__card:nth-child(-n + 2) .hservices__title {
    font-size: clamp(1.375rem, 1.2rem + 0.5vw, 1.5rem);
  }

  .hservices__grid--five > .hservices__card:nth-child(-n + 2) .hservices__text {
    max-width: 46ch;
  }
}

.hservices__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1.75rem;
  border-radius: 1.25rem;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
}

/* Cyan hairline sweep - signature accent shared with portfolio/review cards */
.hservices__card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  background: linear-gradient(90deg, #46e6e1, rgba(70, 230, 225, 0));
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.hservices__card:hover::before {
  transform: scaleX(1);
}

.hservices__card:hover {
  border-color: rgba(169, 214, 229, 0.32);
  background: rgba(24, 34, 58, 0.55);
  transform: translateY(-4px);
}

.hservices__card:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

.hservices__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.hservices__num {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(169, 214, 229, 0.45);
}

.hservices__title {
  margin: 0;
  font-size: clamp(1.1875rem, 1rem + 0.5vw, 1.375rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
  text-wrap: balance;
  hyphens: manual;
  overflow-wrap: normal;
}

.hservices__text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
  text-wrap: pretty;
}

.hservices__more {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid rgba(169, 214, 229, 0.25);
  border-radius: 50%;
  color: #a9d6e5;
  transition: border-color 0.25s ease, background 0.25s ease;
}

.hservices__more svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.25s ease;
}

.hservices__card:hover .hservices__more {
  border-color: #46e6e1;
  background: rgba(70, 230, 225, 0.1);
}

.hservices__card:hover .hservices__more svg {
  transform: translateX(2px);
}

.hservices__footer {
  display: flex;
  justify-content: flex-start;
  margin-top: 2.5rem;
  text-align: left;
}

.hservices__all {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: 1px solid rgba(238, 241, 247, 0.4);
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  color: #eef1f7;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.hservices__all:hover {
  border-color: #eef1f7;
  background: rgba(238, 241, 247, 0.08);
}

.hservices__all:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

.hservices__all svg {
  width: 1rem;
  height: 1rem;
}

/* ── Skeleton ── */
.hservices__skeleton {
  min-height: 210px;
  border-radius: 1.25rem;
  background: linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.04) 40%,
    rgba(255, 255, 255, 0.09) 50%,
    rgba(255, 255, 255, 0.04) 60%
  );
  background-size: 200% 100%;
  animation: hservices-shimmer 1.4s ease infinite;
}

@keyframes hservices-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 640px) {
  .hservices__inner {
    padding: 4.5rem 1.5rem;
  }

  .hservices__card {
    padding: 1.5rem;
  }

  .hservices__footer {
    width: 100%;
  }

  .hservices__all {
    justify-content: center;
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hservices__card,
  .hservices__card::before,
  .hservices__more,
  .hservices__more svg,
  .hservices__all {
    transition: none;
  }
  .hservices__card:hover,
  .hservices__card:hover .hservices__more svg {
    transform: none;
  }
  .hservices__skeleton {
    animation: none;
  }
}
</style>
