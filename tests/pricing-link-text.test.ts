import { test } from "node:test";
import assert from "node:assert/strict";
import { pricingCopy, serviceLinkText } from "../app/components/pricing/copy.js";

test("service link anchor text includes the package title per locale", () => {
  const title = "Корпоративный сайт";
  const expected = {
    ru: "Подробнее: Корпоративный сайт",
    en: "Learn more: Корпоративный сайт",
    uz: "Batafsil: Корпоративный сайт",
  };
  for (const locale of Object.keys(expected)) {
    const text = serviceLinkText(pricingCopy[locale], title);
    assert.ok(text.includes(title), `${locale} text should contain the title`);
    assert.equal(text, expected[locale]);
  }
});

test("service link anchor text describes each published package", () => {
  const titles = ["Лендинг", "Интернет-магазин", "Мобильное приложение", "CRM и автоматизация", "Веб-приложение / SaaS", "Брендинг"];
  for (const locale of ["ru", "en", "uz"]) {
    for (const title of titles) {
      assert.ok(
        serviceLinkText(pricingCopy[locale], title).includes(title),
        `${locale} link text should contain "${title}"`
      );
    }
  }
});

test("empty title falls back to the generic link text per locale", () => {
  for (const title of ["", undefined, null]) {
    for (const locale of ["ru", "en", "uz"]) {
      assert.equal(serviceLinkText(pricingCopy[locale], title), pricingCopy[locale].more);
    }
  }
});
