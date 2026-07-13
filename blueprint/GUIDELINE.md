# Architecture & Coding Guidelines

## 1. Keamanan & Variabel Lingkungan
- Konfigurasi `runtimeConfig` di `nuxt.config.ts` untuk `apiDataToken` dan `apiDataKodeKlpd`.

## 2. Dynamic Routing & File Naming
- Gunakan fitur **Catch-all / Dynamic Route** dari Nuxt 3 (`server/api/data/[endpoint].get.ts`) agar satu file API internal bisa menangani puluhan/ratusan endpoint eksternal secara otomatis.
- Gunakan utilitas bawaan Node.js (`path` dan `fs/promises`) untuk menamai file secara dinamis.
  ```typescript
  // Contoh dinamisasi nama file
  const endpointName = 'list_produk'; // Didapat dari parameter URL
  const filePath = path.resolve(process.cwd(), `server/data/${endpointName}.json`);