import {
  CYRILLIC_MAP,
  NEW_APOSTROPHE,
  OLD_LETTER_APOSTROPHES,
} from "./alphabet-map.ts";
import { COMMON_ENGLISH_WORDS, UNCHANGED_WORDS } from "./exceptions.ts";

export type ConvertMode =
  | "auto"
  | "old-to-new"
  | "cyrillic-to-new"
  | "new-to-old";

export type ConversionWarningCode =
  | "double-apostrophe"
  | "split-digraph"
  | "ambiguous-quote"
  | "mixed-script"
  | "possible-english";

export type ConversionWarning = {
  code: ConversionWarningCode;
  start: number;
  end: number;
};

export type ConversionSegment = {
  text: string;
  changed: boolean;
  start: number;
  end: number;
};

export type ConvertOptions = {
  mode?: ConvertMode;
  keepLinks?: boolean;
  keepEnglishWords?: boolean;
};

export type ConversionResult = {
  result: string;
  warnings: ConversionWarning[];
  replacements: number;
  segments: ConversionSegment[];
  mode: Exclude<ConvertMode, "auto">;
};

type Part = { text: string; changed: boolean; replacements: number };
type Range = { start: number; end: number };

const OLD_APOSTROPHES = new Set<string>(OLD_LETTER_APOSTROPHES);
const LATIN_LETTER = /\p{Script=Latin}/u;
const CYRILLIC_LETTER = /\p{Script=Cyrillic}/u;
const WORD_LETTER = /[\p{Script=Latin}\p{Script=Cyrillic}]/u;
const CYRILLIC_VOWELS = new Set("аеёиоуўэюя");
const UNCHANGED_WORD_PATTERN = new RegExp(
  `(?<!\\p{Script=Latin})(?:${[...UNCHANGED_WORDS].join("|")})(?!\\p{Script=Latin})`,
  "giu",
);
const ENGLISH_WORD_PATTERN = new RegExp(
  `(?<!\\p{Script=Latin})(?:${[...COMMON_ENGLISH_WORDS].join("|")})(?!\\p{Script=Latin})`,
  "giu",
);

function isLetter(value: string | undefined): boolean {
  return value !== undefined && WORD_LETTER.test(value);
}

function appendPart(parts: Part[], text: string, changed: boolean, replacements = 0) {
  if (!text) return;
  const previous = parts.at(-1);
  if (previous && previous.changed === changed) {
    previous.text += text;
    previous.replacements += replacements;
  } else {
    parts.push({ text, changed, replacements });
  }
}

function mergeRanges(ranges: Range[]): Range[] {
  if (ranges.length < 2) return ranges;
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Range[] = [ranges[0]];
  for (let index = 1; index < ranges.length; index += 1) {
    const current = ranges[index];
    const previous = merged.at(-1)!;
    if (current.start <= previous.end) {
      previous.end = Math.max(previous.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

function protectedRanges(
  text: string,
  keepLinks: boolean,
  keepEnglishWords: boolean,
): Range[] {
  const ranges: Range[] = [];

  if (keepLinks) {
    const protectedPattern =
      /`[^`\n]*`|https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|(?:^|(?<=\s))[#@][\p{L}\p{N}_]+/giu;
    for (const match of text.matchAll(protectedPattern)) {
      const value = match[0];
      const leadingSpace = /^\s/u.test(value) ? 1 : 0;
      const start = (match.index ?? 0) + leadingSpace;
      ranges.push({ start, end: (match.index ?? 0) + value.length });
    }
  }

  const wordPattern = keepEnglishWords ? ENGLISH_WORD_PATTERN : UNCHANGED_WORD_PATTERN;
  for (const match of text.matchAll(wordPattern)) {
    ranges.push({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    });
  }

  return mergeRanges(ranges);
}

function collectWarnings(
  text: string,
  offset: number,
  keepEnglishWords: boolean,
): ConversionWarning[] {
  const warnings: ConversionWarning[] = [];
  const apostrophes = "['‘’`ʻ´]";

  for (const match of text.matchAll(
    new RegExp(`[oOgG]${apostrophes}[${apostrophes.slice(1, -1)}ʼ]`, "gu"),
  )) {
    warnings.push({
      code: "double-apostrophe",
      start: offset + (match.index ?? 0),
      end: offset + (match.index ?? 0) + match[0].length,
    });
  }

  for (const match of text.matchAll(
    new RegExp(`[sS]${apostrophes}[hH]`, "gu"),
  )) {
    warnings.push({
      code: "split-digraph",
      start: offset + (match.index ?? 0),
      end: offset + (match.index ?? 0) + match[0].length,
    });
  }

  for (const match of text.matchAll(
    new RegExp(`(^|\\s)(['‘’\\x60ʻ´])[^\\s]*[oOgG]${apostrophes}(?=$|\\s)`, "gu"),
  )) {
    const leading = match[1].length;
    warnings.push({
      code: "ambiguous-quote",
      start: offset + (match.index ?? 0) + leading,
      end: offset + (match.index ?? 0) + match[0].length,
    });
  }

  if (LATIN_LETTER.test(text) && CYRILLIC_LETTER.test(text)) {
    for (const match of text.matchAll(/[\p{L}ʼʻ‘’'`´]+/gu)) {
      if (LATIN_LETTER.test(match[0]) && CYRILLIC_LETTER.test(match[0])) {
        warnings.push({
          code: "mixed-script",
          start: offset + (match.index ?? 0),
          end: offset + (match.index ?? 0) + match[0].length,
        });
      }
    }
  }

  if (keepEnglishWords) {
    for (const match of text.matchAll(/[A-Za-z]{5,}/gu)) {
      const word = match[0].toLocaleLowerCase("en");
      if (
        !UNCHANGED_WORDS.has(word) &&
        !COMMON_ENGLISH_WORDS.has(word) &&
        /(?:sh|ch)/i.test(word)
      ) {
        warnings.push({
          code: "possible-english",
          start: offset + (match.index ?? 0),
          end: offset + (match.index ?? 0) + match[0].length,
        });
      }
    }
  }

  return warnings;
}

function convertOldChunk(text: string): Part[] {
  const parts: Part[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const lower = char.toLowerCase();
    const next = text[index + 1];
    const nextLower = next?.toLowerCase();

    if ((lower === "o" || lower === "g") && next && OLD_APOSTROPHES.has(next)) {
      const replacement =
        lower === "o"
          ? char === char.toUpperCase()
            ? "Ö"
            : "ö"
          : char === char.toUpperCase()
            ? "Ğ"
            : "ğ";
      appendPart(parts, replacement, true, 1);
      index += 1;

      const second = text[index + 1];
      if (
        second &&
        (OLD_APOSTROPHES.has(second) || second === NEW_APOSTROPHE) &&
        isLetter(text[index + 2])
      ) {
        appendPart(parts, NEW_APOSTROPHE, second !== NEW_APOSTROPHE, second === NEW_APOSTROPHE ? 0 : 1);
        index += 1;
      }
      continue;
    }

    if (
      (lower === "s" && nextLower === "h") ||
      (lower === "c" && nextLower === "h")
    ) {
      const base = lower === "s" ? "ş" : "ç";
      appendPart(parts, char === char.toUpperCase() ? base.toUpperCase() : base, true, 1);
      index += 1;
      continue;
    }

    if (
      OLD_APOSTROPHES.has(char) &&
      isLetter(text[index - 1]) &&
      isLetter(next)
    ) {
      appendPart(parts, NEW_APOSTROPHE, char !== NEW_APOSTROPHE, 1);
      continue;
    }

    appendPart(parts, char, false);
  }

  return parts;
}

function applyCase(value: string, source: string, allCaps: boolean): string {
  if (!value) return "";
  if (source === source.toLocaleLowerCase("ru")) return value;
  if (allCaps) return value.toLocaleUpperCase("en");
  return value[0].toLocaleUpperCase("en") + value.slice(1);
}

function isCyrillicAllCaps(word: string): boolean {
  const letters = [...word];
  return (
    letters.length > 0 &&
    letters.some((letter) => letter !== letter.toLocaleLowerCase("ru")) &&
    letters.every((letter) => letter === letter.toLocaleUpperCase("ru"))
  );
}

function convertCyrillicWord(word: string, uppercaseSingleLetter = false): Part[] {
  const parts: Part[] = [];
  const letters = [...word];
  const allCaps =
    (letters.length > 1 && isCyrillicAllCaps(word)) || uppercaseSingleLetter;

  for (let index = 0; index < letters.length; index += 1) {
    const source = letters[index];
    const lower = source.toLocaleLowerCase("ru");
    const previous = letters[index - 1]?.toLocaleLowerCase("ru");
    const next = letters[index + 1]?.toLocaleLowerCase("ru");
    let value: string;

    if (lower === "ъ") {
      value = next && "еёюя".includes(next) ? "" : NEW_APOSTROPHE;
    } else if (lower === "ь") {
      value = "";
    } else if (lower === "е") {
      value =
        index === 0 || previous === "ъ" || previous === "ь" || CYRILLIC_VOWELS.has(previous)
          ? "ye"
          : "e";
    } else if (lower === "ц") {
      value = index === 0 || !previous || !CYRILLIC_VOWELS.has(previous) ? "s" : "ts";
    } else {
      value = CYRILLIC_MAP[lower] ?? source;
    }

    appendPart(parts, applyCase(value, source, allCaps), value !== source, value === source ? 0 : 1);
  }

  return parts;
}

function convertCyrillicChunk(text: string): Part[] {
  const parts: Part[] = [];
  const matches = [...text.matchAll(/[\p{Script=Cyrillic}]+/gu)];
  let lastIndex = 0;
  for (let matchIndex = 0; matchIndex < matches.length; matchIndex += 1) {
    const match = matches[matchIndex];
    const index = match.index ?? 0;
    const previous = matches[matchIndex - 1];
    const next = matches[matchIndex + 1];
    const isSingleUppercase =
      [...match[0]].length === 1 && isCyrillicAllCaps(match[0]);
    const uppercaseSingleLetter =
      isSingleUppercase &&
      ((previous &&
        /^\s*$/u.test(text.slice((previous.index ?? 0) + previous[0].length, index)) &&
        isCyrillicAllCaps(previous[0]) &&
        [...previous[0]].length > 1) ||
        (next &&
          /^\s*$/u.test(text.slice(index + match[0].length, next.index ?? 0)) &&
          isCyrillicAllCaps(next[0]) &&
          [...next[0]].length > 1));
    appendPart(parts, text.slice(lastIndex, index), false);
    for (const part of convertCyrillicWord(match[0], Boolean(uppercaseSingleLetter))) {
      appendPart(parts, part.text, part.changed, part.replacements);
    }
    lastIndex = index + match[0].length;
  }
  appendPart(parts, text.slice(lastIndex), false);
  return parts;
}

function convertNewChunk(text: string): Part[] {
  const parts: Part[] = [];
  const allCapsWordAt = (index: number) => {
    const before = text.slice(0, index).match(/[\p{Script=Latin}]+$/u)?.[0] ?? "";
    const after = text.slice(index + 1).match(/^[\p{Script=Latin}]+/u)?.[0] ?? "";
    const word = before + text[index] + after;
    return word.length > 1 && word === word.toLocaleUpperCase("en");
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const lower = char.toLocaleLowerCase("en");
    let replacement: string | null = null;

    if (lower === "ö") replacement = `o\u02BB`;
    if (lower === "ğ") replacement = `g\u02BB`;
    if (lower === "ş") replacement = "sh";
    if (lower === "ç") replacement = "ch";

    if (replacement) {
      const value =
        char === char.toLocaleUpperCase("en")
          ? allCapsWordAt(index)
            ? replacement.toLocaleUpperCase("en")
            : replacement[0].toLocaleUpperCase("en") + replacement.slice(1)
          : replacement;
      appendPart(parts, value, true, 1);
    } else {
      appendPart(parts, char, false);
    }
  }

  return parts;
}

export function detectMode(text: string): Exclude<ConvertMode, "auto" | "new-to-old"> {
  let cyrillic = 0;
  let latin = 0;
  for (const char of text) {
    if (CYRILLIC_LETTER.test(char)) cyrillic += 1;
    else if (LATIN_LETTER.test(char)) latin += 1;
  }
  return cyrillic > latin ? "cyrillic-to-new" : "old-to-new";
}

export function convert(text: string, options: ConvertOptions = {}): ConversionResult {
  const requestedMode = options.mode ?? "old-to-new";
  const mode = requestedMode === "auto" ? detectMode(text) : requestedMode;
  const keepLinks = options.keepLinks ?? true;
  const keepEnglishWords = options.keepEnglishWords ?? false;
  const ranges =
    mode === "old-to-new"
      ? protectedRanges(text, keepLinks, keepEnglishWords)
      : keepLinks
        ? protectedRanges(text, true, false)
        : [];
  const warnings: ConversionWarning[] = [];
  const parts: Part[] = [];
  let lastIndex = 0;

  const convertChunk = (chunk: string, offset: number) => {
    if (mode === "old-to-new") {
      warnings.push(...collectWarnings(chunk, offset, keepEnglishWords));
      return convertOldChunk(chunk);
    }
    if (mode === "cyrillic-to-new") {
      warnings.push(...collectWarnings(chunk, offset, false));
      return convertCyrillicChunk(chunk);
    }
    return convertNewChunk(chunk);
  };

  for (const range of ranges) {
    const chunk = text.slice(lastIndex, range.start);
    for (const part of convertChunk(chunk, lastIndex)) {
      appendPart(parts, part.text, part.changed, part.replacements);
    }
    appendPart(parts, text.slice(range.start, range.end), false);
    lastIndex = range.end;
  }
  for (const part of convertChunk(text.slice(lastIndex), lastIndex)) {
    appendPart(parts, part.text, part.changed, part.replacements);
  }

  const segments: ConversionSegment[] = [];
  let resultIndex = 0;
  let replacements = 0;
  for (const part of parts) {
    segments.push({
      text: part.text,
      changed: part.changed,
      start: resultIndex,
      end: resultIndex + part.text.length,
    });
    resultIndex += part.text.length;
    replacements += part.replacements;
  }

  return {
    result: parts.map((part) => part.text).join(""),
    warnings,
    replacements,
    segments,
    mode,
  };
}
