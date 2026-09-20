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
const items = computed(() => (props.context?.articles || []).slice(0, limit.value));
</script>

<template>
  <section v-if="items.length > 0" class="sblock sblock--articles">
    <div class="sblock__inner">
      <UiSectionHead
        level="h2"
        :title="payload.title || $t('services.blocks.articles')"
      />

      <UiReveal tag="div" class="articles__grid">
        <UiCard
          v-for="item in items"
          :key="item.alias"
          :item="item"
          :to="`/blog/${item.alias}`"
          show-date
          :show-text="false"
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

.articles__grid {
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
