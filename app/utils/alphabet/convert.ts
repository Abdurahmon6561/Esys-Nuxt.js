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
  resultStart: number;
  resultEnd: number;
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

type Part = {
  chunks: string[];
  changed: boolean;
  replacements: number;
  length: number;
};
type Range = { start: number; end: number };
type SourceWarning = Pick<ConversionWarning, "code" | "start" | "end">;
type ConversionBuilder = {
  parts: Part[];
  sourceMap: Int32Array;
  resultLength: number;
};

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
    previous.chunks.push(text);
    previous.replacements += replacements;
    previous.length += text.length;
  } else {
    parts.push({
      chunks: [text],
      changed,
      replacements,
      length: text.length,
    });
  }
}

function appendOutput(
  builder: ConversionBuilder,
  sourceStart: number,
  sourceEnd: number,
  text: string,
  changed: boolean,
  replacements = 0,
  verbatim = false,
) {
  const resultStart = builder.resultLength;
  if (verbatim) {
    for (let index = sourceStart; index <= sourceEnd; index += 1) {
      builder.sourceMap[index] = resultStart + index - sourceStart;
    }
  } else {
    for (let index = sourceStart; index < sourceEnd; index += 1) {
      builder.sourceMap[index] = resultStart;
    }
    builder.sourceMap[sourceEnd] = resultStart + text.length;
  }

  appendPart(builder.parts, text, changed, replacements);
  builder.resultLength += text.length;
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
): SourceWarning[] {
  const warnings: SourceWarning[] = [];
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

function convertOldChunk(
  text: string,
  offset: number,
  builder: ConversionBuilder,
) {
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
      appendOutput(builder, offset + index, offset + index + 2, replacement, true, 1);
      index += 1;

      const second = text[index + 1];
      if (
        second &&
        (OLD_APOSTROPHES.has(second) || second === NEW_APOSTROPHE) &&
        isLetter(text[index + 2])
      ) {
        appendOutput(
          builder,
          offset + index + 1,
          offset + index + 2,
          NEW_APOSTROPHE,
          second !== NEW_APOSTROPHE,
          second === NEW_APOSTROPHE ? 0 : 1,
        );
        index += 1;
      }
      continue;
    }

    if (
      (lower === "s" && nextLower === "h") ||
      (lower === "c" && nextLower === "h")
    ) {
      const base = lower === "s" ? "ş" : "ç";
      appendOutput(
        builder,
        offset + index,
        offset + index + 2,
        char === char.toUpperCase() ? base.toUpperCase() : base,
        true,
        1,
      );
      index += 1;
      continue;
    }

    if (
      OLD_APOSTROPHES.has(char) &&
      isLetter(text[index - 1]) &&
      isLetter(next)
    ) {
      appendOutput(
        builder,
        offset + index,
        offset + index + 1,
        NEW_APOSTROPHE,
        char !== NEW_APOSTROPHE,
        1,
      );
      continue;
    }

    appendOutput(
      builder,
      offset + index,
      offset + index + 1,
      char,
      false,
    );
  }
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

function convertCyrillicWord(
  word: string,
  offset: number,
  builder: ConversionBuilder,
  uppercaseSingleLetter = false,
) {
  const letters = [...word];
  const allCaps =
    (letters.length > 1 && isCyrillicAllCaps(word)) || uppercaseSingleLetter;
  let sourceIndex = 0;

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

    appendOutput(
      builder,
      offset + sourceIndex,
      offset + sourceIndex + source.length,
      applyCase(value, source, allCaps),
      value !== source,
      value === source ? 0 : 1,
    );
    sourceIndex += source.length;
  }
}

function convertCyrillicChunk(
  text: string,
  offset: number,
  builder: ConversionBuilder,
) {
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
    appendOutput(
      builder,
      offset + lastIndex,
      offset + index,
      text.slice(lastIndex, index),
      false,
      0,
      true,
    );
    convertCyrillicWord(
      match[0],
      offset + index,
      builder,
      Boolean(uppercaseSingleLetter),
    );
    lastIndex = index + match[0].length;
  }
  appendOutput(
    builder,
    offset + lastIndex,
    offset + text.length,
    text.slice(lastIndex),
    false,
    0,
    true,
  );
}

function convertNewChunk(
  text: string,
  offset: number,
  builder: ConversionBuilder,
) {
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
      appendOutput(
        builder,
        offset + index,
        offset + index + 1,
        value,
        true,
        1,
      );
    } else {
      appendOutput(
        builder,
        offset + index,
        offset + index + 1,
        char,
        false,
      );
    }
  }
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
  const sourceWarnings: SourceWarning[] = [];
  const builder: ConversionBuilder = {
    parts: [],
    sourceMap: new Int32Array(text.length + 1),
    resultLength: 0,
  };
  let lastIndex = 0;

  const convertChunk = (chunk: string, offset: number) => {
    if (mode === "old-to-new") {
      sourceWarnings.push(...collectWarnings(chunk, offset, keepEnglishWords));
      convertOldChunk(chunk, offset, builder);
      return;
    }
    if (mode === "cyrillic-to-new") {
      sourceWarnings.push(...collectWarnings(chunk, offset, false));
      convertCyrillicChunk(chunk, offset, builder);
      return;
    }
    convertNewChunk(chunk, offset, builder);
  };

  for (const range of ranges) {
    const chunk = text.slice(lastIndex, range.start);
    convertChunk(chunk, lastIndex);
    appendOutput(
      builder,
      range.start,
      range.end,
      text.slice(range.start, range.end),
      false,
      0,
      true,
    );
    lastIndex = range.end;
  }
  convertChunk(text.slice(lastIndex), lastIndex);

  const segments: ConversionSegment[] = [];
  let resultIndex = 0;
  let replacements = 0;
  const resultParts: string[] = [];
  for (const part of builder.parts) {
    const partText = part.chunks.join("");
    resultParts.push(partText);
    segments.push({
      text: partText,
      changed: part.changed,
      start: resultIndex,
      end: resultIndex + part.length,
    });
    resultIndex += part.length;
    replacements += part.replacements;
  }
  const result = resultParts.join("");
  const warnings = sourceWarnings.map((warning): ConversionWarning => {
    let resultStart = builder.sourceMap[warning.start];
    let resultEnd = Math.max(resultStart, builder.sourceMap[warning.end]);

    if (resultStart === resultEnd && result.length > 0) {
      if (resultStart < result.length) {
        resultEnd = resultStart + 1;
      } else {
        resultStart -= 1;
      }
    }

    return {
      ...warning,
      resultStart,
      resultEnd,
    };
  });

  return {
    result,
    warnings,
    replacements,
    segments,
    mode,
  };
}
