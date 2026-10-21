import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalRedirect } from "../server/utils/canonical-url.ts";

const opts = { siteOrigin: "https://esys.pro" };
const req = (host: string, pathname: string, search = "", method = "GET") => ({
  method,
  host,
  pathname,
  search,
});

test("www root goes to the apex root in one hop", () => {
  assert.equal(canonicalRedirect(req("www.esys.pro", "/"), opts), "https://esys.pro/");
});

test("www + trailing slash + query: one hop, query kept", () => {
  assert.equal(
    canonicalRedirect(req("www.esys.pro", "/services/", "?utm_source=x&a=1"), opts),
    "https://esys.pro/services?utm_source=x&a=1",
  );
});

test("www + /ru prefix + trailing slash collapse into one redirect", () => {
  assert.equal(
    canonicalRedirect(req("www.esys.pro", "/ru/services/websites/", "?q=1"), opts),
    "https://esys.pro/services/websites?q=1",
  );
});

test("apex trailing slash is stripped relative, root is left alone", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/services/"), opts), "/services");
  assert.equal(canonicalRedirect(req("esys.pro", "/en/"), opts), "/en");
  assert.equal(canonicalRedirect(req("esys.pro", "/"), opts), null);
});

test("/ru and /ru/ go to the unprefixed URL", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/ru"), opts), "/");
  assert.equal(canonicalRedirect(req("esys.pro", "/ru/blog"), opts), "/blog");
  assert.equal(canonicalRedirect(req("esys.pro", "/rus"), opts), null);
});

test("canonical URLs are not redirected (no loop)", () => {
  for (const path of ["/services", "/en/services/websites", "/uz/portfolio/bbd", "/"]) {
    assert.equal(canonicalRedirect(req("esys.pro", path, "?a=1"), opts), null, path);
  }
  const once = canonicalRedirect(req("esys.pro", "/services/"), opts)!;
  assert.equal(canonicalRedirect(req("esys.pro", once), opts), null);
});

test("API, framework, sitemap and static files are never touched", () => {
  for (const path of [
    "/api/backend/services/",
    "/api/__cache/invalidate",
    "/_nuxt/entry.js",
    "/_ipx/w_800/x.png",
    "/__sitemap__/ru.xml",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.ico",
  ]) {
    assert.equal(canonicalRedirect(req("www.esys.pro", path), opts), null, path);
  }
});

test("uppercase path is lowercased in a single redirect", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/About"), opts), "/about");
  assert.equal(
    canonicalRedirect(req("esys.pro", "/en/Services/Websites"), opts),
    "/en/services/websites",
  );
});

test("uppercase + /ru prefix + trailing slash collapse into one redirect", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/RU/About/", "?a=1"), opts), "/about?a=1");
  assert.equal(canonicalRedirect(req("www.esys.pro", "/RU/About/"), opts), "https://esys.pro/about");
});

test("the query string is preserved as-is, never lowercased", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/Services", "?Tag=Foo"), opts), "/services?Tag=Foo");
});

test("excluded paths keep their original casing", () => {
  assert.equal(canonicalRedirect(req("www.esys.pro", "/_nuxt/ABC.js"), opts), null);
});

test("percent-encoded paths are left untouched", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/%D0%B0%D0%B9"), opts), null);
});

test("an already-lowercase path returns null", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "/services/websites", "?a=1"), opts), null);
});

test("non-GET requests are never redirected", () => {
  assert.equal(canonicalRedirect(req("www.esys.pro", "/contact/", "", "POST"), opts), null);
  assert.equal(canonicalRedirect(req("esys.pro", "/services/", "", "HEAD"), opts), "/services");
});

test("no open redirect via double slashes or foreign hosts", () => {
  assert.equal(canonicalRedirect(req("esys.pro", "//evil.com/"), opts), null);
  assert.equal(canonicalRedirect(req("esys.pro", "//evil/"), opts), "/evil");
  assert.equal(canonicalRedirect(req("www.esys.pro", "//evil/x/"), opts), "https://esys.pro/evil/x");
  // A spoofed Host is never echoed back: only www.<site> triggers an absolute URL.
  assert.equal(canonicalRedirect(req("www.evil.com", "/services/"), opts), "/services");
  assert.equal(canonicalRedirect(req("evil.com", "/services"), opts), null);
});
