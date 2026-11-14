import { buildConsultantContext, consultantServiceKey, estimateAnalyticsParams } from "../utils/estimate.js";

export const useConsultant = () => {
  const isOpen = useState("consultant-open", () => false);
  const suggestedService = useState("consultant-suggested-service", () => null);
  // A serializable queue lets pages start the globally mounted widget, even during a pending reply.
  const estimateRequests = useState("consultant-estimate-requests", () => []);
  const estimateStarted = useState("consultant-estimate-started", () => false);
  const { t, locale } = useI18n();
  const route = useRoute();
  const track = useTrackEvent();

  const startEstimate = (serviceKey = suggestedService.value) => {
    suggestedService.value = consultantServiceKey(serviceKey);
    const context = buildConsultantContext({
      routeName: route.name, path: route.path, query: route.query,
      origin: import.meta.client ? window.location.origin : undefined,
      suggestedService: suggestedService.value,
    });
    isOpen.value = true;
    estimateStarted.value = true;
    estimateRequests.value.push({ message: t("consultant.estimate.starter"), locale: locale.value, context });
    track("consultant_estimate_started", estimateAnalyticsParams(null, { locale: locale.value, ...context }));
  };

  return { isOpen, suggestedService, startEstimate, estimateRequests, estimateStarted };
};
