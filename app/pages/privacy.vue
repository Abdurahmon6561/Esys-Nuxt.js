<script setup>
const { t } = useI18n();

const SECTION_COUNT = 7;
const sections = Array.from({ length: SECTION_COUNT }, (_, i) => i + 1);

useSeoMeta({
  title: () => t("privacy.title"),
  description: () => t("privacy.intro"),
  robots: "noindex, follow",
});
</script>

<template>
  <main class="privacy page--dark">
    <UiPageHeader
      :eyebrow="$t('privacy.eyebrow')"
      :title="$t('privacy.title')"
      :meta="[{ label: $t('privacy.updatedLabel'), value: $t('privacy.updatedDate') }]"
    />

    <div class="privacy__inner">
      <p class="privacy__intro">{{ $t("privacy.intro") }}</p>

      <section v-for="n in sections" :key="n" class="privacy__section">
        <h2 class="privacy__heading">{{ $t(`privacy.s${n}.title`) }}</h2>
        <p class="privacy__text">{{ $t(`privacy.s${n}.text`) }}</p>
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

.privacy__inner {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
}

.privacy__intro {
  margin: 0 0 3rem;
  font-size: clamp(1.05rem, 2vw, 1.2rem);
  line-height: 1.65;
  color: #c3cad8;
}

.privacy__section {
  margin-bottom: 2.5rem;
}

.privacy__heading {
  margin: 0 0 0.75rem;
  font-size: clamp(1.15rem, 2.2vw, 1.4rem);
  font-weight: 600;
  color: #ffffff;
}

.privacy__text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #aab2c4;
  white-space: pre-line;
}
</style>
