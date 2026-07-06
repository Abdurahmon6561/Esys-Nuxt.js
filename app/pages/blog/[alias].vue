<script setup>
const { blogApi } = useApiService();
const { locale, t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { open: openContact } = useContactModal();

const alias = computed(() => route.params.alias);

// view response envelope: { blog, similar }
const { data, pending, error } = await useAsyncData(
  () => `blog-${alias.value}`,
  () => blogApi.getBlogByAlias(alias.value),
  { watch: [locale, alias] }
);

// Missing article must return a real 404 status, not a 200 with error text
if (error.value?.statusCode === 404 || (!error.value && !data.value?.blog)) {
  throw createError({ statusCode: 404, statusMessage: "Blog post not found", fatal: true });
}

const blog = computed(() => data.value?.blog ?? null);
const similar = computed(() => data.value?.similar ?? []);
const tagsText = computed(() => blog.value?.tags?.join(" · ") || "");

// Article + BreadcrumbList structured data for search engines
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";
const apiOrigin = config.public.apiUrl ? new URL(config.public.apiUrl).origin : "";

// Backend may return a relative storage path - social crawlers need an absolute URL.
const absoluteOgImage = (image) =>
  image ? (image.startsWith("http") ? image : `${apiOrigin}${image}`) : undefined;

useSeoMeta({
  title: () => blog.value?.title || t("blog.title"),
  description: () => blog.value?.short_text || t("blog.subtitle"),
  ogImage: () => absoluteOgImage(blog.value?.image),
});

const articleJsonLd = computed(() => {
  if (!blog.value) return "";
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: blog.value.title,
      description: blog.value.short_text || undefined,
      image: blog.value.image || undefined,
      datePublished: blog.value.published_at || undefined,
      inLanguage: locale.value,
      mainEntityOfPage: `${siteUrl}${route.path}`,
      author: { "@type": "Organization", name: "Evolution Systems", url: siteUrl },
      publisher: { "@type": "Organization", name: "Evolution Systems", url: siteUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Evolution Systems", item: siteUrl },
        { "@type": "ListItem", position: 2, name: t("blog.title"), item: `${siteUrl}${localePath("/blog")}` },
        { "@type": "ListItem", position: 3, name: blog.value.title, item: `${siteUrl}${route.path}` },
      ],
    },
  ]);
});

useHead(() => ({
  script: articleJsonLd.value
    ? [{ type: "application/ld+json", innerHTML: articleJsonLd.value }]
    : [],
}));
</script>

<template>
  <main class="article page--dark">
    <p v-if="error && !pending" class="article__error">{{ $t("blog.error") }}</p>

    <template v-else-if="blog">
      <UiPageHeader
        :eyebrow="$t('blog.eyebrow')"
        :title="blog.title"
        :meta="[
          { label: $t('blog.published'), value: blog.published_at },
          ...(tagsText ? [{ label: $t('blog.tags'), value: tagsText }] : []),
        ]"
      >
        <template #aside>
          <UiArrowLink to="/blog" :text="$t('blog.back')" direction="back" />
        </template>
      </UiPageHeader>

      <div class="article__inner">
        <UiReveal tag="figure" class="article__media">
          <img
            :src="blog.image"
            :alt="blog.title"
            class="article__hero-img"
          />
        </UiReveal>

        <UiReveal tag="div" class="article__body">
          <p v-if="blog.short_text" class="article__lead">
            {{ blog.short_text }}
          </p>

          <!-- Rich text from the CMS - render as-is. -->
          <div class="article__text" v-html="blog.text" />

          <figure v-if="blog.inner_image" class="article__inner-media">
            <img :src="blog.inner_image" :alt="blog.title" loading="lazy" />
          </figure>

          <button
            v-if="blog.has_contact"
            type="button"
            class="article__cta"
            @click="openContact"
          >
            {{ $t("contact.eyebrow") }}
          </button>
        </UiReveal>

        <!-- Related portfolio projects linked to this blog post -->
        <section v-if="blog.portfolio?.length" class="article__related">
          <UiReveal tag="div" class="related__grid">
            <UiCard
              v-for="item in blog.portfolio"
              :key="item.alias"
              :item="item"
              :to="`/portfolio/${item.alias}`"
              :show-text="false"
            />
          </UiReveal>
        </section>

        <!-- Similar articles -->
        <section v-if="similar.length" class="article__similar">
          <h2 class="similar__title">{{ $t("blog.similar") }}</h2>
          <UiReveal tag="div" class="similar__grid">
            <UiCard
              v-for="item in similar"
              :key="item.alias"
              :item="item"
              :to="`/blog/${item.alias}`"
              show-date
              :show-text="false"
            />
          </UiReveal>
        </section>
      </div>
    </template>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.article__inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
}

.article__error {
  max-width: 820px;
  margin: 0 auto;
  padding: 12rem 1.5rem 6rem;
  text-align: center;
  color: #ffb4b4;
}

.article__media {
  margin: 0 0 3rem;
}

.article__hero-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1.25rem;
  background: #0a0a2e;
}

.article__body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.article__lead {
  margin: 0;
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.55;
  font-weight: 500;
  color: #eef1f7;
}

.article__text {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #c3cad8;
}

.article__text :deep(h2),
.article__text :deep(h3) {
  margin: 2rem 0 1rem;
  color: #eef1f7;
  font-weight: 600;
  line-height: 1.3;
}

.article__text :deep(h2) {
  font-size: 1.5rem;
}

.article__text :deep(h3) {
  font-size: 1.25rem;
}

.article__text :deep(p) {
  margin: 0 0 1.25rem;
}

.article__text :deep(ul),
.article__text :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.article__text :deep(li) {
  margin: 0.5rem 0;
}

.article__text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.article__text :deep(a) {
  color: #46e6e1;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.article__text :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 0.5rem 0 0.5rem 1.5rem;
  border-left: 2px solid rgba(70, 230, 225, 0.5);
  color: #eef1f7;
}

.article__inner-media {
  margin: 0;
}

.article__inner-media img {
  width: 100%;
  border-radius: 1rem;
  background: #0a0a2e;
}

.article__cta {
  align-self: flex-start;
  padding: 0.85rem 1.75rem;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0a0a2e;
  background: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.article__cta:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.article__related,
.article__similar {
  margin-top: 4rem;
  border-top: 1px solid rgba(169, 214, 229, 0.14);
  padding-top: 3rem;
}

.similar__title {
  margin: 0 0 2.5rem;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #eef1f7;
}

.related__grid,
.similar__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

@media (max-width: 640px) {
  .article__inner {
    padding-bottom: 4rem;
  }
}
</style>