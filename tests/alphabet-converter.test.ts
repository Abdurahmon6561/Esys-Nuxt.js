import { test } from "node:test";
import assert from "node:assert/strict";
import {
  convert,
  detectMode,
  type ConvertMode,
} from "../app/utils/alphabet/convert.ts";

const cases: Array<[ConvertMode, string, string]> = [
  ["old-to-new", "Oʻzbekiston", "Özbekiston"],
  ["old-to-new", "O'zbekiston", "Özbekiston"],
  ["old-to-new", "O‘ZBEKISTON", "ÖZBEKISTON"],
  ["old-to-new", "g'alaba", "ğalaba"],
  ["old-to-new", "tog'", "toğ"],
  ["old-to-new", "Toshkent shahri", "Toşkent şahri"],
  ["old-to-new", "Choy", "Çoy"],
  ["old-to-new", "ma'no", "maʼno"],
  ["old-to-new", "mo''jiza", "möʼjiza"],
  ["old-to-new", "moʻʼjiza", "möʼjiza"],
  ["old-to-new", "tong", "tong"],
  ["old-to-new", "'salom'", "'salom'"],
  ["old-to-new", "Shopify", "Shopify"],
  ["old-to-new", "https://site.uz/shahar", "https://site.uz/shahar"],
  ["cyrillic-to-new", "Ўзбекистон", "Özbekiston"],
  ["cyrillic-to-new", "Тошкент шаҳри", "Toşkent şahri"],
  ["cyrillic-to-new", "ғишт", "ğişt"],
  ["cyrillic-to-new", "ер", "yer"],
  ["cyrillic-to-new", "поезд", "poyezd"],
  ["cyrillic-to-new", "цирк", "sirk"],
  ["cyrillic-to-new", "милиция", "militsiya"],
  ["cyrillic-to-new", "МИЛИЦИЯ", "MILITSIYA"],
  ["cyrillic-to-new", "маъно", "maʼno"],
  ["cyrillic-to-new", "объект", "obyekt"],
  ["cyrillic-to-new", "ЁЗ", "YOZ"],
  ["cyrillic-to-new", "Ёз", "Yoz"],
  ["new-to-old", "Özbekiston şahri", "Oʻzbekiston shahri"],
];

for (const [mode, input, expected] of cases) {
  test(`${mode}: ${input} → ${expected}`, () => {
    assert.equal(convert(input, { mode }).result, expected);
  });
}

test("auto mode detects predominantly Cyrillic text", () => {
  assert.equal(detectMode("Тошкент shahri"), "cyrillic-to-new");
  assert.equal(detectMode("Toshkent шаҳри"), "old-to-new");
  assert.equal(convert("Ўзбекистон", { mode: "auto" }).result, "Özbekiston");
});

test("old-to-new conversion is idempotent", () => {
  const once = convert("O'zbekiston ma'no mo''jiza", { mode: "old-to-new" }).result;
  assert.equal(convert(once, { mode: "old-to-new" }).result, once);
});

test("Cyrillic output with U+02BC after o or g stays unchanged", () => {
  const cyrillicOutput = convert("объект маъно", {
    mode: "cyrillic-to-new",
  }).result;
  assert.equal(cyrillicOutput, "obyekt maʼno");
  assert.equal(
    convert(cyrillicOutput, { mode: "old-to-new" }).result,
    cyrillicOutput,
  );
});

test("handles standalone capitals and removed uppercase signs", () => {
  assert.equal(convert("Ё", { mode: "cyrillic-to-new" }).result, "Yo");
  assert.equal(convert("Ё СССР", { mode: "cyrillic-to-new" }).result, "YO SSSR");
  assert.equal(convert("ОБЪЕКТ ОбЪект", { mode: "cyrillic-to-new" }).result, "OBYEKT Obyekt");
});

test("old → new → old round-trip returns normalized old Latin", () => {
  const input = "O'zbekiston g'alaba Toshkent shahri ma'no";
  const modern = convert(input, { mode: "old-to-new" }).result;
  assert.equal(
    convert(modern, { mode: "new-to-old" }).result,
    "Oʻzbekiston gʻalaba Toshkent shahri maʼno",
  );
});

test("returns changed output segments for highlighting", () => {
  const converted = convert("Choy va shahar", { mode: "old-to-new" });
  assert.equal(converted.replacements, 2);
  assert.ok(converted.segments.some((segment) => segment.changed && segment.text === "Ç"));
  assert.ok(converted.segments.some((segment) => segment.changed && segment.text === "ş"));
});

test("warns for split digraph Is'hoq", () => {
  const converted = convert("Is'hoq", { mode: "old-to-new" });
  assert.equal(converted.result, "Isʼhoq");
  assert.ok(converted.warnings.some((warning) => warning.code === "split-digraph"));
});

test("warns for ambiguous quoted 'bog'", () => {
  const converted = convert("'bog'", { mode: "old-to-new" });
  assert.ok(converted.warnings.some((warning) => warning.code === "ambiguous-quote"));
});

// Guards against quadratic blow-ups (seconds on 100k chars), not a micro-benchmark:
// test files run in parallel, so a tight threshold is flaky. Warm up the JIT first.
test("converts 100,000 characters without a quadratic slowdown", () => {
  const input = "shahar ".repeat(14_286).slice(0, 100_000);
  convert(input.slice(0, 5_000), { mode: "old-to-new" });
  const started = performance.now();
  const converted = convert(input, { mode: "old-to-new" });
  const elapsed = performance.now() - started;
  assert.equal(converted.result.length > 0, true);
  assert.ok(elapsed < 500, `conversion took ${elapsed.toFixed(1)}ms`);
});
