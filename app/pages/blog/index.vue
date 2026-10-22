<script setup>
const { blogApi } = useApiService();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";

// getBlogs() → blog/all (paginated 10). Envelope: { data: [...], links, meta }.
const { data, pending, error } = await useAsyncData(
  "blogs",
  () => blogApi.getBlogs(),
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);

useSeoMeta({
  title: () => t("blog.seo.title"),
  description: () => t("blog.seo.description"),
  ogTitle: () => t("blog.seo.title"),
  ogDescription: () => t("blog.seo.description"),
});

const breadcrumbsJsonLd = computed(() => {
  const homePath = localePath("/");
  return JSON.stringify(
    breadcrumbList([
      {
        name: "Evolution Systems",
        url: `${siteUrl}${homePath === "/" ? "" : homePath}`,
      },
      { name: t("nav.blog"), url: `${siteUrl}${route.path}` },
    ])
  );
});

useHead(() => ({
  script: [
    {
      key: "blog-breadcrumb-schema",
      type: "application/ld+json",
      innerHTML: breadcrumbsJsonLd.value,
    },
  ],
}));
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
    <template #intro>
      <i18n-t
        keypath="blog.intro.p1"
        tag="p"
        scope="global"
      >
        <template #webCost>
          <NuxtLink :to="localePath('/services/websites')">
            {{ $t("blog.intro.webCost") }}
          </NuxtLink>
        </template>
        <template #crm>
          <NuxtLink :to="localePath('/services/crm-systems')">
            {{ $t("blog.intro.crm") }}
          </NuxtLink>
        </template>
        <template #webApps>
          <NuxtLink :to="localePath('/services/web-applications')">
            {{ $t("blog.intro.webApps") }}
          </NuxtLink>
        </template>
      </i18n-t>
      <i18n-t
        keypath="blog.intro.p2"
        tag="p"
        scope="global"
      >
        <template #mobileDev>
          <NuxtLink :to="localePath('/services/mobile-applications')">
            {{ $t("blog.intro.mobileDev") }}
          </NuxtLink>
        </template>
        <template #branding>
          <NuxtLink :to="localePath('/services/branding')">
            {{ $t("blog.intro.branding") }}
          </NuxtLink>
        </template>
      </i18n-t>
    </template>
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