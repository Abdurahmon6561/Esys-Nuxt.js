import { isSvgImage } from "./ogImage.js";

const IMG_PATTERN = /<img\b([^>]*?)(\/?)\s*>/gi;
// The optional leading group lets a second pass recognize tables that are
// already wrapped, so running the enhancer twice never nests wrappers.
const TABLE_PATTERN =
  /(<div\b[^>]*\bclass="[^"]*\barticle__table-wrap\b[^"]*"[^>]*>\s*)?(<table\b[^>]*>[\s\S]*?<\/table\s*>)/gi;
const ATTRIBUTE_PATTERN =
  /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const SRC_WIDTHS = [480, 960, 1440];
const DEFAULT_SIZES = "(min-width: 1024px) 760px, 100vw";

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseAttributes(source) {
  const attributes = [];
  const pattern = new RegExp(ATTRIBUTE_PATTERN.source, "g");

  for (const match of source.matchAll(pattern)) {
    const name = match[1];
    if (!name) continue;
    attributes.push([name, match[2] ?? match[3] ?? match[4] ?? null]);
  }

  return attributes;
}

function findAttribute(attributes, name) {
  const pair = attributes.find(([key]) => key.toLowerCase() === name);
  return pair ? pair[1] : null;
}

function setAttribute(attributes, name, value) {
  const pair = attributes.find(([key]) => key.toLowerCase() === name);
  if (pair) pair[1] = value;
  else attributes.push([name, value]);
}

function enhanceImageTag(tag, { imageUrl, fallbackAlt, sizes }) {
  const match = tag.match(/^<img\b([^>]*?)(\/?)\s*>$/i);
  if (!match) return tag;

  const attributes = parseAttributes(match[1]);
  const src = findAttribute(attributes, "src");

  if (findAttribute(attributes, "loading") === null) {
    attributes.push(["loading", "lazy"]);
  }
  if (findAttribute(attributes, "decoding") === null) {
    attributes.push(["decoding", "async"]);
  }

  const alt = findAttribute(attributes, "alt");
  if (alt === null || String(alt).trim() === "") {
    setAttribute(attributes, "alt", fallbackAlt ? escapeAttribute(fallbackAlt) : "");
  }

  if (typeof imageUrl === "function" && src && !isSvgImage(src)) {
    setAttribute(attributes, "src", escapeAttribute(imageUrl(src, 960)));
    setAttribute(
      attributes,
      "srcset",
      SRC_WIDTHS.map((width) => `${escapeAttribute(imageUrl(src, width))} ${width}w`).join(", ")
    );
    setAttribute(attributes, "sizes", escapeAttribute(sizes || DEFAULT_SIZES));
  }

  const serialized = attributes
    .map(([name, value]) => (value === null ? name : `${name}="${value}"`))
    .join(" ");

  return `<img ${serialized}${match[2] ? " /" : ""}>`;
}

/**
 * Make CMS images and tables render well inside article bodies:
 * lazy/async decoding, alt fallbacks, responsive srcset URLs, and
 * horizontally scrollable table wrappers. Pure string processing (like
 * buildArticleToc) so it is safe during SSR.
 */
export function enhanceArticleMedia(html, options = {}) {
  if (!html) return html;

  const { imageUrl, fallbackAlt, sizes } = options ?? {};

  const withImages = String(html).replace(IMG_PATTERN, (tag) =>
    enhanceImageTag(tag, { imageUrl, fallbackAlt, sizes })
  );

  return withImages.replace(
    TABLE_PATTERN,
    (match, existingWrap, table) =>
      existingWrap
        ? match
        : `<div class="article__table-wrap" role="region" tabindex="0">${table}</div>`
  );
}
