import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildConsultantContext, estimateAnalyticsParams, formatEstimatePrice } from "../app/utils/estimate.js";

const estimate = { price_from: 4500000, price_to: 6000000, billing_period: "project" };
const expected = {
  ru: ["от 4 500 000 до 6 000 000 сум", "от 4 500 000 сум", " в месяц", " в час"],
  uz: ["4 500 000 dan 6 000 000 so‘mgacha", "4 500 000 so‘mdan", " oyiga", " soatiga"],
  en: ["4,500,000–6,000,000 UZS", "from 4,500,000 UZS", " per month", " per hour"],
};

test("estimate prices use exact localized ranges, open ends and billing periods", () => {
  for (const [locale, [range, open, month, hour]] of Object.entries(expected)) {
    for (const [billing_period, suffix] of [["project", ""], ["custom", ""], ["month", month], ["hour", hour]]) {
      assert.equal(formatEstimatePrice({ ...estimate, billing_period }, locale), range + suffix);
      assert.equal(formatEstimatePrice({ ...estimate, price_to: null, billing_period }, locale), open + suffix);
    }
  }
});

test("estimate formatting preserves fractional prices, zero, and rejects invalid numbers for fallback", () => {
  assert.equal(formatEstimatePrice({ ...estimate, price_from: 4500000.125, price_to: null }, "en"), "from 4,500,000.125 UZS");
  assert.equal(formatEstimatePrice({ ...estimate, price_from: 4500000.125, price_to: 6000000.9876 }, "ru"), "от 4 500 000,125 до 6 000 000,9876 сум");
  assert.equal(formatEstimatePrice({ ...estimate, price_from: 0, price_to: 0 }, "en"), "0–0 UZS");
  for (const price_from of [undefined, null, NaN, Infinity, "4500000", -1]) {
    assert.equal(formatEstimatePrice({ ...estimate, price_from }, "en"), "");
  }
  assert.equal(formatEstimatePrice({ ...estimate, price_to: NaN }, "en"), "");
  assert.equal(formatEstimatePrice({ ...estimate, price_to: 1 }, "en"), "");
  assert.equal(formatEstimatePrice(null, "en"), "");
});

test("consultant route context maps localized route names, including actual alias routes", () => {
  const routes = {
    pricing: "pricing", "pricing-preview": "pricing", index: "homepage",
    "services-slug": "service_page", "services-slug-detail": "service_page",
    "blog-slug": "article", "blog-alias": "article",
    "portfolio-slug": "portfolio", "portfolio-alias": "portfolio",
    blog: "chat", "blog-index": "chat", portfolio: "chat", services: "chat", about: "chat",
  };
  for (const [routeName, entry_point] of Object.entries(routes)) {
    for (const suffix of ["", "___en", "___uz", "___ru___default"]) {
      assert.equal(buildConsultantContext({ routeName: routeName + suffix }).entry_point, entry_point, routeName + suffix);
    }
  }
  assert.deepEqual(buildConsultantContext(), { entry_point: "chat", suggested_service: null, source_url: null, utm: null });
});

test("consultant context strips query/hash, uses origin only, limits UTM, and validates services", () => {
  const context = buildConsultantContext({
    routeName: "pricing___en", origin: "https://esys.pro/ignored?token=secret",
    path: "/en/pricing?email=private#landing", suggestedService: "landing",
    query: { utm_source: "  search  ", utm_medium: ["cpc", "ignored"], utm_campaign: "x".repeat(251), email: "private" },
  });
  assert.deepEqual(context, {
    entry_point: "pricing", suggested_service: "landing", source_url: "https://esys.pro/en/pricing",
    utm: { source: "search", medium: "cpc", campaign: "x".repeat(250) },
  });
  for (const key of ["landing", "corporate", "store", "mobile", "crm", "saas", "branding", "support"]) {
    assert.equal(buildConsultantContext({ suggestedService: key }).suggested_service, key);
  }
  for (const suggestedService of ["invalid", "toString", "__proto__", "", null, {}]) {
    assert.equal(buildConsultantContext({ suggestedService }).suggested_service, null);
  }
  assert.equal(buildConsultantContext({ query: { utm_source: " ", utm_medium: null, utm_campaign: [] } }).utm, null);
  assert.equal(buildConsultantContext({ origin: "invalid", path: "/" }).source_url, null);
  assert.equal(buildConsultantContext({ origin: "file:///secret", path: "/" }).source_url, null);
  assert.equal(buildConsultantContext({ origin: "https://esys.pro", path: "//elsewhere.test/foo?private" }).source_url, "https://esys.pro/elsewhere.test/foo");
});

test("estimate analytics uses only the approved fields, never free text, identifiers or contact data", () => {
  const params = estimateAnalyticsParams({
    ...estimate, price_to: null, service_key: "store", pricing_version: 3, manual_review: false,
    estimate_id: "est_private", session_id: "private", reply: "private", service_title: "private",
    name: "private", contact: "private", included: ["private"], factors: ["private"],
  }, {
    locale: "uz", entry_point: "pricing", name: "private", contact: "private", message: "private",
    source_url: "https://esys.pro/private", estimate_id: "est_private", session_id: "private",
    utm: { source: "search", medium: "cpc", campaign: "launch", email: "private" },
  });
  assert.deepEqual(params, {
    locale: "uz", entry_point: "pricing", service_key: "store", pricing_version: 3,
    estimate_from: 4500000, estimate_to: null, manual_review: false,
    utm_source: "search", utm_medium: "cpc", utm_campaign: "launch",
  });
  assert.deepEqual(estimateAnalyticsParams(null, { locale: "en", entry_point: "homepage", suggested_service: "landing" }), {
    locale: "en", entry_point: "homepage", service_key: "landing",
  });
  assert.deepEqual(estimateAnalyticsParams(null, { locale: "private", entry_point: "private", service_key: "private" }), {});
});

test("estimate translations cover all component strings in RU, EN and Uzbek Latin", () => {
  const files = ["app/components/consultant/EstimateCard.vue", "app/components/ConsultantWidget.vue",
    "app/composables/useConsultant.js", "app/components/pricing/Page.vue"];
  const keys = new Set(files.flatMap(file => [...readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
    .matchAll(/consultant\.estimate\.([a-zA-Z]+)/g)].map(match => match[1])));
  keys.add("changeMessage"); keys.add("restartMessage");
  for (const locale of ["ru", "en", "uz"]) {
    const translations = JSON.parse(readFileSync(new URL(`../i18n/locales/${locale}.json`, import.meta.url), "utf8")).consultant.estimate;
    for (const key of keys) assert.ok(typeof translations[key] === "string" && translations[key], `${locale}.${key}`);
    if (locale === "uz") {
      for (const value of Object.values(translations)) {
        assert.doesNotMatch(String(value), /[\u0400-\u04ff]|[oOgG]['’ʻʼ]/u, "Uzbek uses Latin and U+2018");
      }
    }
  }
});
