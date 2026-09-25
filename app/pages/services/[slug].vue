<script setup>
const { servicesApi } = useApiService();
const { locale, t, te } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const { open: openContact } = useContactModal();

const slug = computed(() => String(route.params.slug || ""));

// Reject scanner probes (Inertia.js, *.php, .env) before hitting the backend
// API. CMS aliases are slugs - no dots/extensions. Cuts log spam and saves a
// backend round-trip per probe.
if (slug.value.includes(".")) {
  throw createError({ statusCode: 404, message: "Not found", fatal: true });
}

// view response envelope: { service, seo, alternates, blocks, faqs, cases, articles, similar }
const { data, pending, error } = await useAsyncData(
  () => `services-${slug.value}`,
  () => servicesApi.getServiceByAlias(route.params.slug),
  { watch: [locale, slug] }
);

// Missing service must return a real 404 status, not a 200 with error text
if (error.value?.statusCode === 404 || (!error.value && !data.value?.service)) {
  throw createError({ statusCode: 404, message: "Service not found", fatal: true });
}

const service = computed(() => data.value?.service ?? null);
const seo = computed(() => data.value?.seo ?? null);
const alternates = computed(() => data.value?.alternates ?? {});
const blocks = computed(() => data.value?.blocks ?? []);
const faqs = computed(() => data.value?.faqs ?? []);
const cases = computed(() => data.value?.cases ?? []);
const articles = computed(() => data.value?.articles ?? []);
const similar = computed(() => data.value?.similar ?? []);

const leadText = computed(() => plainText(service.value?.short_text));

const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";
const apiOrigin = config.public.apiUrl ? new URL(config.public.apiUrl).origin : "";

// Backend may return a relative storage path - social crawlers need an absolute URL.
const absoluteOgImage = (image) =>
  image ? (image.startsWith("http") ? image : `${apiOrigin}${image}`) : undefined;

// SEO meta. `seo.resolved` is computed by the backend resolver (the same one
// the MCP get_page_seo/inspect tools report), so SSR renders exactly what the
// editor previewed. The title is complete - brand suffix included - so the
// global titleTemplate is bypassed. The local fallbacks only cover an API
// that predates `resolved`.
const resolved = computed(() => seo.value?.resolved ?? null);

useSeoMeta({
  title: () =>
    resolved.value?.title ||
    seo.value?.seo_title ||
    service.value?.title ||
    t("services.eyebrow"),
  titleTemplate: () => (resolved.value?.title ? "%s" : undefined),
  description: () =>
    resolved.value?.description ||
    seo.value?.meta_description ||
    leadText.value ||
    t("services.subtitle"),
  ogTitle: () =>
    resolved.value?.og_title ||
    seo.value?.og_title ||
    seo.value?.seo_title ||
    service.value?.title ||
    t("services.eyebrow"),
  ogDescription: () =>
    resolved.value?.og_description ||
    seo.value?.og_description ||
    seo.value?.meta_description ||
    leadText.value ||
    t("services.subtitle"),
  ogImage: () =>
    resolved.value?.og_image ||
    absoluteOgImage(seo.value?.og_image || service.value?.image),
  ogImageAlt: () => resolved.value?.og_image_alt || undefined,
  robots: () => resolved.value?.robots || seo.value?.robots || "index",
});

const localizedPath = (loc, section, alias) =>
  loc === "ru" ? `/${section}/${alias}` : `/${loc}/${section}/${alias}`;

usePageAlternates(() =>
  data.value?.alternates
    ? Object.fromEntries(
        Object.entries(data.value.alternates).map(([loc, a]) => [
          loc,
          localizedPath(loc, "services", a),
        ])
      )
    : null
);

// Per-locale slugs for the language switcher. seo=false: hreflang links come
// from usePageAlternates above (published translations only).
const setI18nParams = useSetI18nParams(false);
watchEffect(() => {
  if (data.value?.alternates) {
    setI18nParams(
      Object.fromEntries(
        Object.entries(data.value.alternates).map(([loc, a]) => [loc, { slug: a }])
      )
    );
  }
});

// JSON-LD structured data: Service + BreadcrumbList + FAQPage (when faqs present)
const serviceJsonLd = computed(() => {
  if (!service.value) return "";

  const items = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.value.title,
      description:
        seo.value?.meta_description ||
        leadText.value ||
        undefined,
      image: service.value.image ? absoluteOgImage(service.value.image) : undefined,
      url: `${siteUrl}${route.path}`,
      provider: {
        "@type": "Organization",
        name: "Evolution Systems",
        url: siteUrl,
      },
      areaServed: "UZ",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Evolution Systems", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: t("services.title"),
          item: `${siteUrl}${localePath("/services")}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: service.value.title,
          item: `${siteUrl}${route.path}`,
        },
      ],
    },
  ];

  const validFaqs = (faqs.value || []).filter(
    (f) => f && (f.question || f.answer)
  );
  if (validFaqs.length > 0) {
    items.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: validFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return JSON.stringify(items);
});

// Canonical link overriding useLocaleHead() with key 'i18n-canonical', plus JSON-LD script
useHead(() => ({
  link: [
    {
      rel: "canonical",
      key: "i18n-canonical",
      href:
        resolved.value?.canonical ||
        seo.value?.canonical ||
        `${siteUrl}${route.path}`,
    },
  ],
  script: serviceJsonLd.value
    ? [{ type: "application/ld+json", innerHTML: serviceJsonLd.value }]
    : [],
}));

const similarTitle = computed(() => {
  try {
    if (te && te("services.similar")) return t("services.similar");
  } catch {}
  if (locale.value === "uz") return "Boshqa xizmatlar";
  if (locale.value === "en") return "Other services";
  return "Другие услуги";
});
</script>

<template>
  <main class="service page--dark">
    <p v-if="error && !pending" class="service__error">{{ $t("services.error") }}</p>

    <template v-else-if="service">
      <UiPageHeader
        :eyebrow="$t('services.eyebrow')"
        :title="resolved?.h1 || service.h1 || service.title"
      >
        <template #aside>
          <UiArrowLink
            to="/services"
            :text="$t('services.eyebrow')"
            direction="back"
          />
        </template>
      </UiPageHeader>

      <div class="service__hero">
        <div class="service__hero-inner">
          <UiReveal v-if="service.image" tag="figure" class="service__media">
            <NuxtImg
              :src="service.image"
              :alt="service.image_alt || service.title || ''"
              format="webp"
              sizes="100vw lg:1200px"
              fetchpriority="high"
              class="service__hero-img"
            />
          </UiReveal>

          <UiReveal tag="div" class="service__body">
            <p v-if="leadText" class="service__lead">
              {{ leadText }}
            </p>

            <!-- Rich text from the CMS - render as-is. -->
            <div
              v-if="service.text"
              class="service__text"
              v-html="service.text"
            />

            <button
              type="button"
              class="service__cta"
              @click="openContact"
            >
              {{ $t("services.cta") }}
            </button>
          </UiReveal>
        </div>
      </div>

      <!-- Content blocks -->
      <div v-if="blocks.length" class="service__blocks">
        <ServiceBlockRenderer
          v-for="b in blocks"
          :key="b.id || b.type"
          :block="b"
          :context="{ cases, articles, faqs }"
        />
      </div>

      <!-- Similar services -->
      <section v-if="similar.length" class="service__similar">
        <div class="similar__inner">
          <h2 class="similar__title">{{ similarTitle }}</h2>
          <UiReveal tag="div" class="similar__grid">
            <NuxtLink
              v-for="(item, index) in similar"
              :key="item.alias"
              :to="localePath('/services/' + item.alias)"
              class="scard"
            >
              <span class="scard__num">{{ String(index + 1).padStart(2, "0") }}</span>
              <div v-if="item.image" class="scard__icon" aria-hidden="true">
                <img :src="item.image" alt="" loading="lazy" />
              </div>
              <h3 class="scard__title">{{ item.title }}</h3>
              <p v-if="item.short_text || item.text" class="scard__text">
                {{ item.short_text || item.text }}
              </p>
              <button
                type="button"
                class="scard__cta"
                @click.prevent="openContact"
              >
                {{ $t("services.cta") }}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </NuxtLink>
          </UiReveal>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.service__error {
  max-width: 820px;
  margin: 0 auto;
  padding: 12rem 1.5rem 6rem;
  text-align: center;
  color: #ffb4b4;
}

.service__hero {
  width: 100%;
}

.service__hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

.service__media {
  margin: 0 0 3rem;
}

.service__hero-img {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: 1.25rem;
  background: #0a0a2e;
}

.service__body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.service__lead {
  margin: 0;
  font-size: clamp(1.125rem, 2vw, 1.375rem);
  line-height: 1.55;
  font-weight: 500;
  color: #eef1f7;
}

.service__text {
  font-size: 1.0625rem;
  line-height: 1.75;
  color: #c3cad8;
}

.service__text :deep(h2),
.service__text :deep(h3) {
  margin: 2rem 0 1rem;
  color: #eef1f7;
  font-weight: 600;
  line-height: 1.3;
}

.service__text :deep(h2) {
  font-size: 1.5rem;
}

.service__text :deep(h3) {
  font-size: 1.25rem;
}

.service__text :deep(p) {
  margin: 0 0 1.25rem;
}

.service__text :deep(ul),
.service__text :deep(ol) {
  margin: 0 0 1.25rem;
  padding-left: 1.5rem;
}

.service__text :deep(li) {
  margin: 0.5rem 0;
}

.service__text :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
}

.service__text :deep(a) {
  color: #46e6e1;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.service__text :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 0.5rem 0 0.5rem 1.5rem;
  border-left: 2px solid rgba(70, 230, 225, 0.5);
  color: #eef1f7;
}

.service__cta {
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

.service__cta:hover {
  transform: translateY(-2px);
  background: #f0f3f7;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28);
}

.service__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

.service__similar {
  padding: 4rem 0 6rem;
  border-top: 1px solid rgba(169, 214, 229, 0.14);
}

.similar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.similar__title {
  margin: 0 0 2.5rem;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #eef1f7;
}

.similar__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .similar__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.scard {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2.25rem 2rem;
  border-radius: 24px;
  background: rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.35s ease,
    border-color 0.35s ease,
    background 0.35s ease;
}

.scard:hover {
  transform: translateY(-4px);
  border-color: rgba(169, 214, 229, 0.32);
  background: rgba(24, 34, 58, 0.55);
}

.scard__num {
  position: absolute;
  top: 1.5rem;
  right: 1.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: rgba(169, 214, 229, 0.45);
}

.scard__icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 16px;
  background: rgba(42, 111, 151, 0.18);
  border: 1px solid rgba(42, 111, 151, 0.3);
}

.scard__icon img {
  width: 1.75rem;
  height: 1.75rem;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.scard__title {
  margin: 0;
  font-size: clamp(1.25rem, 2.4vw, 1.5rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #ffffff;
}

.scard__text {
  margin: 0;
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #aab2c4;
}

.scard__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  margin-top: 0.5rem;
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #a9d6e5;
  cursor: pointer;
  transition: color 0.25s ease, gap 0.25s ease;
}

.scard__cta svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.25s ease;
}

.scard__cta:hover {
  color: #ffffff;
  gap: 0.75rem;
}

.scard__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
  border-radius: 4px;
}

@media (max-width: 640px) {
  .service__hero-inner {
    padding-bottom: 2.5rem;
  }
  .scard {
    padding: 1.75rem 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scard,
  .scard__cta,
  .scard__cta svg {
    transition: none;
  }
  .scard:hover {
    transform: none;
  }
}
</style>
