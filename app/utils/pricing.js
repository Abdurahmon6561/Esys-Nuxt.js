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
