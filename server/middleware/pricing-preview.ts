export default defineEventHandler((event) => {
  if (/^\/(?:(?:en|uz)\/)?pricing-preview$/.test(getRequestURL(event).pathname)) {
    setResponseHeaders(event, {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
    });
  }
});
