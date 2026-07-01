export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },
  devServer: {
    port: 6561,
    host: "localhost",
  },

  modules: ["@nuxtjs/i18n", "motion-v/nuxt"],

  i18n: {
    langDir: "locales",
    strategy: "prefix_except_default",
    locales: [
      { code: "en", iso: "en", name: "En", file: "en.json" },
      { code: "uz", iso: "uz", name: "Uz", file: "uz.json" },
      { code: "ru", iso: "ru", name: "Ру", file: "ru.json" },
    ],
    defaultLocale: "ru",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    apiUsername: process.env.NUXT_API_USERNAME,
    apiPassword: process.env.NUXT_API_PASSWORD,
    // Public keys (exposed to client-side)
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      consultantKey: process.env.NUXT_PUBLIC_CONSULTANT_KEY,
    },
  },
});
