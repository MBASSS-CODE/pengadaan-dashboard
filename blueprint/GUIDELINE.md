# Architecture & Coding Guidelines

## 1. UI, Tata Letak, dan Styling (Tailwind + Maz-UI)
- **Komponen Interaktif:** Gunakan komponen bawaan Maz-UI (seperti `MazBtn`, `MazInput`, `MazDialog`, `MazCard`) untuk semua elemen interaktif dan *form*.
- **Integrasi Tema:** Pastikan aplikasi merender variabel CSS kustom yang berasal dari file `themes/maz-theme.ts`. Jangan menimpa warna dasar secara manual jika sudah diatur di dalam tema ini.
- **Tata Letak (Layouting):** DILARANG menulis CSS kustom untuk layout. Wajib menggunakan *utility classes* dari Tailwind CSS (`flex`, `grid`, `gap-4`, `p-6`, `w-full`, dll) untuk memposisikan komponen Maz-UI dan membangun kerangka halaman.
- **Tabel Data:** Untuk menampilkan data besar, gunakan struktur tabel HTML semantic atau Tailwind Grid yang dibalut dengan desain minimalis, dikombinasikan dengan komponen paginasi/tombol dari Maz-UI.

## 2. Keamanan & Variabel Lingkungan
- Konfigurasi `runtimeConfig` di `nuxt.config.ts` untuk `apiDataToken` dan `apiDataKodeKlpd`. Token tidak boleh bocor ke antarmuka *client*.

## 3. Dynamic Routing & File Naming
- Gunakan fitur **Catch-all / Dynamic Route** dari Nuxt 3 (`server/api/data/[group]/[endpoint].get.ts`) agar satu rute menangani semua agregasi data eksternal secara dinamis.

## 4. Logika Paginasi & Fallback Cache
- **Paginasi Loop:** Gunakan *while-loop* pada Nitro backend untuk menarik data rekursif menggunakan `cursor`.
- **Urutan Pemuatan Data:** Selalu cek In-Memory RAM (`memoryCache`) -> Cek Ketersediaan File JSON -> Jika kosong/tidak ada, lakukan *fetch* manual menggunakan Token, lalu tulis ke JSON dan RAM.