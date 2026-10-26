import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STATIC_PAGE_LASTMOD,
  staticPageEntries,
} from "../server/utils/static-page-lastmod.ts";

test("covers all 9 static pages across the 3 locales", () => {
  assert.equal(staticPageEntries().length, 9);
  assert.equal(Object.keys(STATIC_PAGE_LASTMOD).length, 9);
});

test("every loc starts with a slash and has no trailing slash", () => {
  for (const { loc } of staticPageEntries()) {
    assert.ok(loc.startsWith("/"), loc);
    assert.ok(!loc.endsWith("/"), loc);
  }
});

test("every lastmod parses as a date and is not in the future", () => {
  const horizon = new Date("2026-12-31").getTime();
  for (const { loc, lastmod } of staticPageEntries()) {
    const parsed = Date.parse(lastmod);
    assert.ok(!Number.isNaN(parsed), loc);
    assert.ok(parsed <= horizon, `${loc}: ${lastmod}`);
  }
});

test("locs are unique", () => {
  const locs = staticPageEntries().map((entry) => entry.loc);
  assert.equal(new Set(locs).size, locs.length);
});

test("includes the about page and the uz alphabet converter", () => {
  const locs = staticPageEntries().map((entry) => entry.loc);
  assert.ok(locs.includes("/about"));
  assert.ok(locs.includes("/uz/tools/yangi-alifbo-konvertor"));
});
