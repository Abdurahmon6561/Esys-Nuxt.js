import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pricingCopy } from "../app/components/pricing/copy.js";
import {
  buildServicePricingOffer,
  formatPricingAmount,
  formatPricingNumber,
  formatPricingSuffix,
  formatServicePrice,
  serviceContentBlocks,
} from "../app/utils/pricing.js";

const pricing = {
  price_from: 15000000,
  price_to: null,
  billing_period: "project",
  currency: "UZS",
  url: "/pricing#websites",
};

test("shared number and amount formatters preserve published pricing output", () => {
  for (const [value, expected] of [
    [0, "0"],
    [999, "999"],
    [1000, "1 000"],
    [15000000, "15 000 000"],
    [1234567890, "1 234 567 890"],
  ]) {
    assert.equal(formatPricingNumber(value), expected);
  }
  assert.equal(formatPricingAmount(pricing), "15 000 000");
  assert.equal(formatPricingAmount({ ...pricing, price_to: 30000000 }), "15 000 000–30 000 000");
  assert.equal(formatPricingAmount({ price_from: 15000000 }), "15 000 000");
});

test("service prices use the pricing page's localized from/range/period labels", () => {
  const expected = {
    ru: ["от 15 000 000 сум", "15 000 000–30 000 000 сум", "/мес", "/час"],
    en: ["from 15 000 000 UZS", "15 000 000–30 000 000 UZS", "/month", "/hour"],
    uz: ["15 000 000 so‘mdan", "15 000 000–30 000 000 so‘m", "/oy", "/soat"],
  };
  for (const [locale, [from, range, month, hour]] of Object.entries(expected)) {
    const copy = pricingCopy[locale];
    assert.equal(formatServicePrice(pricing, copy), from);
    assert.equal(formatServicePrice({ ...pricing, price_to: 30000000 }, copy), range);
    for (const [period, suffix] of [["month", month], ["hour", hour], ["project", ""], ["custom", ""]]) {
      const item = { ...pricing, billing_period: period };
      assert.equal(formatPricingSuffix(item, copy), suffix);
      assert.equal(formatServicePrice(item, copy), `${from}${suffix}`);
      assert.equal(formatServicePrice({ ...item, price_to: 30000000 }, copy), `${range}${suffix}`);
      // Listing cards advertise the starting price even for a bounded package.
      assert.equal(formatServicePrice({ ...item, price_to: 30000000 }, copy, { fromOnly: true }), `${from}${suffix}`);
    }
  }
});

test("missing snapshot fields never produce invented or invalid prices", () => {
  for (const value of [undefined, null, {}, { price_from: null }, { price_from: NaN }, { price_from: Infinity }]) {
    assert.equal(formatServicePrice(value, pricingCopy.ru), "");
    assert.equal(buildServicePricingOffer(value, "https://esys.pro"), undefined);
  }
  assert.equal(formatServicePrice({ price_from: 0 }, pricingCopy.ru), "от 0 сум");
  assert.equal(formatPricingSuffix({}, pricingCopy.ru), "");
  assert.equal(formatPricingSuffix({ billing_period: null }, pricingCopy.ru), "");
  assert.deepEqual(buildServicePricingOffer({ price_from: 0 }, "https://esys.pro"), {
    "@type": "Offer",
    price: 0,
    availability: "https://schema.org/InStock",
    priceSpecification: { "@type": "PriceSpecification", minPrice: 0 },
  });
});

test("service offer uses the published minimum and optional maximum, not the typical budget", () => {
  assert.deepEqual(
    buildServicePricingOffer({ ...pricing, typical_from: 20000000, typical_to: 50000000 }, "https://esys.pro"),
    {
      "@type": "Offer",
      price: 15000000,
      priceCurrency: "UZS",
      availability: "https://schema.org/InStock",
      url: "https://esys.pro/pricing#websites",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: 15000000,
        priceCurrency: "UZS",
      },
    },
  );
  const offer = buildServicePricingOffer({ ...pricing, price_to: 30000000 }, "https://esys.pro");
  assert.equal(offer.price, 15000000);
  assert.equal(offer.priceSpecification.maxPrice, 30000000);
  assert.equal("maxPrice" in buildServicePricingOffer({ ...pricing, price_to: undefined }, "https://esys.pro").priceSpecification, false);
});

test("service offers mirror pricing schema units and preserve already localized URLs", () => {
  for (const [period, unit] of [["month", "MONTH"], ["hour", "HOUR"], ["project", undefined], ["custom", undefined], [null, undefined]]) {
    for (const prefix of ["", "/en", "/uz"]) {
      const offer = buildServicePricingOffer({
        ...pricing,
        billing_period: period,
        price_to: 30000000,
        url: `${prefix}/pricing#websites`,
      }, "https://esys.pro");
      assert.equal(offer.url, `https://esys.pro${prefix}/pricing#websites`);
      assert.deepEqual(offer.priceSpecification, {
        "@type": unit ? "UnitPriceSpecification" : "PriceSpecification",
        minPrice: 15000000,
        maxPrice: 30000000,
        priceCurrency: "UZS",
        ...(unit ? { unitText: unit } : {}),
      });
    }
  }
});

test("old APIs retain manual pricing blocks unchanged", () => {
  const blocks = [
    { id: 1, type: "hero" },
    { id: 2, type: "pricing", payload: { plans: [{ price: "old price" }] } },
    { id: 3, type: "features" },
    { id: 4, type: "pricing" },
  ];
  for (const absent of [undefined, null]) {
    assert.strictEqual(serviceContentBlocks(blocks, absent), blocks);
  }
  assert.deepEqual(serviceContentBlocks(blocks, pricing), [blocks[0], blocks[2]]);
  assert.equal(blocks.length, 4, "filtering must not mutate CMS data");
  assert.deepEqual(serviceContentBlocks(blocks, {}), [blocks[0], blocks[2]]);
  assert.deepEqual(serviceContentBlocks(undefined, pricing), []);
  assert.deepEqual(serviceContentBlocks(null, null), []);
});

test("all service pricing translations exist in every locale", () => {
  for (const locale of ["ru", "uz", "en"]) {
    const messages = JSON.parse(readFileSync(new URL(`../i18n/locales/${locale}.json`, import.meta.url), "utf8"));
    for (const key of ["title", "timeline", "included", "allPrices", "compareTitle", "compareText", "compareLink"]) {
      assert.equal(typeof messages.services.priceSummary[key], "string", `${locale}.${key}`);
      assert.ok(messages.services.priceSummary[key].length);
    }
  }
});
