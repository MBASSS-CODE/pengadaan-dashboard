import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  // Nonaktifkan preflight agar Tailwind tidak me-reset styling dasar browser
  // Ini krusial agar tidak merusak tampilan default dan tipografi dari Maz-UI
  corePlugins: {
    preflight: false,
  },
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
