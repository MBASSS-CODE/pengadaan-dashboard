import { customTheme } from './themes/maz-theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap' }
      ]
    }
  },
  modules: [
    '@maz-ui/nuxt'
  ],
  mazUi: {
    theme: {
      preset: customTheme,
      strategy: 'hybrid',
      darkModeStrategy: 'class',
    }
  },
  runtimeConfig: {
    apiDataToken: process.env.API_DATA_TOKEN,
    apiDataKodeKlpd: process.env.API_DATA_KODE_KLPD,
    jwtSecret: process.env.JWT_SECRET,
  }
})

