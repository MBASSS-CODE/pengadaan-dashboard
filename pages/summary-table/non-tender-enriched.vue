<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Non-Tender Enriched</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Summary Table hasil integrasi data (Merge) Non-Tender dengan RUP, Satker, dan PPK</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Filter Tahun Dinamis -->
        <select v-model="selectedYear" class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        
        <MazBtn @click="loadData()" :loading="loading" color="primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </MazBtn>
      </div>
    </div>

    <!-- Empty State (No Data merged) -->
    <div v-if="!loading && !error && totalAllItems === 0" class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-12 text-center shadow-sm">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[color:hsl(var(--maz-foreground))] mb-2">Data Belum Di-merge</h2>
      <p class="text-[color:hsl(var(--maz-muted))] mb-6 max-w-md mx-auto">Tidak ada data hasil merge untuk tahun {{ selectedYear }}. Silakan jalankan proses "Integrasi Data" melalui akses Admin terlebih dahulu.</p>
      <NuxtLink to="/admin/system">
        <MazBtn color="primary">Buka Akses Admin</MazBtn>
      </NuxtLink>
    </div>

    <!-- Main Content Card -->
    <div v-else class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      
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

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData()" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- MazTable Data Table -->
      <div v-else class="overflow-x-auto w-full">
        <MazTable
          size="sm"
          v-model:page="currentPage"
          v-model:page-size="itemsPerPage"
          pagination
          :paginate-rows="false"
          :total-items="totalItems"
          :loading="loading"
          color="primary"
          hoverable
          background-even
          :headers="[
            { label: 'No', key: 'index', align: 'center', width: '4rem', sortable: false },
            { label: 'Informasi Paket (Non-Tender)', key: 'paket', sortable: false, classes: 'min-w-[280px]' },
            { label: 'Integrasi PPK', key: 'ppk', sortable: false, classes: 'min-w-[200px]' },
            { label: 'Integrasi RUP & Satker', key: 'rup', sortable: false, classes: 'min-w-[220px]' },
            { label: 'Pagu & HPS (Rp)', key: 'nilai', align: 'right', sortable: false, classes: 'min-w-[150px]' }
          ]"
          :rows="pageData"
          @update:page="loadData()"
          @update:page-size="onFilterChange()"
        >
          <template #cell-index="{ row }">
            <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
          </template>
          
          <!-- Kolom Paket (Dari Inaproc) -->
          <template #cell-paket="{ row }">
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
          </template>
          
          <!-- Kolom PPK (Dari ppk_master.json) -->
          <template #cell-ppk="{ row }">
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
          </template>

          <!-- Kolom RUP (Dari RUP & Satker) -->
          <template #cell-rup="{ row }">
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
          </template>
          
          <!-- Kolom Nilai -->
          <template #cell-nilai="{ row }">
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
          </template>
          
        </MazTable>
      </div>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { utils, writeFile } from 'xlsx';

const loading = ref(true);
const error = ref(false);

// Data dari server (sudah dipaginasi)
const pageData = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const totalAllItems = ref(0);

// Generate dynamic years
const currentYear = new Date().getFullYear();
const availableYears = [
  (currentYear + 1).toString(),
  currentYear.toString(), 
  (currentYear - 1).toString()
];
const selectedYear = ref(currentYear.toString());
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
  if (!number && number !== 0) return '0';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
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
        tahun: selectedYear.value,
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
    
    if (response.filterOptions) {
      if (response.filterOptions.statusNontender) {
        statusOptions.value = [
          { label: 'Semua Status', value: 'ALL' },
          ...response.filterOptions.statusNontender.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.metodePemilihan) {
        metodeOptions.value = [
          { label: 'Semua Metode', value: 'ALL' },
          ...response.filterOptions.metodePemilihan.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.satker) {
        satkerOptions.value = [
          { label: 'Semua Satker', value: 'ALL' },
          ...response.filterOptions.satker.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.namaPpk) {
        ppkOptions.value = [
          { label: 'Semua PPK', value: 'ALL' },
          ...response.filterOptions.namaPpk.map(opt => ({ label: opt, value: opt }))
        ];
      }
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
      tahun: selectedYear.value,
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

      const filename = `Non_Tender_Enriched_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
