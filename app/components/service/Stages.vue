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
  (payload.value?.items || []).filter(
    (i) => i && (i.title || i.text || i.duration)
  )
);
</script>

<template>
  <section v-if="items.length > 0" class="sblock sblock--stages">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.stages')"
      />

      <UiReveal tag="div" class="stages__list">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="scard stages__item"
        >
          <div class="stages__top">
            <div class="stages__heading">
              <span class="stages__num">{{ String(index + 1).padStart(2, "0") }}</span>
              <h3 v-if="item.title" class="scard__title stages__title">{{ item.title }}</h3>
            </div>
            <span v-if="item.duration" class="stages__duration">{{ item.duration }}</span>
          </div>
          <p v-if="item.text" class="scard__text stages__text">{{ item.text }}</p>
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

.stages__list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.scard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem 2.25rem;
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
  transform: translateY(-3px);
  border-color: rgba(169, 214, 229, 0.32);
  background: rgba(24, 34, 58, 0.55);
}

.stages__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.stages__heading {
  display: flex;
  align-items: baseline;
  gap: 1.25rem;
}

.stages__num {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #46e6e1;
}

.scard__title {
  margin: 0;
  font-size: clamp(1.2rem, 2vw, 1.45rem);
  font-weight: 600;
  color: #ffffff;
}

.stages__duration {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #a9d6e5;
  background: rgba(42, 111, 151, 0.2);
  border: 1px solid rgba(42, 111, 151, 0.35);
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  white-space: nowrap;
}

.scard__text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
  .scard {
    padding: 1.5rem;
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
