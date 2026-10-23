import { test } from "node:test";
import assert from "node:assert/strict";
import { buildShareLinks } from "../app/utils/shareLinks.js";

const url = "https://esys.pro/blog/some-post?ref=x&utm=1";
const title = "Создание сайтов & приложения в Ташкенте";
const links = buildShareLinks({ url, title });

test("returns 4 share links in telegram/whatsapp/linkedin/facebook order", () => {
  assert.deepEqual(
    links.map((l) => l.id),
    ["telegram", "whatsapp", "linkedin", "facebook"]
  );
  assert.deepEqual(
    links.map((l) => l.label),
    ["Telegram", "WhatsApp", "LinkedIn", "Facebook"]
  );
});

test("telegram link contains encoded url and title", () => {
  const [telegram] = links;
  assert.ok(telegram.href.startsWith("https://t.me/share/url?"), telegram.href);
  assert.ok(telegram.href.includes(`url=${encodeURIComponent(url)}`), telegram.href);
  assert.ok(telegram.href.includes(`text=${encodeURIComponent(title)}`), telegram.href);
});

test("whatsapp text contains both title and url", () => {
  const whatsapp = links[1];
  const expected = encodeURIComponent(`${title} ${url}`);
  assert.ok(whatsapp.href.startsWith("https://wa.me/?text="), whatsapp.href);
  assert.ok(whatsapp.href.includes(expected), whatsapp.href);
});

test("linkedin and facebook links contain the encoded url", () => {
  const [, , linkedin, facebook] = links;
  assert.equal(
    linkedin.href,
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  );
  assert.equal(
    facebook.href,
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  );
});

test("url and title are percent-encoded (spaces, cyrillic, ampersand)", () => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  assert.ok(!encodedUrl.match(/[\sа-яА-Я&]/), encodedUrl);
  assert.ok(!encodedTitle.match(/[\sа-яА-Я&]/), encodedTitle);
  assert.ok(encodedTitle.includes("%26"), encodedTitle);
  // No raw values leak into hrefs
  for (const link of links) {
    assert.ok(!link.href.includes(title), link.href);
  }
});
