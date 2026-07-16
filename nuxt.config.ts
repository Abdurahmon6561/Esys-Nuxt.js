// Backend host serving CMS images — allowed through ipx for resize/WebP.
const apiHost = process.env.NUXT_PUBLIC_API_URL
  ? new URL(process.env.NUXT_PUBLIC_API_URL).hostname
  : undefined;

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

  modules: [
    "@nuxtjs/i18n",
    "motion-v/nuxt",
    "@nuxtjs/sitemap",
    "@nuxt/fonts",
    "@nuxt/image",
  ],

  image: {
    // CMS images come full-size from the backend; ipx serves resized WebP
    // variants (srcset) instead. PageSpeed flagged ~1.4MB of savings here.
    domains: apiHost ? [apiHost] : [],
    quality: 75,
  },

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
    // Bundle all locale messages into the build. @nuxtjs/i18n v10 lazy-loads
    // each locale from a /_i18n/{code}/messages.json Nitro endpoint by default;
    // prerendering /about and /privacy fetches that endpoint before the i18n
    // server context is initialized → 500 "Nuxt I18n server context has not
    // been set up yet" + missing-key warnings. Three small locales, static
    // marketing site — bundling is cheaper than the runtime endpoint.
    lazy: false,
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
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Cross-Origin-Opener-Policy": "same-origin",
        // script-src is the directive that matters for XSS; 'unsafe-inline'
        // is required by Nuxt's inline payload script. img/connect stay
        // broad-https for analytics beacons and CMS media.
        "Content-Security-Policy": [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://mc.yandex.ru https://mc.yandex.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https: wss:",
          "frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net https://mc.yandex.ru https://mc.yandex.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
        ].join("; "),
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
      // Google tag id (G-… for GA4 or AW-… for Ads) — disabled when empty
      gtagId: process.env.NUXT_PUBLIC_GTAG_ID || "",
    },
  },
});
