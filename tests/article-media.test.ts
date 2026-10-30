import { test } from "node:test";
import assert from "node:assert/strict";
import { enhanceArticleMedia } from "../app/utils/articleMedia.js";

const imageUrl = (src: string, width: number) => `/_ipx/webp/${width}/${src}`;

const options = {
  imageUrl,
  fallbackAlt: "Post title",
  sizes: "(min-width: 1024px) 760px, 100vw",
};

const count = (html: string, needle: string) =>
  html.split(needle).length - 1;

test("adds lazy loading and async decoding to images", () => {
  const html = enhanceArticleMedia('<img src="https://api.example/a.webp" width="1200" height="630">');

  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.equal(count(html, 'loading="lazy"'), 1);
  assert.equal(count(html, 'decoding="async"'), 1);
  // geometry and src are kept untouched when no imageUrl is provided
  assert.match(html, /src="https:\/\/api\.example\/a\.webp"/);
  assert.match(html, /width="1200"/);
  assert.match(html, /height="630"/);
});

test("keeps existing loading and decoding attributes", () => {
  const html = enhanceArticleMedia(
    '<img src="https://api.example/a.webp" loading="eager" decoding="sync">'
  );

  assert.match(html, /loading="eager"/);
  assert.match(html, /decoding="sync"/);
  assert.equal(count(html, 'loading='), 1);
  assert.equal(count(html, 'decoding='), 1);
});

test("falls back to the article title when alt is missing", () => {
  const html = enhanceArticleMedia('<img src="https://api.example/a.webp">', {
    fallbackAlt: "Building sites in Tashkent",
  });

  assert.match(html, /alt="Building sites in Tashkent"/);
});

test("falls back to the article title when alt is blank", () => {
  for (const tag of [
    '<img src="https://api.example/a.webp" alt="">',
    '<img src="https://api.example/a.webp" alt="   ">',
  ]) {
    const html = enhanceArticleMedia(tag, { fallbackAlt: "Building sites" });

    assert.equal(count(html, "alt="), 1, tag);
    assert.match(html, /alt="Building sites"/);
  }
});

test("escapes the fallback alt for attribute context", () => {
  const html = enhanceArticleMedia('<img src="https://api.example/a.webp">', {
    fallbackAlt: 'Post "Title" & <notes>',
  });

  assert.match(html, /alt="Post &quot;Title&quot; &amp; &lt;notes&gt;"/);
});

test("rewrites src and adds srcset plus sizes for raster images", () => {
  const html = enhanceArticleMedia(
    '<img src="https://api.example/storage/blogs/12/a.webp" width="1200" height="630" alt="Diagram">',
    options
  );

  assert.match(html, /src="\/_ipx\/webp\/960\/https:\/\/api\.example\/storage\/blogs\/12\/a\.webp"/);
  assert.match(
    html,
    /srcset="\/_ipx\/webp\/480\/https:\/\/api\.example\/storage\/blogs\/12\/a\.webp 480w, \/_ipx\/webp\/960\/https:\/\/api\.example\/storage\/blogs\/12\/a\.webp 960w, \/_ipx\/webp\/1440\/https:\/\/api\.example\/storage\/blogs\/12\/a\.webp 1440w"/
  );
  assert.match(html, /sizes="\(min-width: 1024px\) 760px, 100vw"/);
  // existing metadata survives the rewrite
  assert.match(html, /alt="Diagram"/);
  assert.match(html, /width="1200"/);
  assert.match(html, /height="630"/);
});

test("uses the default sizes when none are given", () => {
  const html = enhanceArticleMedia('<img src="https://api.example/a.webp">', {
    imageUrl,
  });

  assert.match(html, /sizes="\(min-width: 1024px\) 760px, 100vw"/);
});

test("leaves SVG sources untouched but still lazy", () => {
  const html = enhanceArticleMedia(
    '<img src="https://api.example/storage/diagram.svg" alt="Diagram">',
    options
  );

  assert.match(html, /src="https:\/\/api\.example\/storage\/diagram\.svg"/);
  assert.doesNotMatch(html, /srcset=/);
  assert.doesNotMatch(html, /sizes=/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
});

test("wraps tables in a scrollable region", () => {
  const html = enhanceArticleMedia(
    '<table><thead><tr><th>Plan</th></tr></thead><tbody><tr><td>Pro</td></tr></tbody></table>'
  );

  assert.equal(
    html,
    '<div class="article__table-wrap" role="region" tabindex="0"><table><thead><tr><th>Plan</th></tr></thead><tbody><tr><td>Pro</td></tr></tbody></table></div>'
  );
});

test("leaves empty and null input untouched", () => {
  assert.equal(enhanceArticleMedia(null, options), null);
  assert.equal(enhanceArticleMedia("", options), "");
});

test("running twice adds no duplicate attributes and wraps tables once", () => {
  const source =
    '<img src="https://api.example/a.webp" width="1200" height="630">' +
    "<table><thead><tr><th>A</th></tr></thead></table>";
  const once = enhanceArticleMedia(source, options);
  const twice = enhanceArticleMedia(once, options);

  assert.equal(count(twice, '<div class="article__table-wrap"'), 1);
  assert.equal(count(twice, "loading="), 1);
  assert.equal(count(twice, "decoding="), 1);
  assert.equal(count(twice, "alt="), 1);
  assert.equal(count(twice, "width="), 1);
  assert.equal(count(twice, "height="), 1);
  assert.equal(count(twice, "srcset="), 1);
  assert.equal(count(twice, "sizes="), 1);
});
