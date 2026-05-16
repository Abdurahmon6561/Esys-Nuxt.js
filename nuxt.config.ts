export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  devServer: {
    port: 6561,
    host: "localhost",
  },

  css: [
    "~/assets/css/main.css",
    "@fortawesome/fontawesome-svg-core/styles.css",
  ],

  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/i18n"],

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

  app: {
    head: {
      title: "Создание и разработка сайтов в г. Ташкенте - Evolution Systems",
      htmlAttrs: {
        lang: "en",
      },
      meta: [{ name: "robots", content: "noindex" }],
    },
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in",
    },
  },

  // Add build transpile for GSAP
  build: {
    transpile: ["gsap"],
  },
});
