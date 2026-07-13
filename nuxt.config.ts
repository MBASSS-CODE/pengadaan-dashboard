// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    apiDataToken: process.env.API_DATA_TOKEN,
    apiDataKodeKlpd: process.env.API_DATA_KODE_KLPD,
    jwtSecret: process.env.JWT_SECRET,
  }
})
