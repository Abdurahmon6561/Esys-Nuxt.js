// Conversion/goal tracking - fires one named event to every configured
// analytics backend: GA4/Google Ads (gtag) and Yandex Metrika (reachGoal).
// Silently no-ops for backends that are absent, so callers never guard.
//
// Event names used across the site (keep in sync when adding goals in
// GA4 / Metrika dashboards):
//   form_submit    - contact form sent successfully (primary conversion)
//   phone_click    - tel: link clicked
//   email_click    - mailto: link clicked
//   telegram_click - Telegram social link clicked
export const useTrackEvent = () => {
  const { gtagId, metrikaId } = useRuntimeConfig().public;

  return (name, params = {}) => {
    if (import.meta.server) return;
    if (gtagId && typeof window.gtag === "function") {
      window.gtag("event", name, params);
    }
    if (metrikaId && typeof window.ym === "function") {
      window.ym(metrikaId, "reachGoal", name, params);
    }
  };
};
