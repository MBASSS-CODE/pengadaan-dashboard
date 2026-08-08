<template>
  <ClientOnly>
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col gap-4">
        <!-- Search Row -->
        <div class="w-full flex items-center gap-4">
          <div class="flex-grow">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
            <MazInput 
              v-model="searchQuery" 
              placeholder="Cari RUP, Satker, Nama Paket, PPK..." 
              size="sm"
              @update:model-value="onSearch"
              clearable
            >
              <template #left-icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </MazInput>
          </div>
          <div class="mt-5 flex gap-2">
            <MazBtn @click="exportModal = true" color="success" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </MazBtn>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Jenis Pengadaan</label>
            <MazSelect
              v-model="filterJenisPengadaan"
              :options="jenisPengadaanOptions"
              multiple
              size="sm"
              placeholder="Semua Jenis"
              @update:model-value="onFilterChange"
            />
          </div>
          
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode Pemilihan</label>
            <MazSelect
              v-model="filterMetodePengadaan"
              :options="metodePengadaanOptions"
              multiple
              size="sm"
              placeholder="Semua Metode"
              @update:model-value="onFilterChange"
            />
          </div>

          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Realisasi (Inaproc)</label>
            <MazSelect
              v-model="filterStatusRealisasi"
              :options="statusRealisasiOptions"
              multiple
              size="sm"
              placeholder="Semua Status"
              @update:model-value="onFilterChange"
            />
          </div>

          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Sumber Dana</label>
            <MazSelect
              v-model="filterSumberDana"
              :options="sumberDanaOptions"
              multiple
              size="sm"
              placeholder="Semua Sumber"
              @update:model-value="onFilterChange"
            />
          </div>

          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pejabat Pembuat Komitmen (PPK)</label>
            <MazSelect
              v-model="filterPpk"
              :options="ppkOptions"
              multiple
              search
              size="sm"
              placeholder="Semua PPK"
              @update:model-value="onFilterChange"
            />
          </div>

          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Pengumuman RUP</label>
            <MazSelect
              v-model="filterUmumkan"
              :options="filterOptionsUmumkan"
              size="sm"
              placeholder="Semua Status"
              @update:model-value="onFilterChange"
            />
          </div>

          <div class="w-full flex items-center justify-between pb-1 text-xs text-[color:hsl(var(--maz-muted))]">
            <span>Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</strong> data</span>
            <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="danger" size="sm" outline class="h-[32px]">
              Reset
            </MazBtn>
          </div>
        </div>
      </div>

      <!-- Empty State Banner (No Data merged) -->
      <div v-if="!loading && !error && (totalAllItems === 0 && !hasActiveFilters && searchQuery === '')" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-1">Data Belum Di-merge</h2>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-4 max-w-md mx-auto">Tidak ada data hasil merge untuk tahun {{ selectedYear }}. Silakan jalankan proses "Integrasi Data" melalui akses Admin terlebih dahulu.</p>
        <NuxtLink to="/admin/data-merge">
          <MazBtn color="primary" size="sm">Buka Kelola Merge Data</MazBtn>
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData()" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- Data Table (Crash-Free Native Vue Table) -->
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
              <th class="py-3 px-4 text-center w-16">No</th>
              <th class="py-3 px-4 min-w-[300px]">Informasi RUP & Spesifikasi</th>
              <th class="py-3 px-4 min-w-[280px]">Integrasi Realisasi (Inaproc)</th>
              <th class="py-3 px-4 min-w-[220px]">Anggaran & Pelaksanaan</th>
              <th class="py-3 px-4 min-w-[250px]">Profil PPK & Satker</th>
              <th class="py-3 px-4 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))] text-sm">
            <tr v-if="loading" class="text-center">
              <td colspan="6" class="py-12 text-[color:hsl(var(--maz-muted))]">
                <div class="flex items-center justify-center gap-2">
                  <span class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></span>
                  <span>Memuat data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="pageData.length === 0" class="text-center">
              <td colspan="6" class="py-12 text-[color:hsl(var(--maz-muted))]">
                Tidak ada data yang sesuai filter / kriteria.
              </td>
            </tr>
            <tr 
              v-else
              v-for="(row, idx) in pageData" 
              :key="row.kd_rup || row._index || idx"
              class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
            >
              <!-- Cell Index -->
              <td class="py-3 px-4 text-center font-medium">
                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
              </td>

              <!-- Cell Paket -->
              <td class="py-3 px-4">
                <div class="font-bold text-[color:hsl(var(--maz-primary))]">
                  {{ row.nama_paket || '-' }}
                </div>
                <div class="flex items-center gap-2 mt-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium text-[color:hsl(var(--maz-foreground))] border border-[color:hsl(var(--maz-border))]">
                    RUP: {{ row.kd_rup }}
                  </span>
                  <span v-if="row.status_aktif_rup" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Aktif
                  </span>
                  <span v-if="row.status_umumkan_rup === 'Sudah' || row.status_umumkan_rup === 'Terumumkan'" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Terumumkan
                  </span>
                </div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1.5 flex flex-wrap gap-2">
                  <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.metode_pengadaan }}</span>
                  <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.jenis_pengadaan }}</span>
                  
                  <span v-if="row.status_pdn" class="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-semibold" title="Produk Dalam Negeri">{{ row.status_pdn }}</span>
                  <span v-if="row.status_ukm" class="px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 font-semibold" title="Usaha Kecil/Mikro">{{ row.status_ukm }}</span>
                </div>
                
                <div v-if="row._has_kaji_ulang" class="mt-2 text-[10px] text-blue-600 dark:text-amber-400 flex items-center">
                  ⚠️ Pernah Kaji Ulang ({{ row.kaji_ulang_count }}x) - Tipe: {{ row.kaji_ulang_jenis_revisi }}
                </div>
              </td>

              <!-- Cell Realisasi -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-1.5">
                  <div v-if="row._has_realisasi" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-bold text-xs text-green-800 dark:text-green-300 line-clamp-1" :title="row.realisasi_nama_paket || 'Realisasi Inaproc'">
                        {{ row.realisasi_nama_paket || 'Realisasi Inaproc' }}
                      </span>
                      <span v-if="row.realisasi_kd_paket" class="text-[9px] font-mono bg-green-200/60 text-green-800 dark:bg-green-800 dark:text-green-200 px-1.5 py-0.5 rounded border border-green-300 dark:border-green-700">
                        ID: {{ row.realisasi_kd_paket }}
                      </span>
                    </div>
                    
                    <div class="flex flex-col gap-1.5 mb-1 mt-2 border-t border-green-200/50 dark:border-green-800/50 pt-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] text-green-600/80 dark:text-green-400/80 font-medium">Status Realisasi:</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                          :class="{
                            'bg-green-100 text-green-800 border border-green-200': row.realisasi_status === 'Selesai',
                            'bg-amber-100 text-amber-800 border border-amber-200': row.realisasi_status === 'Berlangsung'
                          }"
                        >
                          {{ row.realisasi_status || '-' }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] text-green-600/80 dark:text-green-400/80 font-medium">Metode:</span>
                        <span class="font-bold text-green-700 dark:text-green-400 text-[10px]">{{ row.realisasi_metode || '-' }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else-if="row._has_epurchasing" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-bold text-xs text-blue-800 dark:text-blue-300">
                        E-Purchasing
                      </span>
                      <span class="text-[9px] font-mono bg-blue-200/60 text-blue-800 dark:bg-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded border border-blue-300 dark:border-blue-700">
                        ID: {{ row.epurchasing_detail?.order_id }}
                      </span>
                    </div>
                    
                    <div class="flex flex-col gap-1.5 mb-2 mt-2 border-t border-blue-200/50 dark:border-blue-800/50 pt-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] text-blue-600/80 dark:text-blue-400/80 font-medium">Status Pesanan:</span>
                        <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                          :class="{
                            'bg-blue-100 text-blue-800 border border-blue-200': row.epurchasing_detail?.status === 'COMPLETED' || row.epurchasing_detail?.status === 'DONE',
                            'bg-amber-100 text-amber-800 border border-amber-200': row.epurchasing_detail?.status !== 'COMPLETED' && row.epurchasing_detail?.status !== 'DONE'
                          }"
                        >
                          {{ row.epurchasing_detail?.status }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-[9px] text-blue-600/80 dark:text-blue-400/80 font-medium">Total Nilai:</span>
                        <span class="font-bold text-blue-700 dark:text-blue-400 text-xs">{{ formatRupiah(row.epurchasing_detail?.total || 0) }}</span>
                      </div>
                    </div>
                    
                    <div v-if="row.penyedia_detail" class="border-t border-blue-200 dark:border-blue-800/50 pt-2 mt-1">
                      <div class="text-[9px] text-blue-600/80 dark:text-blue-400/80 mb-0.5 font-medium">Penyedia:</div>
                      <div class="font-bold text-[10px] text-blue-900 dark:text-blue-200 flex items-start justify-between gap-2">
                        <span class="line-clamp-2 leading-tight" :title="row.penyedia_detail.nama_penyedia">{{ row.penyedia_detail.nama_penyedia || 'Penyedia Tidak Diketahui' }}</span>
                        <span v-if="row.penyedia_detail.status_umkk !== undefined" class="text-[9px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-sm shrink-0">
                          {{ row.penyedia_detail.status_umkk === 1 ? 'UMKK' : 'Non-UMKK' }}
                        </span>
                      </div>
                      <div class="text-[10px] text-blue-600/90 dark:text-blue-400/90 mt-1 font-mono tracking-tight">
                        NPWP: {{ row.penyedia_detail.npwp || '-' }}
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-[10px] text-amber-600 dark:text-amber-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Belum ada realisasi e-katalog/tender
                  </div>
                </div>
              </td>

              <!-- Cell Pelaksanaan -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col items-start border-b border-[color:hsl(var(--maz-border))] pb-2">
                    <span class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Pagu Anggaran RUP</span>
                    <span class="font-bold text-sm text-[color:hsl(var(--maz-primary))]">{{ formatRupiah(row.pagu) }}</span>
                    <div v-if="row.sumber_dana_list" class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">
                      Sumber: <span class="font-medium">{{ row.sumber_dana_list }}</span>
                    </div>
                  </div>
                  
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))]">
                    <div class="font-medium mb-0.5 text-[color:hsl(var(--maz-foreground))]">Jadwal Pemilihan:</div>
                    <div>{{ row.tgl_awal_pemilihan || '-' }} s/d {{ row.tgl_akhir_pemilihan || '-' }}</div>
                    <div class="mt-1 font-medium text-[color:hsl(var(--maz-foreground))]">Jadwal Kontrak:</div>
                    <div>{{ row.tgl_awal_kontrak ? row.tgl_awal_kontrak.substring(0,10) : '-' }} s/d {{ row.tgl_akhir_kontrak ? row.tgl_akhir_kontrak.substring(0,10) : '-' }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Cell Entitas -->
              <td class="py-3 px-4">
                <div class="mb-3">
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-1">Pejabat Pembuat Komitmen</div>
                  <div v-if="row._ppk_completed" class="flex flex-col">
                    <div class="font-bold text-xs text-[color:hsl(var(--maz-foreground))] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      {{ row.ppk_nama_lengkap }}
                    </div>
                    <div class="text-[10px] text-[color:hsl(var(--maz-muted))] font-mono mt-0.5">{{ row.ppk_nip_asli }}</div>
                  </div>
                  <div v-else class="text-xs flex flex-col">
                    <span class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ row.nama_ppk }}</span>
                    <span class="text-[10px] text-amber-600 dark:text-amber-500">⚠️ Masked: {{ row.nip_ppk }}</span>
                  </div>
                </div>
                
                <div class="border-t border-[color:hsl(var(--maz-border))] pt-2 mt-2">
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-1">Satuan Kerja</div>
                  <div class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] max-w-[250px] truncate" :title="row.nama_satker">
                    {{ row.nama_satker }}
                  </div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">Kode: {{ row.kd_satker }}</div>
                </div>
              </td>

              <!-- Cell Aksi -->
              <td class="py-3 px-4 text-center">
                <MazBtn size="mini" color="info" outline @click="openDetail(row)" title="Lihat Detail RUP">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </MazBtn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls Bar -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[color:hsl(var(--maz-muted))]">
        <div>
          Menampilkan <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span>
          sampai <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
          dari <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ totalItems }}</span> data
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span>Per halaman:</span>
            <select v-model="itemsPerPage" class="px-2 py-1 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded text-xs focus:outline-none" @change="onFilterChange()">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          
          <div class="flex gap-2">
            <MazBtn size="sm" outline :disabled="currentPage === 1 || loading" @click="currentPage--; loadData()">Sebelumnya</MazBtn>
            <MazBtn size="sm" outline :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage) || loading" @click="currentPage++; loadData()">Selanjutnya</MazBtn>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data RUP Penyedia Enriched untuk Tahun Anggaran {{ props.selectedYear }}:
        </p>
        
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data yang tampil pada tabel saat ini berdasarkan pencarian dan filter yang aktif (estimasi: {{ totalItems }} data).</div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ props.selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data master untuk tahun anggaran {{ props.selectedYear }} tanpa filter apapun.</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <MazBtn @click="exportModal = false" color="transparent" size="sm">Batal</MazBtn>
          <MazBtn @click="executeExport" :loading="exportLoading" color="success" size="sm">Download Excel</MazBtn>
        </div>
      </template>
    </MazDialog>

    <!-- Detail Dialog RUP Penyedia Enriched -->
    <MazDialog v-model="isDetailOpen" :title="`Detail RUP Penyedia: ${selectedRow?.kd_rup || ''}`" max-width="1000px">
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
                <span class="font-medium text-right ml-4">{{ selectedRow.tgl_awal_pemilihan || '-' }} s/d {{ selectedRow.tgl_akhir_pemilihan || '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Jadwal Kontrak:</span>
                <span class="font-medium text-right ml-4">{{ selectedRow.tgl_awal_kontrak ? selectedRow.tgl_awal_kontrak.substring(0,10) : '-' }} s/d {{ selectedRow.tgl_akhir_kontrak ? selectedRow.tgl_akhir_kontrak.substring(0,10) : '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Jadwal Pemanfaatan:</span>
                <span class="font-medium text-right ml-4">{{ selectedRow.tgl_awal_pemanfaatan || '-' }} s/d {{ selectedRow.tgl_akhir_pemanfaatan || '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Buat Paket:</span>
                <span class="font-medium text-right ml-4">{{ selectedRow.tgl_buat_paket ? selectedRow.tgl_buat_paket.substring(0,10) : '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Pengumuman:</span>
                <span class="font-medium text-right ml-4">{{ selectedRow.tgl_pengumuman_paket ? selectedRow.tgl_pengumuman_paket.substring(0,10) : '-' }}</span>
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
              <div class="font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider text-[10px]">Uraian Pekerjaan</div>
              <div class="p-3 bg-[color:hsl(var(--maz-background))] rounded border border-[color:hsl(var(--maz-border))] max-h-36 overflow-y-auto whitespace-pre-line text-[color:hsl(var(--maz-foreground))]">
                {{ selectedRow.uraian_pekerjaan || selectedRow.urarian_pekerjaan || 'Tidak ada data uraian pekerjaan.' }}
              </div>
            </div>
            <div>
              <div class="font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider text-[10px]">Spesifikasi Pekerjaan</div>
              <div class="p-3 bg-[color:hsl(var(--maz-background))] rounded border border-[color:hsl(var(--maz-border))] max-h-36 overflow-y-auto whitespace-pre-line text-[color:hsl(var(--maz-foreground))]">
                {{ selectedRow.spesifikasi_pekerjaan || 'Tidak ada data spesifikasi pekerjaan.' }}
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
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tanggal Mulai Realisasi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.realisasi_tgl_mulai || '-' }}</span></div>
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
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kaji Ulang Terakhir:</span> <span class="font-medium text-right ml-4">{{ selectedRow.kaji_ulang_terakhir || '-' }}</span></div>
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
          <MazBtn @click="isDetailOpen = false" color="primary" size="sm">Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { utils, writeFile } from 'xlsx';

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  }
});

// ─── Filter State ───────────────────────────────────────────
const searchQuery = ref('');
let searchTimeout = null;

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 500);
};

const showFilters = ref(false);
const filterJenisPengadaan = ref(null);
const filterMetodePengadaan = ref(null);
const filterStatusRealisasi = ref(null);
const filterSumberDana = ref(null);
const filterPpk = ref(null);
const ppkOptions = ref([]);
const filterUmumkan = ref('ALL');
const filterOptionsUmumkan = ref([]);

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
    (filterJenisPengadaan.value && filterJenisPengadaan.value.length > 0) ||
    (filterMetodePengadaan.value && filterMetodePengadaan.value.length > 0) ||
    (filterStatusRealisasi.value && filterStatusRealisasi.value.length > 0) ||
    (filterSumberDana.value && filterSumberDana.value.length > 0) ||
    (filterPpk.value && filterPpk.value.length > 0) ||
    filterUmumkan.value !== 'ALL';
});

const onFilterChange = () => {
  currentPage.value = 1;
  loadData();
};

const resetFilters = () => {
  searchQuery.value = '';
  filterJenisPengadaan.value = null;
  filterMetodePengadaan.value = null;
  filterStatusRealisasi.value = null;
  filterSumberDana.value = null;
  filterPpk.value = null;
  filterUmumkan.value = 'ALL';
  onFilterChange();
};

const jenisPengadaanOptions = [
  { label: 'Barang', value: 'Barang' },
  { label: 'Pekerjaan Konstruksi', value: 'Pekerjaan Konstruksi' },
  { label: 'Jasa Konsultansi Badan Usaha Konstruksi', value: 'Jasa Konsultansi Badan Usaha Konstruksi' },
  { label: 'Jasa Konsultansi Perorangan Non Konstruksi', value: 'Jasa Konsultansi Perorangan Non Konstruksi' },
  { label: 'Jasa Konsultansi Badan Usaha Non Konstruksi', value: 'Jasa Konsultansi Badan Usaha Non Konstruksi' },
  { label: 'Jasa Lainnya', value: 'Jasa Lainnya' }
];

const metodePengadaanOptions = [
  { label: 'Tender', value: 'Tender' },
  { label: 'E-Purchasing', value: 'E-Purchasing' },
  { label: 'Pengadaan Langsung', value: 'Pengadaan Langsung' },
  { label: 'Penunjukan Langsung', value: 'Penunjukan Langsung' },
  { label: 'Tender Cepat', value: 'Tender Cepat' }
];

const statusRealisasiOptions = [
  { label: 'Selesai', value: 'Selesai' },
  { label: 'Berlangsung', value: 'Berlangsung' },
  { label: 'Persiapan', value: 'Persiapan' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' }
];

const sumberDanaOptions = [
  { label: 'APBN', value: 'APBN' },
  { label: 'APBD', value: 'APBD' },
  { label: 'BLU', value: 'BLU' },
  { label: 'PNBP', value: 'PNBP' }
];

const loading = ref(true);
const error = ref(false);

const pageData = ref([]);
const totalItems = ref(0);
const totalPagu = ref(0);
const realisasiCount = ref(0);
const ppkCount = ref(0);

const currentPage = ref(1);
const itemsPerPage = ref(50);

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/summary-table/rup-penyedia-enriched', {
      params: {
        tahun: props.selectedYear,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        jenisPengadaan: filterJenisPengadaan.value ? filterJenisPengadaan.value.join(',') : undefined,
        metodePengadaan: filterMetodePengadaan.value ? filterMetodePengadaan.value.join(',') : undefined,
        statusRealisasi: filterStatusRealisasi.value ? filterStatusRealisasi.value.join(',') : undefined,
        sumberDana: filterSumberDana.value ? filterSumberDana.value.join(',') : undefined,
        ppk: filterPpk.value ? filterPpk.value.join(',') : undefined,
        statusUmumkan: filterUmumkan.value !== 'ALL' ? filterUmumkan.value : undefined
      }
    });

    if (res.success) {
      pageData.value = res.data.map((item, index) => ({
        ...item,
        _index: index
      }));
      totalItems.value = res.meta.totalItems;

      if (res.filterOptions && res.filterOptions.namaPpk) {
        ppkOptions.value = res.filterOptions.namaPpk.map(opt => ({ label: opt, value: opt }));
      }
      
      if (res.filterOptions && res.filterOptions.statusUmumkan) {
        filterOptionsUmumkan.value = res.filterOptions.statusUmumkan;
      }
      
      // Hitung agregasi jika ini halaman pertama
      if (currentPage.value === 1 && res.meta) {
        totalPagu.value = res.meta.totalPagu || 0;
        realisasiCount.value = res.meta.realisasiCount || 0;
        ppkCount.value = res.meta.ppkCount || 0;
      }
    } else {
      error.value = true;
      pageData.value = [];
      totalItems.value = 0;
    }
  } catch (err) {
    console.error('Gagal fetch data RUP Penyedia Enriched:', err);
    error.value = true;
    pageData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};

watch(() => props.selectedYear, () => {
  currentPage.value = 1;
  loadData();
});

// ─── Detail Modal State ─────────────────────────────────────
const isDetailOpen = ref(false);
const selectedRow = ref(null);

const openDetail = (row) => {
  selectedRow.value = row;
  isDetailOpen.value = true;
};

// ─── Export Logic ───────────────────────────────────────────
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      tahun: props.selectedYear,
      page: 1,
      limit: 100000 // limit besar untuk mengambil seluruh data
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) params.search = searchQuery.value;
      if (filterJenisPengadaan.value) params.jenisPengadaan = filterJenisPengadaan.value.join(',');
      if (filterMetodePengadaan.value) params.metodePengadaan = filterMetodePengadaan.value.join(',');
      if (filterStatusRealisasi.value) params.statusRealisasi = filterStatusRealisasi.value.join(',');
      if (filterSumberDana.value) params.sumberDana = filterSumberDana.value.join(',');
      if (filterPpk.value) params.ppk = filterPpk.value.join(',');
      if (filterUmumkan.value !== 'ALL') params.statusUmumkan = filterUmumkan.value;
    }

    const res = await $fetch('/api/summary-table/rup-penyedia-enriched', { params });

    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Kode RUP': row.kd_rup,
        'Nama Paket': row.nama_paket,
        'Pagu (Rp)': row.pagu,
        'Metode Pengadaan': row.metode_pengadaan,
        'Jenis Pengadaan': row.jenis_pengadaan,
        'Sumber Dana': row.sumber_dana_list || '-',
        'Nama PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Status Aktif': row.status_aktif_rup ? 'Aktif' : 'Non-Aktif',
        'Status Umumkan': row.status_umumkan_rup || '-',
        'Status Realisasi': row.realisasi_status || '-',
        'HPS Realisasi (Rp)': row.realisasi_hps || 0,
        'Metode Realisasi': row.realisasi_metode || '-',
        'PDN': row.status_pdn || '-',
        'UKM': row.status_ukm || '-',
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "RUP Penyedia");

      const wscols = [
        {wch: 5}, {wch: 15}, {wch: 40}, {wch: 15}, {wch: 20}, {wch: 20},
        {wch: 15}, {wch: 30}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15},
        {wch: 15}, {wch: 15}, {wch: 10}, {wch: 10}
      ];
      ws['!cols'] = wscols;

      const filename = `RUP_Penyedia_Enriched_${props.selectedYear}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
      writeFile(wb, filename);
      exportModal.value = false;
    }
  } catch (err) {
    console.error('Failed to export:', err);
    alert('Gagal melakukan ekspor data. Silakan coba lagi.');
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
