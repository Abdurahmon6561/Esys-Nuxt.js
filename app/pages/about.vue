<script setup>
const { t } = useI18n();

const PROCESS_STEPS = 5;
const VALUE_COUNT = 3;

const steps = Array.from({ length: PROCESS_STEPS }, (_, i) => i + 1);
const values = Array.from({ length: VALUE_COUNT }, (_, i) => i + 1);

useSeoMeta({
  title: () => t("about.seo.title"),
  description: () => t("about.seo.description"),
  ogTitle: () => t("about.seo.title"),
  ogDescription: () => t("about.seo.description"),
});
</script>

<template>
  <main class="about page--dark">
    <UiPageHeader
      :eyebrow="$t('about.eyebrow')"
      :title="$t('about.title')"
    />

    <div class="about__inner">
      <UiReveal>
        <p class="about__intro">{{ $t("about.intro") }}</p>
      </UiReveal>

      <!-- Process -->
      <section class="about__section">
        <UiSectionHead
          :eyebrow="$t('about.process.eyebrow')"
          :title="$t('about.process.title')"
          :subtitle="$t('about.process.subtitle')"
        />
        <UiReveal tag="ol" class="about__steps">
          <li v-for="n in steps" :key="n" class="step">
            <span class="step__num">{{ String(n).padStart(2, "0") }}</span>
            <div class="step__body">
              <h3 class="step__title">{{ $t(`about.process.s${n}.title`) }}</h3>
              <p class="step__text">{{ $t(`about.process.s${n}.text`) }}</p>
            </div>
          </li>
        </UiReveal>
      </section>

      <!-- Values -->
      <section class="about__section">
        <UiSectionHead
          :eyebrow="$t('about.values.eyebrow')"
          :title="$t('about.values.title')"
        />
        <UiReveal tag="div" class="about__values">
          <article v-for="n in values" :key="n" class="value">
            <h3 class="value__title">{{ $t(`about.values.v${n}.title`) }}</h3>
            <p class="value__text">{{ $t(`about.values.v${n}.text`) }}</p>
          </article>
        </UiReveal>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.about__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
}

.about__intro {
  margin: 0 0 5rem;
  max-width: 46ch;
  font-size: clamp(1.1rem, 2.2vw, 1.35rem);
  line-height: 1.65;
  color: #c3cad8;
}

.about__section {
  margin-bottom: 5rem;
}

/* ── Process steps ── */
.about__steps {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  gap: 2rem;
  padding: 1.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.step:first-child {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.step__num {
  flex-shrink: 0;
  width: 3rem;
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgba(169, 214, 229, 0.55);
  padding-top: 0.2rem;
}

.step__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  font-weight: 600;
  color: #ffffff;
}

.step__text {
  margin: 0;
  max-width: 62ch;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

/* ── Values ── */
.about__values {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.value {
  padding: 2rem 1.75rem;
  border-radius: 20px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.value__title {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #a9d6e5;
}

.value__text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

@media (max-width: 640px) {
  .about__intro {
    margin-bottom: 3.5rem;
  }
  .about__section {
    margin-bottom: 3.5rem;
  }
  .step {
    gap: 1.25rem;
  }
}
</style>
