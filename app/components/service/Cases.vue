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
const limit = computed(() => Number(payload.value?.limit) || 3);
const items = computed(() => (props.context?.cases || []).slice(0, limit.value));
</script>

<template>
  <section v-if="items.length > 0" class="sblock sblock--cases">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.cases')"
      />

      <UiReveal tag="div" class="cases__grid">
        <UiCard
          v-for="item in items"
          :key="item.alias"
          :item="item"
          :to="`/portfolio/${item.alias}`"
          show-text
        />
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

.cases__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

@media (max-width: 640px) {
  .sblock {
    padding: 2.5rem 0;
  }
}
</style>
