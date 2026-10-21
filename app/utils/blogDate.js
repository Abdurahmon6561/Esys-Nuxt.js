// Blog date conversion for CMS-provided dates.
//
// The backend API formats `published_at` (and `updated_at`) as an English
// string with PHP 'F j, Y' ("October 17, 2026"), which is wrong for both
// structured data and non-English locales. These helpers turn that string
// into an ISO 8601 date for JSON-LD, and into a locale-formatted string for
// display. Parsing uses a month-name map + regex - not `new Date(string)` -
// so results do not depend on the engine or timezone.

const MONTHS = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

// 'F j, Y' - full English month name, day without padding, 4-digit year.
const LONG_DATE = /^([A-Z][a-z]+) (\d{1,2}), (\d{4})$/;

// Already ISO-like: '2026-10-17' or '2026-10-17T...' - keep the date part.
const ISO_LIKE = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/;

/**
 * Parse a CMS blog date into 'YYYY-MM-DD'.
 * Accepts PHP 'F j, Y' strings and values that are already ISO-like.
 * Returns null for empty or unparseable input.
 */
export function toIsoDate(value) {
  if (!value) return null;
  const text = String(value).trim();

  const iso = text.match(ISO_LIKE);
  if (iso) return text.slice(0, 10);

  const long = text.match(LONG_DATE);
  if (long) {
    const month = MONTHS[long[1]];
    const day = Number(long[2]);
    const year = Number(long[3]);
    if (!month || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}

// Site locales -> Intl.DateTimeFormat locales. 'ru' is default and unprefixed.
const LOCALES = { ru: "ru-RU", uz: "uz-Latn-UZ", en: "en-US" };

/**
 * Format a CMS blog date for display in the active locale,
 * e.g. 'October 17, 2026' -> '17 октября 2026 г.' for 'ru'.
 * Falls back to the original value when it can't be parsed.
 */
export function formatBlogDate(value, locale) {
  const iso = toIsoDate(value);
  if (!iso) return value ?? null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(LOCALES[locale] ?? locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
