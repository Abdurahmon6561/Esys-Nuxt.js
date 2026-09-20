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
const items = computed(() =>
  (payload.value?.items || []).filter((i) => i && (i.title || i.text))
);
</script>

<template>
  <section v-if="items.length > 0" class="sblock sblock--benefits">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.benefits')"
      />

      <UiReveal tag="div" class="benefits__grid">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="scard"
        >
          <span class="scard__num">{{ String(index + 1).padStart(2, "0") }}</span>
          <h3 v-if="item.title" class="scard__title">{{ item.title }}</h3>
          <p v-if="item.text" class="scard__text">{{ item.text }}</p>
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

.benefits__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .benefits__grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
  color: inherit;
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

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
  .scard {
    padding: 1.75rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scard {
    transition: none;
  }
  .scard:hover {
    transform: none;
  }
}
</style>
