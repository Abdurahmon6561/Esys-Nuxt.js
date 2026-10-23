export const NEW_APOSTROPHE = "\u02BC";

export const OLD_LETTER_APOSTROPHES = [
  "'",
  "\u2018",
  "\u2019",
  "`",
  "\u02BB",
  "\u00B4",
] as const;

export const ALPHABET_CHANGES = [
  { old: "Oʻ o\u02BB", new: "Ö ö" },
  { old: "Gʻ g\u02BB", new: "Ğ ğ" },
  { old: "Sh sh", new: "Ş ş" },
  { old: "Ch ch", new: "Ç ç" },
] as const;

export const CYRILLIC_MAP: Readonly<Record<string, string>> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  ғ: "ğ",
  д: "d",
  ё: "yo",
  ж: "j",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  қ: "q",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ў: "ö",
  ф: "f",
  х: "x",
  ҳ: "h",
  ч: "ç",
  ш: "ş",
  э: "e",
  ю: "yu",
  я: "ya",
};
