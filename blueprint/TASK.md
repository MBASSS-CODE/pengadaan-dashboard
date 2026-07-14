# AI Developer Tasks - Sistem Dashboard Nuxt 3 Monolith

Berperanlah sebagai Senior Nuxt 3 Developer. Kerjakan tugas-tugas di bawah ini untuk membangun infrastruktur sistem. Aplikasi ini menggunakan PrimeVue (dengan tata letak seragam dan elegan ala template Verona), Pinia, dan Nitro. 

## Task 1: Setup Environment & Dependencies
1. Instal dependensi: `npm install jsonwebtoken bcryptjs node-cron` beserta `@types`-nya.
2. Setup `.env` dengan `API_DATA_TOKEN`, `API_DATA_KODE_KLPD`, dan `JWT_SECRET`.
3. Daftarkan variabel di `runtimeConfig` dalam `nuxt.config.ts`.

## Task 2: Core Data Utilities (Mendukung "Group" Endpoint)
1. Buat file `server/utils/dataManager.ts`.
2. Buat fungsi `syncEndpointData(group: string, endpoint: string, tahun: string, extraParams: any = {})`:
   - Gunakan *while-loop* dan `cursor` untuk limit 100 per *request*.
   - Simpan array gabungan ke file menggunakan path: `server/data/${group}/${endpoint}.json` (Pastikan direktori grup dibuat otomatis dengan `fs/promises.mkdir(..., { recursive: true })`).
   - Simpan ke *cache* in-memory dinamis: `memoryCache[\`\${group}_\${endpoint}\`]`.
3. Buat fungsi fallback `getEndpointData(group: string, endpoint: string, tahun: string, extraParams: any)`:
   - Cek RAM -> Cek File JSON di folder grup -> Jika kosong, jalankan `syncEndpointData`.

## Task 3: Automasi Sinkronisasi (Cron Job Plugin)
1. Buat file plugin `server/plugins/cron.ts` menggunakan `node-cron` (jadwal 06:00 & 12:00).
2. Siapkan array/objek berisi daftar *endpoint* aktif per grup (misal: `{ rup: ['list_paket', ...], ekatalog: ['list_produk', ...] }`).
3. Lakukan iterasi otomatis untuk memanggil `syncEndpointData` agar *cache* selalu segar.

## Task 4: Setup API Routes (Dynamic Group Routing)
**Dynamic Route API Data:**
1. Buat struktur folder: `server/api/data/[group]/[endpoint].get.ts`.
2. Tangkap parameter dari `event.context.params.group` dan `event.context.params.endpoint`.
3. Panggil `getEndpointData` dan kembalikan ke *client*.

**Dashboard Route:** Buat file `server/api/dashboard.get.ts`.
   - Tangkap parameter dan panggil `await getDashboardPrecomputed(...)`.

## Task 5: Otentikasi Internal & User Management Backend
1. Buat `server/utils/userManager.ts` untuk CRUD admin berbasis JSON (`server/data/users.json`) dan `bcryptjs`.
2. Buat API `server/api/auth/login.post.ts` yang mengembalikan `HttpOnly` cookie berisi JWT.
3. Buat API `server/api/users/` (GET, POST, PUT, DELETE) yang dilindungi oleh pengecekan JWT.
4. Buat *Middleware Backend* yang mengecek validitas `auth_token`

## Task 6: Frontend Pages (Manajemen Pengguna)
1. Buat `middleware/auth.ts` untuk proteksi halaman.
2. Buat `pages/users/index.vue` dengan MAZ-UI `DataTable` dan `Dialog` untuk CRUD admin. Pastikan UI bersih dan profesional.

---

# 🤖 SOP WORKFLOW ITERATIF (Untuk AI Assistant)

Setiap kali User memberikan *prompt* berisi struktur JSON/Response baru dari sebuah *endpoint*, AI HARUS menjalankan alur kerja 3 langkah berikut tanpa perlu disuruh ulang:

## Langkah A: Registrasi Backend
1. Identifikasi *Group* dan *Endpoint* dari deskripsi User.
2. Tambahkan *endpoint* tersebut ke dalam daftar Cron Job di `server/plugins/cron.ts`.
3. Validasi apakah ada parameter ekstra yang dibutuhkan untuk URL tersebut.

## Langkah B: Generate UI / Frontend (Modern & Readable)
1. Buat file Vue baru (misal: `pages/[group]/[endpoint].vue`).
2. Analisis struktur JSON yang diberikan User. Pilih komponen MAZ-UI yang paling relevan:
   - Jika data berbentuk array tabular: Gunakan `DataTable` lengkap dengan filter, sorting, dan paginasi lokal.
   - Jika data memiliki status/label: Gunakan MAZ-UI `Tag` atau `Badge`.
   - Jika data numerik besar: Format menggunakan standar mata uang atau ribuan.

## Langkah C: Agregasi Data (Feature Combination)
1. *Task ini akan dipicu secara manual oleh User.* 
2. Jika User meminta "Combine Data X dan Y untuk Menu Z":
   - AI harus membuat fungsi baru di `server/utils/dataAggregator.ts`.
   - Baca data JSON/Cache dari *endpoint* yang diminta, lakukan *mapping/join* data di sisi backend (Nitro).
   - Buat rute API khusus (misal: `server/api/features/summary-z.get.ts`) yang mengirimkan data matang (hasil agregasi) ke frontend.
   - Buat tampilan UI interaktif (seperti *Card*, *Chart*, atau *Master-Detail Table*) berdasarkan agregasi tersebut.