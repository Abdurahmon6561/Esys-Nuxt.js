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
    lazy: true,
    langDir: "locales",
    strategy: "prefix_except_default",
    locales: [
      { code: "en", iso: "en", name: "En", file: "en.json" },
      { code: "uz", iso: "uz", name: "Uz", file: "uz.json" },
      { code: "ru", iso: "ru", name: "Ру", file: "ru.json" },
    ],
    defaultLocale: "ru",
    // Add this to redirect root to default locale
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    }
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