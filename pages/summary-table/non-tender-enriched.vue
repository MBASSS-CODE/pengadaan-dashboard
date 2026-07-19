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
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
        <div class="w-full">
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

        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Nama PPK</label>
          <select v-model="filterNamaPpk" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
            <option value="ALL">Semua PPK</option>
            <option v-for="opt in filterOptions.namaPpk" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>

        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode</label>
          <select v-model="filterMetode" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
            <option value="ALL">Semua Metode</option>
            <option v-for="opt in filterOptions.metodePemilihan" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        
        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status RUP</label>
          <select v-model="filterRupMatch" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
            <option value="ALL">Semua</option>
            <option value="true">RUP Ditemukan</option>
            <option value="false">RUP Tidak Ditemukan</option>
          </select>
        </div>

        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status PPK</label>
          <select v-model="filterPpkComplete" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
            <option value="ALL">Semua</option>
            <option value="true">PPK Lengkap</option>
            <option value="false">PPK Belum Lengkap</option>
          </select>
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
              <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                RUP: {{ row.kd_rup }}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                ID: {{ row.kd_nontender }}
              </span>
              <span v-if="row.status_nontender" 
                class="px-2 py-0.5 rounded text-[10px] font-semibold border"
                :class="{
                  'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800': row.status_nontender === 'Selesai',
                  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800': row.status_nontender === 'Berlangsung',
                  'bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border-[color:hsl(var(--maz-border))]': !['Selesai', 'Berlangsung'].includes(row.status_nontender)
                }"
              >
                {{ row.status_nontender }}
              </span>
            </div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1.5 flex gap-2">
              <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.mtd_pemilihan }}</span>
              <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.jenis_pengadaan }}</span>
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
                <span v-if="row.rup_status_aktif" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Aktif</span>
                <span v-if="row.rup_status_umumkan === 'Sudah'" class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Terumumkan</span>
              </div>
              <div v-if="row._has_kaji_ulang" class="text-[10px] text-amber-600 dark:text-amber-400">
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
              <div v-if="row._rup_matched && row.hps && row.rup_pagu && row.hps !== row.rup_pagu" class="text-[9px] text-amber-600 mt-0.5 text-right leading-tight">
                Selisih: {{ formatRupiah(Math.abs(row.hps - row.rup_pagu)) }}
              </div>
            </div>
          </template>
          
        </MazTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const error = ref(false);

// Data dari server (sudah dipaginasi)
const pageData = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const totalAllItems = ref(0);
const filterOptions = ref({ metodePemilihan: [], namaPpk: [] });

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
const filterMetode = ref('ALL');
const filterRupMatch = ref('ALL');
const filterPpkComplete = ref('ALL');
const filterNamaPpk = ref('ALL');

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
        filterMetode: filterMetode.value,
        filterRupMatch: filterRupMatch.value,
        filterPpkComplete: filterPpkComplete.value,
        filterNamaPpk: filterNamaPpk.value
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
    
    if (response.filterOptions) {
      filterOptions.value = response.filterOptions;
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
