// Yandex Metrika - loads only when NUXT_PUBLIC_METRIKA_ID is set.
// SPA navigation is reported via router.afterEach (Metrika only counts
// the initial page load by itself).
export default defineNuxtPlugin((nuxtApp) => {
  const { metrikaId } = useRuntimeConfig().public;
  if (!metrikaId) return;

  // Queue stub — calls made before tag.js loads replay once it arrives.
  window.ym =
    window.ym ||
    function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
  window.ym.l = 1 * new Date();

  // Defer the tag.js download until idle or first interaction — its
  // evaluation is a long main-thread task (TBT).
  onIdleOrInteraction(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://mc.yandex.ru/metrika/tag.js";
    document.head.appendChild(script);
  });

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
