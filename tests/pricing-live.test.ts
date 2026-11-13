import { test } from "node:test";
import assert from "node:assert/strict";

// Run explicitly against a deployed site:
// PRICING_LIVE_BASE=https://esys.pro npm test
const liveBase = process.env.PRICING_LIVE_BASE?.replace(/\/+$/, "");
const paths = ["/pricing", "/uz/pricing", "/en/pricing"];
const liveOptions = {
  skip: liveBase ? false : "Set PRICING_LIVE_BASE to run deployed pricing checks",
  timeout: 120000,
};

const decodeEntities = (value: string) => value.replace(
  /&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi,
  (_, entity: string) => {
    if (entity.startsWith("#")) {
      const hex = entity[1].toLowerCase() === "x";
      return String.fromCodePoint(Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: "\u00a0" }[entity.toLowerCase()]!;
  },
);

const attributes = (tag: string): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4]);
  }
  return result;
};
const tags = (html: string, name: string) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => attributes(match[0]));
const hasRel = (tag: Record<string, string>, rel: string) =>
  (tag.rel || "").toLowerCase().split(/\s+/).includes(rel);

const schemaNodes = (value: unknown): Record<string, any>[] => {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(schemaNodes);
  return [value as Record<string, any>, ...Object.values(value).flatMap(schemaNodes)];
};
const isType = (node: Record<string, any>, type: string) =>
  Array.isArray(node["@type"]) ? node["@type"].includes(type) : node["@type"] === type;

const fetchText = async (url: string) => {
  const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `${url}: HTTP 200`);
  return { text: await response.text(), url: response.url };
};

for (const path of paths) {
  test(`live pricing SEO and JSON-LD: ${path}`, liveOptions, async (t) => {
    const base = liveBase!;
    const { text: html } = await fetchText(`${base}${path}`);
    assert.equal([...html.matchAll(/<h1\b/gi)].length, 1, "exactly one h1");

    const links = tags(html, "link");
    const canonicals = links.filter((link) => hasRel(link, "canonical"));
    assert.equal(canonicals.length, 1, "one canonical link");
    assert.equal(canonicals[0].href, `${base}${path}`);
    const alternatePaths = { "x-default": "/pricing", ru: "/pricing", uz: "/uz/pricing", en: "/en/pricing" };
    for (const [locale, alternatePath] of Object.entries(alternatePaths)) {
      assert.ok(links.some((link) =>
        hasRel(link, "alternate") && link.hreflang === locale && link.href === `${base}${alternatePath}`,
      ), `${locale} hreflang points to its canonical URL`);
    }

    const meta = tags(html, "meta");
    for (const robots of meta.filter((tag) => tag.name?.toLowerCase() === "robots")) {
      assert.doesNotMatch(robots.content || "", /noindex/i, "public pricing is indexable");
    }
    const description = meta.find((tag) => tag.name?.toLowerCase() === "description")?.content;
    assert.ok(description, "meta description exists");
    const descriptionLength = [...description].length;
    t.diagnostic(`Meta description: ${descriptionLength} characters${descriptionLength > 160 ? " (soft assertion: exceeds 160; copy comes from the CMS)" : " (within 160)"}`);

    const blocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
      .filter((match) => attributes(match[1]).type?.toLowerCase() === "application/ld+json");
    assert.ok(blocks.length > 0, "JSON-LD exists");
    const nodes = blocks.flatMap((match) => schemaNodes(JSON.parse(match[2])));
    const offers = nodes.filter((node) => isType(node, "Offer"));
    assert.equal(offers.length, 8, "eight published pricing offers");
    for (const offer of offers) {
      assert.equal(offer.priceCurrency, "UZS");
      assert.equal(offer.availability, "https://schema.org/InStock");
      assert.match(offer.validFrom, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(new Date(offer.validFrom).toISOString().slice(0, 10), offer.validFrom);
      assert.equal("priceValidUntil" in offer, false);
    }
    const services = nodes.filter((node) => isType(node, "Service"));
    assert.equal(services.length, 8, "eight pricing services");
    for (const service of services) {
      assert.equal(typeof service.serviceType, "string");
      assert.ok(service.serviceType.length > 0);
      assert.deepEqual(service.areaServed, { "@type": "City", name: "Tashkent" });
    }
    const supportOffer = offers.find((offer) => typeof offer.url === "string" && new URL(offer.url, base).hash === "#support");
    assert.ok(supportOffer, "support offer exists");
    assert.equal(supportOffer.priceSpecification["@type"], "UnitPriceSpecification");
    assert.equal(supportOffer.priceSpecification.unitText, "MONTH");
    assert.ok(tags(html, "[a-z][\\w:-]*").some((tag) => tag.id === "estimate" || tag.href === "#estimate"), "estimate target or link exists");
  });
}

test("live pricing URLs appear in sitemap.xml, following redirects and sitemap indexes", liveOptions, async () => {
  const queue = [`${liveBase}/sitemap.xml`];
  const visited = new Set<string>();
  const pageUrls: string[] = [];
  while (queue.length) {
    const requestedUrl = queue.shift()!;
    if (visited.has(requestedUrl)) continue;
    assert.ok(visited.size < 50, "sitemap traversal stays bounded");
    visited.add(requestedUrl);
    const { text: xml, url } = await fetchText(requestedUrl);
    const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi)]
      .map((match) => new URL(decodeEntities(match[1].trim().replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, "$1")), url).href);
    if (/<sitemapindex\b/i.test(xml)) {
      queue.push(...locations);
    } else {
      assert.match(xml, /<urlset\b/i, `${requestedUrl}: XML sitemap`);
      pageUrls.push(...locations);
    }
  }
  for (const path of paths) {
    assert.ok(pageUrls.includes(`${liveBase}${path}`), `${path} appears as a sitemap URL`);
  }
});
