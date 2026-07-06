export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
    head: {
      // Paint dark before any CSS arrives — kills the white flash in dev
      // (Vite ships styles via JS) and on slow prod connections.
      htmlAttrs: { style: "background:#0b0b10" },
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
        { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
      meta: [{ name: "theme-color", content: "#0b0b10" }],
    },
  },
  devServer: {
    port: 6561,
    host: "localhost",
  },

  modules: ["@nuxtjs/i18n", "motion-v/nuxt", "@nuxtjs/sitemap", "@nuxt/fonts"],

  fonts: {
    families: [
      // Self-hosted at build time — no runtime request to Google.
      // Montserrat instead of Poppins: the site is RU-default and Poppins has
      // no Cyrillic subset. Subsets must be listed explicitly — the module
      // defaults to latin-only.
      {
        name: "Montserrat",
        provider: "google",
        weights: [400, 500, 600, 700],
        subsets: ["cyrillic-ext", "cyrillic", "latin-ext", "latin"],
      },
    ],
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || "https://esys.pro",
    name: "Evolution Systems",
  },

  sitemap: {
    // Dynamic blog/portfolio URLs come from the server endpoint
    sources: ["/api/__sitemap__/urls"],
  },

  i18n: {
    // Absolute URLs for hreflang alternates + canonical
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://esys.pro",
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

  // SSR-safe: tree-shakes GSAP plugins not imported. Without this, Vite
  // emits GSAP's ESM/CJS interop in a shape that breaks on the server.
  build: {
    transpile: ["gsap"],
  },

  routeRules: {
    "/**": {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      },
    },
    // Fully static content, no API fetch - safe to prerender at build time.
    "/about": { prerender: true },
    "/privacy": { prerender: true },
    // Backend-driven lists - cache briefly instead of hitting the API every request.
    "/blog": { swr: 300 },
    "/portfolio": { swr: 300 },
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
      // Yandex Metrika counter id — analytics disabled when empty
      metrikaId: process.env.NUXT_PUBLIC_METRIKA_ID || "",
    },
  },
});
