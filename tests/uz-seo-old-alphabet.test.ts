import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const uz = JSON.parse(
  readFileSync(new URL("../i18n/locales/uz.json", import.meta.url), "utf8"),
);

// The alphabet converter description names the new letters (ö, ğ, ş, ç)
// on purpose, so it is not part of this check.
const staticSeo = {
  home: uz.home.seo,
  about: uz.about.seo,
  contact: uz.contact.seo,
  services: uz.services.seo,
  portfolio: uz.portfolio.seo,
  blog: uz.blog.seo,
  tools: uz.tools.hub.seo,
};

test("Uzbek static SEO strings use the old Latin alphabet", () => {
  for (const [page, seo] of Object.entries(staticSeo)) {
    for (const key of ["title", "description"]) {
      assert.equal(typeof seo[key], "string", `${page}.${key} is missing`);
      assert.doesNotMatch(seo[key], /[öÖğĞşŞçÇ]/u, `${page}.${key}`);
    }
  }
});
