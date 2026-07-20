<script setup>
// Dark-themed list page scaffold: section header + responsive grid with
// skeleton, error, and scroll-reveal states. Blog and Portfolio list pages
// both render through this; the per-item card is supplied via the `item` slot.
defineProps({
  eyebrow: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  errorText: { type: String, default: "" },
  items: { type: Array, default: () => [] },
  pending: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  skeletonCount: { type: Number, default: 6 },
  // When true the first card spans both columns (portfolio). Blog wants a
  // uniform grid, so it opts out.
  featureFirst: { type: Boolean, default: true },
});
</script>

<template>
  <main class="page page--dark">
    <div class="page__inner">
      <UiSectionHead
        :eyebrow="eyebrow"
        :title="title"
        :subtitle="subtitle"
      />

      <p v-if="error" class="page__error">{{ errorText }}</p>

      <div v-else-if="pending" class="page__grid"
        :class="{ 'page__grid--feature-first': featureFirst }">
        <UiSkeleton
          v-for="n in skeletonCount"
          :key="n"
          :min-height="featureFirst && n === 1 ? '520px' : '440px'"
          :featured="featureFirst && n === 1"
        />
      </div>

      <UiReveal v-else tag="div" class="page__grid"
        :class="{ 'page__grid--feature-first': featureFirst }">
        <slot
          v-for="(item, index) in items"
          :key="item.alias"
          name="item"
          :item="item"
          :index="index"
        />
      </UiReveal>
    </div>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.page__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 9rem 1.5rem 6rem;
}

.page__error {
  text-align: center;
  color: #ffb4b4;
}

.page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 2rem;
}

@media (min-width: 900px) {
  .page__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  /* Featured first card spans both columns - matches homepage portfolio.
     Only when the page opts in; blog renders a uniform 2-up grid. */
  .page__grid > :deep(*) {
    grid-column: span 1;
  }
  .page__grid--feature-first > :deep(*:first-child) {
    grid-column: span 2;
  }
}

/* Spotlight: hovering the grid dims non-hovered cards. */
.page__grid > :deep(*) {
  transition: transform 0.4s ease, border-color 0.4s ease,
    background 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease;
}

@media (hover: hover) {
  .page__grid:hover > :deep(*) {
    opacity: 0.42;
  }
  .page__grid:hover > :deep(*:hover) {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .page__grid:hover > :deep(*) {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .page__inner {
    padding: 8rem 1.5rem 4rem;
  }
}
</style>