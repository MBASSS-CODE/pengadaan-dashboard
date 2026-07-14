import Aura from '@primeuix/themes/aura';
console.log("AURA IMPORT:", Object.keys(Aura));

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss'
  ],
  vite: {
    optimizeDeps: {
      include: [
        '@primeicons/vue/code',
        '@primeicons/vue/cog',
        '@primeicons/vue/database',
        '@primeicons/vue/external-link',
        '@primeicons/vue/globe',
        '@primeicons/vue/home',
        '@primeicons/vue/key',
        '@primeicons/vue/server',
        '@primeicons/vue/sidebar',
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  },
  primevue: {

    options: {
      ripple: true,
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }
  },
  runtimeConfig: {
    apiDataToken: process.env.API_DATA_TOKEN,
    apiDataKodeKlpd: process.env.API_DATA_KODE_KLPD,
    jwtSecret: process.env.JWT_SECRET,
    public: {
        PRIMEUI_LICENSE: process.env.NUXT_PUBLIC_PRIMEUI_LICENSE
    }
  }
})

