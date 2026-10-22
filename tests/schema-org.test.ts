import { test } from "node:test";
import assert from "node:assert/strict";
import {
  breadcrumbList,
  orgId,
  schemaImage,
  websiteId,
} from "../app/utils/schemaOrg.js";

test("schema IDs use stable site-wide fragments", () => {
  assert.equal(orgId("https://esys.pro"), "https://esys.pro/#org");
  assert.equal(websiteId("https://esys.pro"), "https://esys.pro/#website");
});

test("breadcrumbList maps absolute URLs to positioned list items", () => {
  assert.deepEqual(
    breadcrumbList([
      { name: "Evolution Systems", url: "https://esys.pro" },
      { name: "Services", url: "https://esys.pro/services" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Evolution Systems",
          item: "https://esys.pro",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: "https://esys.pro/services",
        },
      ],
    }
  );
});

test("schemaImage keeps supported image URLs", () => {
  assert.equal(
    schemaImage("https://esys.pro/image.webp", "https://esys.pro/fallback.png"),
    "https://esys.pro/image.webp"
  );
});

test("schemaImage replaces empty and SVG image URLs", () => {
  const fallback = "https://esys.pro/fallback.png";
  assert.equal(schemaImage("", fallback), fallback);
  assert.equal(schemaImage(undefined, fallback), fallback);
  assert.equal(schemaImage("https://esys.pro/image.svg", fallback), fallback);
  assert.equal(schemaImage("https://esys.pro/image.SVG?width=1200", fallback), fallback);
});
