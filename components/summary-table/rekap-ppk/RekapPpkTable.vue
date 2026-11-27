<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <!-- Summary Cards (Matches RealisasiPrivateTable.vue) -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total PPK / Paket</div>
          <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
            {{ loading ? '...' : `${totalAllItems} PPK` }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-0.5">
            {{ loading ? '' : `${summary?.totalKodePaket || 0} Paket Transaksi` }}
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">RUP Terealisasi (Acuan)</div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ loading ? '...' : formatRupiah(summary?.totalRupTerealisasiNilai || 0) }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-0.5">
            {{ loading ? '' : `${summary?.totalRupTerealisasiPaket || 0} dari ${summary?.totalRupTerumumkanPaket || 0} RUP Terumumkan` }}
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai Realisasi</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ loading ? '...' : formatRupiah(summary?.totalNilaiRealisasi || 0) }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-0.5">
            {{ loading ? '' : `Kontrak + Selesai (Serapan ${summary?.persentaseSerapan || 0}%)` }}
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai PDN &amp; UMK</div>
          <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {{ loading ? '...' : formatRupiah(summary?.totalNilaiPdn || 0) }}
          </div>
          <div class="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">
            {{ loading ? '' : `UMK: ${formatRupiah(summary?.totalNilaiUmk || 0)}` }}
          </div>
        </div>
      </div>

      <!-- Main Table Card -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
        <!-- Search/Filter Bar -->
        <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col gap-4">
          <!-- Search Row -->
          <div class="w-full flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-grow">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
              <MazInput
                v-model="searchQuery"
                placeholder="Cari Nama PPK, NIP, Satker, Kode RUP, atau Kode Paket..."
                size="sm"
                block
                class="w-full"
                clearable
                @update:model-value="onSearch"
              >
                <template #left-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </template>
              </MazInput>
            </div>
            <div class="sm:mt-5 flex gap-2 shrink-0">
              <MazBtn @click="exportModal = true" color="success" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Excel / CSV
              </MazBtn>
            </div>
          </div>

          <!-- Filters Row -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Nama PPK</label>
              <MazSelect
                v-model="selectedPpk"
                :options="ppkOptions"
                size="sm"
                multiple
                clearable
                search
                placeholder="Semua PPK"
              />
            </div>
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Sumber Transaksi</label>
              <MazSelect
                v-model="selectedSumber"
                :options="sumberOptions"
                size="sm"
                multiple
                clearable
                search
                placeholder="Semua Sumber"
              />
            </div>
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode Pengadaan</label>
              <MazSelect
                v-model="selectedMetode"
                :options="metodeOptions"
                size="sm"
                multiple
                clearable
                search
                placeholder="Semua Metode"
              />
            </div>
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Tahapan Pengadaan</label>
              <MazSelect
                v-model="selectedTahapan"
                :options="tahapanOptions"
                size="sm"
                multiple
                clearable
                search
                placeholder="Semua Tahapan"
              />
            </div>
            <div class="w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Master PPK</label>
              <MazSelect
                v-model="selectedStatusPpk"
                :options="statusPpkOptions"
                size="sm"
                multiple
                clearable
                placeholder="Semua Status"
              />
            </div>

            <div class="w-full lg:col-span-3 xl:col-span-5 flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-[color:hsl(var(--maz-muted))]">
              <div class="flex flex-wrap items-center gap-3">
                <span>Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</strong> PPK</span>
                <NuxtLink
                  v-if="summary && summary.ppkIncomplete > 0"
                  to="/admin/ppk-master"
                  class="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  {{ summary.ppkIncomplete }} PPK belum di-mapping Master PPK &rarr;
                </NuxtLink>
              </div>
              <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="danger" size="sm" outline class="h-[32px]">
                Reset Filter
              </MazBtn>
            </div>
          </div>
        </div>

        <!-- Empty State Banner -->
        <div v-if="!loading && !error && (totalAllItems === 0 && !hasActiveFilters)" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-1">Data Belum Di-merge</h2>
          <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-4 max-w-md mx-auto">Tidak ada data Rekap PPK untuk tahun {{ selectedYear }}.</p>
          <NuxtLink to="/admin/data-merge?tab=rekap-ppk">
            <MazBtn color="primary" size="sm">Buka Halaman Merge Data</MazBtn>
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

        <!-- Data List (Rich Table + Mobile View) -->
        <div v-if="!error" class="w-full">
          <!-- Desktop View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
                  <th class="py-4 px-4 w-12 text-center">No.</th>
                  <th class="py-4 px-4 min-w-[260px]">Identitas PPK &amp; Satker</th>
                  <th class="py-4 px-4 min-w-[230px]">Rencana Umum Pengadaan (RUP)</th>
                  <th class="py-4 px-4 min-w-[190px]">Tahapan Pemilihan</th>
                  <th class="py-4 px-4 min-w-[210px]">Kontrak &amp; Selesai</th>
                  <th class="py-4 px-4 min-w-[200px] text-right">Nilai Realisasi</th>
                  <th class="py-4 px-4 w-24 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody class="align-top relative">
                <tr v-if="loading && items.length === 0">
                  <td colspan="7" class="py-12 text-center">
                    <MazSpinner color="primary" class="mx-auto" />
                    <p class="text-[color:hsl(var(--maz-muted))] mt-3 text-sm">Memuat data Rekapitulasi PPK...</p>
                  </td>
                </tr>

                <tr v-else-if="items.length === 0 && !loading" class="border-b border-[color:hsl(var(--maz-border))]">
                  <td colspan="7" class="py-12 text-center text-[color:hsl(var(--maz-muted))]">
                    Tidak ada data PPK yang cocok dengan filter pencarian.
                  </td>
                </tr>

                <template v-for="(ppk, index) in items" :key="ppk.ppk_key || index">
                  <tr class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_2%)] transition-colors group">
                    <td class="py-4 px-4 text-center font-medium text-[color:hsl(var(--maz-muted))]">
                      {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </td>

                    <!-- Identitas PPK & Satker -->
                    <td class="py-4 px-4">
                      <div class="font-bold text-emerald-600 dark:text-emerald-400 text-sm mb-0.5">
                        {{ ppk.nama }}
                      </div>
                      <div v-if="ppk.nip_asli" class="text-xs font-mono text-[color:hsl(var(--maz-foreground))] mb-1">
                        NIP. {{ ppk.nip_asli }}
                      </div>
                      <div class="text-xs text-[color:hsl(var(--maz-muted))] mb-2 flex items-center gap-1" :title="ppk.unit_kerja || ppk.nama_satuan_kerja">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span class="truncate max-w-[230px]">{{ [ppk.jabatan, ppk.unit_kerja].filter(Boolean).join(' • ') || ppk.nama_satuan_kerja }}</span>
                      </div>
                      <div class="flex flex-wrap gap-1.5 text-[10px]">
                        <span
                          class="px-2 py-0.5 rounded-full border font-semibold"
                          :class="ppk.is_ppk_completed
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : (ppk.ppk_key === 'UNASSIGNED'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800')"
                        >
                          {{ ppk.is_ppk_completed ? 'Terpetakan' : (ppk.ppk_key === 'UNASSIGNED' ? 'Tanpa Atribut PPK' : 'Belum Mapping') }}
                        </span>
                        <span class="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
                          {{ ppk.total_kode_paket }} Paket
                        </span>
                        <span v-if="ppk.penyedia_count > 0" class="px-2 py-0.5 rounded-full bg-[color:hsl(var(--maz-foreground)_/_5%)] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-muted))]">
                          {{ ppk.penyedia_count }} Penyedia
                        </span>
                      </div>
                    </td>

                    <!-- RUP Terumumkan vs Terealisasi -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col gap-1.5 text-xs">
                        <div class="flex justify-between gap-3">
                          <span class="text-[color:hsl(var(--maz-muted))]">Terumumkan ({{ ppk.total_rup_terumumkan_paket }}):</span>
                          <span class="font-semibold text-[color:hsl(var(--maz-foreground))] whitespace-nowrap">{{ formatRupiah(ppk.total_rup_terumumkan_nilai) }}</span>
                        </div>
                        <div class="flex justify-between gap-3">
                          <span class="text-[color:hsl(var(--maz-muted))]">Terealisasi ({{ ppk.paket_rup }}):</span>
                          <span class="font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{{ formatRupiah(ppk.nilai_rup) }}</span>
                        </div>
                        <div class="flex justify-between gap-3 pt-1 border-t border-[color:hsl(var(--maz-border))]">
                          <span class="text-[color:hsl(var(--maz-muted))]">Belum Jalan ({{ ppk.rup_belum_jalan_paket }}):</span>
                          <span class="font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">{{ formatRupiah(ppk.rup_belum_jalan_nilai) }}</span>
                        </div>
                      </div>
                    </td>

                    <!-- Tahapan Pemilihan -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col gap-2 text-xs">
                        <div>
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-0.5">
                            Berlangsung: {{ ppk.paket_pemilihan_berlangsung }} pkt
                          </span>
                          <div class="font-medium text-[color:hsl(var(--maz-foreground))] whitespace-nowrap">{{ formatRupiah(ppk.nilai_pemilihan_berlangsung) }}</div>
                        </div>
                        <div>
                          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 mb-0.5">
                            Selesai Pemilihan: {{ ppk.paket_pemilihan_selesai }} pkt
                          </span>
                          <div class="font-medium text-[color:hsl(var(--maz-foreground))] whitespace-nowrap">{{ formatRupiah(ppk.nilai_pemilihan_selesai) }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Kontrak & Selesai -->
                    <td class="py-4 px-4">
                      <div class="flex flex-col gap-2 text-xs">
                        <div class="flex justify-between gap-2">
                          <span class="text-indigo-600 dark:text-indigo-400 font-semibold">Kontrak ({{ ppk.paket_kontrak }}):</span>
                          <span class="font-semibold text-[color:hsl(var(--maz-foreground))] whitespace-nowrap">{{ formatRupiah(ppk.nilai_kontrak) }}</span>
                        </div>
                        <div class="flex justify-between gap-2">
                          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Selesai ({{ ppk.paket_selesai }}):</span>
                          <span class="font-semibold text-[color:hsl(var(--maz-foreground))] whitespace-nowrap">{{ formatRupiah(ppk.nilai_selesai) }}</span>
                        </div>
                        <div class="pt-1 border-t border-[color:hsl(var(--maz-border))]">
                          <div class="flex justify-between text-[11px] mb-1">
                            <span class="text-[color:hsl(var(--maz-muted))]">Serapan Pagu:</span>
                            <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ ppk.persentase_serapan || 0 }}%</span>
                          </div>
                          <div class="w-full h-1.5 bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full overflow-hidden">
                            <div class="bg-emerald-500 h-1.5 rounded-full" :style="{ width: `${Math.min(100, ppk.persentase_serapan || 0)}%` }"></div>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Nilai Realisasi + PDN/UMK (Mirrors RealisasiPrivateTable) -->
                    <td class="py-4 px-4 text-right">
                      <div class="font-black text-base text-[color:hsl(var(--maz-foreground))] mb-1 whitespace-nowrap">
                        {{ formatRupiah(ppk.total_nilai_realisasi) }}
                      </div>
                      <div class="flex flex-col gap-1 text-[11px] font-medium text-[color:hsl(var(--maz-muted))]">
                        <div class="flex justify-end items-center gap-1 whitespace-nowrap">
                          <span>PDN:</span>
                          <span :class="ppk.nilai_pdn > 0 ? 'text-teal-600 dark:text-teal-400 font-bold' : ''">{{ formatRupiah(ppk.nilai_pdn) }}</span>
                        </div>
                        <div class="flex justify-end items-center gap-1 whitespace-nowrap">
                          <span>UMK:</span>
                          <span :class="ppk.nilai_umk > 0 ? 'text-purple-600 dark:text-purple-400 font-bold' : ''">{{ formatRupiah(ppk.nilai_umk) }}</span>
                        </div>
                      </div>
                    </td>

                    <td class="py-4 px-4 text-center align-middle">
                      <MazBtn size="xs" outline color="primary" @click="openDetail(ppk)">Detail</MazBtn>
                    </td>
                  </tr>
                </template>
              </tbody>

              <!-- Grand Total Footer -->
              <tfoot v-if="summary && items.length > 0" class="bg-[color:hsl(var(--maz-foreground)_/_3%)] border-t-2 border-[color:hsl(var(--maz-border))] text-xs font-bold">
                <tr>
                  <td colspan="2" class="py-4 px-4">
                    TOTAL KESELURUHAN ({{ summary.totalPpk }} PPK • {{ summary.totalKodePaket }} Paket)
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex justify-between gap-2">
                      <span class="font-normal text-[color:hsl(var(--maz-muted))]">Terumumkan ({{ summary.totalRupTerumumkanPaket }}):</span>
                      <span>{{ formatRupiah(summary.totalRupTerumumkanNilai) }}</span>
                    </div>
                    <div class="flex justify-between gap-2 text-blue-600 dark:text-blue-400">
                      <span class="font-normal">Terealisasi ({{ summary.totalRupTerealisasiPaket }}):</span>
                      <span>{{ formatRupiah(summary.totalRupTerealisasiNilai) }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    <div>Berlangsung: {{ summary.paketPemilihanBerlangsung }} pkt</div>
                    <div class="text-[11px] font-normal text-[color:hsl(var(--maz-muted))]">{{ formatRupiah(summary.nilaiPemilihanBerlangsung) }}</div>
                  </td>
                  <td class="py-4 px-4">
                    <div class="text-indigo-600 dark:text-indigo-400">Kontrak ({{ summary.paketKontrak }}): {{ formatRupiah(summary.nilaiKontrak) }}</div>
                    <div class="text-emerald-600 dark:text-emerald-400">Selesai ({{ summary.paketSelesai }}): {{ formatRupiah(summary.nilaiSelesai) }}</div>
                  </td>
                  <td class="py-4 px-4 text-right whitespace-nowrap">
                    <div class="text-sm font-black">{{ formatRupiah(summary.totalNilaiRealisasi) }}</div>
                    <div class="text-[11px] text-teal-600 dark:text-teal-400">PDN: {{ formatRupiah(summary.totalNilaiPdn) }}</div>
                    <div class="text-[11px] text-purple-600 dark:text-purple-400">UMK: {{ formatRupiah(summary.totalNilaiUmk) }}</div>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Mobile View (Cards) -->
          <div class="md:hidden flex flex-col gap-4 p-4">
            <div v-if="loading && items.length === 0" class="py-12 text-center">
              <MazSpinner color="primary" class="mx-auto" />
              <p class="text-[color:hsl(var(--maz-muted))] mt-3 text-sm">Memuat data Rekapitulasi PPK...</p>
            </div>
            <div v-else-if="items.length === 0 && !loading" class="py-12 text-center text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))] rounded-xl">
              Tidak ada data PPK yang cocok dengan filter pencarian.
            </div>
            <template v-else v-for="(ppk, index) in items" :key="'mobile-' + (ppk.ppk_key || index)">
              <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded-xl p-4 shadow-sm flex flex-col gap-3">
                <div class="flex justify-between items-start gap-2 border-b border-[color:hsl(var(--maz-border))] pb-3">
                  <div>
                    <div class="font-bold text-sm text-emerald-600 dark:text-emerald-400">{{ ppk.nama }}</div>
                    <div v-if="ppk.nip_asli" class="text-[11px] font-mono text-[color:hsl(var(--maz-muted))]">NIP. {{ ppk.nip_asli }}</div>
                  </div>
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap"
                    :class="ppk.is_ppk_completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'"
                  >
                    {{ ppk.total_kode_paket }} Paket
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-xs border-b border-[color:hsl(var(--maz-border))] pb-3">
                  <div>
                    <div class="text-[color:hsl(var(--maz-muted))]">RUP Terumumkan</div>
                    <div class="font-semibold">{{ ppk.total_rup_terumumkan_paket }} pkt • {{ formatRupiah(ppk.total_rup_terumumkan_nilai) }}</div>
                  </div>
                  <div>
                    <div class="text-[color:hsl(var(--maz-muted))]">RUP Terealisasi</div>
                    <div class="font-semibold text-blue-600 dark:text-blue-400">{{ ppk.paket_rup }} pkt • {{ formatRupiah(ppk.nilai_rup) }}</div>
                  </div>
                  <div>
                    <div class="text-[color:hsl(var(--maz-muted))]">Kontrak</div>
                    <div class="font-semibold text-indigo-600 dark:text-indigo-400">{{ ppk.paket_kontrak }} pkt • {{ formatRupiah(ppk.nilai_kontrak) }}</div>
                  </div>
                  <div>
                    <div class="text-[color:hsl(var(--maz-muted))]">Selesai</div>
                    <div class="font-semibold text-emerald-600 dark:text-emerald-400">{{ ppk.paket_selesai }} pkt • {{ formatRupiah(ppk.nilai_selesai) }}</div>
                  </div>
                </div>

                <div class="bg-[color:hsl(var(--maz-foreground)_/_3%)] p-3 rounded-lg border border-[color:hsl(var(--maz-border))]">
                  <div class="flex justify-between items-center mb-1.5">
                    <span class="text-xs font-bold text-[color:hsl(var(--maz-muted))]">TOTAL REALISASI ({{ ppk.persentase_serapan }}%)</span>
                    <span class="text-base font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(ppk.total_nilai_realisasi) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-[10px] text-[color:hsl(var(--maz-muted))] font-medium">
                    <div>PDN: <span class="text-teal-600 dark:text-teal-400 font-bold">{{ formatRupiah(ppk.nilai_pdn) }}</span></div>
                    <div>UMK: <span class="text-purple-600 dark:text-purple-400 font-bold">{{ formatRupiah(ppk.nilai_umk) }}</span></div>
                  </div>
                </div>

                <div class="pt-1">
                  <MazBtn size="sm" outline block color="primary" @click="openDetail(ppk)">Lihat Detail Lengkap</MazBtn>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Pagination (Matches RealisasiPrivateTable.vue) -->
        <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-[color:hsl(var(--maz-muted))]">
            Menampilkan <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span> -
            <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ (currentPage - 1) * itemsPerPage + items.length }}</span> dari
            <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</span> PPK
          </div>

          <div class="flex items-center gap-2">
            <MazBtn @click="currentPage--" :disabled="currentPage <= 1" color="transparent" size="sm" class="!px-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </MazBtn>
            <div class="flex items-center gap-1">
              <template v-for="p in visiblePages" :key="String(p)">
                <span v-if="p === '...'" class="text-[color:hsl(var(--maz-muted))] px-1">...</span>
                <MazBtn
                  v-else
                  @click="currentPage = Number(p)"
                  :color="currentPage === p ? 'primary' : 'transparent'"
                  size="sm"
                  class="!w-8 !h-8 !p-0 rounded-md font-medium"
                  :class="currentPage !== p ? 'text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))] hover:bg-[color:hsl(var(--maz-foreground)_/_5%)]' : ''"
                >
                  {{ p }}
                </MazBtn>
              </template>
            </div>
            <MazBtn @click="currentPage++" :disabled="currentPage >= totalPages" color="transparent" size="sm" class="!px-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </MazBtn>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-[color:hsl(var(--maz-muted))]">Per halaman:</span>
            <MazSelect
              v-model="itemsPerPage"
              :options="[{ label: '10', value: 10 }, { label: '25', value: 25 }, { label: '50', value: 50 }, { label: '100', value: 100 }]"
              size="sm"
              class="w-20"
            />
          </div>
        </div>
      </div>

      <!-- Modal Export (Matches RealisasiPrivateTable.vue) -->
      <MazDialog v-model="exportModal" title="Export Data Rekapitulasi PPK">
        <div class="flex flex-col gap-4 py-2">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))]">
              Pilih Format File:
            </p>
            <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg flex flex-col gap-3">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="radio" v-model="exportFormat" value="xlsx" class="mt-1" />
                <div>
                  <div class="font-semibold text-sm">Excel Lengkap (.xlsx)</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor 2 sheet: Rekapitulasi PPK Lengkap (termasuk RUP Terumumkan, Serapan, PDN, UMK) serta Rincian Paket.</div>
                </div>
              </label>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="radio" v-model="exportFormat" value="csv" class="mt-1" />
                <div>
                  <div class="font-semibold text-sm">CSV Format Acuan (17 Kolom Standar)</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor format CSV persis 17 kolom sesuai standar file acuan (list_kode_rup, list_kode_paket, tahapan, dll.).</div>
                </div>
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))]">
              Cakupan Data Tahun {{ selectedYear }}:
            </p>
            <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg flex flex-col gap-3">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
                <div>
                  <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data yang tampil sesuai pencarian, periode, dan filter aktif ({{ totalAllItems }} PPK).</div>
                </div>
              </label>
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="radio" v-model="exportMode" value="all" class="mt-1" />
                <div>
                  <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh rekap PPK untuk tahun anggaran {{ selectedYear }} tanpa filter.</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2 w-full">
            <MazBtn @click="exportModal = false" color="transparent" size="sm">Batal</MazBtn>
            <MazBtn @click="executeExport" :loading="exportLoading" color="success" size="sm">
              {{ exportFormat === 'csv' ? 'Download CSV' : 'Download Excel' }}
            </MazBtn>
          </div>
        </template>
      </MazDialog>

      <!-- Detail Modal -->
      <RekapPpkDetailDialog v-model="detailModal" :selected-ppk="selectedItem" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, toRefs } from 'vue';
import { utils, writeFile } from 'xlsx';
import RekapPpkDetailDialog from './RekapPpkDetailDialog.vue';

const props = defineProps({
  selectedYear: { type: String, required: true },
  scopeMode: { type: String, default: 'acuan' },
  filterType: { type: String, default: 'semua' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  selectedQuarter: { type: String, default: 'TW 1' }
});

const { selectedYear, scopeMode, filterType, startDate, endDate, selectedQuarter } = toRefs(props);

const loading = ref(true);
const error = ref(false);
const items = ref<any[]>([]);
const summary = ref<any>(null);
const totalAllItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const searchQuery = ref('');

const ppkOptions = ref<any[]>([]);
const selectedPpk = ref<string[]>([]);
const sumberOptions = ref<any[]>([]);
const selectedSumber = ref<string[]>([]);
const metodeOptions = ref<any[]>([]);
const selectedMetode = ref<string[]>([]);
const tahapanOptions = ref<any[]>([]);
const selectedTahapan = ref<string[]>([]);
const statusPpkOptions = [
  { label: 'Terpetakan', value: 'Terpetakan' },
  { label: 'Tanpa Atribut PPK', value: 'Tanpa Atribut PPK' },
  { label: 'Belum Mapping', value: 'Belum Mapping' }
];
const selectedStatusPpk = ref<string[]>([]);

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== '' ||
    selectedPpk.value.length > 0 ||
    selectedSumber.value.length > 0 ||
    selectedMetode.value.length > 0 ||
    selectedTahapan.value.length > 0 ||
    selectedStatusPpk.value.length > 0
  );
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedPpk.value = [];
  selectedSumber.value = [];
  selectedMetode.value = [];
  selectedTahapan.value = [];
  selectedStatusPpk.value = [];
  currentPage.value = 1;
  loadData();
};

const exportModal = ref(false);
const exportFormat = ref<'xlsx' | 'csv'>('xlsx');
const exportMode = ref<'filtered' | 'all'>('filtered');
const exportLoading = ref(false);

const detailModal = ref(false);
const selectedItem = ref<any>(null);

const openDetail = (ppk: any) => {
  selectedItem.value = ppk;
  detailModal.value = true;
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const params: Record<string, any> = {
      tahun: selectedYear.value,
      scopeMode: scopeMode.value,
      filterType: filterType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      selectedQuarter: selectedQuarter.value,
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value
    };

    if (selectedPpk.value.length > 0) params.ppk = selectedPpk.value.join(',');
    if (selectedSumber.value.length > 0) params.sumberTransaksi = selectedSumber.value.join(',');
    if (selectedMetode.value.length > 0) params.metodePengadaan = selectedMetode.value.join(',');
    if (selectedTahapan.value.length > 0) params.tahapanPengadaan = selectedTahapan.value.join(',');
    if (selectedStatusPpk.value.length > 0) params.statusPpk = selectedStatusPpk.value.join(',');

    const res: any = await $fetch('/api/summary-table/rekap-ppk', { params });
    if (res?.success) {
      items.value = res.data || [];
      summary.value = res.summary || null;
      totalAllItems.value = res.meta?.totalItems ?? items.value.length;
      totalPages.value = res.meta?.totalPages ?? 1;

      ppkOptions.value = (res.filterOptions?.ppk || []).map((opt: string) => ({ label: opt, value: opt }));
      sumberOptions.value = (res.filterOptions?.sumberTransaksi || []).map((opt: string) => ({ label: opt, value: opt }));
      metodeOptions.value = (res.filterOptions?.metodePengadaan || []).map((opt: string) => ({ label: opt, value: opt }));
      tahapanOptions.value = (res.filterOptions?.tahapanPengadaan || []).map((opt: string) => ({ label: opt, value: opt }));
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
  let timer: any;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loadData();
    }, 400);
  };
})();

watch([currentPage, itemsPerPage], () => {
  loadData();
});

watch([selectedPpk, selectedSumber, selectedMetode, selectedTahapan, selectedStatusPpk], () => {
  currentPage.value = 1;
  loadData();
});

watch([selectedYear, scopeMode, filterType, startDate, endDate, selectedQuarter], () => {
  currentPage.value = 1;
  loadData();
});

const onSearch = () => {
  currentPage.value = 1;
  debouncedLoadData();
};

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const formatRupiah = (angka: number) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

const escapeCsvField = (val: any): string => {
  const str = val === null || val === undefined ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const params: Record<string, any> = {
      tahun: selectedYear.value,
      scopeMode: scopeMode.value,
      page: 1,
      limit: 10000
    };

    if (exportMode.value === 'filtered') {
      params.filterType = filterType.value;
      params.startDate = startDate.value;
      params.endDate = endDate.value;
      params.selectedQuarter = selectedQuarter.value;
      if (searchQuery.value) params.search = searchQuery.value;
      if (selectedPpk.value.length > 0) params.ppk = selectedPpk.value.join(',');
      if (selectedSumber.value.length > 0) params.sumberTransaksi = selectedSumber.value.join(',');
      if (selectedMetode.value.length > 0) params.metodePengadaan = selectedMetode.value.join(',');
      if (selectedTahapan.value.length > 0) params.tahapanPengadaan = selectedTahapan.value.join(',');
      if (selectedStatusPpk.value.length > 0) params.statusPpk = selectedStatusPpk.value.join(',');
    } else {
      params.filterType = 'semua';
    }

    const res: any = await $fetch('/api/summary-table/rekap-ppk', { params });
    const rowsToExport: any[] = res?.data || [];

    if (exportFormat.value === 'csv') {
      const headers = [
        'nama',
        'role',
        'nama_instansi',
        'nama_satuan_kerja',
        'nilai_rup',
        'paket_rup',
        'list_kode_rup',
        'total_kode_paket',
        'list_kode_paket',
        'nilai_pemilihan_berlangsung',
        'paket_pemilihan_berlangsung',
        'nilai_pemilihan_selesai',
        'paket_pemilihan_selesai',
        'nilai_kontrak',
        'paket_kontrak',
        'nilai_selesai',
        'paket_selesai'
      ];

      const csvRows = rowsToExport.map((ppk) => headers.map((h) => escapeCsvField(ppk[h])).join(','));
      const exportSummary = res?.summary;
      if (exportSummary && rowsToExport.length > 0) {
        const totalRow: Record<string, any> = {
          nama: '',
          role: '',
          nama_instansi: '',
          nama_satuan_kerja: '',
          nilai_rup: exportSummary.totalRupTerealisasiNilai ?? 0,
          paket_rup: exportSummary.totalRupTerealisasiPaket ?? 0,
          list_kode_rup: '',
          total_kode_paket: exportSummary.totalKodePaket ?? 0,
          list_kode_paket: '',
          nilai_pemilihan_berlangsung: exportSummary.nilaiPemilihanBerlangsung || 0,
          paket_pemilihan_berlangsung: exportSummary.paketPemilihanBerlangsung || 0,
          nilai_pemilihan_selesai: exportSummary.nilaiPemilihanSelesai || 0,
          paket_pemilihan_selesai: exportSummary.paketPemilihanSelesai || 0,
          nilai_kontrak: exportSummary.nilaiKontrak ?? 0,
          paket_kontrak: exportSummary.paketKontrak ?? 0,
          nilai_selesai: exportSummary.nilaiSelesai ?? 0,
          paket_selesai: exportSummary.paketSelesai ?? 0
        };
        csvRows.push(headers.map((h) => escapeCsvField(totalRow[h])).join(','));
      }
      const csvContent = '\uFEFF' + [headers.join(','), ...csvRows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const scopeTag = scopeMode.value === 'all' ? 'SemuaSumber' : 'Acuan';
      link.download = `Rekap_PPK_${scopeTag}_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const rekapRows = rowsToExport.map((ppk, idx) => ({
        'No.': idx + 1,
        'Nama PPK': ppk.nama,
        'NIP': ppk.nip_asli || '-',
        'Jabatan': ppk.jabatan || '-',
        'Unit Kerja': ppk.unit_kerja || '-',
        'Nama Instansi': ppk.nama_instansi,
        'Satuan Kerja': ppk.nama_satuan_kerja,
        'Status Mapping PPK': ppk.is_ppk_completed ? 'Terpetakan' : 'Belum Mapping',
        'RUP Terumumkan (Paket)': ppk.total_rup_terumumkan_paket,
        'RUP Terumumkan (Rp)': ppk.total_rup_terumumkan_nilai,
        'RUP Terealisasi Acuan (Paket)': ppk.paket_rup,
        'RUP Terealisasi Acuan (Rp)': ppk.nilai_rup,
        'RUP Belum Jalan (Paket)': ppk.rup_belum_jalan_paket,
        'RUP Belum Jalan (Rp)': ppk.rup_belum_jalan_nilai,
        'Total Kode Paket': ppk.total_kode_paket,
        'Pemilihan Berlangsung (Paket)': ppk.paket_pemilihan_berlangsung,
        'Pemilihan Berlangsung (Rp)': ppk.nilai_pemilihan_berlangsung,
        'Pemilihan Selesai (Paket)': ppk.paket_pemilihan_selesai,
        'Pemilihan Selesai (Rp)': ppk.nilai_pemilihan_selesai,
        'Kontrak (Paket)': ppk.paket_kontrak,
        'Kontrak (Rp)': ppk.nilai_kontrak,
        'Selesai (Paket)': ppk.paket_selesai,
        'Selesai (Rp)': ppk.nilai_selesai,
        'Total Nilai Realisasi (Rp)': ppk.total_nilai_realisasi,
        'Serapan Pagu (%)': ppk.persentase_serapan,
        'Nilai PDN (Rp)': ppk.nilai_pdn,
        'Nilai UMK (Rp)': ppk.nilai_umk,
        'Jumlah Penyedia': ppk.penyedia_count,
        'Kaji Ulang RUP': ppk.kaji_ulang_count,
        'List Kode RUP': ppk.list_kode_rup,
        'List Kode Paket': ppk.list_kode_paket
      }));

      const detailPaketRows: any[] = [];
      for (const ppk of rowsToExport) {
        const pkts = Array.isArray(ppk.detail_paket_list) ? ppk.detail_paket_list : [];
        for (const pkt of pkts) {
          detailPaketRows.push({
            'Nama PPK': ppk.nama,
            'NIP': ppk.nip_asli || '-',
            'Kode Paket': pkt.kode_paket,
            'Kode RUP': pkt.kode_rup || '-',
            'Nama Paket': pkt.nama_paket,
            'Sumber Transaksi': pkt.sumber_transaksi,
            'Metode Pengadaan': pkt.metode_pengadaan,
            'Jenis Pengadaan': pkt.jenis_pengadaan,
            'Nama Penyedia': pkt.nama_penyedia || '-',
            'Tahapan Rekap': pkt.tahapan_rekap,
            'Tahapan Asli': pkt.tahapan_pengadaan,
            'Nilai Transaksi (Rp)': pkt.total_nilai,
            'Nilai PDN (Rp)': pkt.nilai_pdn,
            'Nilai UMK (Rp)': pkt.nilai_umk
          });
        }
      }

      const wb = utils.book_new();
      const wsRekap = utils.json_to_sheet(rekapRows);
      utils.book_append_sheet(wb, wsRekap, 'Rekap_PPK');
      if (detailPaketRows.length > 0) {
        const wsDetail = utils.json_to_sheet(detailPaketRows);
        utils.book_append_sheet(wb, wsDetail, 'Rincian_Paket');
      }
      writeFile(wb, `Rekap_PPK_Lengkap_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`);
    }

    exportModal.value = false;
  } catch (err) {
    console.error('Failed to export Rekap PPK:', err);
    alert('Gagal melakukan ekspor data. Silakan coba lagi.');
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>
