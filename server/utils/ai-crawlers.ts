// User-Agent names of AI crawlers, model trainers and AI-assistant fetchers.
// Keep in sync with public/robots.txt and admin.esys config/crawlers.php.
// Classic search engines (Googlebot, bingbot, YandexBot) are intentionally absent.
export const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
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
  "YandexAdditional",
  "Kangaroo Bot",
  "Webzio-Extended",
  "img2dataset",
  "FirecrawlAgent",
  "Crawl4AI",
  "Scrapy",
];

const pattern = new RegExp(
  AI_CRAWLERS.map((name) => name.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")).join(
    "|",
  ),
  "i",
);

export const isAiCrawler = (userAgent: string | undefined): boolean =>
  Boolean(userAgent) && pattern.test(userAgent as string);
