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
//   converter_convert   - converter used (mode + text length bucket only)
//   converter_copy      - converter result copied
//   converter_download  - converter result downloaded
//   converter_cta_click - converter business CTA clicked
//   consultant_estimate_started         - estimate starter selected (page/service context)
//   consultant_estimate_shown           - estimate returned by the consultant
//   consultant_estimate_recalculated    - second or later estimate in the conversation
//   consultant_estimate_manual_review   - estimate needs the team's review
//   consultant_estimate_error           - chat failed during an estimate flow
//   consultant_estimate_contact_started - inline estimate lead form opened
//   consultant_estimate_lead_submitted  - estimate lead accepted (no contact data in analytics)
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
