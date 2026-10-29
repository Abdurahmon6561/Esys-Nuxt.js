import { test } from "node:test";
import assert from "node:assert/strict";
import { isAiCrawler } from "../server/utils/ai-crawlers.ts";

test("AI training crawlers are refused", () => {
  for (const ua of [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "CCBot/2.0 (https://commoncrawl.org/faq/)",
    "Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)",
  ]) {
    assert.equal(isAiCrawler(ua), true, ua);
  }
});

test("AI search engines and user fetchers are allowed", () => {
  for (const ua of [
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)",
  ]) {
    assert.equal(isAiCrawler(ua), false, ua);
  }
});

test("classic search engines and browsers are not AI crawlers", () => {
  for (const ua of [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    undefined,
  ]) {
    assert.equal(isAiCrawler(ua), false, String(ua));
  }
});
