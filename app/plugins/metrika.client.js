// Yandex Metrika - loads only when NUXT_PUBLIC_METRIKA_ID is set.
// SPA navigation is reported via router.afterEach (Metrika only counts
// the initial page load by itself).
export default defineNuxtPlugin((nuxtApp) => {
  const { metrikaId } = useRuntimeConfig().public;
  if (!metrikaId) return;

  /* eslint-disable */
  (function (m, e, t, r, i, k, a) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * new Date();
    k = e.createElement(t);
    a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  /* eslint-enable */

  window.ym(metrikaId, "init", {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  });

  const router = useRouter();
  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath) return;
    window.ym(metrikaId, "hit", to.fullPath, { referer: from.fullPath });
  });
});
