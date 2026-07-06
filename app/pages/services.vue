<script setup>
const { servicesApi } = useApiService();
const { locale, t } = useI18n();
const { open: openContact } = useContactModal();

// getServices() → services. Envelope: { data: [{ title, short_text, text, image }] }.
const { data, pending, error } = await useAsyncData(
  "services-all",
  () => servicesApi.getServices(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

// AI service is appended locally - the backend list has no AI entry yet.
// Rendered with an inline icon so it never depends on a backend image.
const cards = computed(() => [
  ...items.value,
  { title: t("services.ai.title"), text: t("services.ai.text"), ai: true },
]);

const SKELETON_COUNT = 4;

useSeoMeta({
  title: () => t("services.seo.title"),
  description: () => t("services.seo.description"),
  ogTitle: () => t("services.seo.title"),
  ogDescription: () => t("services.seo.description"),
});
</script>

<template>
  <main class="services page--dark">
    <div class="services__inner">
      <UiSectionHead
        :eyebrow="$t('services.eyebrow')"
        :title="$t('services.title')"
        :subtitle="$t('services.subtitle')"
      />

      <p v-if="error" class="services__error">{{ $t("services.error") }}</p>

      <div v-else-if="pending" class="services__grid">
        <UiSkeleton
          v-for="n in SKELETON_COUNT"
          :key="n"
          min-height="320px"
        />
      </div>

      <UiReveal v-else tag="div" class="services__grid">
        <article
          v-for="(item, index) in cards"
          :key="item.title"
          class="scard"
          :class="{ 'scard--ai': item.ai }"
        >
          <span class="scard__num">{{ String(index + 1).padStart(2, "0") }}</span>
          <div class="scard__icon" aria-hidden="true">
            <svg
              v-if="item.ai"
              class="scard__ai-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
              <path d="M12 8.5 13.4 11 16 12l-2.6 1L12 15.5 10.6 13 8 12l2.6-1L12 8.5Z" />
            </svg>
            <img v-else :src="item.image" alt="" loading="lazy" />
          </div>
          <h2 class="scard__title">{{ item.title }}</h2>
          <p class="scard__text">{{ item.text }}</p>
          <button type="button" class="scard__cta" @click="openContact">
            {{ $t("services.cta") }}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </article>
      </UiReveal>
    </div>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.services__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 9rem 1.5rem 6rem;
}

.services__error {
  text-align: center;
  color: #ffb4b4;
}

.services__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .services__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.scard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2.25rem 2rem;
  border-radius: 24px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition:
    transform 0.35s ease,
    border-color 0.35s ease,
    background 0.35s ease;
}

.scard:hover {
  transform: translateY(-4px);
  border-color: rgba(169, 214, 229, 0.32);
  background: rgba(24, 34, 58, 0.55);
}

.scard__num {
  position: absolute;
  top: 1.5rem;
  right: 1.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(169, 214, 229, 0.45);
}

.scard__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 16px;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.3);
}

.scard__icon img {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
  /* Source SVGs use a near-black fill (#222) - invert to white so they
     are visible on the dark card. */
  filter: brightness(0) invert(1);
}

.scard__ai-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #ffffff;
}

.scard__title {
  margin: 0;
  font-size: clamp(1.25rem, 2.4vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.scard__text {
  margin: 0;
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

.scard__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #a9d6e5;
  cursor: pointer;
  transition: color 0.25s ease, gap 0.25s ease;
}

.scard__cta svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.25s ease;
}

.scard__cta:hover {
  color: #ffffff;
  gap: 0.75rem;
}

.scard__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
  border-radius: 4px;
}

@media (max-width: 640px) {
  .services__inner {
    padding: 8rem 1.5rem 4rem;
  }
  .scard {
    padding: 1.75rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scard,
  .scard__cta,
  .scard__cta svg {
    transition: none;
  }
  .scard:hover {
    transform: none;
  }
}
</style>
