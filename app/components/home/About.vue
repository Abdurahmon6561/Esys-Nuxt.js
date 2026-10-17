<script setup>
// Homepage geo/SEO text block: editorial copy that naturally carries the
// commercial demand phrases ("веб-студия в Ташкенте", "разработка сайтов"
// etc.) with inline links into the service and portfolio pages. Paragraphs
// are split into i18n segments so NuxtLinks can be woven between them.
const localePath = useLocalePath();

// Safe, non-fabricated trust facts only - no invented metrics.
const STATS = ["s1", "s2", "s3", "s4"];
const STACK = ["s1", "s2", "s3", "s4"];
</script>

<template>
  <section class="habout">
    <div class="habout__inner">
      <UiSectionHead
        :eyebrow="$t('homeAbout.eyebrow')"
        :title="$t('homeAbout.title')"
      />

      <UiReveal class="habout__body">
        <p class="habout__p">
          {{ $t("homeAbout.p1a") }}<NuxtLink
            :to="localePath('/services/websites')"
            class="habout__link"
            >{{ $t("homeAbout.link_websites") }}</NuxtLink
          >{{ $t("homeAbout.p1b") }}<NuxtLink
            :to="localePath('/services/web-applications')"
            class="habout__link"
            >{{ $t("homeAbout.link_webapps") }}</NuxtLink
          >{{ $t("homeAbout.p1c") }}<NuxtLink
            :to="localePath('/services/crm-systems')"
            class="habout__link"
            >{{ $t("homeAbout.link_crm") }}</NuxtLink
          >{{ $t("homeAbout.p1d") }}
        </p>
        <p class="habout__p">{{ $t("homeAbout.p2") }}</p>
        <p class="habout__p">
          {{ $t("homeAbout.p3a") }}<NuxtLink
            :to="localePath('/portfolio')"
            class="habout__link"
            >{{ $t("homeAbout.link_portfolio") }}</NuxtLink
          >{{ $t("homeAbout.p3b") }}
        </p>
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

      <UiReveal class="habout__stack">
        <h3 class="habout__stack-title">{{ $t("homeAbout.stack_title") }}</h3>
        <ul class="habout__stack-list">
          <li v-for="key in STACK" :key="key" class="habout__stack-item">
            {{ $t(`homeAbout.stack.${key}`) }}
          </li>
        </ul>
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

.habout__link {
  color: #a9d6e5;
  text-decoration: underline;
  text-decoration-color: rgba(169, 214, 229, 0.4);
  text-underline-offset: 3px;
  transition: color 0.25s ease;
}

.habout__link:hover {
  color: #ffffff;
}

.habout__link:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
  border-radius: 4px;
}

/* ── Trust stats row ── */
.habout__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin: 4rem 0 0;
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

/* ── Tech stack list ── */
.habout__stack {
  margin-top: 3rem;
}

.habout__stack-title {
  margin: 0 0 1.25rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #a9d6e5;
}

.habout__stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.habout__stack-item {
  padding: 0.5rem 1.125rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #c3cad8;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.3);
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

@media (prefers-reduced-motion: reduce) {
  .habout__link {
    transition: none;
  }
}
</style>
