<script setup>
import { computed } from "vue";

const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
  context: {
    type: Object,
    default: () => ({}),
  },
});

const payload = computed(() => props.block?.payload || {});
const faqs = computed(() =>
  (props.context?.faqs || []).filter((f) => f && (f.question || f.answer))
);
</script>

<template>
  <section v-if="faqs.length > 0" class="sblock sblock--faq">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.faq')"
      />

      <UiReveal tag="div" class="faq__list">
        <details
          v-for="(item, index) in faqs"
          :key="index"
          class="faq__details"
        >
          <summary class="faq__summary">
            <span class="faq__question">{{ item.question }}</span>
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
          </summary>
          <div class="faq__answer">
            <p class="faq__answer-text">{{ item.answer }}</p>
          </div>
        </details>
      </UiReveal>
    </div>
  </section>
</template>

<style scoped>
.sblock {
  background: #05051a;
  color: #eef1f7;
  padding: 4rem 0;
}

.sblock__inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.faq__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq__details {
  border-radius: 18px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition:
    border-color 0.3s ease,
    background 0.3s ease;
}

.faq__details[open] {
  border-color: rgba(169, 214, 229, 0.3);
  background: rgba(24, 34, 58, 0.55);
}

.faq__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 1.35rem 1.5rem;
  font-family: inherit;
  font-size: 1.0625rem;
  font-weight: 600;
  text-align: left;
  color: #eef1f7;
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: color 0.25s ease;
}

.faq__summary::-webkit-details-marker {
  display: none;
}

.faq__summary:hover {
  color: #a9d6e5;
}

.faq__summary:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: -2px;
  border-radius: 18px;
}

.faq__question {
  flex: 1;
}

.faq__chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: rgba(169, 214, 229, 0.7);
  transition: transform 0.3s ease;
}

.faq__details[open] .faq__chevron {
  transform: rotate(180deg);
}

.faq__answer {
  padding: 0 1.5rem 1.35rem;
}

.faq__answer-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #aab2c4;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
  .faq__summary {
    font-size: 1rem;
    padding: 1.15rem 1.25rem;
  }
  .faq__answer {
    padding: 0 1.25rem 1.15rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq__details,
  .faq__summary,
  .faq__chevron {
    transition: none;
  }
}
</style>
