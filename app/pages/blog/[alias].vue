<script setup>
const { blogApi } = useApiService();
const { locale, t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { open: openContact } = useContactModal();

const alias = computed(() => route.params.alias);

// Reject scanner probes (Inertia.js, 82.php, .env, xyn.php) before hitting the
// backend API. CMS aliases are slugs — no dots/extensions. Cuts log spam and
// saves a backend round-trip per probe.
if (alias.value.includes(".")) {
  throw createError({ statusCode: 404, message: "Not found", fatal: true });
}

// view response envelope: { blog, similar }
const { data, pending, error } = await useAsyncData(
  () => `blog-${alias.value}`,
  () => blogApi.getBlogByAlias(alias.value),
  { watch: [locale, alias] }
);

// Missing article must return a real 404 status, not a 200 with error text
if (error.value?.statusCode === 404 || (!error.value && !data.value?.blog)) {
  throw createError({ statusCode: 404, message: "Blog post not found", fatal: true });
}

const blog = computed(() => data.value?.blog ?? null);
const similar = computed(() => data.value?.similar ?? []);

// Additive API field: locale-aware {title, alias} pairs. May be missing on
// old cached responses - treated as an empty list.
const serviceLinks = computed(() =>
  (blog.value?.service_links ?? [])
    .filter((s) => s?.title && s?.alias)
    .map((s) => ({ label: s.title, to: localePath(`/services/${s.alias}`) }))
);
const tagsText = computed(() => blog.value?.tags?.join(" · ") || "");

// Article + BreadcrumbList structured data for search engines
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";
const apiOrigin = config.public.apiUrl ? new URL(config.public.apiUrl).origin : "";

// Backend may return a relative storage path - social crawlers need an absolute URL.
const absoluteOgImage = (image) =>
  image ? (image.startsWith("http") ? image : `${apiOrigin}${image}`) : undefined;

// `short_text` arrives from the CMS wrapped in editor markup on some posts, so
// it is stripped before it reaches the lead paragraph, the meta description,
// or the JSON-LD.
const summary = computed(() => plainText(blog.value?.short_text));

// `seo.resolved` comes from the backend resolver (same values the MCP tools
// report). It carries the complete title, so the global titleTemplate is
// bypassed; a locale without its own translation resolves to noindex.
const resolved = computed(() => data.value?.seo?.resolved ?? null);

useSeoMeta({
  title: () => resolved.value?.title || blog.value?.title || t("blog.title"),
  titleTemplate: () => (resolved.value?.title ? "%s" : undefined),
  description: () =>
    resolved.value?.description || metaDescription(blog.value?.short_text) || t("blog.subtitle"),
  ogTitle: () => resolved.value?.og_title || undefined,
  ogDescription: () => resolved.value?.og_description || undefined,
  ogImage: () => resolved.value?.og_image || absoluteOgImage(blog.value?.image),
  ogImageAlt: () => resolved.value?.og_image_alt || undefined,
  robots: () => resolved.value?.robots || undefined,
});

usePageAlternates(() =>
  data.value?.seo?.alternates
    ? Object.fromEntries(
        Object.entries(data.value.seo.alternates).map(([loc, a]) => [
          loc,
          loc === "ru" ? `/blog/${a}` : `/${loc}/blog/${a}`,
        ])
      )
    : null
);

// `published_at`/`updated_at` arrive as PHP 'F j, Y' English strings; JSON-LD
// needs ISO 8601, so they go through toIsoDate before reaching the markup.
const datePublished = computed(() => toIsoDate(blog.value?.published_at) || undefined);
const dateModified = computed(() => {
  const updated = toIsoDate(blog.value?.updated_at);
  return updated || datePublished.value;
});

const articleJsonLd = computed(() => {
  if (!blog.value) return "";
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.value.title,
      description: summary.value || undefined,
      image: schemaImage(
        absoluteOgImage(blog.value.image),
        `${siteUrl}/og-image.png`
      ),
      datePublished: datePublished.value,
      dateModified: dateModified.value,
      inLanguage: locale.value,
      mainEntityOfPage: `${siteUrl}${route.path}`,
      author: { "@id": orgId(siteUrl) },
      publisher: { "@id": orgId(siteUrl) },
      isPartOf: { "@id": websiteId(siteUrl) },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Evolution Systems", item: siteUrl },
        { "@type": "ListItem", position: 2, name: t("nav.blog"), item: `${siteUrl}${localePath("/blog")}` },
        { "@type": "ListItem", position: 3, name: blog.value.title, item: `${siteUrl}${route.path}` },
      ],
    },
  ]);
});

useHead(() => ({
  link: resolved.value?.canonical
    ? [{ rel: "canonical", key: "i18n-canonical", href: resolved.value.canonical }]
    : [],
  script: articleJsonLd.value
    ? [
        {
          key: "article-schema",
          type: "application/ld+json",
          innerHTML: articleJsonLd.value,
        },
      ]
    : [],
}));
</script>

<template>
  <main class="article page--dark">
    <p v-if="error && !pending" class="article__error">{{ $t("blog.error") }}</p>

    <template v-else-if="blog">
      <UiPageHeader
        :eyebrow="$t('blog.eyebrow')"
        :title="resolved?.h1 || blog.title"
        :meta="[
          { label: $t('blog.published'), value: formatBlogDate(blog.published_at, locale) },
          ...(tagsText ? [{ label: $t('blog.tags'), value: tagsText }] : []),
        ]"
      >
        <template #aside>
          <UiArrowLink to="/blog" :text="$t('blog.back')" direction="back" />
        </template>
      </UiPageHeader>

      <div class="article__inner">
        <UiReveal tag="figure" class="article__media">
          <NuxtImg
            :src="blog.image"
            :alt="blog.title"
            format="webp"
            sizes="100vw lg:1200px"
            fetchpriority="high"
            class="article__hero-img"
          />
        </UiReveal>

        <UiReveal tag="div" class="article__body">
          <p v-if="summary" class="article__lead">
            {{ summary }}
          </p>

          <!-- Rich text from the CMS - render as-is. -->
          <div class="article__text" v-html="blog.text" />

          <figure v-if="blog.inner_image" class="article__inner-media">
            <NuxtImg
              :src="blog.inner_image"
              :alt="blog.title"
              loading="lazy"
              format="webp"
              sizes="100vw lg:1200px"
            />
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

        <!-- Related services linked to this blog post -->
        <section v-if="serviceLinks.length" class="article__services">
          <h2 class="similar__title">{{ $t("blog.services_title") }}</h2>
          <UiReveal tag="nav" class="services__list">
            <NuxtLink
              v-for="link in serviceLinks"
              :key="link.to"
              :to="link.to"
              class="services__pill"
            >
              <span>{{ link.label }}</span>
              <span class="services__arrow" aria-hidden="true">→</span>
            </NuxtLink>
          </UiReveal>
        </section>

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
.article__services,
.article__similar {
  margin-top: 4rem;
  border-top: 1px solid rgba(169, 214, 229, 0.14);
  padding-top: 3rem;
}

.services__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.services__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
  padding: 0.65rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
  color: #eef1f7;
  text-decoration: none;
  border: 1px solid rgba(169, 214, 229, 0.3);
  border-radius: 999px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.services__pill:hover {
  border-color: #46e6e1;
  transform: translateY(-2px);
}

.services__arrow {
  color: #46e6e1;
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