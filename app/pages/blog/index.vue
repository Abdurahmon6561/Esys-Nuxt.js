<script setup>
const { blogApi } = useApiService();
const { locale, t } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";

// getBlogs() → blog/all (paginated 10). Envelope: { data: [...], links, meta }.
// The first page comes from useAsyncData (SSR + locale watch); "show more"
// appends further pages client-side via the same endpoint.
const { data, pending, error } = await useAsyncData(
  "blogs",
  () => blogApi.getBlogs(),
  { watch: [locale] }
);

const items = ref([]);
const page = ref(1);
const lastPage = computed(() => data.value?.meta?.last_page ?? 1);
const loadingMore = ref(false);
const hasMore = computed(() => page.value < lastPage.value);

// useAsyncData refetches on locale change — reset the appended pages with it.
watch(
  data,
  (firstPage) => {
    items.value = firstPage?.data ?? [];
    page.value = 1;
  },
  { immediate: true }
);

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  try {
    const next = page.value + 1;
    const res = await blogApi.getBlogs({ page: next });
    items.value = items.value.concat(res?.data ?? []);
    page.value = next;
  } catch (e) {
    console.error("Failed to load more blogs:", e);
  } finally {
    loadingMore.value = false;
  }
}

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
    <template #after>
      <button
        v-if="hasMore"
        class="blog__more"
        type="button"
        :disabled="loadingMore"
        @click="loadMore"
      >
        {{ loadingMore ? $t("blog.loading") : $t("blog.load_more") }}
      </button>
    </template>
  </UiPageList>
</template>

<style scoped>
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