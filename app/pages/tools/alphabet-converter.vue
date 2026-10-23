<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { ALPHABET_CHANGES, NEW_APOSTROPHE } from "../../utils/alphabet/alphabet-map.ts";
import {
  convert,
  type ConversionResult,
  type ConvertMode,
} from "../../utils/alphabet/convert.ts";

defineI18nRoute({
  paths: {
    ru: "/tools/konverter-novyy-uzbekskiy-alfavit",
    uz: "/tools/yangi-alifbo-konvertor",
    en: "/tools/new-uzbek-alphabet-converter",
  },
});

const ALTERNATE_PATHS = {
  ru: "/tools/konverter-novyy-uzbekskiy-alfavit",
  uz: "/uz/tools/yangi-alifbo-konvertor",
  en: "/en/tools/new-uzbek-alphabet-converter",
};
const BLOG_ARTICLE_PATH: string | null = null;
const FAQ_COUNT = 6;
const MAX_LENGTH = 100_000;
const HIGHLIGHT_LIMIT = 20_000;
const TRACK_INTERVAL = 4_000;
const SYMBOLS = ["Ö", "ö", "Ğ", "ğ", "Ş", "ş", "Ç", "ç", NEW_APOSTROPHE];

const { t, locale } = useI18n();
const route = useRoute();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const track = useTrackEvent();
const { open: openContact } = useContactModal();
const siteUrl = config.public.siteUrl || "https://esys.pro";

usePageAlternates(() => ALTERNATE_PATHS);

const source = ref("");
const mode = ref<ConvertMode>("old-to-new");
const keepLinks = ref(true);
const keepEnglishWords = ref(false);
const highlightChanges = ref(true);
const converted = ref<ConversionResult>(
  convert("", { mode: "old-to-new" }),
);
const copied = ref(false);
const copyFallback = ref(false);
const openFaq = ref<number | null>(null);
const activeWarning = ref<number | null>(null);
const sourceField = ref<HTMLTextAreaElement | null>(null);
const resultField = ref<HTMLElement | null>(null);
const uploadField = ref<HTMLInputElement | null>(null);
let convertTimer: ReturnType<typeof setTimeout> | undefined;
let copyTimer: ReturnType<typeof setTimeout> | undefined;
let lastTrackedAt = 0;

const modes: ConvertMode[] = [
  "auto",
  "old-to-new",
  "cyrillic-to-new",
  "new-to-old",
];
const faqItems = Array.from({ length: FAQ_COUNT }, (_, index) => index + 1);
const isHighlightLimited = computed(() => source.value.length > HIGHLIGHT_LIMIT);
const showHighlights = computed(
  () => highlightChanges.value && !isHighlightLimited.value,
);
const warningItems = computed(() =>
  converted.value.warnings.map((warning) => ({
    ...warning,
    snippet: source.value.slice(warning.start, warning.end),
  })),
);
const resultSegments = computed(() => {
  if (!showHighlights.value || !warningItems.value.length) {
    return converted.value.segments.map((segment) => ({
      ...segment,
      warningIndexes: [] as number[],
    }));
  }

  const warningRanges = warningItems.value.map((warning, index) => ({
    start: warning.resultStart,
    end: warning.resultEnd,
    index,
  }));

  return converted.value.segments.flatMap((segment) => {
    const ranges = warningRanges.filter(
      (range) => range.start < segment.end && range.end > segment.start,
    );
    if (!ranges.length) return [{ ...segment, warningIndexes: [] as number[] }];

    const points = [...new Set([
      segment.start,
      segment.end,
      ...ranges.flatMap((range) => [
        Math.max(segment.start, range.start),
        Math.min(segment.end, range.end),
      ]),
    ])].sort((a, b) => a - b);

    return Array.from({ length: points.length - 1 }, (_, boundaryIndex) => {
      const start = points[boundaryIndex]!;
      const end = points[boundaryIndex + 1]!;
      return {
        text: converted.value.result.slice(start, end),
        changed: segment.changed,
        start,
        end,
        warningIndexes: ranges
          .filter((range) => range.start < end && range.end > start)
          .map((range) => range.index),
      };
    });
  });
});

function lengthBucket(length: number) {
  if (length < 100) return "<100";
  if (length < 1_000) return "100-1k";
  if (length < 10_000) return "1k-10k";
  return ">10k";
}

function runConversion() {
  converted.value = convert(source.value, {
    mode: mode.value,
    keepLinks: keepLinks.value,
    keepEnglishWords: keepEnglishWords.value,
  });
  if (!source.value) return;
  const now = Date.now();
  if (now - lastTrackedAt >= TRACK_INTERVAL) {
    lastTrackedAt = now;
    track("converter_convert", {
      mode: converted.value.mode,
      length_bucket: lengthBucket(source.value.length),
    });
  }
}

watch(
  [source, mode, keepLinks, keepEnglishWords],
  () => {
    if (convertTimer) clearTimeout(convertTimer);
    convertTimer = setTimeout(runConversion, 150);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (convertTimer) clearTimeout(convertTimer);
  if (copyTimer) clearTimeout(copyTimer);
});

function clearText() {
  source.value = "";
  copied.value = false;
  copyFallback.value = false;
  sourceField.value?.focus();
}

function swapDirection() {
  if (!converted.value.result) return;
  source.value = converted.value.result;
  mode.value =
    converted.value.mode === "new-to-old" ? "old-to-new" : "new-to-old";
  nextTick(() => sourceField.value?.focus());
}

async function copyResult() {
  if (!converted.value.result) return;
  copied.value = false;
  copyFallback.value = false;

  try {
    await navigator.clipboard.writeText(converted.value.result);
    copied.value = true;
    track("converter_copy", {
      mode: converted.value.mode,
      length_bucket: lengthBucket(converted.value.result.length),
    });
  } catch {
    const field = resultField.value;
    if (field) {
      const range = document.createRange();
      range.selectNodeContents(field);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      field.focus();
    }
    copyFallback.value = true;
  }

  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => {
    copied.value = false;
    copyFallback.value = false;
  }, 3_000);
}

function downloadResult() {
  if (!converted.value.result) return;
  const url = URL.createObjectURL(
    new Blob([converted.value.result], { type: "text/plain;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "yangi-alifbo.txt";
  anchor.click();
  URL.revokeObjectURL(url);
  track("converter_download", {
    mode: converted.value.mode,
    length_bucket: lengthBucket(converted.value.result.length),
  });
}

function openUpload() {
  uploadField.value?.click();
}

async function uploadText(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  source.value = (await file.text()).slice(0, MAX_LENGTH);
  input.value = "";
  nextTick(() => sourceField.value?.focus());
}

function insertSymbol(symbol: string) {
  const field = sourceField.value;
  if (!field) return;
  const start = field.selectionStart ?? source.value.length;
  const end = field.selectionEnd ?? start;
  source.value = (
    source.value.slice(0, start) +
    symbol +
    source.value.slice(end)
  ).slice(0, MAX_LENGTH);
  nextTick(() => {
    const caret = Math.min(start + symbol.length, MAX_LENGTH);
    field.focus();
    field.setSelectionRange(caret, caret);
  });
}

function handleCta() {
  track("converter_cta_click");
  openContact();
}

function toggleFaq(index: number) {
  openFaq.value = openFaq.value === index ? null : index;
}

useSeoMeta({
  title: () => t("tools.alphabet.seo.title"),
  description: () => t("tools.alphabet.seo.description"),
  ogTitle: () => t("tools.alphabet.seo.title"),
  ogDescription: () => t("tools.alphabet.seo.description"),
  ogUrl: () => `${siteUrl}${route.path}`,
});

const pageJsonLd = computed(() => {
  const pageUrl = `${siteUrl}${route.path}`;
  const homePath = localePath("/");
  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: t("tools.alphabet.title"),
      description: t("tools.alphabet.seo.description"),
      url: pageUrl,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      inLanguage: locale.value,
      isPartOf: { "@id": websiteId(siteUrl) },
      provider: { "@id": orgId(siteUrl) },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "UZS",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale.value,
      mainEntity: faqItems.map((index) => ({
        "@type": "Question",
        name: t(`tools.alphabet.faq.q${index}.question`),
        acceptedAnswer: {
          "@type": "Answer",
          text: t(`tools.alphabet.faq.q${index}.answer`),
        },
      })),
    },
    breadcrumbList([
      {
        name: "Evolution Systems",
        url: `${siteUrl}${homePath === "/" ? "" : homePath}`,
      },
      { name: t("tools.alphabet.breadcrumb"), url: pageUrl },
    ]),
  ]);
});

useHead(() => ({
  script: [
    {
      key: "alphabet-converter-schema",
      type: "application/ld+json",
      innerHTML: pageJsonLd.value,
    },
  ],
}));
</script>

<template>
  <main class="alphabet page--dark">
    <header class="tool-header">
      <p class="tool-header__eyebrow">{{ $t("tools.alphabet.eyebrow") }}</p>
      <h1 class="tool-header__title">{{ $t("tools.alphabet.title") }}</h1>
    </header>

    <div class="alphabet__inner">
      <p class="alphabet__intro">{{ $t("tools.alphabet.intro") }}</p>

      <section class="converter" :aria-label="$t('tools.alphabet.converterLabel')">
        <div class="converter__toolbar">
          <div class="converter__direction">
            <label class="control control--mode">
              <span>{{ $t("tools.alphabet.mode.label") }}</span>
              <span class="select-wrap">
                <select v-model="mode">
                  <option v-for="item in modes" :key="item" :value="item">
                    {{ $t(`tools.alphabet.mode.${item}`) }}
                  </option>
                </select>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </label>
            <button
              type="button"
              class="button button--icon"
              :disabled="!converted.result"
              :aria-label="$t('tools.alphabet.actions.swap')"
              :title="$t('tools.alphabet.actions.swap')"
              @click="swapDirection"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m7 7-3 3 3 3" />
                <path d="M4 10h13" />
                <path d="m17 17 3-3-3-3" />
                <path d="M20 14H7" />
              </svg>
            </button>
          </div>
          <div class="converter__options">
            <label class="check">
              <input v-model="keepLinks" type="checkbox">
              <span>{{ $t("tools.alphabet.options.keepLinks") }}</span>
            </label>
            <label class="check">
              <input v-model="keepEnglishWords" type="checkbox">
              <span>{{ $t("tools.alphabet.options.keepEnglish") }}</span>
            </label>
            <label class="check">
              <input v-model="highlightChanges" type="checkbox">
              <span>{{ $t("tools.alphabet.options.highlight") }}</span>
            </label>
          </div>
        </div>

        <div class="converter__panels">
          <div class="text-panel">
            <div class="text-panel__head">
              <label for="alphabet-source">{{ $t("tools.alphabet.sourceLabel") }}</label>
              <span>{{ source.length.toLocaleString() }} / {{ MAX_LENGTH.toLocaleString() }}</span>
            </div>
            <textarea
              id="alphabet-source"
              ref="sourceField"
              v-model="source"
              :maxlength="MAX_LENGTH"
              :placeholder="$t('tools.alphabet.sourcePlaceholder')"
              spellcheck="false"
            />
          </div>

          <div class="text-panel">
            <div class="text-panel__head">
              <span id="alphabet-result-label">{{ $t("tools.alphabet.resultLabel") }}</span>
              <span>
                {{ $t("tools.alphabet.replacements", { count: converted.replacements }) }}
              </span>
            </div>
            <div
              ref="resultField"
              class="result"
              role="textbox"
              aria-readonly="true"
              aria-labelledby="alphabet-result-label"
              tabindex="0"
            >
              <template v-if="converted.result">
                <template v-if="showHighlights">
                  <template v-for="(segment, index) in resultSegments" :key="index">
                    <mark
                      v-if="segment.warningIndexes.length"
                      class="result__warning"
                      :class="{
                        'is-active':
                          activeWarning !== null &&
                          segment.warningIndexes.includes(activeWarning),
                      }"
                    >{{ segment.text }}</mark>
                    <mark v-else-if="segment.changed">{{ segment.text }}</mark>
                    <template v-else>{{ segment.text }}</template>
                  </template>
                </template>
                <template v-else>{{ converted.result }}</template>
              </template>
              <span v-else class="result__placeholder">
                {{ $t("tools.alphabet.resultPlaceholder") }}
              </span>
            </div>
          </div>
        </div>

        <p v-if="isHighlightLimited && highlightChanges" class="converter__notice">
          {{ $t("tools.alphabet.highlightLimited") }}
        </p>

        <div class="symbols" :aria-label="$t('tools.alphabet.symbolsLabel')">
          <span>{{ $t("tools.alphabet.symbolsLabel") }}</span>
          <button
            v-for="symbol in SYMBOLS"
            :key="symbol"
            type="button"
            @click="insertSymbol(symbol)"
          >
            {{ symbol }}
          </button>
        </div>

        <div class="converter__actions">
          <button
            type="button"
            class="button button--primary"
            :disabled="!converted.result"
            @click="copyResult"
          >
            {{ copied ? $t("tools.alphabet.actions.copied") : $t("tools.alphabet.actions.copy") }}
          </button>
          <button type="button" class="button" :disabled="!source" @click="clearText">
            {{ $t("tools.alphabet.actions.clear") }}
          </button>
          <button
            type="button"
            class="button"
            :disabled="!converted.result"
            @click="downloadResult"
          >
            {{ $t("tools.alphabet.actions.download") }}
          </button>
          <button type="button" class="button" @click="openUpload">
            {{ $t("tools.alphabet.actions.upload") }}
          </button>
          <input
            ref="uploadField"
            class="visually-hidden"
            type="file"
            accept=".txt,text/plain"
            @change="uploadText"
          >
        </div>

        <p class="privacy-note">{{ $t("tools.alphabet.privacy") }}</p>
        <p v-if="copyFallback" class="converter__status">
          {{ $t("tools.alphabet.actions.copyFallback") }}
        </p>
        <p class="visually-hidden" aria-live="polite">
          {{
            copied
              ? $t("tools.alphabet.actions.copied")
              : copyFallback
                ? $t("tools.alphabet.actions.copyFallback")
                : ""
          }}
        </p>

        <div v-if="warningItems.length" class="warnings" role="status">
          <strong>{{ $t("tools.alphabet.warnings.title") }}</strong>
          <ul>
            <li
              v-for="(warning, index) in warningItems"
              :key="`${warning.start}-${index}`"
              tabindex="0"
              @mouseenter="activeWarning = index"
              @mouseleave="activeWarning = null"
              @focus="activeWarning = index"
              @blur="activeWarning = null"
            >
              {{ $t(`tools.alphabet.warnings.${warning.code}`) }}
              <code v-if="warning.snippet">{{ warning.snippet }}</code>
            </li>
          </ul>
        </div>
      </section>

      <section class="content-section">
        <UiSectionHead
          :eyebrow="$t('tools.alphabet.changes.eyebrow')"
          :title="$t('tools.alphabet.changes.title')"
          :subtitle="$t('tools.alphabet.changes.subtitle')"
        />
        <div class="changes-card">
          <ul class="changes-grid">
            <li v-for="row in ALPHABET_CHANGES" :key="row.old">
              <span class="visually-hidden">{{ $t("tools.alphabet.changes.old") }}:</span>
              <strong>{{ row.old }}</strong>
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
                <path d="m15 8 4 4-4 4" />
              </svg>
              <span class="visually-hidden">{{ $t("tools.alphabet.changes.new") }}:</span>
              <strong>{{ row.new }}</strong>
            </li>
          </ul>
          <dl class="change-notes">
            <div>
              <dt>Ng ng</dt>
              <dd>{{ $t("tools.alphabet.changes.unchanged") }}</dd>
            </div>
            <div>
              <dt>{{ NEW_APOSTROPHE }}</dt>
              <dd>{{ $t("tools.alphabet.changes.apostrophe") }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section class="business">
        <div>
          <p class="business__eyebrow">{{ $t("tools.alphabet.business.eyebrow") }}</p>
          <h2>{{ $t("tools.alphabet.business.title") }}</h2>
          <p>{{ $t("tools.alphabet.business.text") }}</p>
        </div>
        <button type="button" class="button button--primary" @click="handleCta">
          {{ $t("tools.alphabet.business.cta") }}
        </button>
      </section>

      <section class="content-section faq">
        <UiSectionHead
          :eyebrow="$t('tools.alphabet.faq.eyebrow')"
          :title="$t('tools.alphabet.faq.title')"
        />
        <div class="faq__list">
          <div
            v-for="index in faqItems"
            :key="index"
            class="faq__item"
            :class="{ 'is-open': openFaq === index }"
          >
            <button
              :id="`alphabet-faq-button-${index}`"
              type="button"
              class="faq__question"
              :aria-expanded="openFaq === index"
              :aria-controls="`alphabet-faq-answer-${index}`"
              @click="toggleFaq(index)"
            >
              <span>{{ $t(`tools.alphabet.faq.q${index}.question`) }}</span>
              <svg
                class="faq__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              v-show="openFaq === index"
              :id="`alphabet-faq-answer-${index}`"
              class="faq__answer"
              role="region"
              :aria-labelledby="`alphabet-faq-button-${index}`"
            >
              {{ $t(`tools.alphabet.faq.q${index}.answer`) }}
            </div>
          </div>
        </div>
      </section>

      <NuxtLink v-if="BLOG_ARTICLE_PATH" :to="BLOG_ARTICLE_PATH">
        {{ $t("tools.alphabet.articleLink") }}
      </NuxtLink>
    </div>
  </main>
</template>

<style scoped>
.page--dark {
  min-height: 100vh;
  background: var(--color-ground, #05051a);
  color: var(--color-text-primary, #eef1f7);
}

.tool-header {
  max-width: 1100px;
  margin: 0 auto;
  padding: 6.75rem 1.5rem 0.85rem;
}

.tool-header__eyebrow {
  margin: 0 0 0.55rem;
  color: var(--color-sky, #a9d6e5);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.tool-header__title {
  max-width: 100%;
  margin: 0;
  color: var(--color-text-primary, #eef1f7);
  font-size: clamp(1.85rem, 3.25vw, 2.75rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.alphabet__inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem 7rem;
}

.alphabet__intro {
  max-width: 920px;
  margin: 0 0 1.25rem;
  color: #c3cad8;
  font-size: 0.9375rem;
  line-height: 1.55;
}

.converter {
  padding: 1.25rem;
  border: 1px solid rgba(169, 214, 229, 0.16);
  border-radius: 24px;
  background: var(--color-surface-card, rgba(20, 28, 48, 0.45));
}

.converter__actions,
.symbols {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.converter__toolbar {
  display: grid;
  grid-template-columns: minmax(0, 24rem) minmax(0, 1fr);
  align-items: end;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.converter__direction {
  display: flex;
  align-items: end;
  gap: 0.75rem;
  min-width: 0;
}

.converter__options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.control {
  display: grid;
  gap: 0.4rem;
  color: var(--color-text-secondary, #aab2c4);
  font-size: 0.75rem;
  font-weight: 600;
}

.control--mode {
  flex: 1 1 auto;
  min-width: 0;
}

select,
textarea,
.result {
  font: inherit;
  color: var(--color-text-primary, #eef1f7);
  background: var(--color-surface, #0b0b10);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.select-wrap {
  position: relative;
  display: block;
}

select {
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 2.75rem 0 0.85rem;
  border-radius: 10px;
  appearance: none;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
}

.select-wrap svg {
  position: absolute;
  top: 50%;
  right: 0.85rem;
  width: 1.05rem;
  height: 1.05rem;
  color: var(--color-sky, #a9d6e5);
  pointer-events: none;
  transform: translateY(-50%);
}

.check {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 10px;
  color: #c3cad8;
  background: rgba(255, 255, 255, 0.025);
  font-size: 0.8125rem;
  line-height: 1.25;
  cursor: pointer;
}

.check input {
  display: grid;
  flex: 0 0 auto;
  place-content: center;
  width: 2.25rem;
  height: 1.25rem;
  margin: 0;
  border: 1px solid rgba(169, 214, 229, 0.35);
  border-radius: 999px;
  appearance: none;
  background: rgba(169, 214, 229, 0.12);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.check input::before {
  width: 0.875rem;
  height: 0.875rem;
  border-radius: 50%;
  background: var(--color-text-secondary, #aab2c4);
  content: "";
  transform: translateX(-0.45rem);
  transition: transform 0.2s ease, background 0.2s ease;
}

.check input:checked {
  border-color: var(--color-teal, #1aab9a);
  background: var(--color-teal, #1aab9a);
}

.check input:checked::before {
  background: var(--color-text-primary, #eef1f7);
  transform: translateX(0.45rem);
}

.converter__panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.text-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.6rem;
  color: var(--color-text-secondary, #aab2c4);
  font-size: 0.75rem;
  font-weight: 600;
}

textarea,
.result {
  width: 100%;
  min-height: 280px;
  padding: 1rem;
  border-radius: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

textarea {
  display: block;
  resize: vertical;
}

.result {
  overflow: auto;
}

.result__placeholder {
  color: var(--color-text-secondary, #aab2c4);
}

mark {
  padding: 0;
  color: var(--color-text-primary, #eef1f7);
  background: rgba(26, 171, 154, 0.42);
  text-decoration: underline;
  text-decoration-color: var(--color-teal-soft, #9ae2d6);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.12em;
}

.result__warning {
  color: #fff2d8;
  background: rgba(255, 190, 92, 0.28);
  text-decoration-color: #ffbe5c;
}

.result__warning.is-active {
  background: rgba(255, 190, 92, 0.52);
}

select:focus-visible,
textarea:focus-visible,
.result:focus-visible,
button:focus-visible,
.check input:focus-visible,
.warnings li:focus-visible {
  outline: 2px solid #46e6e1;
  outline-offset: 2px;
}

.converter__notice,
.privacy-note,
.converter__status {
  margin: 0.8rem 0 0;
  color: #9ca6ba;
  font-size: 0.8rem;
  line-height: 1.5;
}

.converter__status {
  color: #f1d6a2;
}

.symbols {
  margin-top: 1rem;
  color: var(--color-text-secondary, #aab2c4);
  font-size: 0.8125rem;
}

.symbols button {
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(169, 214, 229, 0.2);
  border-radius: 8px;
  color: var(--color-text-primary, #eef1f7);
  background: rgba(169, 214, 229, 0.08);
  font: inherit;
  font-size: 1rem;
  cursor: pointer;
}

.converter__actions {
  margin-top: 1.25rem;
}

.button {
  min-height: 44px;
  padding: 0.65rem 1rem;
  border: 1px solid rgba(169, 214, 229, 0.24);
  border-radius: 10px;
  color: var(--color-text-primary, #eef1f7);
  background: rgba(169, 214, 229, 0.08);
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
}

.button--primary {
  border-color: var(--color-teal, #1aab9a);
  color: #031310;
  background: #6ad9c9;
}

.button--icon {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  padding: 0;
}

.button--icon svg {
  width: 1.35rem;
  height: 1.35rem;
}

.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.warnings {
  margin-top: 1.25rem;
  padding: 1rem;
  border: 1px solid rgba(255, 190, 92, 0.3);
  border-radius: 12px;
  color: #f1d6a2;
  background: rgba(102, 66, 12, 0.16);
  font-size: 0.875rem;
  overflow-wrap: anywhere;
}

.warnings ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
}

.warnings code {
  margin-left: 0.35rem;
  color: #fff2d8;
}

.warnings li {
  border-radius: 4px;
}

.content-section {
  margin-top: 6rem;
}

.changes-card {
  padding: 1rem;
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  background: var(--color-surface-card, rgba(20, 28, 48, 0.45));
}

.changes-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.changes-grid li {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  padding: 1.1rem 0.75rem;
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  background: rgba(169, 214, 229, 0.05);
  text-align: center;
}

.changes-grid strong {
  min-width: 0;
  color: var(--color-text-primary, #eef1f7);
  font-size: clamp(1rem, 2vw, 1.25rem);
}

.changes-grid svg {
  width: 1rem;
  color: var(--color-teal-soft, #9ae2d6);
}

.change-notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  margin: 1rem 0 0;
  padding-top: 0.25rem;
  border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
}

.change-notes div {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.8rem 1rem 0;
}

.change-notes div + div {
  border-left: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
}

.change-notes dt {
  flex: 0 0 auto;
  color: var(--color-sky, #a9d6e5);
  font-size: 1.05rem;
  font-weight: 700;
}

.change-notes dd {
  min-width: 0;
  margin: 0;
  color: var(--color-text-secondary, #aab2c4);
  font-size: 0.8125rem;
}

.business {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 6rem;
  padding: clamp(1.5rem, 4vw, 3rem);
  border: 1px solid rgba(106, 217, 201, 0.25);
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(26, 171, 154, 0.16), rgba(20, 28, 48, 0.5));
}

.business__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--color-teal-soft, #9ae2d6);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.business h2 {
  max-width: 650px;
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2.25rem);
}

.business p:last-child {
  max-width: 650px;
  margin-bottom: 0;
  color: #c3cad8;
  line-height: 1.65;
}

.faq__list {
  display: grid;
  gap: 0.75rem;
}

.faq__item {
  overflow: hidden;
  border: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  background: var(--color-surface-card, rgba(20, 28, 48, 0.45));
}

.faq__item.is-open {
  border-color: rgba(169, 214, 229, 0.28);
}

.faq__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-height: 44px;
  padding: 1.2rem 1.25rem;
  border: 0;
  color: var(--color-text-primary, #eef1f7);
  background: transparent;
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.faq__chevron {
  flex: 0 0 auto;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-sky, #a9d6e5);
  transition: transform 0.25s ease;
}

.faq__item.is-open .faq__chevron {
  transform: rotate(180deg);
}

.faq__answer {
  padding: 0 1.25rem 1.25rem;
  color: var(--color-text-secondary, #aab2c4);
  line-height: 1.7;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 760px) {
  .converter__toolbar {
    grid-template-columns: 1fr;
  }

  .converter__panels {
    grid-template-columns: 1fr;
  }

  textarea,
  .result {
    min-height: 240px;
  }

  .changes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .business {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .symbols {
    gap: 0.5rem;
  }

  .symbols > span {
    flex-basis: 100%;
  }

  .tool-header {
    padding: 6.5rem 1rem 0.65rem;
  }

  .alphabet__inner {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .alphabet__intro {
    margin-bottom: 1rem;
    font-size: 0.875rem;
  }

  .converter {
    padding: 1rem;
    border-radius: 18px;
  }

  .converter__options {
    grid-template-columns: 1fr;
  }

  .control--mode {
    min-width: 0;
  }

  .converter__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .converter__actions .button {
    width: 100%;
    min-width: 0;
    padding-right: 0.5rem;
    padding-left: 0.5rem;
    white-space: normal;
  }

  .changes-card {
    padding: 0.75rem;
  }

  .changes-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .changes-grid li {
    padding: 0.85rem 0.75rem;
  }

  .change-notes {
    grid-template-columns: 1fr;
  }

  .change-notes div {
    padding: 0.75rem 0.5rem 0;
  }

  .change-notes div + div {
    margin-top: 0.75rem;
    border-top: 1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08));
    border-left: 0;
  }

  .text-panel__head {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .check input,
  .check input::before,
  .faq__chevron {
    transition: none;
  }
}
</style>
