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
const img = useImage();

// Inline CMS media is enhanced after the TOC pass: lazy/async loading, alt
// fallbacks, responsive /_ipx srcset URLs, and scrollable table wrappers.
const article = computed(() => {
  const { html, toc } = buildArticleToc(blog.value?.text);

  return {
    toc,
    html: enhanceArticleMedia(html, {
      imageUrl: (src, width) => img(src, { width, format: "webp" }),
      fallbackAlt: blog.value?.title,
    }),
  };
});
const readingTime = computed(() =>
  typeof blog.value?.reading_time === "number" && blog.value.reading_time > 0
    ? blog.value.reading_time
    : null
);

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
const shareUrl = computed(() => `${siteUrl}${route.path}`);
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
const defaultOgImage = `${siteUrl}/og-image.png`;
const ogImageCandidate = computed(
  () => resolved.value?.og_image || absoluteOgImage(blog.value?.image)
);
const ogImage = computed(() =>
  resolveOgImage(ogImageCandidate.value, defaultOgImage)
);

useSeoMeta({
  title: () => resolved.value?.title || blog.value?.title || t("blog.title"),
  titleTemplate: () => (resolved.value?.title ? "%s" : undefined),
  description: () =>
    resolved.value?.description || metaDescription(blog.value?.short_text) || t("blog.subtitle"),
  ogTitle: () => resolved.value?.og_title || undefined,
  ogDescription: () => resolved.value?.og_description || undefined,
  ogImage: () => ogImage.value,
  ogImageAlt: () =>
    isSvgImage(ogImageCandidate.value)
      ? undefined
      : resolved.value?.og_image_alt || undefined,
  twitterImage: () => ogImage.value,
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
  const homePath = localePath("/");
  const homeUrl = `${siteUrl}${homePath === "/" ? "" : homePath}`;

  // Visible FAQ blocks carry Q/A pairs; expose them as FAQPage too (no
  // Google rich result since May 2026, but adds structure for AI answers).
  const faq = buildFaq(blog.value.text);

  const blocks = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${siteUrl}${route.path}#article`,
      headline: blog.value.title,
      description: summary.value || undefined,
      image: schemaImage(
        ogImage.value,
        defaultOgImage
      ),
      datePublished: datePublished.value,
      dateModified: dateModified.value,
      timeRequired: readingTime.value ? `PT${readingTime.value}M` : undefined,
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
        { "@type": "ListItem", position: 1, name: "Evolution Systems", item: homeUrl },
        { "@type": "ListItem", position: 2, name: t("nav.blog"), item: `${siteUrl}${localePath("/blog")}` },
        { "@type": "ListItem", position: 3, name: blog.value.title, item: `${siteUrl}${route.path}` },
      ],
    },
  ];

  if (faq.length >= 2) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }

  return JSON.stringify(blocks);
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

const articleText = ref(null);
const readingProgress = ref(0);
let progressFrame;
let articleStart = 0;
let articleEnd = 1;
let articleResizeObserver;

function measureArticle() {
  if (!import.meta.client || !articleText.value) return;

  const bounds = articleText.value.getBoundingClientRect();
  articleStart = bounds.top + window.scrollY;
  articleEnd = Math.max(
    articleStart + articleText.value.offsetHeight - window.innerHeight,
    articleStart + 1
  );
  updateReadingProgress();
}

function updateReadingProgress() {
  if (!import.meta.client || progressFrame) return;

  progressFrame = window.requestAnimationFrame(() => {
    const progress = (window.scrollY - articleStart) / (articleEnd - articleStart);
    readingProgress.value = Math.min(1, Math.max(0, progress));
    progressFrame = undefined;
  });
}

onMounted(() => {
  measureArticle();
  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", measureArticle, { passive: true });

  articleResizeObserver = new ResizeObserver(measureArticle);
  if (articleText.value) articleResizeObserver.observe(articleText.value);
});

watch(
  () => article.value.html,
  async () => {
    await nextTick();
    measureArticle();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateReadingProgress);
  window.removeEventListener("resize", measureArticle);
  articleResizeObserver?.disconnect();
  if (progressFrame) window.cancelAnimationFrame(progressFrame);
});
</script>

<template>
  <main class="article page--dark">
    <div
      class="article__progress"
      :style="{ transform: `scaleX(${readingProgress})` }"
      aria-hidden="true"
    />

    <p v-if="error && !pending" class="article__error">{{ $t("blog.error") }}</p>

    <template v-else-if="blog">
      <UiPageHeader
        class="article__header"
        :eyebrow="$t('blog.eyebrow')"
        :title="resolved?.h1 || blog.title"
        :meta="[
          { label: $t('blog.published'), value: formatBlogDate(blog.published_at, locale) },
          ...(readingTime
            ? [{
                label: $t('blog.readingTimeLabel'),
                value: $t('blog.readingTime', { n: readingTime }),
              }]
            : []),
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

        <div class="article__reading-layout">
          <UiArticleToc :items="article.toc" class="article__toc" />

          <UiReveal tag="div" class="article__body">
            <p v-if="summary" class="article__lead">
              {{ summary }}
            </p>

            <!-- Rich text from the CMS, enhanced with SSR-safe heading anchors. -->
            <div ref="articleText" class="article__text" v-html="article.html" />

            <figure v-if="blog.inner_image" class="article__inner-media">
              <NuxtImg
                :src="blog.inner_image"
                :alt="blog.title"
                loading="lazy"
                format="webp"
                sizes="100vw lg:1200px"
              />
            </figure>

            <UiShareButtons
              :url="shareUrl"
              :title="blog.title"
              class="article__share"
            />

            <button
              v-if="blog.has_contact"
              type="button"
              class="article__cta"
              @click="openContact"
            >
              {{ $t("contact.eyebrow") }}
            </button>
          </UiReveal>
        </div>

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
  --article-font-size: 1.125rem;
  --article-measure: 64ch;
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.article__inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
}

.article__progress {
  position: fixed;
  z-index: 2000;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  pointer-events: none;
  background: #46e6e1;
  transform: scaleX(0);
  transform-origin: left center;
  will-change: transform;
}

.article > :deep(.phead.article__header) {
  box-sizing: border-box;
  width: min(calc(100% - 3rem), var(--article-measure));
  max-width: none;
  padding-right: 0;
  padding-left: 0;
  font-size: var(--article-font-size);
}

.article__error {
  max-width: 820px;
  margin: 0 auto;
  padding: 12rem 1.5rem 6rem;
  text-align: center;
  color: #ffb4b4;
}

.article__media {
  width: min(100%, var(--article-measure));
  margin: 0 auto 3rem;
  font-size: var(--article-font-size);
}

.article__hero-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1.25rem;
  background: #0a0a2e;
}

.article__reading-layout {
  font-size: var(--article-font-size);
}

.article__toc {
  margin: 0 auto 2rem;
}

.article__body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: min(100%, var(--article-measure));
  min-width: 0;
  margin: 0 auto;
}

.article__lead {
  max-width: var(--article-measure);
  margin: 0;
  font-size: clamp(1.125rem, 2vw, 1.3125rem);
  line-height: 1.65;
  font-weight: 500;
  color: #eef1f7;
  text-wrap: pretty;
}

.article__text {
  max-width: var(--article-measure);
  min-width: 0;
  font-size: 1em;
  line-height: 1.7;
  color: #c3cad8;
  overflow-wrap: break-word;
}

.article__text :deep(h2),
.article__text :deep(h3) {
  scroll-margin-top: 92px;
  color: #eef1f7;
  font-weight: 700;
  line-height: 1.25;
  text-wrap: balance;
}

.article__text :deep(h2) {
  margin: 3rem 0 1rem;
  font-size: 1.75rem;
  letter-spacing: -0.015em;
}

.article__text :deep(h3) {
  margin: 2rem 0 0.625rem;
  font-size: 1.25rem;
}

.article__text :deep(p) {
  margin: 0 0 1.25rem;
  text-wrap: pretty;
}

.article__text :deep(ul),
.article__text :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.article__text :deep(li) {
  margin: 0.625rem 0;
  padding-left: 0.25rem;
}

.article__text :deep(li::marker) {
  color: #46e6e1;
  font-weight: 700;
}

.article__text :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  margin: 1.5rem 0;
  border-radius: 0.75rem;
}

.article__text :deep(figure img) {
  margin: 0;
}

.article__text :deep(a) {
  color: #46e6e1;
  text-decoration: underline;
  text-decoration-thickness: from-font;
  text-underline-offset: 3px;
  transition: color 0.15s ease;
}

.article__text :deep(a:hover) {
  color: #8ff4f1;
}

.article__text :deep(a:focus-visible) {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
  border-radius: 0.125rem;
}

.article__text :deep(blockquote) {
  margin: 2rem 0;
  padding: 1.125rem 1.25rem;
  border-left: 3px solid #46e6e1;
  border-radius: 0 0.75rem 0.75rem 0;
  background: rgba(70, 230, 225, 0.06);
  color: #eef1f7;
  font-size: 1.0625em;
  font-style: normal;
  line-height: 1.65;
}

.article__text :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.article__text :deep(.article__table-wrap) {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1.5rem 0;
}

.article__text :deep(.article__table-wrap:focus-visible) {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

.article__text :deep(table) {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
}

.article__text :deep(th),
.article__text :deep(td) {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.article__text :deep(th) {
  color: #eef1f7;
  background: rgba(169, 214, 229, 0.08);
  font-weight: 700;
  text-align: left;
}

.article__text :deep(pre) {
  max-width: 100%;
  margin: 2rem 0;
  padding: 1.125rem;
  overflow-x: auto;
  border: 1px solid rgba(169, 214, 229, 0.14);
  border-radius: 0.75rem;
  background: #090925;
  font-size: 0.875rem;
  line-height: 1.6;
}

.article__text :deep(code) {
  padding: 0.1em 0.3em;
  border-radius: 0.25rem;
  background: rgba(169, 214, 229, 0.1);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.article__text :deep(pre code) {
  padding: 0;
  background: transparent;
  font-size: inherit;
}

.article__text :deep(hr) {
  margin: 3rem 0;
  border: 0;
  border-top: 1px solid rgba(169, 214, 229, 0.2);
}

.article__text :deep(figure) {
  margin: 2rem 0;
}

.article__text :deep(figcaption) {
  margin-top: 0.625rem;
  color: rgba(195, 202, 216, 0.72);
  font-size: 0.8125rem;
  line-height: 1.5;
  text-align: center;
}

.article__inner-media {
  margin: 0;
}

.article__inner-media img {
  width: 100%;
  border-radius: 1rem;
  background: #0a0a2e;
}

.article__share {
  margin-top: 1rem;
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
  max-width: 1100px;
  margin-right: auto;
  margin-left: auto;
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
  box-sizing: border-box;
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
  overflow-wrap: anywhere;
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 2rem;
}

@media (min-width: 1200px) {
  .article__reading-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, var(--article-measure)) minmax(0, 1fr);
    align-items: stretch;
  }

  .article__body {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
  }

  .article__toc {
    box-sizing: border-box;
    grid-column: 3;
    grid-row: 1;
    width: 100%;
    max-width: 18rem;
    margin: 0;
    padding-left: clamp(1.5rem, 3vw, 3rem);
  }
}

@media (max-width: 640px) {
  .page--dark {
    --article-font-size: 1.0625rem;
  }

  .article__inner {
    padding-bottom: 4rem;
  }

  .article__text :deep(p) {
    hyphens: auto;
  }

  .article__text :deep(h2) {
    font-size: 1.625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article__text :deep(a),
  .article__cta,
  .services__pill {
    transition: none;
  }
}
</style>
