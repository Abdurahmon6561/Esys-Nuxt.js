<script setup>
const { blogApi } = useApiService();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";

// getBlogs() → blog/all (paginated 10). Envelope: { data: [...], links, meta }.
// ALL pages are fetched during SSR so every post link ships in the HTML —
// crawlers never followed the old client-side "show more" fetch, leaving
// posts 11+ as sitemap-only orphans. The button is now a pure reveal.
const PAGE_SIZE = 10;

const { data, pending, error } = await useAsyncData(
  "blogs",
  async () => {
    const first = await blogApi.getBlogs();
    const lastPage = first?.meta?.last_page ?? 1;
    if (lastPage <= 1) return first;

    const rest = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) =>
        blogApi.getBlogs({ page: i + 2 })
      )
    );
    return {
      ...first,
      data: [
        ...(first?.data ?? []),
        ...rest.flatMap((page) => page?.data ?? []),
      ],
    };
  },
  { watch: [locale] }
);

const items = computed(() => data.value?.data ?? []);
const expanded = ref(false);
// All post links must ship in the SSR HTML (crawlers don't click), so extra
// cards are hidden with CSS instead of left out of the render.
const isHidden = (index) => !expanded.value && index >= PAGE_SIZE;
const hasMore = computed(() => items.value.length > PAGE_SIZE);

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

// ItemList so the listing itself enumerates every post URL for crawlers.
const itemListJsonLd = computed(() => {
  const entries = items.value.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${siteUrl}${localePath(`/blog/${item.alias}`)}`,
    name: item.title,
  }));
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: entries.length,
    itemListElement: entries,
  });
});

useHead(() => ({
  script: [
    {
      key: "blog-breadcrumb-schema",
      type: "application/ld+json",
      innerHTML: breadcrumbsJsonLd.value,
    },
    {
      key: "blog-itemlist-schema",
      type: "application/ld+json",
      innerHTML: itemListJsonLd.value,
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
    <template #item="{ item, index }">
      <UiCard
        :class="{ 'blog__card--hidden': isHidden(index) }"
        :item="item"
        :to="`/blog/${item.alias}`"
        show-date
        :show-text="false"
      />
    </template>
    <template #after>
      <button
        v-if="hasMore && !expanded"
        class="blog__more"
        type="button"
        @click="expanded = true"
      >
        {{ $t("blog.load_more") }}
      </button>
    </template>
  </UiPageList>
</template>

<style scoped>
/* Extra posts stay in the DOM (SSR links for crawlers) but not in layout. */
.blog__card--hidden {
  display: none;
}

.blog__more {
  padding: 0.85rem 2.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #eef1f7;
  background: transparent;
  border: 1px solid rgba(169, 214, 229, 0.3);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.blog__more:hover:not(:disabled) {
  border-color: #46e6e1;
  transform: translateY(-2px);
}

.blog__more:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>