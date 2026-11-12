<script setup>
// Keep the introduction focused on how the studio works; services and
// portfolio already have dedicated sections above.

// Safe, non-fabricated trust facts only - no invented metrics.
const STATS = ["s1", "s2", "s3", "s4"];
</script>

<template>
  <section class="habout">
    <div class="habout__inner">
      <UiSectionHead :title="$t('homeAbout.title')" />

      <UiReveal class="habout__body">
        <p class="habout__p">{{ $t("homeAbout.p2") }}</p>
      </UiReveal>

      <UiReveal class="habout__stats" tag="ul">
        <li v-for="key in STATS" :key="key" class="habout__stat">
          <span class="habout__stat-value">
            {{ $t(`homeAbout.stats.${key}.value`) }}
          </span>
          <span class="habout__stat-label">
            {{ $t(`homeAbout.stats.${key}.label`) }}
          </span>
        </li>
      </UiReveal>
    </div>
  </section>
</template>

<style scoped>
.habout {
  background: var(--color-ground, #05051a);
  color: var(--color-text-primary, #eef1f7);
}

.habout__inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.habout__body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.habout__p {
  margin: 0;
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #aab2c4;
}

/* ── Trust stats row ── */
.habout__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
  margin: 2rem 0 0;
  padding: 2rem;
  list-style: none;
  border-radius: 1.25rem;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.habout__stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.habout__stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.25;
  color: #ffffff;
}

.habout__stat-label {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #aab2c4;
}

@media (max-width: 640px) {
  .habout__inner {
    padding: 4.5rem 1.5rem;
  }
  .habout__stats {
    grid-template-columns: 1fr 1fr;
    padding: 1.5rem;
    gap: 1.25rem;
  }
}

</style>
