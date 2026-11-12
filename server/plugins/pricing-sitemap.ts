// Only published locales returned by pricing/sitemap may advertise pricing.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('sitemap:sources', (ctx) => {
    for (const source of ctx.sources) {
      if (typeof source !== 'object' || Array.isArray(source) || source.sourceType !== 'app' || !source.urls) continue;
      source.urls = source.urls.filter((entry) => {
        const loc = typeof entry === 'string' ? entry : entry.loc || '';
        const path = new URL(loc, 'https://esys.pro').pathname;
        return !/^\/(?:(?:ru|en|uz)\/)?pricing(?:-preview)?\/?$/.test(path);
      });
    }
  });
});
