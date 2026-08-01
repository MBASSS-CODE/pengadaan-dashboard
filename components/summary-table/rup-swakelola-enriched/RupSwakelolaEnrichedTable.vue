<template>
  <ClientOnly>
    <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
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
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Tipe Swakelola</label>
            <MazSelect
              v-model="filterTipeSwakelola"
              :options="tipeSwakelolaOptions"
              multiple
              size="sm"
              placeholder="Semua Tipe"
              @update:model-value="onFilterChange"
            />
          </div>
          
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Pelaksanaan</label>
            <MazSelect
              v-model="filterStatusPelaksanaan"
              :options="statusPelaksanaanOptions"
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
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Nama PPK</label>
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
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Umumkan</label>
            <MazSelect
              v-model="filterUmumkan"
              :options="[{label: 'Semua Status', value: 'ALL'}, ...filterOptionsUmumkan.map(u => ({label: u, value: u}))]"
              size="sm"
              @update:model-value="onFilterChange"
            />
          </div>
          
          <div class="w-full flex items-center justify-between pb-1 text-xs text-[color:hsl(var(--maz-muted))]">
            <span>Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalItems }}</strong> data</span>
            <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="danger" size="sm" outline class="h-[32px]">
              Reset
            </MazBtn>
          </div>
        </div>
      </div>

      <!-- Empty State Banner (No Data merged) -->
      <div v-if="!loading && !error && (totalItems === 0 && !hasActiveFilters && searchQuery === '')" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
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

      <div class="flex-1 overflow-auto relative">
        <div v-if="loading" class="absolute inset-0 bg-[color:hsl(var(--maz-background)_/_50%)] flex items-center justify-center z-10 backdrop-blur-sm">
          <MazSpinner color="primary" />
        </div>

        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
              <th class="py-3 px-4 text-center w-16">No</th>
              <th class="py-3 px-4 min-w-[300px]">Informasi Paket Swakelola</th>
              <th class="py-3 px-4 min-w-[280px]">Pencatatan & Anak Paket</th>
              <th class="py-3 px-4 min-w-[220px]">Anggaran & Jadwal</th>
              <th class="py-3 px-4 min-w-[250px]">Profil PPK & Satker</th>
              <th class="py-3 px-4 w-20 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-sm">
            <tr v-if="error" class="text-center">
              <td colspan="6" class="py-12 text-red-500">{{ errorMessage }}</td>
            </tr>
            <tr v-else-if="pageData.length === 0 && !loading" class="text-center">
              <td colspan="6" class="py-12 text-[color:hsl(var(--maz-muted))]">Data tidak ditemukan.</td>
            </tr>
            <tr v-else v-for="(row, idx) in pageData" :key="row.kd_rup" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors">
              <td class="py-3 px-4 text-center font-medium">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              
              <!-- Informasi Paket Swakelola -->
              <td class="py-3 px-4">
                <div class="font-bold text-[color:hsl(var(--maz-primary))]">{{ row.nama_paket || '-' }}</div>
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
                  <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">Tipe Swakelola {{ row.tipe_swakelola }}</span>
                </div>
                
                <div v-if="row._has_kaji_ulang" class="mt-2 text-[10px] text-blue-600 dark:text-amber-400 flex items-center">
                  âš ï¸ Pernah Kaji Ulang ({{ row.kaji_ulang_count }}x) - Tipe: {{ row.kaji_ulang_jenis_revisi }}
                </div>
              </td>
              
              <!-- Pencatatan & Anak Paket -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-1.5">
                  <div v-if="row._has_pelaksanaan" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2.5">
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <span class="font-bold text-xs text-green-700 dark:text-green-400 truncate max-w-[180px]" :title="row.pelaksanaan_kd_pct">
                        Tercatat ({{ row.pelaksanaan_kd_pct }})
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="px-1.5 py-0.5 rounded font-semibold bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                        {{ row.pelaksanaan_status || 'Berjalan' }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-[10px] text-amber-600 dark:text-amber-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Belum Tercatat
                  </div>

                  <div v-if="row._has_paket_penyedia" class="mt-1 text-[10px] text-blue-600 dark:text-blue-400 flex items-center font-medium">
                    ðŸ“¦ Memiliki {{ row.paket_penyedia_count }} Anak Paket Penyedia
                  </div>
                </div>
              </td>
              
              <!-- Anggaran & Jadwal -->
              <td class="py-3 px-4">
                <div class="flex flex-col gap-2">
                  <div class="flex flex-col items-start border-b border-[color:hsl(var(--maz-border))] pb-2">
                    <span class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Pagu Anggaran</span>
                    <span class="font-bold text-sm text-[color:hsl(var(--maz-primary))]">{{ formatRupiah(row.pagu) }}</span>
                    <div v-if="row.sumber_dana_list" class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">
                      Sumber: <span class="font-medium">{{ row.sumber_dana_list }}</span>
                    </div>
                  </div>
                  
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))]">
                    <div class="font-medium mb-0.5 text-[color:hsl(var(--maz-foreground))]">Jadwal Pelaksanaan:</div>
                    <div>{{ row.tgl_awal_pelaksanaan_kontrak ? row.tgl_awal_pelaksanaan_kontrak.substring(0,10) : '-' }} s/d {{ row.tgl_akhir_pelaksanaan_kontrak ? row.tgl_akhir_pelaksanaan_kontrak.substring(0,10) : '-' }}</div>
                  </div>
                </div>
              </td>
              
              <!-- Profil PPK & Satker -->
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
                    <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">NIP: {{ row.ppk_nip_asli }}</div>
                  </div>
                  <div v-else class="text-[10px] text-amber-600 dark:text-amber-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    PPK Tidak Ditemukan ({{ row.nama_ppk }})
                  </div>
                </div>
                
                <div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-1">Satuan Kerja</div>
                  <div class="font-medium text-xs text-[color:hsl(var(--maz-foreground))] truncate max-w-[220px]" :title="row.nama_satker">
                    {{ row.nama_satker }}
                  </div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5 truncate max-w-[220px]" :title="row.nama_klpd">
                    {{ row.nama_klpd }}
                  </div>
                </div>
              </td>
              
              <!-- Aksi -->
              <td class="py-3 px-4 text-center">
                <MazBtn size="mini" color="info" outline @click="openDetail(row)">
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

      <!-- Pagination -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex justify-between items-center">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Hal {{ currentPage }} dari {{ Math.ceil(totalItems / itemsPerPage) || 1 }}
        </div>
        <div class="flex gap-2">
          <MazBtn size="sm" outline :disabled="currentPage === 1 || loading" @click="currentPage--; loadData()">Sebelumnya</MazBtn>
          <MazBtn size="sm" outline :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage) || loading" @click="currentPage++; loadData()">Selanjutnya</MazBtn>
        </div>
      </div>
    </div>

    <!-- Detail Dialog -->
    <MazDialog v-model="isDetailOpen" :title="`Detail RUP Swakelola: ${selectedRow?.kd_rup || ''}`" max-width="900px">
      <div v-if="selectedRow" class="space-y-6">
        <!-- Info Utama -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3">Informasi Paket</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Paket:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_paket || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tipe Swakelola:</span> <span class="font-medium text-right ml-4">{{ selectedRow.tipe_swakelola || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Total Pagu:</span> <span class="font-medium text-right ml-4">{{ formatRupiah(selectedRow.pagu) }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Umumkan:</span> <span class="font-medium text-right ml-4">{{ selectedRow.status_umumkan_rup || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Status Aktif:</span> <span class="font-medium text-right ml-4">{{ selectedRow.status_aktif_rup ? 'Aktif' : 'Tidak Aktif' }}</span></div>
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3">Satuan Kerja & PPK</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Satker:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">K/L/PD:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_klpd || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Lokasi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.lokasi || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Pencatatan / Pelaksanaan -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3 flex items-center gap-2">
            Pencatatan Swakelola
            <span v-if="selectedRow._has_pelaksanaan" class="px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700">Tercatat</span>
            <span v-else class="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700">Belum Tercatat</span>
          </h3>
          <div v-if="selectedRow._has_pelaksanaan" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kode Pencatatan:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_kd_pct || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Pelaksanaan:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_status || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tgl Mulai:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_tgl_mulai || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tgl Selesai:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_tgl_selesai || '-' }}</span></div>
          </div>
          <p v-else class="text-sm text-[color:hsl(var(--maz-muted))] italic">Tidak ada data pencatatan/pelaksanaan untuk paket swakelola ini.</p>
        </div>

        <!-- History Kaji Ulang -->
        <div v-if="selectedRow._has_kaji_ulang" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-amber-200 dark:border-amber-900/50">
          <h3 class="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
            Riwayat Kaji Ulang
            <span class="px-2 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700">{{ selectedRow.kaji_ulang_count }}x Kaji Ulang</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kaji Ulang Terakhir:</span> <span class="font-medium">{{ selectedRow.kaji_ulang_terakhir || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Jenis Revisi:</span> <span class="font-medium">{{ selectedRow.kaji_ulang_jenis_revisi || '-' }}</span></div>
            <div class="flex flex-col gap-1 md:col-span-2 pt-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Alasan Terakhir:</span> 
              <span class="font-medium bg-[color:hsl(var(--maz-background))] p-2 rounded border border-[color:hsl(var(--maz-border))]">{{ selectedRow.kaji_ulang_alasan || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Anak Paket Penyedia -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3 flex items-center gap-2">
            Paket Penyedia Dalam Swakelola
            <span class="px-2 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700">{{ selectedRow.paket_penyedia_count || 0 }} Paket</span>
          </h3>
          <div v-if="selectedRow._has_paket_penyedia" class="space-y-3">
            <div v-for="paket in selectedRow.paket_penyedia_list" :key="paket.kd_rup" class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded p-3 text-sm flex justify-between items-start gap-4">
              <div>
                <div class="font-medium text-[color:hsl(var(--maz-primary))]">{{ paket.nama_paket || '-' }}</div>
                <div class="text-[color:hsl(var(--maz-muted))] text-xs mt-1">
                  RUP: {{ paket.kd_rup }} | {{ paket.jenis_pengadaan }} | {{ paket.metode_pengadaan }}
                </div>
              </div>
              <div class="font-bold text-right shrink-0">
                {{ formatRupiah(paket.pagu) }}
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-[color:hsl(var(--maz-muted))] italic">Tidak ada anak paket penyedia di dalam swakelola ini.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end w-full">
          <MazBtn @click="isDetailOpen = false" color="primary">Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
  year: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const pageData = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(50);

const searchQuery = ref('');
let searchTimeout = null;

const filterTipeSwakelola = ref(null);
const filterStatusPelaksanaan = ref(null);
const filterSumberDana = ref(null);
const filterPpk = ref(null);
const ppkOptions = ref([]);
const filterUmumkan = ref('ALL');
const filterOptionsUmumkan = ref([]);

const tipeSwakelolaOptions = [
  { label: 'Tipe 1', value: '1' },
  { label: 'Tipe 2', value: '2' },
  { label: 'Tipe 3', value: '3' },
  { label: 'Tipe 4', value: '4' }
];

const statusPelaksanaanOptions = [
  { label: 'Tercatat', value: 'Tercatat' },
  { label: 'Belum Tercatat', value: 'Belum Tercatat' }
];

const sumberDanaOptions = [
  { label: 'APBN', value: 'APBN' },
  { label: 'APBD', value: 'APBD' },
  { label: 'BLU', value: 'BLU' },
  { label: 'PNBP', value: 'PNBP' }
];

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
    (filterTipeSwakelola.value && filterTipeSwakelola.value.length > 0) ||
    (filterStatusPelaksanaan.value && filterStatusPelaksanaan.value.length > 0) ||
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
  filterTipeSwakelola.value = null;
  filterStatusPelaksanaan.value = null;
  filterSumberDana.value = null;
  filterPpk.value = null;
  filterUmumkan.value = 'ALL';
  onFilterChange();
};

const isDetailOpen = ref(false);
const selectedRow = ref(null);

const openDetail = (row) => {
  selectedRow.value = row;
  isDetailOpen.value = true;
};

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 500);
};

const formatRupiah = (num) => {
  if (!num) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/data/merged/rup-swakelola-enriched', {
      params: {
        tahun: props.year,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        tipeSwakelola: filterTipeSwakelola.value ? filterTipeSwakelola.value.join(',') : undefined,
        statusPelaksanaan: filterStatusPelaksanaan.value ? filterStatusPelaksanaan.value.join(',') : undefined,
        sumberDana: filterSumberDana.value ? filterSumberDana.value.join(',') : undefined,
        ppk: filterPpk.value ? filterPpk.value.join(',') : undefined,
        statusUmumkan: filterUmumkan.value !== 'ALL' ? filterUmumkan.value : undefined
      }
    });
    if (res.success) {
      pageData.value = res.data;
      totalItems.value = res.meta.totalItems;
      
      if (res.filterOptions && res.filterOptions.namaPpk) {
        ppkOptions.value = res.filterOptions.namaPpk.map(opt => ({ label: opt, value: opt }));
      }
      if (res.filterOptions && res.filterOptions.statusUmumkan) {
        filterOptionsUmumkan.value = res.filterOptions.statusUmumkan;
      }
    } else {
      error.value = true;
      errorMessage.value = res.message || 'Gagal memuat data.';
      pageData.value = [];
      totalItems.value = 0;
    }
  } catch (err) {
    error.value = true;
    errorMessage.value = 'Gagal terhubung ke server.';
    pageData.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.year, () => {
  resetFilters();
});

onMounted(() => {
  loadData();
});
</script>
