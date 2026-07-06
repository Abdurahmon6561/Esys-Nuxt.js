<script setup>
const { portfolioApi } = useApiService();
const { locale, t } = useI18n();

// getPortfolios() → portfolio/all. Envelope: { data: [...] }.
const { data, pending, error } = await useAsyncData(
  "portfolios-all",
  () => portfolioApi.getPortfolios(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

useSeoMeta({
  title: () => t("portfolio.title"),
  description: () => t("portfolio.subtitle"),
});
</script>

<template>
  <UiPageList
    :eyebrow="$t('portfolio.eyebrow')"
    :title="$t('portfolio.title')"
    :subtitle="$t('portfolio.subtitle')"
    :error-text="$t('portfolio.error')"
    :items="items"
    :pending="pending"
    :error="!!error"
  >
    <template #item="{ item, index }">
      <UiCard
        :item="item"
        :to="`/portfolio/${item.alias}`"
        :featured="index === 0"
        show-text
      />
    </template>
  </UiPageList>
</template>