# Product Requirements Document (PRD)
**Sistem Dashboard INAPROC & Agregasi Data (Nuxt 3 Monolith)**

## 1. Ringkasan Proyek
Sistem ini menarik, mengagregasi, menyisihkan (cache), dan menyajikan data dari API eksternal menggunakan arsitektur monolith Nuxt 3. Sistem harus tangguh menangani data besar dengan menyimpan *cache* di dalam file JSON per *endpoint*.

## 2. Kebutuhan Data (Data Fetching Strategy)

### 2.1 API Dashboard (Public API)
- **Sifat:** Publik, tanpa otentikasi.
- **Endpoint:** `https://data.inaproc.id/dashboard-api/profil-pengadaan/precomputed`
- **Parameter Wajib:** `tahun` dan `instansi`.
- **Target Penyimpanan:** `server/data/dashboard_precomputed.json`

### 2.2 API Data (Secured, Paginated, & Multi-Endpoint)
- **Sifat:** Privat, membutuhkan Token dari `.env`.
- **Skala Endpoint:** Terdapat 28+ endpoint yang akan terus bertambah (contoh: `/list_produk`, `/list_e_purchasing`, dll).
- **Parameter Wajib Base:** `tahun`, `kode_klpd` (dari `.env`), `cursor`.
- **Mekanisme Paginasi:** *Cursor-based While Loop* (batas 100 data per *request* hingga `has_more` bernilai `false`).
- **Strategi Penyimpanan Cache (Pemisahan File):** Sistem **wajib** menyimpan hasil agregasi data (setelah proses *loop* selesai) ke dalam file JSON yang namanya diambil persis dari nama *endpoint* tersebut.
  - Jika fetch `/list_produk`, simpan di `server/data/list_produk.json`.
  - Jika fetch `/list_e_purchasing`, simpan di `server/data/list_e_purchasing.json`.
- **Struktur Akses Frontend:** Frontend cukup memanggil API internal yang dinamis, tanpa perlu tahu token aslinya.