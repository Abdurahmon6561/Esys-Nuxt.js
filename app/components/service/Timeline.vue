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
  (payload.value?.items || []).filter((i) => i && (i.label || i.value))
);
</script>

<template>
  <section v-if="items.length > 0" class="sblock sblock--timeline">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.timeline')"
        :subtitle="payload.text"
      />

      <UiReveal tag="div" class="timeline__grid">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="scard timeline__card"
        >
          <span v-if="item.label" class="timeline__label">{{ item.label }}</span>
          <span v-if="item.value" class="timeline__value">{{ item.value }}</span>
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

.timeline__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .timeline__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.scard {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
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

.timeline__label {
  font-size: 0.9375rem;
  font-weight: 500;
  color: #aab2c4;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.timeline__value {
  font-size: clamp(1.4rem, 2.5vw, 1.85rem);
  font-weight: 700;
  line-height: 1.25;
  color: #46e6e1;
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
