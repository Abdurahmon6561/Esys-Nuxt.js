const ENTITY_MAP = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeEntities(value) {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi,
    (entity, decimal, hexadecimal, named) => {
      if (decimal) return String.fromCodePoint(Number(decimal));
      if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return ENTITY_MAP[named.toLowerCase()] ?? entity;
    }
  );
}

function headingText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFC")
    .replace(/[^\p{Script=Latin}\p{Script=Cyrillic}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function existingId(attributes) {
  const match = attributes.match(
    /\bid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/i
  );
  return match ? decodeEntities(match[1] ?? match[2] ?? match[3] ?? "") : null;
}

/**
 * Add stable anchors to article headings and return the corresponding TOC.
 * This intentionally uses string processing so it works during SSR.
 */
export function buildArticleToc(source) {
  if (!source) return { html: "", toc: [] };

  const input = String(source);
  const headingPattern = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi;
  const reservedIds = new Set();

  for (const match of input.matchAll(headingPattern)) {
    const id = existingId(match[2]);
    if (id !== null) reservedIds.add(id);
  }

  const usedIds = new Set(reservedIds);
  const slugCounts = new Map();
  const toc = [];

  const html = input.replace(
    headingPattern,
    (heading, level, attributes, content) => {
      const text = headingText(content);
      const preservedId = existingId(attributes);
      let id = preservedId;
      let nextAttributes = attributes;

      if (id === null) {
        const base = slugify(text) || "section";
        let count = slugCounts.get(base) ?? 1;
        id = count === 1 ? base : `${base}-${count}`;

        while (usedIds.has(id)) {
          count += 1;
          id = `${base}-${count}`;
        }

        slugCounts.set(base, count + 1);
        usedIds.add(id);
        nextAttributes = ` id="${id}"${attributes}`;
      }

      toc.push({ id, text, level: Number(level) });
      return `<h${level}${nextAttributes}>${content}</h${level}>`;
    }
  );

  return { html, toc };
}
