<script setup>
import { ALPHABET_CHANGES } from "../../utils/alphabet/alphabet-map.ts";

const { t, locale } = useI18n();
const localePath = useLocalePath();
const route = useRoute();
const { open: openContact } = useContactModal();
const track = useTrackEvent();
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://esys.pro";

const alphabet = findTool("alphabet");
const alphabetPath = computed(() => localePath({ name: alphabet.route }));
const alphabetUpdated = computed(() =>
  formatBlogDate(alphabet.updatedAt, locale.value),
);

// "Oʻ oʻ" -> "Oʻ": the specimen shows one capital pair per changed letter.
const specimen = ALPHABET_CHANGES.map((row) => ({
  old: row.old.split(" ")[0],
  new: row.new.split(" ")[0],
}));

function handleCustomCta() {
  track("tools_custom_cta_click");
  openContact();
}

useSeoMeta({
  title: () => t("tools.hub.seo.title"),
  description: () => t("tools.hub.seo.description"),
  ogTitle: () => t("tools.hub.seo.title"),
  ogDescription: () => t("tools.hub.seo.description"),
});

const pageJsonLd = computed(() => {
  const pageUrl = `${siteUrl}${route.path}`;
  const homePath = localePath("/");
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: t("tools.hub.title"),
      description: t("tools.hub.seo.description"),
      url: pageUrl,
      inLanguage: locale.value,
      isPartOf: { "@id": websiteId(siteUrl) },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t("tools.alphabet.title"),
            url: `${siteUrl}${alphabetPath.value}`,
          },
        ],
      },
    },
    breadcrumbList([
      {
        name: "Evolution Systems",
        url: `${siteUrl}${homePath === "/" ? "" : homePath}`,
      },
      { name: t("footer.links.tools"), url: pageUrl },
    ]),
  ]);
});

useHead(() => ({
  script: [
    {
      key: "tools-hub-schema",
      type: "application/ld+json",
      innerHTML: pageJsonLd.value,
    },
  ],
}));
</script>

<template>
  <main class="tools page--dark">
    <div class="tools__inner">
      <UiSectionHead
        level="h1"
        :eyebrow="$t('tools.hub.eyebrow')"
        :title="$t('tools.hub.title')"
        :subtitle="$t('tools.hub.subtitle')"
      />

      <article class="tool">
        <div class="tool__body">
          <h2 class="tool__title">
            <NuxtLink :to="alphabetPath" class="tool__link">
              {{ $t("tools.alphabet.title") }}
            </NuxtLink>
          </h2>
          <p class="tool__text">{{ $t("tools.hub.alphabet.text") }}</p>
          <ul class="tool__points">
            <li v-for="point in $tm('tools.hub.alphabet.points')" :key="$rt(point)">
              {{ $rt(point) }}
            </li>
          </ul>
          <div class="tool__footer">
            <span class="tool__open" aria-hidden="true">
              {{ $t("tools.hub.alphabet.open") }}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
            <time class="tool__date" :datetime="alphabet.updatedAt">
              {{ $t("tools.alphabet.updated", { date: alphabetUpdated }) }}
            </time>
          </div>
        </div>

        <dl class="specimen" :aria-label="$t('tools.hub.specimenLabel')">
          <div v-for="pair in specimen" :key="pair.new" class="specimen__pair">
            <dt class="specimen__old">{{ pair.old }}</dt>
            <dd class="specimen__new">{{ pair.new }}</dd>
          </div>
        </dl>
      </article>

      <section class="custom">
        <div>
          <h2 class="custom__title">{{ $t("tools.hub.custom.title") }}</h2>
          <p class="custom__text">{{ $t("tools.hub.custom.text") }}</p>
        </div>
        <button type="button" class="custom__cta" @click="handleCustomCta">
          {{ $t("tools.hub.custom.cta") }}
        </button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page--dark {
  background: #05051a;
  color: #eef1f7;
  min-height: 100vh;
}

.tools__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 9rem 1.5rem 6rem;
}

/* ── Featured tool ──
   The whole card is clickable through the title link's ::after overlay, so
   there is one link in the accessibility tree instead of a wrapped card. */
.tool {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
  gap: 3rem;
  align-items: center;
  padding: 3rem;
  border-radius: 28px;
  background:
    radial-gradient(120% 140% at 100% 0%, rgba(42, 111, 151, 0.22), transparent 55%),
    rgba(20, 28, 48, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.3s ease;
}

.tool:hover,
.tool:focus-within {
  border-color: rgba(169, 214, 229, 0.35);
}

.tool__title {
  margin: 0 0 1rem;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.tool__link {
  color: #ffffff;
  text-decoration: none;
}

.tool__link::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.tool__link:focus-visible {
  outline: none;
}

.tool:has(.tool__link:focus-visible) {
  outline: 2px solid #46e6e1;
  outline-offset: 4px;
}

.tool__text {
  margin: 0 0 1.5rem;
  max-width: 46ch;
  font-size: 1rem;
  line-height: 1.65;
  color: #aab2c4;
}

.tool__points {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 2rem;
  padding: 0;
  list-style: none;
}

.tool__points li {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(169, 214, 229, 0.2);
  font-size: 0.875rem;
  color: #d5dce8;
}

.tool__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.75rem;
}

.tool__open {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #a9d6e5;
  transition: color 0.25s ease, gap 0.25s ease;
}

.tool__open svg {
  width: 1rem;
  height: 1rem;
}

.tool:hover .tool__open {
  color: #ffffff;
  gap: 0.75rem;
}

.tool__date {
  font-size: 0.8125rem;
  color: rgba(238, 241, 247, 0.5);
}

/* ── Letter specimen: the four letters the 2026 reform replaces ── */
.specimen {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  margin: 0;
  border-radius: 20px;
  overflow: hidden;
  background: rgba(169, 214, 229, 0.14);
}

.specimen__pair {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 1rem;
  padding: 1.6rem 1rem 1.4rem;
  background: #080a24;
}

.specimen__old {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 500;
  color: rgba(169, 214, 229, 0.55);
  text-decoration: line-through;
  text-decoration-color: rgba(169, 214, 229, 0.35);
  text-decoration-thickness: 1px;
}

.specimen__new {
  margin: 0;
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
}

/* ── Custom tool CTA ── */
.custom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem 3rem;
  margin-top: 4rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(169, 214, 229, 0.14);
}

.custom__title {
  margin: 0 0 0.5rem;
  font-size: clamp(1.2rem, 2.2vw, 1.5rem);
  font-weight: 600;
  color: #ffffff;
}

.custom__text {
  margin: 0;
  max-width: 52ch;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #aab2c4;
}

.custom__cta {
  flex-shrink: 0;
  padding: 0.85rem 1.75rem;
  border: 1px solid rgba(238, 241, 247, 0.25);
  border-radius: 999px;
  background: transparent;
  font-family: inherit;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #eef1f7;
  cursor: pointer;
  transition: border-color 0.25s ease, color 0.25s ease;
}

.custom__cta:hover {
  border-color: rgba(169, 214, 229, 0.6);
  color: #ffffff;
}

.custom__cta:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 3px;
}

@media (max-width: 860px) {
  .tool {
    grid-template-columns: 1fr;
    gap: 2.25rem;
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 640px) {
  .tools__inner {
    padding: 8rem 1.5rem 4rem;
  }

  .custom {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tool,
  .tool__open {
    transition: none;
  }
}
</style>
