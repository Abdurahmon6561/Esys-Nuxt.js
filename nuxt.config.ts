// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: [
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],

  modules: [
    '@nuxtjs/tailwindcss'
  ],

  app: {
    head: {
      meta: [
        { name: 'robots', content: 'noindex' }
      ]
    }
  }
})
