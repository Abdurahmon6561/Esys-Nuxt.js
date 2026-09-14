// robots.txt asks AI crawlers to stay away, but plenty ignore it — refuse them
// outright. Runs before SSR and the /api/backend proxy, so a blocked bot costs
// neither a render nor a backend request. Static files from public/ (robots.txt
// included) are served before middleware and stay reachable.
export default defineEventHandler((event) => {
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
