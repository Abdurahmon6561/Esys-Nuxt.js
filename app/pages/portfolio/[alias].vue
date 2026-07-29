<script setup>
const { portfolioApi } = useApiService();
const { locale, t } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { open: openContact } = useContactModal();

const alias = computed(() => route.params.alias);

// Reject scanner probes (Inertia.js, *.php, .env) before hitting the backend
// API. CMS aliases are slugs — no dots/extensions. Cuts log spam and saves a
// backend round-trip per probe.
if (alias.value.includes(".")) {
  throw createError({ statusCode: 404, message: "Not found", fatal: true });
}

// view response envelope: { portfolio, similar }
const { data, pending, error } = await useAsyncData(
  () => `portfolio-${alias.value}`,
  () => portfolioApi.getPortfolioByAlias(alias.value),
  { watch: [locale, alias] }
);

// Missing case must return a real 404 status, not a 200 with error text
if (error.value?.statusCode === 404 || (!error.value && !data.value?.portfolio)) {
  throw createError({ statusCode: 404, message: "Portfolio case not found", fatal: true });
}

const portfolio = computed(() => data.value?.portfolio ?? null);
const similar = computed(() => data.value?.similar ?? []);
const servicesText = computed(() => portfolio.value?.services?.join(" · ") || "");
const techText = computed(() => portfolio.value?.technologies?.join(" · ") || "");

const meta = computed(() => {
  const m = [];
  if (servicesText.value) m.push({ label: t("portfolioDetail.services"), value: servicesText.value });
  if (portfolio.value?.client) m.push({ label: t("portfolioDetail.client"), value: portfolio.value.client });
  if (techText.value) m.push({ label: t("portfolioDetail.technologies"), value: techText.value });
  return m;
});

const lightboxIndex = ref(-1);
const lightboxImages = computed(() =>
  portfolio.value?.images?.map((img) => ({ src: img.image, alt: portfolio.value.title })) ?? []
);
const isLightboxOpen = computed(() => lightboxIndex.value >= 0);
const openLightbox = (index) => {
  lightboxIndex.value = index;
};
const closeLightbox = () => {
  lightboxIndex.value = -1;
};

// BreadcrumbList structured data for search engines
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";
const apiOrigin = config.public.apiUrl ? new URL(config.public.apiUrl).origin : "";

// Backend may return a relative storage path - social crawlers need an absolute URL.
const absoluteOgImage = (image) =>
  image ? (image.startsWith("http") ? image : `${apiOrigin}${image}`) : undefined;

useSeoMeta({
  title: () => portfolio.value?.title || t("portfolio.title"),
  description: () => portfolio.value?.short_text || t("portfolio.subtitle"),
  ogImage: () => absoluteOgImage(portfolio.value?.image),
});

const breadcrumbJsonLd = computed(() => {
  if (!portfolio.value) return "";
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Evolution Systems", item: siteUrl },
      { "@type": "ListItem", position: 2, name: t("portfolio.title"), item: `${siteUrl}${localePath("/portfolio")}` },
      { "@type": "ListItem", position: 3, name: portfolio.value.title, item: `${siteUrl}${route.path}` },
    ],
  });
});

useHead(() => ({
  script: breadcrumbJsonLd.value
    ? [{ type: "application/ld+json", innerHTML: breadcrumbJsonLd.value }]
    : [],
}));
</script>

<template>
  <main class="case page--dark">
    <p v-if="error && !pending" class="case__error">{{ $t("portfolio.error") }}</p>

    <template v-else-if="portfolio">
      <UiPageHeader
        :eyebrow="$t('portfolio.eyebrow')"
        :title="portfolio.title"
        :meta="meta"
      >
        <template #aside>
          <UiArrowLink
            to="/portfolio"
            :text="$t('portfolioDetail.back')"
            direction="back"
          />
        </template>
      </UiPageHeader>

      <div class="case__inner">
        <UiReveal tag="figure" class="case__media">
          <NuxtImg
            :src="portfolio.image"
            :alt="portfolio.title"
            format="webp"
            sizes="100vw lg:1200px"
            fetchpriority="high"
            class="case__hero-img"
          />
        </UiReveal>

        <UiReveal tag="div" class="case__body">
          <p v-if="portfolio.short_text" class="case__lead">
            {{ portfolio.short_text }}
          </p>

          <div class="case__text" v-html="portfolio.text" />

          <div class="case__actions">
            <a
              v-if="portfolio.link"
              :href="portfolio.link"
              class="case__visit"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ $t("portfolioDetail.visitSite") }}
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </div>
        </UiReveal>

        <!-- Gallery -->
        <section v-if="portfolio.images?.length" class="case__gallery">
          <h2 class="case__section-title">
            {{ $t("portfolioDetail.gallery") }}
          </h2>
          <UiReveal tag="div" class="gallery__grid">
            <button
              v-for="(img, index) in portfolio.images"
              :key="img.id"
              type="button"
              class="gallery__item gallery__trigger"
              :aria-label="$t('portfolioDetail.lightbox.counter', { current: index + 1, total: portfolio.images.length })"
              @click="openLightbox(index)"
            >
              <figure class="gallery__figure">
                <NuxtImg
                  :src="img.image"
                  :alt="portfolio.title"
                  loading="lazy"
                  format="webp"
                  sizes="100vw md:50vw"
                />
              </figure>
            </button>
          </UiReveal>
        </section>

        <!-- Lightbox -->
        <UiLightbox
          v-if="isLightboxOpen"
          :images="lightboxImages"
          :initial-index="lightboxIndex"
          @close="closeLightbox"
        />

        <!-- Contact CTA -->
        <section class="case__contact">
          <p class="case__contact-text">{{ $t("footer.prompt") }}</p>
          <button type="button" class="case__contact-cta" @click="openContact">
            {{ $t("hero.cta_contact") }}
          </button>
        </section>

        <!-- Similar projects -->
        <section v-if="similar.length" class="case__similar">
          <h2 class="case__section-title">
            {{ $t("portfolioDetail.similar") }}
          </h2>
          <UiReveal tag="div" class="similar__grid">
            <UiCard
              v-for="item in similar"
              :key="item.alias"
              :item="item"
              :to="`/portfolio/${item.alias}`"
              show-text
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

.case__inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem 6rem;
}

.case__error {
  max-width: 820px;
  margin: 0 auto;
  padding: 12rem 1.5rem 6rem;
  text-align: center;
  color: #ffb4b4;
}

.case__media {
  margin: 0 0 3rem;
}

.case__hero-img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1.25rem;
  background: #0a0a2e;
}

.case__body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.case__lead {
  margin: 0;
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.55;
  font-weight: 500;
  color: #eef1f7;
}

.case__text {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #c3cad8;
}

.case__text :deep(h2),
.case__text :deep(h3) {
  margin: 2rem 0 1rem;
  color: #eef1f7;
  font-weight: 600;
}

.case__text :deep(p) {
  margin: 0 0 1.25rem;
}

.case__text :deep(ul),
.case__text :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.case__text :deep(li) {
  margin: 0.5rem 0;
}

.case__text :deep(a) {
  color: #46e6e1;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.case__text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.case__actions {
  display: flex;
}

.case__visit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0a0a2e;
  background: #fff;
  border-radius: 999px;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, gap 0.2s ease, box-shadow 0.2s ease;
}

.case__visit:hover {
  transform: translateY(-2px);
  gap: 0.75rem;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.case__gallery,
.case__similar {
  margin-top: 4rem;
  border-top: 1px solid rgba(169, 214, 229, 0.14);
  padding-top: 3rem;
}

.case__section-title {
  margin: 0 0 2.5rem;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #eef1f7;
}

.gallery__grid,
.similar__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.gallery__item {
  margin: 0;
}

.gallery__trigger {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: zoom-in;
  text-align: left;
}

.gallery__figure {
  margin: 0;
}

.gallery__figure img {
  width: 100%;
  border-radius: 1rem;
  background: #0a0a2e;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery__trigger:hover .gallery__figure img,
.gallery__trigger:focus-visible .gallery__figure img {
  transform: scale(1.02);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.gallery__trigger:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 4px;
  border-radius: 1rem;
}

/* Contact CTA block */
.case__contact {
  margin-top: 4rem;
  padding: 3rem 2rem;
  text-align: center;
  border-radius: 1.5rem;
  background: rgba(238, 241, 247, 0.04);
  border: 1px solid rgba(238, 241, 247, 0.08);
}

.case__contact-text {
  margin: 0 0 1.5rem;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #eef1f7;
}

.case__contact-cta {
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

.case__contact-cta:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

@media (max-width: 640px) {
  .case__inner {
    padding-bottom: 4rem;
  }
}
</style>