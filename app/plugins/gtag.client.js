// Google tag (GA4 / Google Ads) - loads only when NUXT_PUBLIC_GTAG_ID is set.
// SPA navigations are reported via router.afterEach; the initial page view
// comes from the `config` call itself.
export default defineNuxtPlugin(() => {
  const { gtagId } = useRuntimeConfig().public;
  if (!gtagId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  // Consent Mode v2 - default follows the stored CookieBanner choice.
  // Users who have not accepted stay "denied"; gtag then runs cookieless
  // (modeled conversions). CookieBanner sends the "update" on accept.
  let consented = false;
  try {
    consented = localStorage.getItem("cookie_consent") === "accepted";
  } catch {
    /* storage unavailable - stay denied */
  }
  const state = consented ? "granted" : "denied";
  window.gtag("consent", "default", {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });

  window.gtag("js", new Date());
  window.gtag("config", gtagId);

  // Defer the actual gtag.js download until idle or first interaction —
  // its evaluation is a long main-thread task (TBT). All calls above are
  // queued in dataLayer and replay once the script loads, so nothing is lost.
  onIdleOrInteraction(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
    document.head.appendChild(script);
  });

  const router = useRouter();
  router.afterEach((to, from) => {
    // Skip the initial navigation - `config` above already sent a page_view.
    if (!from.matched.length || to.fullPath === from.fullPath) return;
    window.gtag("event", "page_view", {
      page_path: to.fullPath,
      page_location: window.location.origin + to.fullPath,
    });
  });
});
