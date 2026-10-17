<script setup>
const { portfolioApi } = useApiService();
const { locale, t } = useI18n();
const localePath = useLocalePath();

// getPortfolios() → portfolio/all. Envelope: { data: [...] }.
const { data, pending, error } = await useAsyncData(
  "portfolios-all",
  () => portfolioApi.getPortfolios(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

useSeoMeta({
  title: () => t("portfolio.seo.title"),
  description: () => t("portfolio.seo.description"),
  ogTitle: () => t("portfolio.seo.title"),
  ogDescription: () => t("portfolio.seo.description"),
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
    <template #intro>
      <p>{{ $t("portfolio.intro.p1") }}</p>
      <i18n-t
        keypath="portfolio.intro.p2"
        tag="p"
        scope="global"
      >
        <template #websites>
          <NuxtLink :to="localePath('/services/websites')">
            {{ $t("portfolio.intro.websites") }}
          </NuxtLink>
        </template>
        <template #webApps>
          <NuxtLink :to="localePath('/services/web-applications')">
            {{ $t("portfolio.intro.webApps") }}
          </NuxtLink>
        </template>
        <template #crm>
          <NuxtLink :to="localePath('/services/crm-systems')">
            {{ $t("portfolio.intro.crm") }}
          </NuxtLink>
        </template>
        <template #mobile>
          <NuxtLink :to="localePath('/services/mobile-applications')">
            {{ $t("portfolio.intro.mobile") }}
          </NuxtLink>
        </template>
      </i18n-t>
    </template>
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