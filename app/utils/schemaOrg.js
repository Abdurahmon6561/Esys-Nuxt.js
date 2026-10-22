export const orgId = (siteUrl) => `${siteUrl}/#org`;

export const websiteId = (siteUrl) => `${siteUrl}/#website`;

export const breadcrumbList = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const schemaImage = (url, fallback) => {
  if (!url || /\.svg(?:\?.*)?$/i.test(url)) return fallback;
  return url;
};
