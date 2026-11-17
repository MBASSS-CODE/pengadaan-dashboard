# Panduan Menjalankan Aplikasi — Pengadaan Dashboard (`ukpbj-dashboard`)

Panduan praktis untuk menjalankan **Pengadaan Dashboard** di lingkungan **Development (Lokal)** maupun **Production (Hostinger)**, termasuk pengaturan **SSH SOCKS5 Tunnel** agar komputer lokal dapat mengakses API INAPROC (`data.inaproc.id`).

> Untuk dokumentasi arsitektur, daftar endpoint, dan alur merge data, lihat [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 1. Prasyarat

1. **Node.js** (`^20.0.0 || ^22.0.0`, kompatibel juga dengan Node `v24.x`)
2. **MariaDB / MySQL** (misalnya lewat XAMPP / Laragon / service MariaDB lokal)
3. **OpenSSH Client** (sudah tersedia bawaan di Windows 10/11 & Git Bash)
4. **Akses SSH ke Server Hostinger** yang IPv4 publiknya sudah terdaftar di *whitelist* INAPROC *(hanya dibutuhkan saat development lokal yang menarik data langsung dari API INAPROC)*

---

## 2. Persiapan Database

Tabel (`users`, `ppk_master`, `penyedia_master`) akan dibuat otomatis saat server start oleh `initDB()` di `server/utils/db.ts`, tetapi **database-nya harus dibuat terlebih dahulu**:

- **Mode Development (`NODE_ENV !== 'production'`)**
  Konfigurasi di `server/utils/db.ts`:
  - Host: `localhost`
  - User: `root`
  - Password: *(kosong)*
  - Database: **`pengadaan`**

  Buat database di MySQL/MariaDB lokal:
  ```sql
  CREATE DATABASE IF NOT EXISTS pengadaan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

- **Mode Production (`NODE_ENV === 'production'`)**
  Menggunakan variabel `DB_HOST_PROD`, `DB_USER_PROD`, `DB_PASSWORD_PROD`, dan `DB_NAME_PROD` dari file `.env`.

> **Akun Admin Default:** Jika tabel `users` masih kosong saat aplikasi pertama kali dijalankan, `server/utils/userManager.ts` otomatis membuat user `admin` (lihat `ensureDefaultUser()` di `server/utils/userManager.ts` untuk kredensial default, dan segera ubah setelah login pertama).

---

## 3. Konfigurasi File `.env`

Buat/pastikan file `.env` di root project berisi variabel berikut (sesuaikan nilai `<...>` dengan kredensial Anda):

```env
API_DATA_TOKEN=<TOKEN_API_INAPROC_AKTIF>
API_DATA_KODE_KLPD=K22
JWT_SECRET=<SECRET_KEY_JWT_PANJANG>
NUXT_PUBLIC_PRIMEUI_LICENSE=<LICENSE_KEY_JIKA_ADA>
INPROC_API=https://data.inaproc.id/api/v1
NUXT_PUBLIC_NAMA_INSTANSI="KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI"

# Production Database (dipakai saat NODE_ENV=production)
DB_HOST_PROD=127.0.0.1
DB_USER_PROD=<DB_USER_PROD>
DB_PASSWORD_PROD=<DB_PASSWORD_PROD>
DB_NAME_PROD=<DB_NAME_PROD>

# KHUSUS LOKAL DEVELOPMENT — JANGAN dipasang di server produksi Hostinger!
# Wajib menggunakan socks5:// (BUKAN socks5h://) agar DNS di-resolve ke IPv4
INAPROC_PROXY_URL=socks5://127.0.0.1:10808
```

### Catatan Penting Konfigurasi Proxy
- **Wajib `socks5://`, bukan `socks5h://`**:
  - `socks5h://` menyuruh server Hostinger me-resolve DNS `data.inaproc.id` di sisi server (dual-stack), sehingga koneksi keluar memakai **IPv6 Hostinger** dan ditolak INAPROC (`{"error":"IP tidak diizinkan untuk token ini"}`).
  - `socks5://` dipadukan dengan `ipv4Lookup` di `server/utils/inaprocFetch.ts` memaksa resolusi DNS ke **IPv4** terlebih dahulu, sehingga traffic keluar dari Hostinger selalu memakai **IPv4 yang sudah di-whitelist**.
- **Di Server Production Hostinger:** hapus atau beri tanda komentar (`#`) pada `INAPROC_PROXY_URL`. Tanpa `INAPROC_PROXY_URL`, `server/plugins/forceIpv4.ts` dan `server/utils/inaprocFetch.ts` otomatis melakukan koneksi langsung via IPv4.

---

## 4. Cara Menjalankan di Komputer Lokal (Development)

### Langkah 1 — Install Dependencies
Jalankan sekali saat pertama kali clone atau setelah ada update `package.json`:
```powershell
npm install
```

### Langkah 2 — Jalankan MariaDB/MySQL Lokal
Pastikan service MySQL/MariaDB aktif dan database `pengadaan` sudah tersedia.

### Langkah 3 — Buka SSH SOCKS5 Tunnel ke Hostinger *(Jika perlu tarik data API INAPROC)*
Buka **terminal PowerShell terpisah**, lalu jalankan salah satu perintah berikut dan **biarkan terminal tetap terbuka** selama development:

- **Menggunakan Password:**
  ```powershell
  # Shared / Cloud Hosting Hostinger (port SSH 65002)
  ssh -N -D 127.0.0.1:10808 -p 65002 <USER_HOSTINGER>@<IP_HOSTINGER>

  # Jika menggunakan VPS (port SSH default 22)
  ssh -N -D 127.0.0.1:10808 <USER_HOSTINGER>@<IP_HOSTINGER>
  ```

- **Menggunakan SSH Key (tanpa input password setiap kali):**
  1. Jika belum punya SSH key, buat sekali di Windows:
     ```powershell
     ssh-keygen -t ed25519 -C "hostinger-tunnel"
     Get-Content "$env:USERPROFILE\.ssh\id_ed25519.pub"
     ```
  2. Tempel isi public key ke **hPanel Hostinger → Advanced → SSH Access → Manage SSH Keys** (atau `~/.ssh/authorized_keys` pada VPS).
  3. Jalankan tunnel:
     ```powershell
     ssh -N -D 127.0.0.1:10808 -i "$env:USERPROFILE\.ssh\id_ed25519" -p 65002 <USER_HOSTINGER>@<IP_HOSTINGER>
     ```

> **Catatan:** Karena memakai flag `-N`, setelah login SSH berhasil terminal memang akan **diam / tidak menampilkan prompt shell**. Itu normal dan menandakan tunnel sedang berjalan.

*(Opsional)* Verifikasi tunnel di terminal lain sebelum menjalankan aplikasi:
```powershell
curl.exe -4 -x socks5://127.0.0.1:10808 https://api.ipify.org
```
Pastikan IP yang tampil adalah IPv4 server Hostinger Anda.

### Langkah 4 — Jalankan Server Development Nuxt
Di terminal project utama:
```powershell
npm run dev
```
Aplikasi akan berjalan di **`http://localhost:3000`**.

> Setiap kali mengubah isi `.env`, **stop (`Ctrl+C`) lalu jalankan ulang `npm run dev`** agar perubahan `.env` terbaca.

---

## 5. Cara Deploy ke Server Production (Hostinger via `git push`)

Deployment ke Hostinger cukup dilakukan dengan **`git push`** ke branch yang terhubung dengan integrasi Git Hostinger.

Konfigurasi tunnel lokal **tidak akan memengaruhi server Hostinger** karena:
1. File `.env` sudah masuk di `.gitignore` sehingga **`INAPROC_PROXY_URL` di komputer lokal tidak ikut ter-push ke Git**.
2. Di `server/utils/inaprocFetch.ts`, `SocksProxyAgent` hanya aktif jika `process.env.INAPROC_PROXY_URL` diset. Di Hostinger (yang tidak men-set `INAPROC_PROXY_URL`), aplikasi otomatis melakukan koneksi langsung ke API INAPROC menggunakan **IPv4** (`family: 4` & `ipv4Lookup`).

### Checklist sebelum `git push` ke branch deploy:
1. Pastikan Environment Variables / `.env` di **Hostinger** sudah memiliki `API_DATA_TOKEN` yang aktif, `API_DATA_KODE_KLPD`, `JWT_SECRET`, `INPROC_API`, dan `DB_*_PROD` — serta **tidak** menyertakan `INAPROC_PROXY_URL`.
2. Pastikan perubahan kode dari branch `proxy` (seperti `package.json`, `package-lock.json`, dan `server/utils/inaprocFetch.ts`) sudah di-merge ke branch deploy Hostinger jika ingin menyamakan codebase, lalu jalankan `git push`:
   ```powershell
   git push origin <branch-deploy>
   ```
3. Hostinger akan otomatis menjalankan `npm install`, `npm run build`, dan me-restart aplikasi. *(Pastikan folder `server/data/` memiliki izin tulis agar cron sync dan merge dapat menyimpan file JSON.)*

Untuk menguji hasil build production di komputer lokal sebelum push:
```powershell
npm run build
npm run preview
```

---

## 6. Troubleshooting

| Gejala / Error | Penyebab | Solusi |
| :--- | :--- | :--- |
| `{"error":"IP tidak diizinkan untuk token ini"}` | Koneksi keluar via IP lokal, IP GCP/VPN lain, atau lewat IPv6 Hostinger karena memakai `socks5h://` | Pastikan tunnel SSH Hostinger aktif, ubah `INAPROC_PROXY_URL` di `.env` menjadi `socks5://127.0.0.1:10808` (tanpa `h`), lalu restart `npm run dev`. |
| `{"error":"Access to this API has been disallowed"}` | `API_DATA_TOKEN` kadaluarsa/tidak valid, atau aplikasi lokal belum memakai kode proxy (`socks-proxy-agent`) | Cek `API_DATA_TOKEN` di `.env`, pastikan `socks-proxy-agent` terpasang (`npm install`), dan `INAPROC_PROXY_URL` aktif di lokal. |
| HTML `403` Cloudflare (`Cf-Mitigated: challenge`) | Exit IP proxy diblokir Cloudflare (mis. IP cloud/VPN luar Indonesia) atau request tanpa header `User-Agent` | Gunakan tunnel Hostinger (IP Indonesia yang lolos Cloudflare), jangan gunakan VPN/GCP US. |
| `connect ECONNREFUSED 127.0.0.1:10808` | Tunnel SSH ke Hostinger belum dijalankan atau terputus | Jalankan ulang perintah `ssh -N -D 127.0.0.1:10808 ...` di terminal terpisah. |
| `curl: (3) URL using bad/illegal format` saat tes manual | Perintah multi-baris berakhiran `\` ter-paste menjadi satu baris | Hapus seluruh karakter `\` dan jalankan perintah `curl` dalam satu baris utuh. |
| `Error connecting to MariaDB` saat startup | Service MySQL/MariaDB mati atau database `pengadaan` belum dibuat | Nyalakan MySQL/MariaDB dan buat database `pengadaan` (atau cek kredensial `DB_*_PROD` untuk production). |
