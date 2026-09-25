// hreflang for CMS pages, built only from translations the backend reports as
// published. @nuxtjs/i18n emits a link for every configured locale (a ru
// fallback would be advertised as a uz/en page), so:
//  - app.vue drops i18n links for locales missing here (state keyed by path),
//  - this composable emits the real links with the same ids ("i18n-alt-<code>",
//    "i18n-xd"), which replace the i18n ones, with each locale's own slug.
// x-default follows ru (the unprefixed default locale) and is omitted with it.
export const usePageAlternatesState = () =>
  useState("page-alternates", () => ({ path: null, locales: null }));

/** @param getPaths () => Record<locale, relativePath> | null */
export function usePageAlternates(getPaths) {
  const state = usePageAlternatesState();
  const route = useRoute();
  const siteUrl = useRuntimeConfig().public.siteUrl || "https://esys.pro";

  const paths = computed(() => toValue(getPaths));

  watchEffect(() => {
    state.value = {
      path: route.path,
      locales: paths.value ? Object.keys(paths.value) : null,
    };
  });

  useHead(() => {
    if (!paths.value) return {};
    const link = Object.entries(paths.value).map(([code, path]) => ({
      id: `i18n-alt-${code}`,
      rel: "alternate",
      href: `${siteUrl}${path}`,
      hreflang: code,
    }));
    if (paths.value.ru) {
      link.unshift({
        id: "i18n-xd",
        rel: "alternate",
        href: `${siteUrl}${paths.value.ru}`,
        hreflang: "x-default",
      });
    }
    return { link };
  });
}
