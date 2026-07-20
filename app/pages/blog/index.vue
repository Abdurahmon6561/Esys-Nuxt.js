<script setup>
const { blogApi } = useApiService();
const { locale, t } = useI18n();

// getBlogs() → blog/all (paginated 10). Envelope: { data: [...], links, meta }.
const { data, pending, error } = await useAsyncData(
  "blogs",
  () => blogApi.getBlogs(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

useSeoMeta({
  title: () => t("blog.title"),
  description: () => t("blog.subtitle"),
});
</script>

<template>
  <UiPageList
    :eyebrow="$t('blog.eyebrow')"
    :title="$t('blog.title')"
    :subtitle="$t('blog.subtitle')"
    :error-text="$t('blog.error')"
    :items="items"
    :pending="pending"
    :error="!!error"
    :feature-first="false"
  >
    <template #item="{ item }">
      <UiCard
        :item="item"
        :to="`/blog/${item.alias}`"
        show-date
        :show-text="false"
      />
    </template>
  </UiPageList>
</template>