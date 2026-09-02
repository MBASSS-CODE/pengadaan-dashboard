<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Transaksi</div>
          <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
            {{ loading ? '...' : totalAllItems.toLocaleString('id-ID') }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai Realisasi</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ loading ? '...' : formatRupiah(totalBelanja) }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai PDN</div>
          <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {{ loading ? '...' : formatRupiah(totalPdn) }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai UMK</div>
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ loading ? '...' : formatRupiah(totalUmk) }}
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
              placeholder="Cari Kode Paket, Nama Paket, Kode RUP, atau Penyedia..." 
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
        <div class="flex flex-col sm:flex-row gap-4 items-end">
          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Sumber Transaksi</label>
            <MazSelect 
              v-model="selectedSumber" 
              :options="sumberOptions" 
              size="sm" 
              multiple 
              clearable 
              placeholder="Semua Sumber"
            />
          </div>
          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode Pengadaan</label>
            <MazSelect 
              v-model="selectedMetode" 
              :options="metodeOptions" 
              size="sm" 
              multiple 
              clearable 
              placeholder="Semua Metode"
            />
          </div>
          <div class="w-full sm:w-1/3 text-right text-xs text-[color:hsl(var(--maz-muted))]">
            <span>Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</strong> data</span>
          </div>
        </div>
      </div>

      <!-- Empty State Banner (No Data merged) -->
      <div v-if="!loading && !error && (totalAllItems === 0 && searchQuery === '')" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-1">Data Belum Di-merge</h2>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-4 max-w-md mx-auto">Tidak ada data Realisasi Pengadaan untuk tahun {{ selectedYear }}.</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData()" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- Data List (Rich Table) -->
      <div class="w-full">
        <!-- Desktop View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
                <th class="py-4 px-4 w-12 text-center">No.</th>
                <th class="py-4 px-4 min-w-[300px]">Informasi Paket</th>
                <th class="py-4 px-4 min-w-[200px]">Pihak Terkait</th>
                <th class="py-4 px-4 min-w-[200px]">Pelaksanaan</th>
                <th class="py-4 px-4 min-w-[150px]">Status</th>
                <th class="py-4 px-4 min-w-[200px] text-right">Nilai Transaksi</th>
              </tr>
            </thead>
            <tbody class="align-top relative">
              <tr v-if="loading && items.length === 0">
                <td colspan="6" class="py-12 text-center">
                  <MazSpinner color="primary" class="mx-auto" />
                  <p class="text-[color:hsl(var(--maz-muted))] mt-3 text-sm">Memuat data Realisasi Pengadaan...</p>
                </td>
              </tr>
              <tr v-else-if="items.length === 0 && !loading" class="border-b border-[color:hsl(var(--maz-border))]">
                <td colspan="6" class="py-12 text-center text-[color:hsl(var(--maz-muted))]">
                  Tidak ada data yang cocok dengan filter pencarian.
                </td>
              </tr>
              <template v-for="(item, index) in items" :key="index + '-' + item.kode_paket">
                <tr class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_2%)] transition-colors group">
                  <td class="py-4 px-4 text-center font-medium text-[color:hsl(var(--maz-muted))]">
                    {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                  </td>
                  
                  <td class="py-4 px-4">
                    <div class="font-bold text-[color:hsl(var(--maz-foreground))] mb-1 line-clamp-2" :title="item.nama_paket || '-'">
                      {{ item.nama_paket || '-' }}
                    </div>
                    <div class="text-sm text-[color:hsl(var(--maz-muted))] mb-2 flex items-center gap-1" :title="item.nama_satuan_kerja || '-'">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span class="truncate max-w-[250px]">{{ item.nama_satuan_kerja || '-' }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 text-[10px]">
                      <span class="px-2 py-1 bg-[color:hsl(var(--maz-foreground)_/_5%)] border border-[color:hsl(var(--maz-border))] rounded text-[color:hsl(var(--maz-muted))] font-mono">
                        PAKET: {{ item.kode_paket || '-' }}
                      </span>
                      <span class="px-2 py-1 bg-[color:hsl(var(--maz-foreground)_/_5%)] border border-[color:hsl(var(--maz-border))] rounded text-[color:hsl(var(--maz-muted))] font-mono">
                        RUP: {{ item.kode_rup || '-' }}
                      </span>
                      <span class="px-2 py-1 bg-[color:hsl(var(--maz-foreground)_/_5%)] border border-[color:hsl(var(--maz-border))] rounded text-[color:hsl(var(--maz-muted))] font-mono">
                        T.A: {{ item.tahun_anggaran || '-' }}
                      </span>
                    </div>
                  </td>

                  <td class="py-4 px-4">
                    <div class="flex flex-col gap-2">
                      <div>
                        <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-0.5">Nama PPK</div>
                        <div class="font-semibold text-emerald-600 dark:text-emerald-400 text-sm truncate max-w-[200px]" :title="item.nama_ppk || '-'">
                          {{ item.nama_ppk || '-' }}
                        </div>
                      </div>
                      <div>
                        <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-0.5">Penyedia</div>
                        <div class="font-semibold text-[color:hsl(var(--maz-primary))] text-sm truncate max-w-[200px]" :title="item.nama_penyedia || '-'">
                          {{ item.nama_penyedia || '-' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td class="py-4 px-4">
                    <div class="flex flex-wrap gap-1 text-[10px]">
                      <span class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {{ item.sumber_transaksi || '-' }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {{ item.sumber_dana || '-' }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" v-if="item.metode_pengadaan && item.metode_pengadaan !== '-'">
                        {{ item.metode_pengadaan }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800" v-if="item.jenis_pengadaan && item.jenis_pengadaan !== '-'">
                        {{ item.jenis_pengadaan }}
                      </span>
                    </div>
                  </td>
                  
                  <td class="py-4 px-4">
                    <div class="flex flex-col gap-2 items-start">
                      <span class="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-md text-xs font-semibold whitespace-nowrap">
                        {{ item.status_paket || '-' }}
                      </span>
                      <span class="text-xs font-medium text-[color:hsl(var(--maz-muted))] flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        {{ item.tahapan_pengadaan || '-' }}
                      </span>
                    </div>
                  </td>
                  
                  <td class="py-4 px-4 text-right">
                    <div class="font-black text-lg text-[color:hsl(var(--maz-foreground))] mb-1">
                      {{ formatRupiah(item.total_nilai) }}
                    </div>
                    <div class="flex flex-col gap-1 text-[11px] font-medium text-[color:hsl(var(--maz-muted))]">
                      <div class="flex justify-end items-center gap-1">
                        <span>PDN:</span>
                        <span :class="item.nilai_pdn > 0 ? 'text-teal-600 dark:text-teal-400 font-bold' : ''">{{ formatRupiah(item.nilai_pdn) }}</span>
                      </div>
                      <div class="flex justify-end items-center gap-1">
                        <span>UMK:</span>
                        <span :class="item.nilai_umk > 0 ? 'text-purple-600 dark:text-purple-400 font-bold' : ''">{{ formatRupiah(item.nilai_umk) }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Mobile View (Cards) -->
        <div class="md:hidden flex flex-col gap-4 p-4">
          <div v-if="loading && items.length === 0" class="py-12 text-center">
            <MazSpinner color="primary" class="mx-auto" />
            <p class="text-[color:hsl(var(--maz-muted))] mt-3 text-sm">Memuat data Realisasi Pengadaan...</p>
          </div>
          <div v-else-if="items.length === 0 && !loading" class="py-12 text-center text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))] rounded-xl">
            Tidak ada data yang cocok dengan filter pencarian.
          </div>
          <template v-else v-for="(item, index) in items" :key="'mobile-' + index + '-' + item.kode_paket">
            <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded-xl p-4 shadow-sm flex flex-col gap-4">
              <div class="flex justify-between items-start gap-2 border-b border-[color:hsl(var(--maz-border))] pb-3">
                <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ item.nama_paket || '-' }}</div>
                <div class="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded text-[10px] font-bold whitespace-nowrap">
                  {{ item.status_paket || '-' }}
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 text-xs border-b border-[color:hsl(var(--maz-border))] pb-3">
                <div class="flex flex-col gap-1">
                  <span class="text-[color:hsl(var(--maz-muted))]">Nama PPK</span>
                  <span class="font-semibold text-emerald-600 dark:text-emerald-400 truncate" :title="item.nama_ppk || '-'">{{ item.nama_ppk || '-' }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[color:hsl(var(--maz-muted))]">Penyedia</span>
                  <span class="font-semibold text-[color:hsl(var(--maz-primary))] truncate" :title="item.nama_penyedia || '-'">{{ item.nama_penyedia || '-' }}</span>
                </div>
                <div class="flex flex-col gap-1 col-span-2">
                  <span class="text-[color:hsl(var(--maz-muted))]">Satuan Kerja</span>
                  <span class="font-medium text-[color:hsl(var(--maz-foreground))] truncate" :title="item.nama_satuan_kerja || '-'">{{ item.nama_satuan_kerja || '-' }}</span>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="flex flex-col gap-1">
                  <span class="text-[color:hsl(var(--maz-muted))]">Kode Paket / RUP</span>
                  <span class="font-mono text-[color:hsl(var(--maz-foreground))]">{{ item.kode_paket || '-' }} / {{ item.kode_rup || '-' }}</span>
                </div>
                <div class="flex flex-col gap-1 text-right">
                  <span class="text-[color:hsl(var(--maz-muted))]">Tahun Anggaran</span>
                  <span class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ item.tahun_anggaran || '-' }}</span>
                </div>
              </div>
              
              <div class="flex flex-wrap gap-1 mt-1 text-[10px]">
                <span class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {{ item.sumber_transaksi || '-' }}
                </span>
                <span class="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" v-if="item.metode_pengadaan && item.metode_pengadaan !== '-'">
                  {{ item.metode_pengadaan }}
                </span>
                <span class="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800" v-if="item.jenis_pengadaan && item.jenis_pengadaan !== '-'">
                  {{ item.jenis_pengadaan }}
                </span>
              </div>
              
              <div class="bg-[color:hsl(var(--maz-foreground)_/_3%)] p-3 rounded-lg border border-[color:hsl(var(--maz-border))] mt-2">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-bold text-[color:hsl(var(--maz-muted))]">TOTAL NILAI</span>
                  <span class="text-lg font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(item.total_nilai) }}</span>
                </div>
                <div class="flex justify-between items-center text-[10px] text-[color:hsl(var(--maz-muted))] font-medium">
                  <div>PDN: <span :class="item.nilai_pdn > 0 ? 'text-teal-600 dark:text-teal-400 font-bold' : ''">{{ formatRupiah(item.nilai_pdn) }}</span></div>
                  <div>UMK: <span :class="item.nilai_umk > 0 ? 'text-purple-600 dark:text-purple-400 font-bold' : ''">{{ formatRupiah(item.nilai_umk) }}</span></div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Menampilkan <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span> - <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ (currentPage - 1) * itemsPerPage + items.length }}</span> dari <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</span> data
        </div>
        <div class="flex items-center gap-2">
          <MazBtn @click="currentPage--" :disabled="currentPage === 1" color="transparent" size="sm" class="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </MazBtn>
          <div class="flex items-center gap-1">
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="text-[color:hsl(var(--maz-muted))] px-1">...</span>
              <MazBtn v-else @click="currentPage = p" :color="currentPage === p ? 'primary' : 'transparent'" size="sm" class="!w-8 !h-8 !p-0 rounded-md font-medium" :class="currentPage !== p ? 'text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))] hover:bg-[color:hsl(var(--maz-foreground)_/_5%)]' : ''">
                {{ p }}
              </MazBtn>
            </template>
          </div>
          <MazBtn @click="currentPage++" :disabled="currentPage === totalPages" color="transparent" size="sm" class="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </MazBtn>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-[color:hsl(var(--maz-muted))]">Per halaman:</span>
          <MazSelect v-model="itemsPerPage" :options="[{label:'10',value:10},{label:'25',value:25},{label:'50',value:50},{label:'100',value:100}]" size="sm" class="w-20" />
        </div>
      </div>
    </div>

    <!-- Modal Export -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data Realisasi Pengadaan (Internal) untuk Tahun Anggaran {{ selectedYear }}:
        </p>
        
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data yang tampil pada tabel saat ini berdasarkan pencarian dan filter yang aktif (estimasi: {{ totalAllItems }} data).</div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data transaksi publik untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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
</template>

<script setup>
import { ref, watch, onMounted, computed, toRefs } from 'vue';
import { utils, writeFile } from 'xlsx';
import { useRuntimeConfig } from '#imports';

const props = defineProps({
  selectedYear: { type: String, required: true }
});
const { selectedYear } = toRefs(props);

const config = useRuntimeConfig();
const namaInstansi = config.public.namaInstansi || 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI';

const loading = ref(true);
const error = ref(false);
const items = ref([]);
const totalAllItems = ref(0);
const totalBelanja = ref(0);
const totalPdn = ref(0);
const totalUmk = ref(0);

const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const searchQuery = ref('');

const sumberOptions = ref([]);
const selectedSumber = ref([]);
const metodeOptions = ref([]);
const selectedMetode = ref([]);

const exportModal = ref(false);

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const params = {
      tahun: selectedYear.value,
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
    };

    if (selectedSumber.value.length > 0) params.sumberTransaksi = selectedSumber.value.join(',');
    if (selectedMetode.value.length > 0) params.metodePengadaan = selectedMetode.value.join(',');

    const res = await $fetch('/api/summary-table/realisasi-private', { params });
    if (res.success) {
      items.value = res.data;
      totalAllItems.value = res.meta.totalItems;
      totalPages.value = res.meta.totalPages;
      totalBelanja.value = res.meta.totalNilai || 0;
      totalPdn.value = res.meta.totalPdn || 0;
      totalUmk.value = res.meta.totalUmk || 0;

      sumberOptions.value = (res.filterOptions?.sumberTransaksi || []).map(opt => ({ label: opt, value: opt }));
      metodeOptions.value = (res.filterOptions?.metodePengadaan || []).map(opt => ({ label: opt, value: opt }));
    } else {
      error.value = true;
      items.value = [];
    }
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const debouncedLoadData = (() => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loadData();
    }, 500);
  };
})();

watch([currentPage, itemsPerPage, selectedSumber, selectedMetode], () => { loadData(); });
watch(() => selectedYear.value, () => { currentPage.value = 1; loadData(); });

const onSearch = () => { currentPage.value = 1; debouncedLoadData(); };

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const exportMode = ref('filtered');
const exportLoading = ref(false);

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      tahun: selectedYear.value,
      page: 1,
      limit: 100000
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) params.search = searchQuery.value;
      if (selectedSumber.value.length > 0) params.sumberTransaksi = selectedSumber.value.join(',');
      if (selectedMetode.value.length > 0) params.metodePengadaan = selectedMetode.value.join(',');
    }

    const res = await $fetch('/api/summary-table/realisasi-private', { params });

    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No.': i + 1,
        'Nama Instansi': row.nama_instansi || namaInstansi,
        'Nama Satuan Kerja': row.nama_satuan_kerja || '-',
        'Kode Paket': row.kode_paket || '-',
        'Kode RUP': row.kode_rup || '-',
        'Tahun Anggaran': row.tahun_anggaran || '-',
        'Sumber Transaksi': row.sumber_transaksi || '-',
        'Sumber Dana': row.sumber_dana || '-',
        'Nama Penyedia': row.nama_penyedia || '-',
        'Nama PPK': row.nama_ppk || '-',
        'Metode Pengadaan': row.metode_pengadaan || '-',
        'Jenis Pengadaan': row.jenis_pengadaan || '-',
        'Nama Paket': row.nama_paket || '-',
        'Status Paket': row.status_paket || '-',
        'Tahapan Pengadaan': row.tahapan_pengadaan || '-',
        'Total Nilai (Rp)': row.total_nilai || 0,
        'Nilai PDN (Rp)': row.nilai_pdn || 0,
        'Nilai UMK (Rp)': row.nilai_umk || 0
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Realisasi_Pengadaan");

      const wscols = [
        {wch: 5}, {wch: 40}, {wch: 40}, {wch: 15}, {wch: 15}, {wch: 10},
        {wch: 20}, {wch: 15}, {wch: 30}, {wch: 30}, {wch: 20}, {wch: 20}, {wch: 50},
        {wch: 15}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 20}
      ];
      ws['!cols'] = wscols;

      const filename = `Realisasi_Pengadaan_Internal_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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

onMounted(() => { loadData(); });
</script>
