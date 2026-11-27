<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Detail Realisasi Pengadaan" max-width="1050px">
    <div v-if="selectedItem" class="space-y-6 pr-1 text-sm max-h-[75vh] overflow-y-auto">

      <!-- Top Grid: Nilai Pagu, Total Nilai, PDN, UMK -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between">
          <span class="text-[10px] text-blue-700 dark:text-blue-400 font-medium uppercase tracking-wider">Nilai Pagu</span>
          <span class="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">{{ formatRupiah(selectedItem.nilai_pagu) }}</span>
        </div>
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-[10px] text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider">Total Nilai Realisasi</span>
          <div class="mt-1">
            <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(selectedItem.total_nilai) }}</span>
            <span v-if="selectedItem.realisasi_pct !== null && selectedItem.realisasi_pct !== undefined" class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 ml-1.5">
              ({{ selectedItem.realisasi_pct }}%)
            </span>
          </div>
        </div>
        <div class="p-3.5 rounded-lg border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-900/10 flex flex-col justify-between">
          <span class="text-[10px] text-teal-700 dark:text-teal-400 font-medium uppercase tracking-wider">Nilai PDN</span>
          <span class="text-base font-bold text-teal-600 dark:text-teal-400 mt-1">{{ formatRupiah(selectedItem.nilai_pdn) }}</span>
        </div>
        <div class="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10 flex flex-col justify-between">
          <span class="text-[10px] text-purple-700 dark:text-purple-400 font-medium uppercase tracking-wider">Nilai UMK</span>
          <span class="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">{{ formatRupiah(selectedItem.nilai_umk) }}</span>
        </div>
      </div>

      <!-- Main Info Grids -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Informasi Paket & Pelaksanaan -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informasi Paket &amp; Pelaksanaan
          </h3>

          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Identitas Paket</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket:</span>
              <span class="font-semibold text-right text-[color:hsl(var(--maz-primary))]">{{ selectedItem.nama_paket || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Kode Paket:</span>
              <span class="font-mono font-medium text-right">{{ selectedItem.kode_paket || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Kode RUP:</span>
              <span class="font-mono font-medium text-right">{{ selectedItem.kode_rup || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Tahun Anggaran:</span>
              <span class="font-medium text-right">{{ selectedItem.tahun_anggaran || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.tgl_transaksi">
              <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Transaksi:</span>
              <span class="font-medium text-right">{{ formatDate(selectedItem.tgl_transaksi) }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Detail Pengadaan</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Jenis Pengadaan:</span>
              <span class="font-medium text-right">{{ selectedItem.jenis_pengadaan_enriched || selectedItem.jenis_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Metode Pengadaan:</span>
              <span class="font-medium text-right">{{ selectedItem.metode_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Tahapan Pengadaan:</span>
              <span class="font-medium text-right">{{ selectedItem.tahapan_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Paket:</span>
              <span class="font-medium text-right">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {{ selectedItem.status_paket || '-' }}
                </span>
              </span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.tx_shipment_status">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Pengiriman:</span>
              <span class="font-medium text-right">{{ selectedItem.tx_shipment_status }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.tx_hps">
              <span class="text-[color:hsl(var(--maz-muted))]">Nilai HPS:</span>
              <span class="font-medium text-right">{{ formatRupiah(selectedItem.tx_hps) }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.mak_list && selectedItem.mak_list.length">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Kode MAK:</span>
              <span class="font-mono text-[11px] font-semibold text-right">{{ selectedItem.mak_list.join(', ') }}</span>
            </div>
          </div>
        </div>

        <!-- Card Pihak Terkait & Organisasi -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Pihak &amp; Organisasi
          </h3>

          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Organisasi</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Instansi:</span>
              <span class="font-medium text-right">{{ selectedItem.nama_instansi || namaInstansi || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Satuan Kerja:</span>
              <span class="font-medium text-right">{{ selectedItem.nama_satuan_kerja || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.satker_jenis">
              <span class="text-[color:hsl(var(--maz-muted))]">Jenis / Status Satker:</span>
              <span class="font-medium text-right">{{ selectedItem.satker_jenis }} ({{ selectedItem.satker_status || '-' }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Sumber Dana:</span>
              <span class="font-medium text-right">{{ selectedItem.sumber_dana || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Sumber Transaksi:</span>
              <span class="font-medium text-right">{{ selectedItem.sumber_transaksi || '-' }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Pejabat Pembuat Komitmen (PPK)</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400 text-right">{{ selectedItem.nama_ppk || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.ppk_nip_asli">
              <span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span>
              <span class="font-mono text-right">{{ selectedItem.ppk_nip_asli }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.ppk_jabatan">
              <span class="text-[color:hsl(var(--maz-muted))]">Jabatan:</span>
              <span class="text-right">{{ selectedItem.ppk_jabatan }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.ppk_unit_kerja">
              <span class="text-[color:hsl(var(--maz-muted))]">Unit Kerja:</span>
              <span class="text-right">{{ selectedItem.ppk_unit_kerja }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Penyedia</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama Penyedia:</span>
              <span class="font-bold text-[color:hsl(var(--maz-primary))] text-right">{{ selectedItem.nama_penyedia || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.penyedia_npwp">
              <span class="text-[color:hsl(var(--maz-muted))]">NPWP:</span>
              <span class="font-mono text-right">{{ selectedItem.penyedia_npwp }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.penyedia_status_umkk">
              <span class="text-[color:hsl(var(--maz-muted))]">Kualifikasi UMKK:</span>
              <span class="font-semibold text-purple-600 dark:text-purple-400 text-right">{{ selectedItem.penyedia_status_umkk }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.penyedia_jenis_perusahaan || selectedItem.penyedia_bentuk_usaha">
              <span class="text-[color:hsl(var(--maz-muted))]">Jenis / Bentuk Usaha:</span>
              <span class="text-right">{{ [selectedItem.penyedia_jenis_perusahaan, selectedItem.penyedia_bentuk_usaha].filter(Boolean).join(' / ') }}</span>
            </div>
            <div class="flex justify-between gap-4" v-if="selectedItem.penyedia_alamat">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Alamat:</span>
              <span class="text-right">{{ selectedItem.penyedia_alamat }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail RUP & Jadwal (jika terhubung ke RUP) -->
      <div v-if="selectedItem._rup_matched" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-bold text-teal-600 dark:text-teal-400">
            Data Pengayaan RUP ({{ selectedItem.rup_tipe_paket || 'Penyedia' }})
          </h3>
          <div class="flex flex-wrap gap-1.5 text-[10px]">
            <span v-if="selectedItem.rup_status_pdn" class="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">PDN: {{ selectedItem.rup_status_pdn }}</span>
            <span v-if="selectedItem.rup_status_ukm" class="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">UKM: {{ selectedItem.rup_status_ukm }}</span>
            <span v-if="selectedItem.rup_spp_lingkungan" class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">SPP Lingkungan</span>
            <span v-if="selectedItem.rup_spp_sosial" class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold">SPP Sosial</span>
            <span v-if="selectedItem.rup_spp_ekonomi" class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">SPP Ekonomi</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="space-y-1">
            <div><span class="text-[color:hsl(var(--maz-muted))]">Nama Paket RUP:</span> <span class="font-medium">{{ selectedItem.rup_nama_paket || '-' }}</span></div>
            <div><span class="text-[color:hsl(var(--maz-muted))]">Pagu RUP:</span> <span class="font-semibold">{{ formatRupiah(selectedItem.rup_pagu) }}</span></div>
            <div><span class="text-[color:hsl(var(--maz-muted))]">Volume:</span> <span class="font-medium">{{ selectedItem.rup_volume_pekerjaan || '-' }}</span></div>
            <div v-if="selectedItem.rup_detail_lokasi"><span class="text-[color:hsl(var(--maz-muted))]">Lokasi:</span> <span class="font-medium">{{ selectedItem.rup_detail_lokasi }}</span></div>
          </div>
          <div class="space-y-1">
            <div><span class="text-[color:hsl(var(--maz-muted))]">Status Umumkan:</span> <span class="font-medium">{{ selectedItem.rup_status_umumkan || '-' }}</span></div>
            <div><span class="text-[color:hsl(var(--maz-muted))]">Jadwal Pemilihan:</span> <span class="font-medium">{{ formatDateRange(selectedItem.rup_tgl_awal_pemilihan, selectedItem.rup_tgl_akhir_pemilihan) }}</span></div>
            <div><span class="text-[color:hsl(var(--maz-muted))]">Jadwal Kontrak:</span> <span class="font-medium">{{ formatDateRange(selectedItem.rup_tgl_awal_kontrak, selectedItem.rup_tgl_akhir_kontrak) }}</span></div>
            <div><span class="text-[color:hsl(var(--maz-muted))]">Jadwal Pemanfaatan:</span> <span class="font-medium">{{ formatDateRange(selectedItem.rup_tgl_awal_pemanfaatan, selectedItem.rup_tgl_akhir_pemanfaatan) }}</span></div>
          </div>
        </div>

        <div v-if="selectedItem.rup_uraian_pekerjaan || selectedItem.rup_spesifikasi_pekerjaan" class="text-xs pt-2 border-t border-[color:hsl(var(--maz-border))] space-y-1">
          <div v-if="selectedItem.rup_uraian_pekerjaan">
            <span class="text-[color:hsl(var(--maz-muted))] font-semibold">Uraian Pekerjaan:</span>
            <p class="mt-0.5 text-[color:hsl(var(--maz-foreground))] whitespace-pre-line">{{ selectedItem.rup_uraian_pekerjaan }}</p>
          </div>
          <div v-if="selectedItem.rup_spesifikasi_pekerjaan">
            <span class="text-[color:hsl(var(--maz-muted))] font-semibold">Spesifikasi:</span>
            <span class="ml-1">{{ selectedItem.rup_spesifikasi_pekerjaan }}</span>
          </div>
        </div>
      </div>

      <!-- Detail Produk E-Katalog -->
      <div v-if="selectedItem.tx_products && selectedItem.tx_products.length > 0" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <div class="flex justify-between items-center">
          <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400">Rincian Item Produk ({{ selectedItem.tx_products.length }})</h3>
          <span v-if="selectedItem.tx_shipping_fee" class="text-xs text-[color:hsl(var(--maz-muted))]">Ongkos Kirim: {{ formatRupiah(selectedItem.tx_shipping_fee) }}</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="text-[11px] uppercase text-[color:hsl(var(--maz-muted))] border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-1.5 pr-2">Produk</th>
                <th class="py-1.5 px-2 text-right">Qty</th>
                <th class="py-1.5 px-2 text-right">Harga Satuan</th>
                <th class="py-1.5 pl-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(prod, idx) in selectedItem.tx_products" :key="idx">
                <td class="py-1.5 pr-2">{{ prod.product_name || prod.nama_produk || prod.name || '-' }}</td>
                <td class="py-1.5 px-2 text-right">{{ prod.qty || prod.quantity || 1 }}</td>
                <td class="py-1.5 px-2 text-right">{{ formatRupiah(prod.price || prod.harga_satuan || 0) }}</td>
                <td class="py-1.5 pl-2 text-right font-semibold">{{ formatRupiah(prod.total || prod.subtotal || ((prod.qty || 1) * (prod.price || 0))) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Realisasi Pencatatan -->
      <div v-if="selectedItem.tx_realisasi_list && selectedItem.tx_realisasi_list.length > 0" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-indigo-600 dark:text-indigo-400">Riwayat Realisasi Pembayaran ({{ selectedItem.tx_realisasi_list.length }})</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="text-[11px] uppercase text-[color:hsl(var(--maz-muted))] border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-1.5 pr-2">Tanggal</th>
                <th class="py-1.5 px-2">Jenis / Keterangan</th>
                <th class="py-1.5 px-2">Penyedia / Pelaksana</th>
                <th class="py-1.5 pl-2 text-right">Nilai Realisasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(rl, idx) in selectedItem.tx_realisasi_list" :key="idx">
                <td class="py-1.5 pr-2 whitespace-nowrap">{{ formatDate(rl.tgl_realisasi) }}</td>
                <td class="py-1.5 px-2">{{ rl.jenis_realisasi || '-' }} <span v-if="rl.ket_realisasi" class="text-[color:hsl(var(--maz-muted))]">({{ rl.ket_realisasi }})</span></td>
                <td class="py-1.5 px-2">{{ rl.nama_penyedia || rl.nama_pelaksana || '-' }}</td>
                <td class="py-1.5 pl-2 text-right font-semibold">{{ formatRupiah(rl.nilai_realisasi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Tender (Peserta & Pemenang) -->
      <div v-if="selectedItem.tx_type === 'tender' && (selectedItem.tx_peserta_count > 0 || selectedItem.tx_pemenang_detail)" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-2 text-xs">
        <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400">Detail Tender &amp; Pemenang</h3>
        <div class="flex flex-wrap gap-6">
          <div><span class="text-[color:hsl(var(--maz-muted))]">Jumlah Peserta:</span> <span class="font-bold">{{ selectedItem.tx_peserta_count }} peserta</span></div>
          <div v-if="selectedItem.tx_pemenang_detail">
            <span class="text-[color:hsl(var(--maz-muted))]">Pemenang Terverifikasi:</span>
            <span class="font-bold ml-1">{{ selectedItem.tx_pemenang_detail.nama_penyedia }}</span>
            <span class="text-[color:hsl(var(--maz-muted))] ml-2">(Penawaran: {{ formatRupiah(selectedItem.tx_pemenang_detail.nilai_penawaran) }})</span>
          </div>
        </div>
      </div>

      <!-- Riwayat Anggaran / MAK & Kaji Ulang -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4" v-if="(selectedItem.anggaran_list && selectedItem.anggaran_list.length) || (selectedItem.kaji_ulang_list && selectedItem.kaji_ulang_list.length)">
        <div v-if="selectedItem.anggaran_list && selectedItem.anggaran_list.length" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-2 text-xs">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))]">Rincian Anggaran / MAK RUP</h3>
          <div v-for="(ang, idx) in selectedItem.anggaran_list" :key="idx" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1 last:border-0">
            <div>
              <div class="font-mono font-semibold">{{ ang.mak }}</div>
              <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">{{ ang.sumber_dana }} {{ ang.asal_dana_satker ? `• ${ang.asal_dana_satker}` : '' }}</div>
            </div>
            <div class="font-bold">{{ formatRupiah(ang.pagu) }}</div>
          </div>
        </div>

        <div v-if="selectedItem.kaji_ulang_list && selectedItem.kaji_ulang_list.length" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-2 text-xs">
          <h3 class="text-sm font-bold text-amber-600 dark:text-amber-400">Riwayat Kaji Ulang RUP ({{ selectedItem.kaji_ulang_list.length }})</h3>
          <div v-for="(ku, idx) in selectedItem.kaji_ulang_list" :key="idx" class="border-b border-[color:hsl(var(--maz-border))] pb-1.5 last:border-0">
            <div class="flex justify-between font-semibold">
              <span>{{ ku.jenis_revisi || 'Revisi' }}</span>
              <span class="text-[color:hsl(var(--maz-muted))]">{{ formatDate(ku.tgl_kaji_ulang) }}</span>
            </div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5">{{ ku.alasan_kajiulang || '-' }}</div>
          </div>
        </div>
      </div>

    </div>
    <template #footer>
      <div class="w-full flex justify-end">
        <MazBtn @click="$emit('update:modelValue', false)" color="primary" size="sm">Tutup</MazBtn>
      </div>
    </template>
  </MazDialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedItem: {
    type: Object,
    default: () => null
  },
  namaInstansi: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};

const formatDateRange = (start, end) => {
  if (!start && !end) return '-';
  return `${formatDate(start)} s.d. ${formatDate(end)}`;
};
</script>
