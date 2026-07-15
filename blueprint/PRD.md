# Product Requirements Document (PRD)
**Sistem Dashboard Agregasi Data (Nuxt 3 Monolith)**

## 1. Ringkasan Proyek
Sistem dasbor administrasi internal yang bertugas menarik, mengagregasi, menyisihkan (cache), dan menyajikan data dari API eksternal. Aplikasi dibangun menggunakan arsitektur monolith Nuxt 3 dengan antarmuka yang bersih dan profesional. Sistem menyimpan *cache* di dalam file JSON secara terpisah per *endpoint* untuk performa maksimal.

## 2. Tech Stack & UI/UX
- **Framework Utama:** Nuxt 3 (Vue 3 Composition API).
- **Styling & Layout:** Tailwind CSS (digunakan secara eksklusif untuk tata letak, *grid*, *flexbox*, *margin/padding*, dan tipografi).
- **UI Component Library:** Maz-UI.
- **Custom Theme:** Menggunakan tema bawaan yang sudah di- *generate* via Theme Builder dan disimpan di `themes/maz-theme.ts`.
- **Desain:** Harus terlihat rapi, modern, dan fungsional, responsive di mobile dan desktop, sangat cocok untuk aplikasi internal tingkat birokrasi/pemerintahan yang menangani banyak data.

## 3. Kebutuhan Data (Data Fetching Strategy)

### 3.1 API Dashboard (Public API)
- **Sifat:** Publik, tanpa otentikasi.
- **Endpoint:** `https://data.inaproc.id/dashboard-api/profil-pengadaan/precomputed`
- **Target Penyimpanan:** `server/data/dashboard_precomputed.json`

### 3.2 API Data (Secured, Paginated, & Multi-Endpoint)
- **Sifat:** Privat, membutuhkan Token dari `.env`.
- **Skala Endpoint:** Terdapat banyak endpoint yang dikelompokkan (contoh: `/rup/list_paket`, `/ekatalog/list_produk`).
- **Mekanisme Paginasi:** *Cursor-based While Loop* (batas 100 data per *request* hingga `has_more` bernilai `false`).
- **Strategi Penyimpanan Cache:** Wajib menyimpan hasil agregasi data ke dalam file JSON menggunakan jalur dinamis `server/data/[group]/[endpoint].json`.