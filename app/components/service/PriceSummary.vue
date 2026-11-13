<script setup>
import { pricingCopy } from "../pricing/copy.js";

const props = defineProps({
  pricing: {
    type: Object,
    required: true,
  },
});

const { locale } = useI18n();
const { open: openContact } = useContactModal();
const price = computed(() =>
  formatServicePrice(props.pricing, pricingCopy[locale.value])
);
const included = computed(() =>
  Array.isArray(props.pricing?.included)
    ? props.pricing.included.filter((line) => typeof line === "string" && line.trim()).slice(0, 6)
    : []
);
</script>

<template>
  <section class="sblock sblock--price-summary">
    <div class="sblock__inner">
      <UiSectionHead level="h2" :title="$t('services.priceSummary.title')" />
      <UiReveal tag="div" class="scard">
        <h3 v-if="pricing.title" class="summary__title">{{ pricing.title }}</h3>
        <p v-if="price" class="summary__price">{{ price }}</p>
        <p v-if="pricing.short_text" class="summary__text">{{ pricing.short_text }}</p>
        <p v-if="pricing.timeline" class="summary__text">
          <strong>{{ $t("services.priceSummary.timeline") }}:</strong> {{ pricing.timeline }}
        </p>
        <div v-if="included.length">
          <h3 class="summary__included-title">{{ $t("services.priceSummary.included") }}</h3>
          <ul class="summary__included">
            <li v-for="(line, index) in included" :key="index">{{ line }}</li>
          </ul>
        </div>
        <div class="summary__actions">
          <button type="button" class="summary__cta" @click="openContact">
            {{ $t("services.cta") }}
          </button>
          <NuxtLink v-if="pricing.url" :to="pricing.url" class="summary__link">
            {{ $t("services.priceSummary.allPrices") }}
          </NuxtLink>
        </div>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.scard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2.5rem 2rem;
  border-radius: 24px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.summary__title,
.summary__included-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.35rem;
  font-weight: 600;
}

.summary__price {
  margin: 0;
  color: #46e6e1;
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.summary__text,
.summary__included {
  margin: 0;
  color: #c3cad8;
  font-size: 0.9375rem;
  line-height: 1.65;
}

.summary__included-title {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.summary__included {
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.summary__included li {
  position: relative;
  padding-left: 1.5rem;
}

.summary__included li::before {
  position: absolute;
  left: 0;
  content: "✓";
  color: #46e6e1;
}

.summary__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.summary__cta {
  padding: 0.85rem 1.5rem;
  border: 1px solid rgba(169, 214, 229, 0.35);
  border-radius: 999px;
  background: rgba(42, 111, 151, 0.2);
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
}

.summary__cta:hover {
  background: #ffffff;
  color: #05051a;
}

.summary__link {
  color: #a9d6e5;
  text-underline-offset: 3px;
}

.summary__cta:focus-visible,
.summary__link:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
  .scard {
    padding: 1.75rem 1.5rem;
  }
}
</style>
