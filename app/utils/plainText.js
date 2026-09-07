// Strips HTML and decodes entities from CMS rich-text fields.
//
// `short_text` comes from a ProseMirror editor in admin.esys and sometimes
// arrives wrapped in markup (`<p>…</p>`, and occasionally editor state such as
// `data-pm-slice="1 1 []"`). That value is used as the visible lead paragraph,
// the meta description, and the JSON-LD description - all three need plain
// text. Runs during SSR, so no DOM APIs.

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  laquo: "«",
  raquo: "»",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‘",
  rsquo: "’",
  shy: "",
};

const decodeEntities = (input) =>
  input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const decoded = NAMED_ENTITIES[name.toLowerCase()];
      return decoded === undefined ? match : decoded;
    });

/**
 * Turn a possibly-HTML CMS string into clean plain text.
 * Entities are decoded twice: the source is sometimes double-encoded, so a
 * single pass can leave a literal `&amp;mdash;` behind.
 */
export function plainText(value) {
  if (!value) return "";
  return decodeEntities(
    decodeEntities(String(value))
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Plain text clipped to `limit` characters on a word boundary, for use as a
 * meta description. 155 keeps it inside what Google typically renders.
 */
export function metaDescription(value, limit = 155) {
  const text = plainText(value);
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped).replace(/[\s.,;:—–-]+$/, "")}…`;
}
