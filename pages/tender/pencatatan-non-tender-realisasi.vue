<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Pencatatan Non-Tender (Realisasi)</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar realisasi paket pengadaan non-tender</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Filter Tahun Dinamis -->
        <select v-model="selectedYear" class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange(true)">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        
        <MazBtn @click="loadData(true)" :loading="loading" color="primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </MazBtn>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col lg:flex-row gap-4 items-end">
        <div class="w-full lg:w-1/3">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari paket, penyedia..." 
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
        
        <div class="w-full lg:w-1/3">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Jenis Realisasi</label>
          <MazSelect
            v-model="selectedJenisRealisasi"
            :options="jenisRealisasiOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full lg:w-1/3">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Satuan Kerja</label>
          <MazSelect
            v-model="selectedSatker"
            :options="satkerOptions"
            size="sm"
            search
            @update:model-value="onFilterChange(false)"
          />
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData(true)" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
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
          { label: 'Paket & RUP', key: 'paket', sortable: false, classes: 'min-w-[250px]' },
          { label: 'Satuan Kerja & PPK', key: 'satker', sortable: false, classes: 'min-w-[200px]' },
          { label: 'Penyedia & Realisasi', key: 'penyedia', sortable: false, classes: 'min-w-[220px]' },
          { label: 'Nilai (Rp)', key: 'nilai', align: 'right', sortable: false, classes: 'min-w-[150px]' }
        ]"
        :rows="pageData"
        @update:page="loadData(false)"
        @update:page-size="onFilterChange(false)"
      >
        <template #cell-index="{ row }">
          <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
        </template>
        
        <template #cell-paket="{ row }">
          <div class="font-bold text-[color:hsl(var(--maz-primary))]" :title="row.nama_paket">
            {{ row.nama_paket || '-' }}
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              RUP: {{ row.kd_rup_paket }}
            </span>
            <span v-if="row.kd_nontender_pct" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              ID: {{ row.kd_nontender_pct }}
            </span>
          </div>
        </template>
        
        <template #cell-satker="{ row }">
          <div class="font-medium text-xs truncate max-w-[200px]" :title="row.nama_satker">{{ row.nama_satker || '-' }}</div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
            {{ row.nama_klpd || '-' }}
          </div>
          <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1 font-semibold flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            {{ row.nama_ppk || '-' }}
          </div>
        </template>
        
        <template #cell-penyedia="{ row }">
          <div class="font-semibold text-sm">{{ row.nama_penyedia || '-' }}</div>
          <div class="text-[10px] font-mono text-[color:hsl(var(--maz-muted))] mt-0.5">NPWP: {{ row.npwp_penyedia || '-' }}</div>
          <div class="flex flex-col gap-1 mt-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-info)_/_15%)] text-[color:hsl(var(--maz-info)_/_100%)] w-fit">
              {{ row.jenis_realisasi || 'Unknown' }}
            </span>
            <div class="text-[10px] text-[color:hsl(var(--maz-muted))]">
              <div>No: {{ row.no_realisasi || '-' }}</div>
              <div>Tgl: {{ formatDate(row.tgl_realisasi) }}</div>
            </div>
          </div>
        </template>

        <template #cell-nilai="{ row }">
          <div class="flex flex-col items-end">
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Pagu:</div>
            <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.pagu) }}</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Realisasi:</div>
            <div class="font-semibold text-[color:hsl(var(--maz-success))]">{{ formatRupiah(row.nilai_realisasi) }}</div>
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

// Generate dynamic years
const currentYear = new Date().getFullYear();
const availableYears = [
  currentYear.toString(), 
  (currentYear - 1).toString()
];
const selectedYear = ref(currentYear.toString());
const searchQuery = ref('');
const selectedJenisRealisasi = ref('ALL');
const selectedSatker = ref('ALL');

const jenisRealisasiOptions = ref([{ label: 'Semua Jenis', value: 'ALL' }]);
const satkerOptions = ref([{ label: 'Semua Satker', value: 'ALL' }]);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce timer
let searchTimer = null;

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '0';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
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

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/tender/pencatatan-non-tender-realisasi', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        // Since we are using generic backend filtering, let's map generic filters or wait for backend extraction
        filterJenisRevisi: selectedJenisRealisasi.value !== 'ALL' ? selectedJenisRealisasi.value : undefined, // Actually maybe we just pass as search or extend backend, but backend `search` is robust.
        filterSatker: selectedSatker.value !== 'ALL' ? selectedSatker.value : undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
    
    if (response.filterOptions) {
      if (response.filterOptions.satker && response.filterOptions.satker.length > 0) {
        satkerOptions.value = [
          { label: 'Semua Satker', value: 'ALL' },
          ...response.filterOptions.satker.map(opt => ({ label: opt, value: opt }))
        ];
      }
    }

    // Ekstrak unique options untuk jenis realisasi secara manual dari data frontend jika perlu, 
    // atau gunakan dari backend jika kita modif backend. Karena backend catch-all mungkin belum extract jenis_realisasi, 
    // kita akan rely pada search atau jika backend tidak extract, kita biarkan manual extract dari rawItems jika paginate di frontend.
    // Tapi karena paginate di backend, kita bisa biarkan saja filterJenisRevisi atau search text.
    // Saat ini, dropdown jenis_realisasi mungkin kosong kecuali kita isi manual:
    jenisRealisasiOptions.value = [
      { label: 'Semua Jenis', value: 'ALL' },
      { label: 'Bukti Pembelian', value: 'Bukti Pembelian' },
      { label: 'Kwitansi', value: 'Kwitansi' },
      { label: 'SPK', value: 'SPK' }
    ];

  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const onFilterChange = (forceRefresh = false) => {
  currentPage.value = 1;
  loadData(forceRefresh);
};

const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    onFilterChange(false);
  }, 500);
};

onMounted(() => {
  loadData(false);
});
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
