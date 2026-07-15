# AI Developer Tasks - Sistem Dashboard Nuxt 3 Monolith

Berperanlah sebagai Senior Nuxt 3 Developer. Kerjakan tugas-tugas di bawah ini. Aplikasi ini menggunakan Tailwind CSS untuk layouting, Maz-UI untuk komponen interaktif, Pinia, dan backend Nitro.

## Task 1: Setup Environment, Tailwind & Maz-UI
1. Instal dependensi: `npm install jsonwebtoken bcryptjs node-cron maz-ui` dan instal Tailwind CSS via `npx nuxi module add tailwindcss`.
2. Konfigurasi `nuxt.config.ts`:
   - Tambahkan `@nuxtjs/tailwindcss` ke dalam *modules*.
   - Tambahkan konfigurasi agar Nuxt membaca dan meng- *inject* tema kustom dari `themes/maz-theme.ts` ke dalam siklus aplikasi.
3. Setup `.env` dengan `API_DATA_TOKEN`, `API_DATA_KODE_KLPD`, dan `JWT_SECRET`. Daftarkan di `runtimeConfig`.

## Task 2: Core Data Utilities (Mendukung "Group" Endpoint)
1. Buat file `server/utils/dataManager.ts`.
2. Buat fungsi `syncEndpointData(group: string, endpoint: string, tahun: string, extraParams: any = {})`:
   - Gunakan *while-loop* dan `cursor` untuk limit 100 per *request*.
   - Simpan array gabungan ke file menggunakan path: `server/data/${group}/${endpoint}.json` (Pastikan direktori dibuat otomatis menggunakan `fs/promises`).
   - Simpan ke *cache* in-memory dinamis.
3. Buat fungsi fallback `getEndpointData(...)` yang memvalidasi RAM -> File JSON -> Sinkronisasi Baru.

## Task 3: Automasi Sinkronisasi (Cron Job Plugin)
1. Buat plugin `server/plugins/cron.ts` menggunakan `node-cron` (jadwal 06:00 & 12:00).
2. Lakukan iterasi otomatis untuk daftar grup dan *endpoint* krusial, panggil `syncEndpointData` agar data JSON diperbarui di latar belakang.

## Task 4: Setup API Routes (Dynamic Group Routing)
1. Buat struktur folder: `server/api/data/[group]/[endpoint].get.ts` untuk menangkap parameter URL dinamis dan memanggil utilitas *cache*.
2. Buat rute statis `server/api/dashboard.get.ts` khusus untuk API publik precomputed.

## Task 5: Otentikasi Internal Backend
1. Buat `server/utils/userManager.ts` untuk operasi CRUD ke file `server/data/users.json` dengan `bcryptjs`.
2. Buat API login (`server/api/auth/login.post.ts`) yang mengirim `HttpOnly` cookie.
3. Buat *Middleware Backend* untuk mengecek validitas JWT.

## Task 6: Frontend Pages (Menggunakan Tailwind & Maz-UI)
1. Buat halaman `pages/users/index.vue` untuk manajemen admin.
2. Gunakan utility Tailwind CSS (`flex`, `grid`, dll) untuk membungkus struktur halaman agar rapi.
3. Gunakan komponen Maz-UI (seperti `MazInput`, `MazBtn`, `MazDialog`) untuk form tambah/edit user. Pastikan UI terlihat sangat rapi dan profesional untuk skala instansi.

---

# 🤖 SOP WORKFLOW ITERATIF (Untuk AI Assistant)

Setiap kali User memberikan deskripsi/struktur JSON dari *endpoint* baru, AI HARUS:

## Langkah A: Registrasi Backend
1. Identifikasi *Group* dan *Endpoint*.
2. Daftarkan *endpoint* ke dalam `server/plugins/cron.ts`.

## Langkah B: Generate UI / Frontend (Tailwind + Maz-UI)
1. Buat file Vue di `pages/[group]/[endpoint].vue`.
2. Gunakan **Tailwind CSS** murni untuk mendesain kerangka, jarak (*margin/padding*), tata letak (*flex/grid*), dan panel penampung (*card*).
3. Gunakan **Maz-UI** untuk elemen form, tombol pencarian, status/label, dan *modal dialog*.
4. Pastikan tata letaknya mudah dipindai (scannable) dan optimal untuk menampilkan data dalam jumlah besar.

## Langkah C: Agregasi Data (Feature Combination)
1. *(Hanya dijalankan jika diminta)*.
2. Buat fungsi di `server/utils/dataAggregator.ts` untuk menggabungkan beberapa data JSON.
3. Render antarmuka statistik/rekap menggunakan kombinasi kerangka Tailwind dan elemen visual UI.