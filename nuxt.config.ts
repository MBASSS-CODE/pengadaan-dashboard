import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module'
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura
      }
    }
  },
  runtimeConfig: {
    apiDataToken: process.env.API_DATA_TOKEN,
    apiDataKodeKlpd: process.env.API_DATA_KODE_KLPD,
    jwtSecret: process.env.JWT_SECRET,
  }
})
