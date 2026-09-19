<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="`Detail RUP Penyedia: ${selectedRow?.kd_rup || ''}`" max-width="1000px">
    <div v-if="selectedRow" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
      
      <!-- Grid 1: Informasi Utama & Profil Paket -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Informasi Paket -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informasi Paket RUP
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama Paket:</span>
              <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Kode RUP:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_rup || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Total Pagu:</span>
              <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ formatRupiah(selectedRow.pagu) }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Jenis Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.jenis_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Metode Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.metode_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Status RUP:</span>
              <div class="flex gap-1 ml-4 justify-end flex-wrap">
                <span v-if="selectedRow.status_aktif_rup" class="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">Aktif</span>
                <span v-else class="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Non-Aktif</span>
                <span v-if="selectedRow.status_umumkan_rup" class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">{{ selectedRow.status_umumkan_rup }}</span>
              </div>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Volume Pekerjaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.volume_pekerjaan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Tipe Paket:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.tipe_paket || 'Penyedia' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Konsolidasi / Pradipa:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.status_konsolidasi || '-' }} / {{ selectedRow.status_pradipa || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Dikecualikan:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.status_dikecualikan ? `Ya (${selectedRow.alasan_dikecualikan || 'Dikecualikan'})` : 'Tidak' }}</span>
            </div>
          </div>
        </div>

        <!-- Card Satuan Kerja & PPK -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
            </svg>
            Satuan Kerja & PPK
          </h3>
          
          <!-- Sub Section Satker -->
          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Satuan Kerja</div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Nama Satker:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Kode Satker:</span> <span class="font-mono text-right ml-4">{{ selectedRow.kd_satker || selectedRow.kd_satker_str || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">K/L/PD:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_klpd || '-' }} ({{ selectedRow.kd_klpd || '-' }})</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Jenis / Status Satker:</span> <span class="font-medium text-right ml-4">{{ selectedRow.satker_jenis || '-' }} / {{ selectedRow.satker_status || '-' }}</span></div>
            <div v-if="selectedRow.satker_alamat" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Alamat Satker:</span> <span class="font-medium text-right ml-4">{{ selectedRow.satker_alamat }}</span></div>
          </div>

          <!-- Sub Section PPK -->
          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))] flex items-center justify-between">
              <span>Pejabat Pembuat Komitmen (PPK)</span>
              <span v-if="selectedRow._ppk_completed" class="text-green-600 dark:text-green-400 font-normal">✓ Match Master</span>
              <span v-else class="text-amber-600 dark:text-amber-400 font-normal">⚠️ Masked</span>
            </div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span> <span class="font-bold text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span> <span class="font-mono text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span></div>
            <div v-if="selectedRow.ppk_jabatan" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Jabatan PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_jabatan }}</span></div>
            <div v-if="selectedRow.ppk_unit_kerja" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Unit Kerja PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_unit_kerja }}</span></div>
            <div v-if="selectedRow.ppk_email || selectedRow.ppk_telepon" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Kontak:</span> <span class="font-medium text-right ml-4">{{ [selectedRow.ppk_email, selectedRow.ppk_telepon].filter(Boolean).join(' / ') }}</span></div>
            <div v-if="selectedRow.username_ppk" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Username PPK:</span> <span class="font-mono text-right ml-4">{{ selectedRow.username_ppk }}</span></div>
          </div>
        </div>
      </div>

      <!-- Grid 2: Jadwal Pelaksanaan & Kebijakan Pengadaan -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Jadwal & Timeline -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Jadwal & Timeline Pelaksanaan
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Jadwal Pemilihan:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_awal_pemilihan) }} s/d {{ formatDate(selectedRow.tgl_akhir_pemilihan) }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Jadwal Kontrak:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_awal_kontrak) }} s/d {{ formatDate(selectedRow.tgl_akhir_kontrak) }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Jadwal Pemanfaatan:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_awal_pemanfaatan) }} s/d {{ formatDate(selectedRow.tgl_akhir_pemanfaatan) }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Buat Paket:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_buat_paket) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Pengumuman:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_pengumuman_paket) }}</span>
            </div>
          </div>
        </div>

        <!-- Card Kebijakan Pengadaan (PDN, UKM, SPP) -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Kebijakan & Pengadaan Berkelanjutan (SPP)
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Produk Dalam Negeri (PDN):</span>
              <span class="font-semibold text-right ml-4 text-blue-600 dark:text-blue-400">{{ selectedRow.status_pdn || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Usaha Kecil/Mikro (UKM):</span>
              <span class="font-semibold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ selectedRow.status_ukm || '-' }}</span>
            </div>
            <div v-if="selectedRow.alasan_non_ukm" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Alasan Non-UKM:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.alasan_non_ukm }}</span>
            </div>
            <div class="pt-1">
              <span class="text-[color:hsl(var(--maz-muted))] font-medium block mb-1">Aspek Pengadaan Berkelanjutan (SPP):</span>
              <div class="flex gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold" :class="selectedRow.spp_aspek_lingkungan ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500'">
                  🌿 Lingkungan: {{ selectedRow.spp_aspek_lingkungan ? 'Ya' : 'Tidak' }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold" :class="selectedRow.spp_aspek_sosial ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-500'">
                  👥 Sosial: {{ selectedRow.spp_aspek_sosial ? 'Ya' : 'Tidak' }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold" :class="selectedRow.spp_aspek_ekonomi ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-500'">
                  💰 Ekonomi: {{ selectedRow.spp_aspek_ekonomi ? 'Ya' : 'Tidak' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Spesifikasi & Uraian Pekerjaan -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          Uraian & Spesifikasi Pekerjaan
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div class="font-semibold text-[color:hsl(var(--maz-muted))] mb-2 uppercase tracking-wider text-[10px]">Uraian Pekerjaan</div>
            <div class="p-3 bg-[color:hsl(var(--maz-background))] rounded border border-[color:hsl(var(--maz-border))] max-h-48 overflow-y-auto text-[color:hsl(var(--maz-foreground))]">
              <ul v-if="selectedRow.uraian_pekerjaan || selectedRow.urarian_pekerjaan" class="space-y-2">
                <li v-for="(item, i) in formatTextToList(selectedRow.uraian_pekerjaan || selectedRow.urarian_pekerjaan)" :key="i" class="flex items-start gap-2">
                  <span class="text-[color:hsl(var(--maz-primary))] mt-0.5 text-[10px]">●</span>
                  <span class="leading-relaxed">{{ item }}</span>
                </li>
              </ul>
              <div v-else class="italic text-[color:hsl(var(--maz-muted))]">Tidak ada data uraian pekerjaan.</div>
            </div>
          </div>
          <div>
            <div class="font-semibold text-[color:hsl(var(--maz-muted))] mb-2 uppercase tracking-wider text-[10px]">Spesifikasi Pekerjaan</div>
            <div class="p-3 bg-[color:hsl(var(--maz-background))] rounded border border-[color:hsl(var(--maz-border))] max-h-48 overflow-y-auto text-[color:hsl(var(--maz-foreground))]">
              <ul v-if="selectedRow.spesifikasi_pekerjaan" class="space-y-2">
                <li v-for="(item, i) in formatTextToList(selectedRow.spesifikasi_pekerjaan)" :key="i" class="flex items-start gap-2">
                  <span class="text-[color:hsl(var(--maz-primary))] mt-0.5 text-[10px]">●</span>
                  <span class="leading-relaxed">{{ item }}</span>
                </li>
              </ul>
              <div v-else class="italic text-[color:hsl(var(--maz-muted))]">Tidak ada data spesifikasi pekerjaan.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Lokasi Pekerjaan -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Lokasi Pekerjaan
        </h3>
        <div v-if="selectedRow.detail_lokasi && selectedRow.detail_lokasi.length > 0" class="overflow-x-auto">
          <table class="w-full text-xs text-left border border-[color:hsl(var(--maz-border))]">
            <thead class="bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-muted))] uppercase text-[10px]">
              <tr>
                <th class="p-2 border-b border-r">Provinsi</th>
                <th class="p-2 border-b border-r">Kabupaten / Kota</th>
                <th class="p-2 border-b">Detil Alamat Lokasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <tr v-for="(lok, lIdx) in selectedRow.detail_lokasi" :key="lIdx">
                <td class="p-2 border-r font-medium">{{ lok.prp_nama || '-' }}</td>
                <td class="p-2 border-r font-medium">{{ lok.kbp_nama || '-' }}</td>
                <td class="p-2">{{ lok.detil_lokasi || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">Tidak ada rincian lokasi pekerjaan khusus.</p>
      </div>

      <!-- Rincian Anggaran & Sumber Dana -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Rincian Sumber Dana & Anggaran</span>
          </div>
          <span class="text-xs font-normal text-[color:hsl(var(--maz-muted))]">Sumber Dana: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ selectedRow.sumber_dana_list || '-' }}</strong></span>
        </h3>
        
        <div v-if="selectedRow.anggaran_list && selectedRow.anggaran_list.length > 0" class="overflow-x-auto">
          <table class="w-full text-xs text-left border border-[color:hsl(var(--maz-border))]">
            <thead class="bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-muted))] uppercase text-[10px]">
              <tr>
                <th class="p-2 border-b border-r">MAK / Kode Anggaran</th>
                <th class="p-2 border-b border-r">Sumber Dana</th>
                <th class="p-2 border-b border-r">Jenis Dana APBN</th>
                <th class="p-2 border-b border-r">Asal Dana</th>
                <th class="p-2 border-b border-r text-right">Pagu</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <tr v-for="(ang, aIdx) in selectedRow.anggaran_list" :key="aIdx">
                <td class="p-2 border-r font-mono font-semibold text-[color:hsl(var(--maz-primary))]">{{ ang.mak || '-' }}</td>
                <td class="p-2 border-r">{{ ang.sumber_dana || '-' }} ({{ ang.tahun_anggaran_dana || ang.tahun_anggaran || '-' }})</td>
                <td class="p-2 border-r">{{ ang.jenis_dana_apbn || '-' }}</td>
                <td class="p-2 border-r">{{ ang.asal_dana_klpd || ang.asal_dana_satker || ang.nama_satker || '-' }}</td>
                <td class="p-2 text-right font-bold text-emerald-600 dark:text-emerald-400">{{ formatRupiah(ang.pagu) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">Tidak ada rincian anggaran yang terhubung.</p>
      </div>

      <!-- Realisasi Inaproc (Non-Tender) -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Integrasi Realisasi Pelaksanaan (Inaproc)</span>
          </div>
          <span v-if="selectedRow._has_realisasi" class="px-2 py-0.5 text-[10px] rounded font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Tercatat di Inaproc</span>
          <span v-else class="px-2 py-0.5 text-[10px] rounded font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Belum Ada Realisasi</span>
        </h3>

        <div v-if="selectedRow._has_realisasi" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Paket Realisasi:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.realisasi_nama_paket || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kode Paket Realisasi:</span> <span class="font-mono text-right ml-4">{{ selectedRow.realisasi_kd_paket || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Realisasi:</span> <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ selectedRow.realisasi_status || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Metode Realisasi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.realisasi_metode || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nilai HPS Realisasi:</span> <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ formatRupiah(selectedRow.realisasi_hps) }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tanggal Mulai Realisasi:</span> <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.realisasi_tgl_mulai) }}</span></div>
          <div v-if="selectedRow.nomor_kontrak" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1 col-span-2"><span class="text-[color:hsl(var(--maz-muted))]">Nomor Kontrak:</span> <span class="font-mono text-right ml-4">{{ selectedRow.nomor_kontrak }}</span></div>
        </div>
        <p v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">Paket ini belum memiliki data realisasi pelaksanaan pada sistem Inaproc / Non-Tender.</p>
      </div>

      <!-- Profil Penyedia & E-Purchasing -->
      <div v-if="selectedRow._has_epurchasing" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-blue-200 dark:border-blue-900/50 space-y-3">
        <h3 class="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          E-Purchasing & Master Penyedia
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kode Pesanan (Order ID):</span> <span class="font-mono text-right ml-4 font-bold">{{ selectedRow.epurchasing_detail?.order_id || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Pesanan:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.epurchasing_detail?.status || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Total Pembelian (E-Katalog):</span> <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ formatRupiah(selectedRow.epurchasing_detail?.total) }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Penyedia:</span> <span class="font-bold text-[color:hsl(var(--maz-primary))] text-right ml-4">{{ selectedRow.penyedia_detail?.nama_penyedia || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">NPWP Penyedia:</span> <span class="font-mono text-right ml-4">{{ selectedRow.penyedia_detail?.npwp || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status UMKK:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.penyedia_detail?.status_umkk === 1 ? 'Usaha Mikro/Kecil' : (selectedRow.penyedia_detail?.status_umkk === 0 ? 'Non-UMKK' : '-') }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Jenis Perusahaan:</span> <span class="text-right ml-4">{{ selectedRow.penyedia_detail?.jenis_perusahaan || '-' }} ({{ selectedRow.penyedia_detail?.bentuk_usaha || '-' }})</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Alamat Penyedia:</span> <span class="text-right ml-4">{{ selectedRow.penyedia_detail?.alamat || '-' }}</span></div>
        </div>
      </div>

      <!-- Induk Swakelola (Jika Merupakan Anak Paket Dalam Swakelola) -->
      <div v-if="selectedRow._has_swakelola_induk || selectedRow.kd_rup_swakelola" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Paket Induk Swakelola
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kode RUP Swakelola:</span> <span class="font-mono text-right ml-4">{{ selectedRow.kd_rup_swakelola || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Paket Swakelola:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.swakelola_nama || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Pagu Swakelola:</span> <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ formatRupiah(selectedRow.swakelola_pagu) }}</span></div>
        </div>
      </div>

      <!-- Riwayat Kaji Ulang -->
      <div v-if="selectedRow._has_kaji_ulang" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-amber-300 dark:border-amber-900/50 space-y-3">
        <h3 class="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Riwayat Kaji Ulang RUP</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">{{ selectedRow.kaji_ulang_count }}x Kaji Ulang</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kaji Ulang Terakhir:</span> <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.kaji_ulang_terakhir) }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Jenis Revisi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.kaji_ulang_jenis_revisi || '-' }}</span></div>
          <div class="flex flex-col gap-1 md:col-span-2 pt-1">
            <span class="text-[color:hsl(var(--maz-muted))]">Alasan Terakhir Kaji Ulang:</span>
            <div class="font-medium bg-[color:hsl(var(--maz-background))] p-2.5 rounded border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))]">
              {{ selectedRow.kaji_ulang_alasan || '-' }}
            </div>
          </div>
        </div>
      </div>

    </div>
    <template #footer>
      <div class="flex justify-end w-full">
        <MazBtn @click="$emit('update:modelValue', false)" color="primary" size="sm">Tutup</MazBtn>
      </div>
    </template>
  </MazDialog>
</template>

<script setup>
const formatTextToList = (text) => {
  if (!text) return [];
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*•]\s*/, ''));
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const str = dateString.substring(0, 10);
  if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = str.split('-');
    return `${day}-${month}-${year}`;
  }
  if (str.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = str.split('-');
    return `${month}-${year}`;
  }
  return str;
};

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};
</script>
