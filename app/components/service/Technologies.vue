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
const groups = computed(() =>
  (payload.value?.groups || []).filter(
    (g) => g && (g.name || (Array.isArray(g.items) && g.items.length))
  )
);
</script>

<template>
  <section v-if="groups.length > 0" class="sblock sblock--technologies">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.technologies')"
      />

      <UiReveal tag="div" class="tech__grid">
        <div
          v-for="(group, index) in groups"
          :key="index"
          class="scard tech__card"
        >
          <h3 v-if="group.name" class="tech__name">{{ group.name }}</h3>
          <ul v-if="group.items?.length" class="tech__chips">
            <li
              v-for="(item, itemIdx) in group.items"
              :key="itemIdx"
              class="tech__chip"
            >
              {{ item }}
            </li>
          </ul>
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

.tech__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .tech__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.scard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.tech__name {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 600;
  color: #ffffff;
}

.tech__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tech__chip {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.35);
  color: #a9d6e5;
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0.02em;
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
