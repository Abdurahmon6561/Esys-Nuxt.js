// User-Agent names of AI crawlers and model trainers that are refused.
// Keep in sync with public/robots.txt and admin.esys config/crawlers.php
// (except YandexAdditional: allowed here so esys.pro stays eligible for
// Yandex Neuro answers; still blocked on the admin panel and demos).
// Classic search engines (Googlebot, bingbot, YandexBot) are intentionally absent.
export const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "Google-Extended",
  "GoogleOther",
  "Google-CloudVertexBot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "FacebookBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "MistralAI-User",
  "DuckAssistBot",
  "YouBot",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Timpibot",
  "PanguBot",
  "Kangaroo Bot",
  "Webzio-Extended",
  "img2dataset",
  "FirecrawlAgent",
  "Crawl4AI",
  "Scrapy",
];

// AI search engines and fetchers acting on a user's request: they cite and
// link to the site in answers (ChatGPT search, Claude, Perplexity), so the
// whole site is open to them. Training crawlers above stay blocked.
export const AI_SEARCH_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
];

const toPattern = (names: string[]) =>
  new RegExp(
    names.map((name) => name.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")).join("|"),
    "i",
  );

const crawlerPattern = toPattern(AI_CRAWLERS);
const searchAgentPattern = toPattern(AI_SEARCH_AGENTS);

export const isAiCrawler = (userAgent: string | undefined): boolean =>
  Boolean(userAgent) &&
  !searchAgentPattern.test(userAgent as string) &&
  crawlerPattern.test(userAgent as string);
