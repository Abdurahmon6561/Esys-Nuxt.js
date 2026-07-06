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
    <Reviews />
    <Faq />
  </div>
</template>
