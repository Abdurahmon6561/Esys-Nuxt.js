// robots.txt asks AI crawlers to stay away, but plenty ignore it — refuse them
// outright. Runs before SSR and the /api/backend proxy, so a blocked bot costs
// neither a render nor a backend request. Static files from public/ (robots.txt
// included) are served before middleware and stay reachable.
// The blog is intentionally open to AI crawlers (all locales).
const BLOG_PATH = /^\/(?:(?:en|uz)\/)?blog(?:\/|$)/;

export default defineEventHandler((event) => {
  if (BLOG_PATH.test(event.path.split("?")[0])) {
    return;
  }

  if (!isAiCrawler(getRequestHeader(event, "user-agent"))) {
    return;
  }

  setResponseStatus(event, 403);
  setResponseHeaders(event, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, noai, noimageai",
  });

  return "Forbidden";
});
