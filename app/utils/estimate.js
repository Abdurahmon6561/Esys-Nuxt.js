import { PRICING_SERVICE_TYPES } from "./pricing.js";

export const consultantServiceKey = (value) =>
  typeof value === "string" && Object.hasOwn(PRICING_SERVICE_TYPES, value) ? value : null;

export const formatEstimatePrice = (estimate, locale = "ru") => {
  const from = estimate?.price_from;
  const to = estimate?.price_to;
  if (!Number.isFinite(from) || from < 0 || (to != null && (!Number.isFinite(to) || to < from))) return "";
  const lang = ["ru", "uz", "en"].includes(locale) ? locale : "ru";
  const number = (value) => {
    // Significant digits preserve the number, including fractional prices, without rounding to whole UZS.
    const [integer, fraction] = value.toLocaleString("en-US", { useGrouping: false, maximumSignificantDigits: 21 }).split(".");
    return integer.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "en" ? "," : " ") +
      (fraction ? `${lang === "en" ? "." : ","}${fraction}` : "");
  };
  const low = number(from);
  const high = to == null ? null : number(to);
  const price = lang === "en"
    ? high == null ? `from ${low} UZS` : `${low}–${high} UZS`
    : lang === "uz"
      ? high == null ? `${low} so‘mdan` : `${low} dan ${high} so‘mgacha`
      : high == null ? `от ${low} сум` : `от ${low} до ${high} сум`;
  const suffixes = {
    ru: { month: " в месяц", hour: " в час" },
    uz: { month: " oyiga", hour: " soatiga" },
    en: { month: " per month", hour: " per hour" },
  };
  return price + (suffixes[lang][estimate.billing_period] || "");
};

export const buildConsultantContext = ({ routeName, path, query = {}, origin, suggestedService } = {}) => {
  const name = String(routeName || "").split("___")[0];
  const entry_point = name.startsWith("pricing") ? "pricing"
    : name.startsWith("index") ? "homepage"
      : name.startsWith("services-slug") ? "service_page"
        : name.startsWith("blog-") && name !== "blog-index" ? "article"
          : /^portfolio-(slug|alias)/.test(name) ? "portfolio" : "chat";
  let source_url = null;
  try {
    const base = new URL(origin);
    if (["http:", "https:"].includes(base.protocol) && typeof path === "string") {
      source_url = base.origin + "/" + path.split(/[?#]/)[0].replace(/^\/+/, "");
    }
  } catch { /* SSR or missing origin. */ }
  const utm = {};
  for (const key of ["source", "medium", "campaign"]) {
    const raw = query?.[`utm_${key}`];
    const value = (Array.isArray(raw) ? raw[0] : raw);
    if (typeof value === "string" && value.trim()) utm[key] = value.trim().slice(0, 250);
  }
  return { entry_point, suggested_service: consultantServiceKey(suggestedService), source_url, utm: Object.keys(utm).length ? utm : null };
};

// Explicit allowlist: never spread a response, contact form, URL, or chat text into analytics.
export const estimateAnalyticsParams = (estimate, extras = {}) => {
  const params = {};
  if (["ru", "uz", "en"].includes(extras.locale)) params.locale = extras.locale;
  if (["pricing", "homepage", "service_page", "article", "portfolio", "chat"].includes(extras.entry_point)) params.entry_point = extras.entry_point;
  const service = consultantServiceKey(estimate?.service_key ?? extras.service_key ?? extras.suggested_service);
  if (service) params.service_key = service;
  if (Number.isFinite(estimate?.pricing_version)) params.pricing_version = estimate.pricing_version;
  if (Number.isFinite(estimate?.price_from)) params.estimate_from = estimate.price_from;
  if (estimate && (estimate.price_to === null || Number.isFinite(estimate.price_to))) params.estimate_to = estimate.price_to;
  if (typeof estimate?.manual_review === "boolean") params.manual_review = estimate.manual_review;
  for (const key of ["source", "medium", "campaign"]) {
    const value = extras.utm?.[key] ?? extras[`utm_${key}`];
    if (typeof value === "string" && value.trim()) params[`utm_${key}`] = value.trim().slice(0, 250);
  }
  return params;
};
