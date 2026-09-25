import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isPurgeablePath,
  routeCacheKeyPrefix,
  safeEqual,
  selectRouteCacheKeys,
} from "../server/utils/cache-purge.ts";

test("only record and list pages are purgeable", () => {
  for (const ok of ["/services", "/services/websites", "/uz/services/crm-systems", "/en/portfolio/bbd", "/blog/x"]) {
    assert.ok(isPurgeablePath(ok), ok);
  }
  for (const bad of ["/", "/api/backend/x", "/services/../x", "/services/a/b", "/ru/services/x", "*", "/services/Web", 42, null]) {
    assert.ok(!isPurgeablePath(bad), String(bad));
  }
});

test("key prefix mirrors nitro's escaped 16-char pathname", () => {
  assert.equal(routeCacheKeyPrefix("/services/mobile-applications"), ":servicesmobileap.");
  assert.equal(routeCacheKeyPrefix("/uz/services/websites"), ":uzserviceswebsit.");
});

test("selects only route-cache keys of the given pages, all query variants", () => {
  const keys = [
    "nitro:routes:_:serviceswebsites.abc123.json",
    "nitro:routes:_:serviceswebsites.zzz999.json",
    "nitro:routes:_:servicesbranding.def456.json",
    "nitro:routes:_:about.aaa.json",
    "nitro:functions:services-redirect-map:.json",
  ];

  assert.deepEqual(selectRouteCacheKeys(keys, ["/services/websites"]), keys.slice(0, 2));
  assert.deepEqual(selectRouteCacheKeys(keys, []), []);
});

test("secret comparison", () => {
  assert.ok(safeEqual("secret", "secret"));
  assert.ok(!safeEqual("secret", "secreT"));
  assert.ok(!safeEqual("", ""));
  assert.ok(!safeEqual("a", "ab"));
});
