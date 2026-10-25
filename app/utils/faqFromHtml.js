// Extract a Q/A list from a CMS article's rich-text HTML for FAQPage
// JSON-LD. Same string-processing approach as articleToc.js so it runs
// during SSR without a DOM parser.

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
      if (hexadecimal) return Number.parseInt(hexadecimal, 16);
      return ENTITY_MAP[named.toLowerCase()] ?? entity;
    }
  );
}

function stripTags(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

// "Часто задаваемые вопросы", "FAQ", "Frequently asked questions",
// "Ko'p beriladigan savollar" (uz spelling varies, so match loosely).
const FAQ_HEADING = /часто\s*задаваем|frequently\s*asked|\bfaq\b|savol/i;

const HEADING = /<(h[23])\b[^>]*>([\s\S]*?)<\/h[23]\s*>/gi;
const ANSWER_BLOCK = /<(p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;

/**
 * Return [{ question, answer }] from the FAQ section of an article, or []
 * when there is no recognizable FAQ section. Only paragraphs/lists directly
 * following a question heading (up to the next heading) count as the answer.
 */
export function buildFaq(source) {
  if (!source) return [];
  const input = String(source);

  const headings = [...input.matchAll(HEADING)].map((match) => ({
    level: match[1].toLowerCase(),
    text: stripTags(match[2]),
    start: match.index,
    end: match.index + match[0].length,
  }));

  const faqHeading = headings.find(
    (heading) =>
      heading.level === "h2" &&
      heading.text.length < 120 &&
      FAQ_HEADING.test(heading.text)
  );
  if (!faqHeading) return [];

  // The section ends at the next h2 after the FAQ heading.
  const boundary =
    headings.find((heading) => heading.start > faqHeading.end && heading.level === "h2")
      ?.start ?? input.length;

  const section = input.slice(faqHeading.end, boundary);
  const questions = [...section.matchAll(HEADING)]
    .filter((match) => match[1].toLowerCase() === "h3")
    .map((match) => ({
      text: stripTags(match[2]),
      start: match.index,
      end: match.index + match[0].length,
    }));

  const faq = [];
  for (let i = 0; i < questions.length; i += 1) {
    const question = questions[i];
    const answerZone = section.slice(
      question.end,
      i + 1 < questions.length ? questions[i + 1].start : section.length
    );

    const answers = [];
    for (const block of answerZone.matchAll(ANSWER_BLOCK)) {
      const text = stripTags(block[2]);
      if (text) answers.push(text);
    }

    const answer = answers.join(" ").trim();
    if (question.text && question.text.length <= 300 && answer.length >= 30) {
      faq.push({ question: question.text, answer });
    }
  }

  return faq;
}
