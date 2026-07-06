<script setup>
// Inner-page header - eyebrow, large title, and a meta row (label/value pairs)
// for things like published date, client, or services. Slot `aside` holds a
// back link or contact CTA.
defineProps({
  eyebrow: { type: String, default: "" },
  title: { type: String, default: "" },
  // [{ label, value }]
  meta: { type: Array, default: () => [] },
});
</script>

<template>
  <header class="phead">
    <div v-if="$slots.aside" class="phead__aside">
      <slot name="aside" />
    </div>

    <p v-if="eyebrow" class="phead__eyebrow">{{ eyebrow }}</p>
    <h1 v-if="title" class="phead__title">{{ title }}</h1>

    <dl v-if="meta.length" class="phead__meta">
      <div v-for="m in meta" :key="m.label" class="phead__meta-item">
        <dt>{{ m.label }}</dt>
        <dd>{{ m.value }}</dd>
      </div>
    </dl>
  </header>
</template>

<style scoped>
.phead {
  max-width: 1100px;
  margin: 0 auto;
  padding: 9rem 1.5rem 3rem;
}

.phead__aside {
  margin-bottom: 2rem;
}

.phead__eyebrow {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.phead__title {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #eef1f7;
  max-width: 18ch;
}

.phead__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  margin: 2rem 0 0;
  padding: 0;
}

.phead__meta-item {
  margin: 0;
}

.phead__meta-item dt {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(169, 214, 229, 0.5);
  margin-bottom: 0.5rem;
}

.phead__meta-item dd {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #eef1f7;
  max-width: 28ch;
}

@media (max-width: 640px) {
  .phead {
    padding: 8rem 1.5rem 2.5rem;
  }
  .phead__meta {
    gap: 1.5rem;
  }
}
</style>