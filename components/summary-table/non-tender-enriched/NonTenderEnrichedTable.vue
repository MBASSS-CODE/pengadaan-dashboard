<template>
  <div class="w-full">
    <!-- ClientOnly wrapper to prevent SSR Hydration Style Mismatches from MazUI dynamic CSS variables & extensions -->
    <ClientOnly>
      <!-- Main Content Card -->
      <div class="flex flex-col gap-4">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Non-Tender</div>
            <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
              {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Terintegrasi RUP</div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ loading ? '...' : rupMatchedCount.toLocaleString('id-ID') }}
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total HPS (Rp)</div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ loading ? '...' : formatRupiah(totalHps) }}
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">PPK Tervalidasi</div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ loading ? '...' : ppkCompletedCount.toLocaleString('id-ID') }}
            </div>
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
        
        <!-- Search/Filter Bar -->
        <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col gap-4">
          <!-- Search Row -->
          <div class="w-full flex items-center gap-4">
            <div class="flex-grow">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
              <MazInput 
                v-model="searchQuery" 
                placeholder="Cari paket, PPK, satker, kode..." 
                size="sm"
                @update:model-value="onSearchDebounced"
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
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status (Inaproc)</label>
              <MazSelect v-model="filterStatusNontender" :options="statusOptions" size="sm" @update:model-value="onFilterChange" />
            </div>
            
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode</label>
              <MazSelect v-model="filterMetode" :options="metodeOptions" size="sm" @update:model-value="onFilterChange" />
            </div>

            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Satuan Kerja</label>
              <MazSelect v-model="filterSatker" :options="satkerOptions" size="sm" search @update:model-value="onFilterChange" />
            </div>
            
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Nama PPK</label>
              <MazSelect v-model="filterNamaPpk" :options="ppkOptions" size="sm" search @update:model-value="onFilterChange" />
            </div>
            
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status RUP</label>
              <MazSelect v-model="filterRupMatch" :options="rupMatchOptions" size="sm" @update:model-value="onFilterChange" />
            </div>

            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status PPK</label>
              <MazSelect v-model="filterPpkComplete" :options="ppkCompleteOptions" size="sm" @update:model-value="onFilterChange" />
            </div>
          </div>
        </div>

        <!-- Empty State Banner (No Data merged) -->
        <div v-if="!loading && !error && totalAllItems === 0" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-1">Data Belum Di-merge</h2>
          <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-4 max-w-md mx-auto">Tidak ada data hasil merge untuk tahun {{ selectedYear }}. Silakan jalankan proses "Integrasi Data" melalui akses Admin terlebih dahulu.</p>
          <NuxtLink to="/admin/system">
            <MazBtn color="primary" size="sm">Buka Akses Admin</MazBtn>
          </NuxtLink>
        </div>

        <!-- Error State Banner -->
        <div v-if="error" class="flex flex-col items-center justify-center py-12 text-[color:hsl(var(--maz-destructive))] border-b border-[color:hsl(var(--maz-border))]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="font-medium text-sm">Gagal memuat data dari server.</p>
          <MazBtn @click="loadData()" size="sm" outline class="mt-3">Coba Lagi</MazBtn>
        </div>

        <!-- MazTable Data Table (Permanently Mounted & Crash-Free) -->
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
                <th class="py-3 px-4 text-center w-16">No</th>
                <th class="py-3 px-4 min-w-[280px]">Informasi Paket (Non-Tender)</th>
                <th class="py-3 px-4 min-w-[200px]">Integrasi PPK</th>
                <th class="py-3 px-4 min-w-[220px]">Integrasi RUP & Satker</th>
                <th class="py-3 px-4 text-right min-w-[150px]">Pagu & HPS (Rp)</th>
                <th class="py-3 px-4 text-center w-16">Aksi</th>
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
                :key="row.kd_nontender || row._index || idx"
                class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
              >
                <!-- Cell Index -->
                <td class="py-3 px-4 text-center font-medium">
                  {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>

                <!-- Cell Paket -->
                <td class="py-3 px-4">
                  <div class="font-bold text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer" :title="row.nama_paket" @click="row.url_lpse ? openUrl(row.url_lpse) : null">
                    {{ row.nama_paket || '-' }}
                  </div>
                  <div class="flex items-center gap-2 mt-2 flex-wrap">
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium text-[color:hsl(var(--maz-foreground))] border border-[color:hsl(var(--maz-border))]">
                      RUP: {{ row.kd_rup }}
                    </span>
                    <span v-if="row.status_nontender" 
                      class="px-2 py-0.5 rounded text-[10px] font-semibold border"
                      :class="{
                        'bg-[#8cc63f] text-gray-900 border-[#8cc63f]': row.status_nontender === 'Selesai',
                        'bg-[#fbbd08] text-gray-900 border-[#fbbd08]': row.status_nontender === 'Berlangsung',
                        'bg-[#17a2b8] text-white border-[#17a2b8]': ['Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(row.status_nontender),
                        'bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border-[color:hsl(var(--maz-border))]': !['Selesai', 'Berlangsung', 'Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(row.status_nontender)
                      }"
                    >
                      {{ row.status_nontender }}
                    </span>
                  </div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1.5 flex flex-wrap gap-2">
                    <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.mtd_pemilihan }}</span>
                    <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.jenis_pengadaan }}</span>
                    <template v-if="row._rup_matched">
                      <span v-if="row.rup_status_pdn" class="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-semibold" title="Produk Dalam Negeri">{{ row.rup_status_pdn }}</span>
                      <span v-if="row.rup_status_ukm" class="px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 font-semibold" title="Usaha Kecil/Mikro">{{ row.rup_status_ukm }}</span>
                    </template>
                  </div>
                </td>

                <!-- Cell PPK -->
                <td class="py-3 px-4">
                  <div v-if="row._ppk_completed">
                    <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))] flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      {{ row.ppk_nama_lengkap }}
                    </div>
                    <div v-if="row.ppk_nip_asli" class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 font-mono">NIP: {{ row.ppk_nip_asli }}</div>
                    <div v-if="row.ppk_jabatan" class="text-xs text-[color:hsl(var(--maz-muted))] mt-0.5">{{ row.ppk_jabatan }}</div>
                  </div>
                  <div v-else class="text-amber-600 dark:text-amber-500 text-xs">
                    <div class="font-bold flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Data Belum Lengkap
                    </div>
                    <div class="font-mono text-[10px]">{{ row.nip_nama_ppk }}</div>
                  </div>
                </td>

                <!-- Cell RUP & Satker -->
                <td class="py-3 px-4">
                  <div v-if="row._rup_matched" class="mb-2">
                    <div class="text-xs text-[color:hsl(var(--maz-muted))] flex items-center mb-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                      Ditemukan di Sirup
                    </div>
                    <div class="flex gap-1 mb-1">
                      <span v-if="row.rup_status_aktif" class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full text-center border border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Aktif</span>
                      <span v-if="row.rup_status_umumkan === 'Sudah' || row.rup_status_umumkan === 'Terumumkan'" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Terumumkan</span>
                    </div>
                    <div v-if="row.rup_tgl_awal_pemilihan || row.rup_tgl_akhir_kontrak" class="mt-1.5 border-t border-[color:hsl(var(--maz-border))] pt-1.5">
                      <div class="text-[10px] text-[color:hsl(var(--maz-muted))] grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                        <span class="font-medium">Mulai Pemilihan:</span> <span>{{ row.rup_tgl_awal_pemilihan || '-' }}</span>
                        <span class="font-medium">Akhir Kontrak:</span> <span>{{ row.rup_tgl_akhir_kontrak ? row.rup_tgl_akhir_kontrak.substring(0, 10) : '-' }}</span>
                      </div>
                    </div>
                    <div v-if="row._has_kaji_ulang" class="mt-1 text-[10px] text-blue-600 dark:text-amber-400">
                      ⚠️ {{ row.kaji_ulang_count }}x Kaji Ulang ({{ row.kaji_ulang_jenis_revisi }})
                    </div>
                  </div>
                  <div v-else class="mb-2">
                    <div class="text-xs text-red-500 flex items-center mb-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                      TIDAK Ditemukan di Sirup
                    </div>
                  </div>

                  <!-- Satker info -->
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] border-t border-[color:hsl(var(--maz-border))] pt-1 mt-1 truncate max-w-[220px]" :title="row.nama_satker">
                    <span class="font-semibold">{{ row.kd_satker }}</span> - {{ row.nama_satker }}
                  </div>
                </td>

                <!-- Cell Nilai -->
                <td class="py-3 px-4 text-right">
                  <div class="flex flex-col items-end">
                    <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">HPS (Non-Tender)</div>
                    <div class="font-bold text-sm text-[color:hsl(var(--maz-primary))]">{{ formatRupiah(row.hps) }}</div>
                    
                    <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mt-1.5">Pagu (Sirup)</div>
                    <div class="font-semibold text-xs text-[color:hsl(var(--maz-foreground))]">
                      <span v-if="row._rup_matched">{{ formatRupiah(row.rup_pagu) }}</span>
                      <span v-else class="text-red-500">-</span>
                    </div>
                    
                    <!-- Indicator beda harga -->
                    <div v-if="row._rup_matched && row.hps && row.rup_pagu && row.hps !== row.rup_pagu" class="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5 text-right leading-tight">
                      Selisih: {{ formatRupiah(Math.abs(row.hps - row.rup_pagu)) }}
                    </div>
                  </div>
                </td>

                <!-- Cell Aksi -->
                <td class="py-3 px-4 text-center align-middle">
                  <MazBtn size="mini" color="info" outline @click="openDetail(row)" title="Lihat Detail Non-Tender">
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
              <MazBtn size="sm" outline :disabled="currentPage >= totalPages || loading" @click="currentPage++; loadData()">Selanjutnya</MazBtn>
            </div>
          </div>
        </div>

        <!-- Detail Modal Non-Tender Enriched -->
        <MazDialog v-model="detailModal" :title="`Detail Non-Tender: ${selectedRow?.kd_nontender || ''}`" max-width="1000px">
          <div v-if="selectedRow" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
            
            <!-- Summary Financial Bar (4 Cards Top) -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
                <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium">Pagu (Sirup)</span>
                <span class="text-base font-bold text-[color:hsl(var(--maz-primary))] mt-1">
                  {{ selectedRow.rup_pagu ? formatRupiah(selectedRow.rup_pagu) : 'Rp 0' }}
                </span>
              </div>
              <div class="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col justify-between">
                <span class="text-xs text-emerald-700 dark:text-emerald-400 font-medium">HPS (Non-Tender)</span>
                <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {{ formatRupiah(selectedRow.hps) }}
                </span>
              </div>
              <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
                <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium">Selisih Pagu & HPS</span>
                <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))] mt-1">
                  {{ formatRupiah(Math.abs((selectedRow.rup_pagu || 0) - (selectedRow.hps || 0))) }}
                </span>
              </div>
              <div class="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between">
                <span class="text-xs text-blue-700 dark:text-blue-400 font-medium">Status Integrasi RUP</span>
                <span class="text-base font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                  <span v-if="selectedRow._rup_matched" class="text-green-600 dark:text-green-400">✓ Ditemukan</span>
                  <span v-else class="text-red-600 dark:text-red-400">✗ Tidak Ada</span>
                </span>
              </div>
            </div>

            <!-- Grid 1: Informasi Utama & Satker/PPK -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Card Informasi Paket -->
              <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
                <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Informasi Paket Non-Tender
                </h3>
                <div class="space-y-2 text-xs">
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket:</span>
                    <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">ID Non-Tender / RUP:</span>
                    <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_nontender || '-' }} / {{ selectedRow.kd_rup || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Metode Pemilihan:</span>
                    <span class="font-semibold text-right ml-4">{{ selectedRow.mtd_pemilihan || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jenis Pengadaan:</span>
                    <span class="font-medium text-right ml-4">{{ selectedRow.jenis_pengadaan || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Status LPSE:</span>
                    <span class="font-bold text-right ml-4" :class="{
                      'text-[#8cc63f]': selectedRow.status_nontender === 'Selesai',
                      'text-[#fbbd08]': selectedRow.status_nontender === 'Berlangsung',
                      'text-[#17a2b8]': ['Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(selectedRow.status_nontender)
                    }">
                      {{ selectedRow.status_nontender || '-' }}
                    </span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Tanggal Buat:</span>
                    <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_buat_paket) }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Link LPSE:</span>
                    <span class="font-medium text-right ml-4">
                      <a v-if="selectedRow.url_lpse" :href="selectedRow.url_lpse" target="_blank" class="text-blue-500 hover:underline">Buka LPSE</a>
                      <span v-else>-</span>
                    </span>
                  </div>
                  <div v-if="selectedRow.alasan_pembatalan" class="flex justify-between">
                    <span class="text-[color:hsl(var(--maz-destructive))] font-semibold shrink-0">Alasan Batal:</span>
                    <span class="font-medium text-[color:hsl(var(--maz-destructive))] text-right ml-4">{{ selectedRow.alasan_pembatalan }}</span>
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
                
                <!-- Satker -->
                <div class="space-y-2 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
                  <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Satuan Kerja</div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Satker:</span>
                    <span class="font-semibold text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Kode Satker:</span>
                    <span class="font-mono text-right ml-4">{{ selectedRow.kd_satker || '-' }}</span>
                  </div>
                </div>

                <!-- PPK -->
                <div class="space-y-2 text-xs pt-1">
                  <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))] flex items-center justify-between">
                    <span>Pejabat Pembuat Komitmen (PPK)</span>
                    <span v-if="selectedRow._ppk_completed" class="text-green-600 dark:text-green-400 font-normal">✓ Lengkap</span>
                    <span v-else class="text-amber-600 dark:text-amber-400 font-normal">⚠️ Belum Lengkap</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama PPK:</span>
                    <span class="font-bold text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nip_nama_ppk || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">NIP PPK:</span>
                    <span class="font-mono text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span>
                  </div>
                  <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jabatan PPK:</span>
                    <span class="font-medium text-right ml-4">{{ selectedRow.ppk_jabatan || '-' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Email / Telp:</span>
                    <span class="font-medium text-right ml-4">{{ [selectedRow.ppk_email, selectedRow.ppk_telepon].filter(Boolean).join(' / ') || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Detail Perencanaan (RUP) -->
            <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
              <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Detail Perencanaan (RUP Sirup)</span>
                </div>
                <span v-if="selectedRow.rup_status_aktif" class="px-2 py-0.5 text-[10px] rounded font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  RUP Aktif
                </span>
                <span v-else-if="selectedRow._rup_matched && !selectedRow.rup_status_aktif" class="px-2 py-0.5 text-[10px] rounded font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  RUP Tidak Aktif
                </span>
              </h3>
              
              <div v-if="selectedRow._rup_matched" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Pagu RUP Awal:</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400 text-right ml-4">{{ formatRupiah(selectedRow.rup_pagu) }}</span>
                </div>
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Metode (RUP):</span>
                  <span class="font-semibold text-right ml-4">{{ selectedRow.rup_metode_pengadaan || '-' }}</span>
                </div>
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jenis Pengadaan (RUP):</span>
                  <span class="font-semibold text-right ml-4">{{ selectedRow.rup_jenis_pengadaan || '-' }}</span>
                </div>
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Produk Dalam Negeri (PDN):</span>
                  <span class="font-medium text-right ml-4 text-blue-600 dark:text-blue-400">{{ selectedRow.rup_status_pdn || '-' }}</span>
                </div>
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Usaha Kecil/Mikro (UKM):</span>
                  <span class="font-medium text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ selectedRow.rup_status_ukm || '-' }}</span>
                </div>
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Mulai Pemilihan:</span>
                  <span class="font-medium text-right ml-4">{{ selectedRow.rup_tgl_awal_pemilihan || '-' }}</span>
                </div>
                <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Akhir Kontrak:</span>
                  <span class="font-medium text-right ml-4">{{ selectedRow.rup_tgl_akhir_kontrak ? selectedRow.rup_tgl_akhir_kontrak.substring(0, 10) : '-' }}</span>
                </div>
                <div v-if="selectedRow.rup_nama_paket" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1 col-span-1 md:col-span-2 mt-1">
                  <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket RUP:</span>
                  <span class="font-medium text-right ml-4">{{ selectedRow.rup_nama_paket }}</span>
                </div>
                
                <!-- History Kaji Ulang -->
                <div v-if="selectedRow._has_kaji_ulang" class="col-span-1 md:col-span-2 mt-3 p-3 rounded border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
                  <div class="font-semibold text-amber-700 dark:text-amber-500 mb-1 flex items-center gap-1">
                    ⚠️ Paket ini mengalami revisi kaji ulang
                  </div>
                  <div class="flex justify-between pb-1">
                    <span class="text-amber-700/80 dark:text-amber-500/80 shrink-0">Jumlah Kaji Ulang:</span>
                    <span class="font-bold text-amber-800 dark:text-amber-400">{{ selectedRow.kaji_ulang_count }} Kali</span>
                  </div>
                  <div class="flex justify-between pb-1">
                    <span class="text-amber-700/80 dark:text-amber-500/80 shrink-0">Revisi Terakhir:</span>
                    <span class="font-medium text-amber-800 dark:text-amber-400">{{ selectedRow.kaji_ulang_jenis_revisi }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic p-4 text-center border border-dashed border-[color:hsl(var(--maz-border))] rounded-lg">
                Data RUP tidak ditemukan. ID RUP ({{ selectedRow.kd_rup }}) tidak ada di data tarik Sirup, kemungkinan belum ditarik dari Sirup atau dihapus.
              </div>
            </div>
            
          </div>
          
          <template #footer>
            <div class="w-full flex justify-end">
              <MazBtn @click="detailModal = false" color="primary" size="sm">Tutup</MazBtn>
            </div>
          </template>
        </MazDialog>
      </div>

      <!-- Export Modal -->
      <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
        <div class="flex flex-col gap-4 py-2">
          <p class="text-sm text-[color:hsl(var(--maz-muted))]">
            Pilih mode ekspor data Non-Tender Enriched untuk Tahun Anggaran {{ selectedYear }}:
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
                  <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data Non-Tender untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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

      </div>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { utils, writeFile } from 'xlsx';

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const error = ref(false);
const detailModal = ref(false);
const selectedRow = ref(null);

// Data dari server (sudah dipaginasi)
const pageData = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const totalAllItems = ref(0);
const totalHps = ref(0);
const rupMatchedCount = ref(0);
const ppkCompletedCount = ref(0);

const searchQuery = ref('');

// Filters
const filterStatusNontender = ref('ALL');
const filterMetode = ref('ALL');
const filterSatker = ref('ALL');
const filterNamaPpk = ref('ALL');
const filterRupMatch = ref('ALL');
const filterPpkComplete = ref('ALL');

// Option lists
const statusOptions = ref([{ label: 'Semua Status', value: 'ALL' }]);
const metodeOptions = ref([{ label: 'Semua Metode', value: 'ALL' }]);
const satkerOptions = ref([{ label: 'Semua Satker', value: 'ALL' }]);
const ppkOptions = ref([{ label: 'Semua PPK', value: 'ALL' }]);
const rupMatchOptions = ref([
  { label: 'Semua Status', value: 'ALL' },
  { label: 'Ditemukan di RUP', value: 'true' },
  { label: 'Tidak Ditemukan', value: 'false' }
]);
const ppkCompleteOptions = ref([
  { label: 'Semua Status', value: 'ALL' },
  { label: 'PPK Lengkap', value: 'true' },
  { label: 'PPK Belum Lengkap', value: 'false' }
]);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce timer
let searchTimer = null;

const formatRupiah = (number) => {
  if (number === null || number === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const openDetail = (row) => {
  selectedRow.value = row;
  detailModal.value = true;
};

const openUrl = (url) => {
  if (url) {
    window.open(url, '_blank');
  }
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/merged/nontender-enriched', {
      params: { 
        tahun: props.selectedYear,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterStatusNontender: filterStatusNontender.value !== 'ALL' ? filterStatusNontender.value : undefined,
        filterMetode: filterMetode.value !== 'ALL' ? filterMetode.value : undefined,
        filterSatker: filterSatker.value !== 'ALL' ? filterSatker.value : undefined,
        filterNamaPpk: filterNamaPpk.value !== 'ALL' ? filterNamaPpk.value : undefined,
        filterRupMatch: filterRupMatch.value !== 'ALL' ? filterRupMatch.value : undefined,
        filterPpkComplete: filterPpkComplete.value !== 'ALL' ? filterPpkComplete.value : undefined,
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
    totalHps.value = response.meta?.totalHps || 0;
    rupMatchedCount.value = response.meta?.rupMatchedCount || 0;
    ppkCompletedCount.value = response.meta?.ppkCompletedCount || 0;
    
    if (response.filterOptions) {
      statusOptions.value = [
        { label: 'Semua Status', value: 'ALL' },
        ...(response.filterOptions.statusNontender || []).map(opt => ({ label: opt, value: opt }))
      ];
      metodeOptions.value = [
        { label: 'Semua Metode', value: 'ALL' },
        ...(response.filterOptions.metodePemilihan || []).map(opt => ({ label: opt, value: opt }))
      ];
      satkerOptions.value = [
        { label: 'Semua Satker', value: 'ALL' },
        ...(response.filterOptions.satker || []).map(opt => ({ label: opt, value: opt }))
      ];
      ppkOptions.value = [
        { label: 'Semua PPK', value: 'ALL' },
        ...(response.filterOptions.namaPpk || []).map(opt => ({ label: opt, value: opt }))
      ];
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// Ketika filter berubah, reset ke halaman 1 lalu fetch
const onFilterChange = () => {
  currentPage.value = 1;
  loadData();
};

// Debounce pencarian
const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    onFilterChange();
  }, 500);
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
      if (filterStatusNontender.value !== 'ALL') params.statusNontender = filterStatusNontender.value;
      if (filterMetode.value !== 'ALL') params.metode = filterMetode.value;
      if (filterSatker.value !== 'ALL') params.satker = filterSatker.value;
      if (filterNamaPpk.value !== 'ALL') params.namaPpk = filterNamaPpk.value;
      if (filterRupMatch.value !== 'ALL') params.rupMatch = filterRupMatch.value;
      if (filterPpkComplete.value !== 'ALL') params.ppkComplete = filterPpkComplete.value;
    }

    const res = await $fetch('/api/summary-table/non-tender-enriched', { params });

    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Kode RUP': row.kd_rup || '-',
        'Nama Paket': row.nama_paket || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Nama PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'HPS (Rp)': row.hps || 0,
        'Metode Pemilihan': row.mtd_pemilihan || '-',
        'Jenis Pengadaan': row.jenis_pengadaan || '-',
        'Status Inaproc': row.status_nontender || '-',
        'Status RUP Match': row._rup_matched ? 'Match' : 'Not Match',
        'Status PPK Lengkap': row._ppk_completed ? 'Lengkap' : 'Tidak Lengkap',
        'Pagu Sirup (Rp)': row.rup_pagu || 0,
        'Tanggal Mulai': row.tgl_mulai_nontender || '-',
        'Tanggal Selesai': row.tgl_selesai_nontender || '-',
        'Status PDN (RUP)': row.rup_status_pdn || '-',
        'Status UKM (RUP)': row.rup_status_ukm || '-',
        'Pernah Kaji Ulang': row._has_kaji_ulang ? 'Ya' : 'Tidak'
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Non Tender");

      const wscols = [
        {wch: 5}, {wch: 15}, {wch: 40}, {wch: 30}, {wch: 30}, {wch: 15},
        {wch: 20}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15},
        {wch: 15}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 10}
      ];
      ws['!cols'] = wscols;

      const filename = `Non_Tender_Enriched_${props.selectedYear}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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

// Initial load
onMounted(() => {
  loadData();
});

watch(() => props.selectedYear, () => {
  currentPage.value = 1;
  loadData();
});
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
