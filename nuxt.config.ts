import { customTheme } from './themes/maz-theme'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
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

