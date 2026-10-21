import { test } from "node:test";
import assert from "node:assert/strict";
import { toIsoDate, formatBlogDate } from "../app/utils/blogDate.js";

test("PHP 'F j, Y' strings parse to ISO dates", () => {
  assert.equal(toIsoDate("October 17, 2026"), "2026-10-17");
  assert.equal(toIsoDate("December 9, 2024"), "2024-12-09");
  assert.equal(toIsoDate("January 1, 2000"), "2000-01-01");
});

test("already ISO-like values keep only their date part", () => {
  assert.equal(toIsoDate("2026-10-17T10:00:00Z"), "2026-10-17");
  assert.equal(toIsoDate("2026-10-17"), "2026-10-17");
});

test("empty or unparseable input yields null", () => {
  assert.equal(toIsoDate(""), null);
  assert.equal(toIsoDate(null), null);
  assert.equal(toIsoDate("garbage"), null);
  assert.equal(toIsoDate("Octo 17, 2026"), null);
});

test("formatBlogDate renders the date in the page locale", () => {
  const ru = formatBlogDate("October 17, 2026", "ru");
  assert.ok(ru.includes("2026"), ru);
  assert.notEqual(ru, "October 17, 2026");
  assert.ok(formatBlogDate("October 17, 2026", "en") === "October 17, 2026");
});

test("unparseable values fall back to the original string", () => {
  assert.equal(formatBlogDate("garbage", "ru"), "garbage");
  assert.equal(formatBlogDate("", "en"), "");
});
