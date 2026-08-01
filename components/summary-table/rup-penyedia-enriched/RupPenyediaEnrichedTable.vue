<template>
  <ClientOnly>
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
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
            <MazBtn @click="showFilters = !showFilters" :color="showFilters ? 'primary' : 'secondary'" size="sm" outline>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter {{ hasActiveFilters ? 'Active' : '' }}
            </MazBtn>

            <MazBtn @click="exportModal = true" color="success" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </MazBtn>
          </div>
        </div>

        <!-- Expanded Filters Grid -->
        <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-[color:hsl(var(--maz-border))]">
          <div>
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
          
          <div>
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

          <div>
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

          <div>
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

          <div>
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

          <div>
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Pengumuman RUP</label>
            <MazSelect
              v-model="filterUmumkan"
              :options="filterOptionsUmumkan"
              size="sm"
              placeholder="Semua Status"
              @update:model-value="onFilterChange"
            />
          </div>

          <div class="flex items-end">
            <MazBtn @click="resetFilters" color="transparent" size="sm" class="text-xs">
              Reset Semua Filter
            </MazBtn>
          </div>
        </div>
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
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))] text-sm">
            <tr v-if="loading" class="text-center">
              <td colspan="5" class="py-12 text-[color:hsl(var(--maz-muted))]">
                <div class="flex items-center justify-center gap-2">
                  <span class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></span>
                  <span>Memuat data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="pageData.length === 0" class="text-center">
              <td colspan="5" class="py-12 text-[color:hsl(var(--maz-muted))]">
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
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <span class="font-bold text-xs text-green-700 dark:text-green-400 truncate max-w-[180px]" :title="row.realisasi_nama_paket">
                        {{ row.realisasi_nama_paket }}
                      </span>
                      <span class="text-[10px] font-mono bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">
                        Kode: {{ row.realisasi_kd_paket }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between text-[10px]">
                      <span class="px-1.5 py-0.5 rounded font-semibold"
                        :class="{
                          'bg-green-100 text-green-800': row.realisasi_status === 'Selesai',
                          'bg-amber-100 text-amber-800': row.realisasi_status === 'Berlangsung'
                        }"
                      >
                        {{ row.realisasi_status }}
                      </span>
                      <span class="text-[10px] text-[color:hsl(var(--maz-muted))]">via {{ row.realisasi_metode }}</span>
                    </div>
                  </div>
                  <div v-else class="text-[10px] text-amber-600 dark:text-amber-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Belum ada paket / Belum Tender
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
