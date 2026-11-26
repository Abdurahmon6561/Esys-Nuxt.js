// Keep the published pricing page's grouping and range formatting unchanged.
export const formatPricingNumber = (value) =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

export const formatPricingAmount = (item) =>
  item.price_to
    ? `${formatPricingNumber(item.price_from)}–${formatPricingNumber(item.price_to)}`
    : formatPricingNumber(item.price_from);

export const formatPricingSuffix = (item, copy) =>
  item?.billing_period === "month"
    ? copy.month
    : item?.billing_period === "hour"
      ? copy.hour
      : "";

export const PRICING_SERVICE_TYPES = {
  landing: "Landing page development",
  corporate: "Corporate website development",
  store: "E-commerce development",
  mobile: "Mobile app development",
  crm: "CRM development and business automation",
  saas: "Web application and SaaS development",
  branding: "Branding and visual identity",
  support: "Website and software maintenance",
};

// Keep the publication's calendar date, not its potentially different UTC date.
// Reject malformed timestamps and calendar dates that Date.parse normalizes.
const publicationDate = (value) => {
  if (typeof value !== "string") return undefined;
  const date = /^(\d{4}-\d{2}-\d{2})(?:T|$)/.exec(value)?.[1];
  if (!date || !Number.isFinite(Date.parse(value))) return undefined;
  return new Date(date).toISOString().slice(0, 10) === date ? date : undefined;
};

export const buildPricingPageSchema = ({ page, items, locale, siteUrl, navLabel, pathFor }) => {
  const validFrom = publicationDate(page.published_at);
  const unitText = { month: "MONTH", hour: "HOUR" };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Evolution Systems", item: `${siteUrl}${locale === "ru" ? "" : "/" + locale}` },
          { "@type": "ListItem", position: 2, name: navLabel, item: `${siteUrl}${pathFor(locale)}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.content.faq.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
      ...items.map((item) => ({
        "@type": "Service",
        name: item.title,
        description: item.short_text,
        provider: { "@id": `${siteUrl}/#org` },
        ...(Object.hasOwn(PRICING_SERVICE_TYPES, item.service_key) ? { serviceType: PRICING_SERVICE_TYPES[item.service_key] } : {}),
        areaServed: { "@type": "City", name: "Tashkent" },
        ...(item.service_url ? { "@id": `${siteUrl}${item.service_url}#service` } : {}),
        url: `${siteUrl}${item.service_url || pathFor(locale) + "#" + item.service_key}`,
        ...(page.published ? {
          offers: {
            "@type": "Offer",
            name: item.title,
            price: item.price_from,
            priceCurrency: "UZS",
            url: `${siteUrl}${pathFor(locale)}#${item.service_key}`,
            availability: "https://schema.org/InStock",
            ...(validFrom ? { validFrom } : {}),
            // price is the starting price; priceSpecification states it as a minimum.
            priceSpecification: {
              "@type": unitText[item.billing_period] ? "UnitPriceSpecification" : "PriceSpecification",
              minPrice: item.price_from,
              ...(item.price_to ? { maxPrice: item.price_to } : {}),
              priceCurrency: "UZS",
              ...(unitText[item.billing_period] ? { unitText: unitText[item.billing_period] } : {}),
            },
          },
        } : {}),
      })),
    ],
  };
};

// Old APIs may omit individual snapshot fields. Never invent a starting price.
export const formatServicePrice = (pricing, copy, { fromOnly = false } = {}) => {
  if (!Number.isFinite(pricing?.price_from)) return "";

  const hasRange = !fromOnly && Boolean(pricing.price_to);
  const amount = hasRange
    ? formatPricingAmount(pricing)
    : formatPricingNumber(pricing.price_from);
  const label = hasRange
    ? `${amount} ${copy.currency}`
    : [copy.fromPre, amount, copy.fromPost].filter(Boolean).join(" ");
  return `${label}${formatPricingSuffix(pricing, copy)}`;
};

export const buildServicePricingOffer = (pricing, siteUrl) => {
  if (!Number.isFinite(pricing?.price_from)) return undefined;

  const unitText = { month: "MONTH", hour: "HOUR" }[pricing.billing_period];
  const currency = pricing.currency ? { priceCurrency: pricing.currency } : {};
  return {
    "@type": "Offer",
    price: pricing.price_from,
    ...currency,
    availability: "https://schema.org/InStock",
    ...(pricing.url ? { url: `${siteUrl}${pricing.url}` } : {}),
    priceSpecification: {
      "@type": unitText ? "UnitPriceSpecification" : "PriceSpecification",
      minPrice: pricing.price_from,
      ...(pricing.price_to != null ? { maxPrice: pricing.price_to } : {}),
      ...currency,
      ...(unitText ? { unitText } : {}),
    },
  };
};

export const serviceContentBlocks = (blocks, pricing) => {
  if (!Array.isArray(blocks)) return [];
  return pricing ? blocks.filter((block) => block?.type !== "pricing") : blocks;
};

// All active pricing items linked to the service (API `pricing_items`); older
// APIs only send the first one as `pricing`.
export const servicePricingItems = (data) => {
  const items = Array.isArray(data?.pricing_items)
    ? data.pricing_items.filter((item) => item && typeof item === "object")
    : [];
  if (items.length) return items;
  return data?.pricing ? [data.pricing] : [];
};

// One Offer per package; a single package keeps the plain-object shape.
export const buildServicePricingOffers = (items, siteUrl) => {
  const offers = (items || [])
    .map((item) => buildServicePricingOffer(item, siteUrl))
    .filter(Boolean);
  if (!offers.length) return undefined;
  return offers.length === 1 ? offers[0] : offers;
};
