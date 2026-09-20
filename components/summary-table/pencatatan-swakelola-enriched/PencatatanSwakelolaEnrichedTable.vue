<template>
  <div class="flex flex-col gap-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Pencatatan</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
          <span class="text-xs text-red-500"> (pageData: {{ pageData.length }})</span>
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ loading ? '...' : formatRupiah(totalPagu) }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Realisasi (Rp)</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ loading ? '...' : formatRupiah(totalRealisasi) }}
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
            placeholder="Cari paket, satker, PPK..." 
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
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4 items-end">
        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status</label>
          <MazSelect
            v-model="selectedStatus"
            :options="statusOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Tipe Swakelola</label>
          <MazSelect
            v-model="selectedTipe"
            :options="tipeOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full">
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
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
            <th class="py-3 px-4 text-center w-16">No</th>
            <th class="py-3 px-4 min-w-[280px]">Informasi Paket</th>
            <th class="py-3 px-4 min-w-[200px]">Satker & PPK</th>
            <th class="py-3 px-4 min-w-[150px] text-right">Pagu & Realisasi</th>
            <th class="py-3 px-4 min-w-[150px] text-center">Status Pelaksanaan</th>
            <th class="py-3 px-4 w-24 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-sm">
          <tr v-if="pageData.length === 0 && !loading" class="text-center">
            <td colspan="6" class="py-12 text-[color:hsl(var(--maz-muted))]">Data tidak ditemukan.</td>
          </tr>
          <tr v-else-if="loading" class="text-center">
            <td colspan="6" class="py-12 text-[color:hsl(var(--maz-muted))]">Memuat data...</td>
          </tr>
          <tr v-else v-for="(row, idx) in pageData" :key="row.kd_swakelola_pct || idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors">
            
            <td class="py-3 px-4 text-center font-medium">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
            
            <td class="py-3 px-4">
              <div class="font-bold text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer" @click="openDetail(row)" :title="row.nama_paket">
                {{ row.nama_paket || '-' }}
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                  RUP: {{ row.kd_rup }}
                </span>
                <span v-if="row.kd_swakelola_pct" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                  ID: {{ row.kd_swakelola_pct }}
                </span>
              </div>
              <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
                {{ row.tipe_swakelola_nama || 'Tipe Swakelola -' }}
              </div>
            </td>
            
            <td class="py-3 px-4">
              <div class="font-medium text-xs truncate max-w-[200px]" :title="row.nama_satker">{{ row.nama_satker || '-' }}</div>
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1 font-semibold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                {{ row.ppk_nama_lengkap || row.nama_ppk || '-' }}
              </div>
              <div v-if="getUniquePenyedia(row.realisasi_list).length > 0" class="text-[10px] text-[color:hsl(var(--maz-primary))] mt-1.5 font-medium flex items-start gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
                </svg>
                <span class="line-clamp-2 leading-tight" :title="getUniquePenyedia(row.realisasi_list).join(', ')">
                  {{ getUniquePenyedia(row.realisasi_list).join(', ') }}
                </span>
              </div>
            </td>
            
            <td class="py-3 px-4 text-right">
              <div class="flex flex-col items-end">
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Pagu:</div>
                <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.pagu) }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Realisasi:</div>
                <div class="font-semibold text-[color:hsl(var(--maz-success))]">{{ formatRupiah(row.total_realisasi) }}</div>
              </div>
            </td>
            
            <td class="py-3 px-4">
              <div class="flex flex-col items-center gap-1.5 w-full">
                <span 
                  class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
                  :class="{
                    'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': row.status_swakelola_pct_ket === 'Paket Selesai',
                    'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': row.status_swakelola_pct === 'Aktif' && row.status_swakelola_pct_ket !== 'Paket Selesai',
                    'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': row.status_swakelola_pct !== 'Aktif' && row.status_swakelola_pct_ket !== 'Paket Selesai'
                  }"
                >
                  {{ row.status_swakelola_pct_ket || row.status_swakelola_pct || 'Unknown' }}
                </span>
                <div class="text-[10px] text-[color:hsl(var(--maz-muted))] text-center mt-1 w-full flex flex-col gap-0.5">
                  <span>{{ row.realisasi_list?.length || 0 }} Bukti Realisasi</span>
                </div>
              </div>
            </td>

            <td class="py-3 px-4 text-center">
              <MazBtn size="mini" color="info" outline @click="openDetail(row)" title="Lihat Detail Swakelola">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </MazBtn>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))]">
          Menampilkan <span class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - 
          <span class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> dari 
          <span class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ totalItems }}</span> data
        </div>
        
        <div class="flex items-center gap-2">
          <select v-model="itemsPerPage" @change="onFilterChange(false)" class="text-xs border border-[color:hsl(var(--maz-border))] rounded px-2 py-1 bg-transparent text-[color:hsl(var(--maz-foreground))] outline-none">
            <option :value="10">10 / hal</option>
            <option :value="25">25 / hal</option>
            <option :value="50">50 / hal</option>
            <option :value="100">100 / hal</option>
          </select>
          
          <div class="flex items-center gap-1">
            <button @click="currentPage > 1 ? (currentPage--, loadData(false)) : null" :disabled="currentPage === 1" class="p-1.5 rounded-md hover:bg-[color:hsl(var(--maz-foreground)_/_5%)] disabled:opacity-50 disabled:cursor-not-allowed text-[color:hsl(var(--maz-foreground))]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span class="text-xs font-medium px-2 text-[color:hsl(var(--maz-foreground))]">
              {{ currentPage }} / {{ totalPages }}
            </span>
            
            <button @click="currentPage < totalPages ? (currentPage++, loadData(false)) : null" :disabled="currentPage === totalPages" class="p-1.5 rounded-md hover:bg-[color:hsl(var(--maz-foreground)_/_5%)] disabled:opacity-50 disabled:cursor-not-allowed text-[color:hsl(var(--maz-foreground))]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal Pencatatan Swakelola Enriched -->
    <PencatatanSwakelolaEnrichedDetailDialog v-model="detailModal" :selected-row="selectedRow" />

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data Pencatatan Swakelola untuk Tahun Anggaran {{ selectedYear }}:
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
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data Pencatatan Swakelola untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { utils, writeFile } from 'xlsx';
import PencatatanSwakelolaEnrichedDetailDialog from './PencatatanSwakelolaEnrichedDetailDialog.vue';

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  },
  selectedSatker: {
    type: String,
    default: null
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
const totalPagu = ref(0);
const totalRealisasi = ref(0);

const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedTipe = ref('ALL');
const selectedSatker = ref('ALL');

const statusOptions = ref([{ label: 'Semua Status', value: 'ALL' }]);
const tipeOptions = ref([{ label: 'Semua Tipe', value: 'ALL' }]);
const satkerOptions = ref([{ label: 'Semua Satker', value: 'ALL' }]);

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

const getUniquePenyedia = (realisasiList) => {
  if (!realisasiList || !realisasiList.length) return [];
  const unique = [...new Set(realisasiList.map(r => r.nama_penyedia || r.nama_pelaksana).filter(Boolean))];
  return unique;
};

const openDetail = (row) => {
  selectedRow.value = row;
  detailModal.value = true;
};

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/merged/pencatatan-swakelola-enriched', {
      params: { 
        tahun: props.selectedYear,
          satker: props.selectedSatker || undefined,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterStatusSwakelola: selectedStatus.value !== 'ALL' ? selectedStatus.value : undefined, 
        filterTipeSwakelola: selectedTipe.value !== 'ALL' ? selectedTipe.value : undefined,
        filterSatker: selectedSatker.value !== 'ALL' ? selectedSatker.value : undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
    totalPagu.value = response.meta?.totalPagu || 0;
    totalRealisasi.value = response.meta?.totalRealisasi || 0;
    
    if (response.filterOptions) {
      if (response.filterOptions.statusSwakelola && response.filterOptions.statusSwakelola.length > 0) {
        statusOptions.value = [
          { label: 'Semua Status', value: 'ALL' },
          ...response.filterOptions.statusSwakelola.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.tipeSwakelola && response.filterOptions.tipeSwakelola.length > 0) {
        tipeOptions.value = [
          { label: 'Semua Tipe', value: 'ALL' },
          ...response.filterOptions.tipeSwakelola.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.satker && response.filterOptions.satker.length > 0) {
        satkerOptions.value = [
          { label: 'Semua Satker', value: 'ALL' },
          ...response.filterOptions.satker.map(opt => ({ label: opt, value: opt }))
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
const onFilterChange = (forceRefresh = false) => {
  currentPage.value = 1;
  loadData(forceRefresh);
};

// Debounce pencarian agar tidak hit API setiap ketik huruf
const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    onFilterChange(false);
  }, 500);
};

watch(() => props.selectedYear, () => {
  onFilterChange(true);
});

// Initial load
onMounted(() => {
  loadData(false);
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
          satker: props.selectedSatker || undefined,
      page: 1,
      limit: 100000 // limit besar untuk mengambil seluruh data
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) params.search = searchQuery.value;
      if (selectedStatus.value !== 'ALL') params.filterStatusSwakelola = selectedStatus.value;
      if (selectedTipe.value !== 'ALL') params.filterTipeSwakelola = selectedTipe.value;
      if (selectedSatker.value !== 'ALL') params.filterSatker = selectedSatker.value;
    }

    const res = await $fetch('/api/data/merged/pencatatan-swakelola-enriched', { params });

    if (res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Nama Paket Pencatatan': row.nama_paket || '-',
        'Kode RUP (Pencatatan)': row.kd_rup || '-',
        'Kode Pencatatan': row.kd_swakelola_pct || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Nama PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'Tipe Swakelola': row.tipe_swakelola || '-',
        'Pagu (Rp)': row.pagu || 0,
        'Total Realisasi (Rp)': row.total_realisasi || 0,
        'Status (Pencatatan)': row.status_swakelola || '-',
        'Penyedia (Pencatatan)': getUniquePenyedia(row.realisasi_list).join(', '),
        // RUP Info
        'Nama Paket (RUP)': row.rup_nama_paket || '-',
        'Sasaran (RUP)': row.rup_sasaran || '-'
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Pencatatan Swakelola");

      const wscols = [
        {wch: 5}, {wch: 40}, {wch: 15}, {wch: 20}, {wch: 30}, {wch: 30},
        {wch: 15}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 30},
        {wch: 40}, {wch: 30}
      ];
      ws['!cols'] = wscols;

      const filename = `Pencatatan_Swakelola_${props.selectedYear}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
