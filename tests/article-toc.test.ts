import { test } from "node:test";
import assert from "node:assert/strict";
import { buildArticleToc } from "../app/utils/articleToc.js";

test("creates a Cyrillic heading slug", () => {
  const article = buildArticleToc("<h2>Разработка сайтов в Ташкенте</h2>");

  assert.equal(
    article.html,
    '<h2 id="разработка-сайтов-в-ташкенте">Разработка сайтов в Ташкенте</h2>'
  );
  assert.deepEqual(article.toc, [
    {
      id: "разработка-сайтов-в-ташкенте",
      text: "Разработка сайтов в Ташкенте",
      level: 2,
    },
  ]);
});

test("deduplicates generated heading ids", () => {
  const article = buildArticleToc("<h2>Intro</h2><h3>Intro</h3><h2>Intro</h2>");

  assert.deepEqual(
    article.toc.map(({ id }) => id),
    ["intro", "intro-2", "intro-3"]
  );
});

test("keeps an existing heading id", () => {
  const article = buildArticleToc('<h2 id="cms-anchor">Heading</h2>');

  assert.equal(article.html, '<h2 id="cms-anchor">Heading</h2>');
  assert.equal(article.toc[0].id, "cms-anchor");
});

test("strips nested inline tags from TOC text", () => {
  const article = buildArticleToc("<h3>Build <strong>fast</strong> &amp; well</h3>");

  assert.deepEqual(article.toc[0], {
    id: "build-fast-well",
    text: "Build fast & well",
    level: 3,
  });
});

test("preserves attributes when adding an id", () => {
  const article = buildArticleToc('<h2 class="title" data-kind="guide">Guide</h2>');

  assert.equal(
    article.html,
    '<h2 id="guide" class="title" data-kind="guide">Guide</h2>'
  );
});

test("returns an empty result for empty input", () => {
  assert.deepEqual(buildArticleToc(null), { html: "", toc: [] });
  assert.deepEqual(buildArticleToc(""), { html: "", toc: [] });
});
