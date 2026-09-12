// Russian is the default locale and lives on unprefixed URLs
// (i18n strategy: prefix_except_default), so /ru/** has no route and 404s.
// Permanently redirect any explicitly-prefixed /ru URL to its unprefixed
// equivalent so shared/bookmarked links keep working.
export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  if (url.pathname !== "/ru" && !url.pathname.startsWith("/ru/")) {
    return;
  }

  // "/ru" → "/", "/ru/" → "/", "/ru/blog" → "/blog"
  const stripped = url.pathname.slice(3);
  url.pathname = stripped === "" ? "/" : stripped;

  return sendRedirect(event, url.pathname + url.search, 301);
});
