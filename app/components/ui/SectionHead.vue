<script setup>
// Editorial section header: eyebrow + title + subtitle on the left.
// Mirrors the homepage Portfolio header.
defineProps({
  eyebrow: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
});
</script>

<template>
  <header class="shead">
    <div class="shead__text">
      <p v-if="eyebrow" class="shead__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="title" class="shead__title">{{ title }}</h2>
      <p v-if="subtitle" class="shead__subtitle">{{ subtitle }}</p>
    </div>
  </header>
</template>

<style scoped>
.shead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  margin: 0 0 4rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(169, 214, 229, 0.14);
}

.shead__text {
  max-width: 60ch;
}

.shead__eyebrow {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.shead__title {
  margin: 0 0 1rem;
  font-size: clamp(1.75rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #eef1f7;
}

.shead__subtitle {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.5;
  color: #c3cad8;
}

@media (max-width: 640px) {
  .shead {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
}
</style>