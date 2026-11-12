<script setup>
// API layer available via composables:
//   const { blogApi, portfolioApi, reviewsApi, servicesApi, api } = useApiService()
const { t } = useI18n();

useSeoMeta({
  title: () => t("home.seo.title"),
  description: () => t("home.seo.description"),
  ogTitle: () => t("home.seo.title"),
  ogDescription: () => t("home.seo.description"),
});
</script>

<template>
  <div class="home-page">
    <Hero />
    <Portfolio />
    <HomeServices />
    <HomeAbout />
    <HomeProcess />
    <Reviews />
    <Faq />
  </div>
</template>

<style scoped>
/* Keep the existing section language with a tighter homepage rhythm. */
.home-page :deep(.shead) { margin-bottom: 2rem; padding-bottom: 1.5rem; }
@media (max-width: 640px) {
  .home-page :deep(.portfolio),
  .home-page :deep(.reviews) { padding-block: 3.5rem; }
  .home-page :deep(.habout__inner),
  .home-page :deep(.hservices__inner),
  .home-page :deep(.hprocess__inner) { padding-block: 3.5rem; }
}
</style>
