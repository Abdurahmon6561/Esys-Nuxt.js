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

const { open: openContact } = useContactModal();

const payload = computed(() => props.block?.payload || {});
const plans = computed(() =>
  (payload.value?.plans || []).filter((p) => p && (p.name || p.price))
);
</script>

<template>
  <section v-if="plans.length > 0" class="sblock sblock--pricing">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.pricing')"
      />

      <UiReveal tag="div" class="pricing__grid">
        <div
          v-for="(plan, index) in plans"
          :key="index"
          class="scard pricing__card"
        >
          <div class="pricing__header">
            <h3 v-if="plan.name" class="pricing__name">{{ plan.name }}</h3>
            <div class="pricing__price-box">
              <span v-if="plan.price" class="pricing__price">{{ plan.price }}</span>
              <span v-if="plan.currency" class="pricing__currency">{{ plan.currency }}</span>
              <span v-if="plan.period" class="pricing__period">/ {{ plan.period }}</span>
            </div>
          </div>

          <ul v-if="plan.includes?.length" class="pricing__includes">
            <li
              v-for="(item, itemIdx) in plan.includes"
              :key="itemIdx"
              class="pricing__item"
            >
              <svg
                class="pricing__check"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{{ item }}</span>
            </li>
          </ul>

          <button
            v-if="plan.cta_label"
            type="button"
            class="pricing__cta"
            @click="openContact"
          >
            {{ plan.cta_label }}
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
          </button>
        </div>
      </UiReveal>

      <p v-if="payload.note" class="pricing__note">
        {{ payload.note }}
      </p>
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

.pricing__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .pricing__grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

.scard {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 2.5rem 2rem;
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

.pricing__header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.pricing__name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: #ffffff;
}

.pricing__price-box {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.pricing__price {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #46e6e1;
  letter-spacing: -0.02em;
}

.pricing__currency {
  font-size: 1.1rem;
  font-weight: 600;
  color: #eef1f7;
}

.pricing__period {
  font-size: 0.875rem;
  color: #aab2c4;
}

.pricing__includes {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pricing__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: #c3cad8;
}

.pricing__check {
  flex-shrink: 0;
  width: 1.125rem;
  height: 1.125rem;
  color: #46e6e1;
  margin-top: 0.15rem;
}

.pricing__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem 1.5rem;
  border: 1px solid rgba(169, 214, 229, 0.35);
  border-radius: 999px;
  background: rgba(42, 111, 151, 0.2);
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
}

.pricing__cta svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.25s ease;
}

.pricing__cta:hover {
  background: #ffffff;
  color: #05051a;
  border-color: #ffffff;
  transform: translateY(-2px);
}

.pricing__cta:hover svg {
  transform: translateX(3px);
}

.pricing__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 2px;
}

.pricing__note {
  margin: 2.5rem 0 0;
  text-align: center;
  font-size: 0.875rem;
  color: #aab2c4;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
  .scard {
    padding: 1.75rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scard,
  .pricing__cta,
  .pricing__cta svg {
    transition: none;
  }
  .scard:hover,
  .pricing__cta:hover {
    transform: none;
  }
}
</style>
