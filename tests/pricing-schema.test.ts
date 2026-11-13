import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { pricingCopy } from "../app/components/pricing/copy.js";
import {
  PRICING_SERVICE_TYPES,
  buildPricingPageSchema,
  formatPricingAmount,
  formatPricingSuffix,
} from "../app/utils/pricing.js";

const serviceTypes = {
  landing: "Landing page development",
  corporate: "Corporate website development",
  store: "E-commerce development",
  mobile: "Mobile app development",
  crm: "CRM development and business automation",
  saas: "Web application and SaaS development",
  branding: "Branding and visual identity",
  support: "Website and software maintenance",
};
const prices = [4500000, 7900000, 12900000, 19900000, 24900000, 34900000, 7900000, 1000000];
const items = Object.keys(serviceTypes).map((service_key, index) => ({
  id: index + 1,
  service_key,
  title: `Package ${service_key}`,
  short_text: `Description ${service_key}`,
  price_from: prices[index],
  price_to: service_key === "corporate" ? 11900000 : null,
  billing_period: service_key === "support" ? "month" : "project",
  sort_order: index,
  service_url: index % 2 === 0 ? `/services/${service_key}` : null,
  cases: [],
}));
const page = {
  id: 1,
  version: 1,
  currency: "UZS",
  published: true,
  published_at: "2026-11-13T10:00:00+05:00",
  locales: ["ru", "uz", "en"],
  content: {
    title: "Pricing",
    description: "Pricing description",
    h1: "Pricing",
    faq: [
      { question: "What is included?", answer: "The listed scope." },
      { question: "Can scope change?", answer: "Yes, after discussion. <Details>" },
    ],
  },
  items,
};
const siteUrl = "https://esys.pro";
const pathFor = (locale: string) => `${locale === "ru" ? "" : `/${locale}`}/pricing`;
const schemaFor = (overrides = {}) => buildPricingPageSchema({
  page, items, locale: "ru", siteUrl, navLabel: pricingCopy.ru.nav, pathFor, ...overrides,
});
const servicesFor = (overrides = {}) => schemaFor(overrides)["@graph"].slice(2);

test("pricing Service types match only the eight known service keys", () => {
  assert.deepEqual(PRICING_SERVICE_TYPES, serviceTypes);
  for (const locale of page.locales) {
    const services = servicesFor({ locale, navLabel: pricingCopy[locale].nav });
    assert.equal(services.length, 8);
    services.forEach((service, index) => {
      assert.equal(service["@type"], "Service");
      assert.equal(service.serviceType, Object.values(serviceTypes)[index]);
      assert.deepEqual(service.areaServed, { "@type": "City", name: "Tashkent" });
    });
  }
});

test("each published Offer keeps the UZS starting price and publication date", () => {
  for (const locale of page.locales) {
    servicesFor({ locale }).forEach((service, index) => {
      const item = items[index];
      const offer = service.offers;
      assert.equal(offer["@type"], "Offer");
      assert.equal(offer.name, item.title);
      assert.equal(offer.price, item.price_from);
      assert.equal(offer.priceCurrency, "UZS");
      assert.equal(offer.availability, "https://schema.org/InStock");
      assert.equal(offer.validFrom, "2026-11-13");
      assert.equal(offer.url, `${siteUrl}${pathFor(locale)}#${item.service_key}`);
      assert.deepEqual(offer.priceSpecification, {
        "@type": item.service_key === "support" ? "UnitPriceSpecification" : "PriceSpecification",
        minPrice: item.price_from,
        ...(item.price_to ? { maxPrice: item.price_to } : {}),
        priceCurrency: "UZS",
        ...(item.service_key === "support" ? { unitText: "MONTH" } : {}),
      });
      assert.equal("priceValidUntil" in offer, false);
    });
  }
});

test("extraction preserves every existing graph field and graph ordering", () => {
  for (const locale of page.locales) {
    const schema = schemaFor({ locale, navLabel: pricingCopy[locale].nav });
    // Remove only the newly requested fields to compare the original schema.
    const originalGraph = schema["@graph"].map((entry) => {
      if (entry["@type"] !== "Service") return entry;
      const { serviceType, areaServed, offers, ...service } = entry;
      const { availability, validFrom, ...offer } = offers;
      return { ...service, offers: offer };
    });
    assert.deepEqual(originalGraph, [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Evolution Systems", item: `${siteUrl}${locale === "ru" ? "" : `/${locale}`}` },
          { "@type": "ListItem", position: 2, name: pricingCopy[locale].nav, item: `${siteUrl}${pathFor(locale)}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.content.faq.map(({ question, answer }) => ({
          "@type": "Question", name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      ...items.map((item) => ({
        "@type": "Service",
        name: item.title,
        description: item.short_text,
        provider: { "@id": `${siteUrl}/#org` },
        ...(item.service_url ? { "@id": `${siteUrl}${item.service_url}#service` } : {}),
        url: `${siteUrl}${item.service_url || `${pathFor(locale)}#${item.service_key}`}`,
        offers: {
          "@type": "Offer", name: item.title, price: item.price_from,
          priceCurrency: "UZS", url: `${siteUrl}${pathFor(locale)}#${item.service_key}`,
          priceSpecification: {
            "@type": item.service_key === "support" ? "UnitPriceSpecification" : "PriceSpecification",
            minPrice: item.price_from,
            ...(item.price_to ? { maxPrice: item.price_to } : {}),
            priceCurrency: "UZS",
            ...(item.service_key === "support" ? { unitText: "MONTH" } : {}),
          },
        },
      })),
    ]);
    assert.equal(schema["@context"], "https://schema.org");
  }
});

test("the helper respects the supplied item order without mutating API data", () => {
  const before = structuredClone(page);
  const reversed = [...items].reverse();
  assert.deepEqual(servicesFor({ items: reversed }).map((service) => service.name), reversed.map((item) => item.title));
  assert.deepEqual(page, before);
});

test("unpublished pricing has Services but no offers", () => {
  const services = servicesFor({ page: { ...page, published: false } });
  assert.equal(services.length, 8);
  for (const service of services) assert.equal("offers" in service, false);
});

test("missing and invalid publication timestamps omit validFrom, not offers", () => {
  const { published_at, ...oldPage } = page;
  const invalidPages = [
    oldPage,
    ...[undefined, null, "", "not-a-date", "2026-11-13garbage",
      "2026-02-29T10:00:00+05:00", "2026-02-30", "2026-13-01T10:00:00Z",
      "2026-11-13T25:00:00Z", "2026-11-13T10:00:00+99:00", 1794560400000,
    ].map((value) => ({ ...page, published_at: value })),
  ];
  for (const invalidPage of invalidPages) {
    for (const service of servicesFor({ page: invalidPage })) {
      assert.equal(service.offers.availability, "https://schema.org/InStock");
      assert.equal("validFrom" in service.offers, false);
    }
  }
});

test("validFrom keeps the timestamp's date across timezone boundaries", () => {
  for (const [published_at, expected] of [
    ["2026-11-13T00:30:00+05:00", "2026-11-13"],
    ["2026-11-13T23:30:00-05:00", "2026-11-13"],
    ["2026-11-13T10:00+05:00", "2026-11-13"],
    ["2026-11-13T10:00:00+0500", "2026-11-13"],
    ["2024-02-29T10:00:00.000000Z", "2024-02-29"],
    ["2026-11-13", "2026-11-13"],
  ]) {
    for (const service of servicesFor({ page: { ...page, published_at } })) {
      assert.equal(service.offers.validFrom, expected);
    }
  }
});

test("FAQPage preserves every CMS question and answer 1:1, including an empty FAQ", () => {
  const faq = schemaFor()["@graph"][1];
  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq.mainEntity.length, page.content.faq.length);
  assert.deepEqual(faq.mainEntity.map((entry) => ({
    question: entry.name, answer: entry.acceptedAnswer.text,
  })), page.content.faq);
  for (const entry of faq.mainEntity) {
    assert.equal(entry["@type"], "Question");
    assert.equal(entry.acceptedAnswer["@type"], "Answer");
  }
  assert.deepEqual(schemaFor({ page: { ...page, content: { ...page.content, faq: [] } } })["@graph"][1].mainEntity, []);
});

test("unknown service keys never invent serviceType, including prototype names", () => {
  for (const service_key of ["unknown", "", "constructor", "toString", "__proto__", undefined]) {
    const [service] = servicesFor({ items: [{ ...items[0], service_key }] });
    assert.equal("serviceType" in service, false);
    assert.deepEqual(service.areaServed, { "@type": "City", name: "Tashkent" });
    assert.equal(service.offers.price, items[0].price_from);
  }
});

test("hourly offers retain HOUR units and zero starting prices remain prices", () => {
  const [service] = servicesFor({ items: [{ ...items[0], billing_period: "hour", price_from: 0, price_to: 1000000 }] });
  assert.equal(service.offers.price, 0);
  assert.deepEqual(service.offers.priceSpecification, {
    "@type": "UnitPriceSpecification", minPrice: 0, maxPrice: 1000000,
    priceCurrency: "UZS", unitText: "HOUR",
  });
});

test("schema survives JSON serialization and the page's script escaping", () => {
  const schema = schemaFor();
  const serialized = JSON.stringify(schema);
  assert.deepEqual(JSON.parse(serialized), schema);
  const escaped = serialized.replace(/</g, "\\u003c");
  assert.equal(escaped.includes("<"), false);
  assert.deepEqual(JSON.parse(escaped), schema);
});

test("fixture prices are non-negative, ranges are ordered, and grouping and monthly suffix stay unchanged", () => {
  const amounts = ["4 500 000", "7 900 000–11 900 000", "12 900 000", "19 900 000", "24 900 000", "34 900 000", "7 900 000", "1 000 000"];
  items.forEach((item, index) => {
    assert.ok(Number.isFinite(item.price_from) && item.price_from >= 0);
    if (item.price_to != null) assert.ok(item.price_to >= item.price_from);
    assert.equal(formatPricingAmount(item), amounts[index]);
    assert.equal(formatPricingSuffix(item, pricingCopy.ru), item.billing_period === "month" ? "/мес" : "");
  });
  assert.equal(formatPricingSuffix({ billing_period: "hour" }, pricingCopy.ru), "/час");
  assert.equal(formatPricingSuffix({}, pricingCopy.ru), "");
});

test("pricing template keeps one h1 and uses the shared schema with safe script output", () => {
  const source = readFileSync(new URL("../app/components/pricing/Page.vue", import.meta.url), "utf8");
  const template = source.match(/<template>([\s\S]*)<\/template>/)?.[1];
  assert.ok(template, "pricing template exists");
  assert.equal([...template.matchAll(/<h1\b/gi)].length, 1);
  assert.match(source, /const schema = computed\(\(\) => buildPricingPageSchema\(\{/);
  for (const binding of ["page: page.value", "items: items.value", "locale: locale.value", "navLabel: copy.value.nav", "pathFor"]) {
    assert.ok(source.includes(binding), binding);
  }
  assert.match(source, /key:\s*'pricing-schema'/);
  assert.ok(source.includes(String.raw`JSON.stringify(schema.value).replace(/</g,'\\u003c')`));

  const expression = source.match(/^const pathFor = (.+);$/m)?.[1];
  assert.ok(expression, "pathFor remains a statically testable function");
  const pagePathFor = runInNewContext(`(${expression})`);
  for (const [locale, expected] of [["ru", "/pricing"], ["uz", "/uz/pricing"], ["en", "/en/pricing"]]) {
    assert.equal(pagePathFor(locale), expected);
    assert.equal(pathFor(locale), expected);
  }
});

test("assembled pricing sitemap contains each published locale once with x-default alternates", {
  skip: "Final deduplication and hreflang assembly depend on Nuxt/Nitro and @nuxtjs/sitemap; no standalone pure entry point. The opt-in live test checks sitemap URL inclusion.",
}, () => {});
