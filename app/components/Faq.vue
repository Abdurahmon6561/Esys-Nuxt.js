<script setup>
import { ref } from "vue";

const { t, locale } = useI18n();

const FAQ_COUNT = 6;
const items = Array.from({ length: FAQ_COUNT }, (_, i) => i + 1);

const openIndex = ref(null);

const toggle = (n) => {
  openIndex.value = openIndex.value === n ? null : n;
};

// FAQPage schema - recomputed per locale so search engines get localized Q&A.
useHead(() => ({
  script: [
    {
      key: "faq-jsonld",
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: locale.value,
        mainEntity: items.map((n) => ({
          "@type": "Question",
          name: t(`faq.q${n}.question`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`faq.q${n}.answer`),
          },
        })),
      }),
    },
  ],
}));
</script>

<template>
  <section class="faq">
    <div class="faq__inner">
      <UiSectionHead
        :eyebrow="$t('faq.eyebrow')"
        :title="$t('faq.title')"
        :subtitle="$t('faq.subtitle')"
      />

      <UiReveal tag="div" class="faq__list">
        <div
          v-for="n in items"
          :key="n"
          class="faq__item"
          :class="{ 'is-open': openIndex === n }"
        >
          <button
            type="button"
            class="faq__question"
            :aria-expanded="openIndex === n"
            :aria-controls="`faq-answer-${n}`"
            @click="toggle(n)"
          >
            <span>{{ $t(`faq.q${n}.question`) }}</span>
            <svg
              class="faq__chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div
            :id="`faq-answer-${n}`"
            class="faq__answer"
            role="region"
          >
            <p class="faq__answer-text">{{ $t(`faq.q${n}.answer`) }}</p>
          </div>
        </div>
      </UiReveal>
    </div>
  </section>
</template>

<style scoped>
.faq {
  background: #05051a;
  color: #eef1f7;
}

.faq__inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 5rem 1.5rem 7rem;
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq__item {
  border-radius: 18px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: border-color 0.3s ease, background 0.3s ease;
}

.faq__item.is-open {
  border-color: rgba(169, 214, 229, 0.3);
  background: rgba(24, 34, 58, 0.55);
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 1.35rem 1.5rem;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 1.0625rem;
  font-weight: 600;
  text-align: left;
  color: #eef1f7;
  cursor: pointer;
  transition: color 0.25s ease;
}

.faq__question:hover {
  color: #a9d6e5;
}

.faq__question:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: -2px;
  border-radius: 18px;
}

.faq__chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(169, 214, 229, 0.7);
  transition: transform 0.3s ease;
}

.faq__item.is-open .faq__chevron {
  transform: rotate(180deg);
}

/* Grid-rows trick animates height without JS measurement. */
.faq__answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
}

.faq__item.is-open .faq__answer {
  grid-template-rows: 1fr;
}

.faq__answer-text {
  overflow: hidden;
  margin: 0;
  padding: 0 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #aab2c4;
  transition: padding 0.35s ease;
}

.faq__item.is-open .faq__answer-text {
  padding: 0 1.5rem 1.35rem;
}

@media (prefers-reduced-motion: reduce) {
  .faq__item,
  .faq__question,
  .faq__chevron,
  .faq__answer,
  .faq__answer-text {
    transition: none;
  }
}

@media (max-width: 640px) {
  .faq__inner {
    padding: 3.5rem 1.5rem 5rem;
  }
  .faq__question {
    font-size: 1rem;
    padding: 1.15rem 1.25rem;
  }
  .faq__answer-text {
    padding: 0 1.25rem;
  }
  .faq__item.is-open .faq__answer-text {
    padding: 0 1.25rem 1.15rem;
  }
}
</style>
