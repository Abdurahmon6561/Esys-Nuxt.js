export const isSvgImage = (url) =>
  typeof url === "string" &&
  url.split(/[?#]/, 1)[0].toLocaleLowerCase("en").endsWith(".svg");

export const resolveOgImage = (url, fallback) =>
  isSvgImage(url) ? fallback : url;
