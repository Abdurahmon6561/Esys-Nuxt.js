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

  modules: ["@nuxtjs/tailwindcss"],

  app: {
    head: {
      title: "Создание и разработка сайтов в г. Ташкенте - Evolution Systems",
      htmlAttrs: {
        lang: "en",
      },
      meta: [{ name: "robots", content: "noindex" }],
    },
    pageTransition: { 
      name: 'page', 
      mode: 'out-in' 
    },
    layoutTransition: { 
      name: 'layout', 
      mode: 'out-in' 
    }
  },

  // Add build transpile for GSAP
  build: {
    transpile: ['gsap']
  }
});