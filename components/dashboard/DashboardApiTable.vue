<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {{ group }}/{{ endpoint }}
          </span>
          <span v-if="params && params.length" class="text-xs text-[color:hsl(var(--maz-muted))]">
            Param: {{ params.join(', ') }}
          </span>
        </div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">{{ title }}</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">{{ subtitle || `Data dari endpoint ${group}/${endpoint}` }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <!-- Filter Tahun -->
        <select 
          v-model="selectedYear" 
          class="px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors"
          @change="onFilterChange(true)"
        >
          <option v-for="year in availableYears" :key="year" :value="year">Tahun {{ year }}</option>
        </select>

        <!-- Filter Satker (jika didukung parameter) -->
        <div v-if="supportsSatker" class="relative">
          <select 
            v-model="selectedSatker" 
            class="max-w-[220px] truncate px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors"
            @change="onFilterChange(true)"
          >
            <option value="">Semua Satuan Kerja</option>
            <option v-for="s in satkerList" :key="s.kd_satker" :value="String(s.kd_satker)">
              {{ s.nama_satker }} ({{ s.kd_satker }})
            </option>
          </select>
        </div>

        <!-- Tombol Export Excel -->
        <MazBtn @click="exportModal = true" color="success" size="sm" :disabled="loading || totalItems === 0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export
        </MazBtn>

        <!-- Tombol Refresh / Sinkronisasi -->
        <MazBtn @click="loadData(true)" :loading="loading" color="primary" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </MazBtn>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      <!-- Search & Controls Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div class="relative flex-1 max-w-md">
          <input 
            v-model="searchQuery" 
            type="text"
            placeholder="Cari data di semua kolom..." 
            class="w-full pl-9 pr-4 py-1.5 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors"
            @input="onSearchDebounced"
          />
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-2.5 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div class="flex items-center gap-3 text-xs text-[color:hsl(var(--maz-muted))] justify-between sm:justify-end">
          <span>Menampilkan {{ totalItems }} data</span>
          <div class="flex items-center gap-1.5">
            <span>Per hal:</span>
            <select 
              v-model="itemsPerPage" 
              class="px-2 py-1 text-xs bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded focus:outline-none"
              @change="onFilterChange(false)"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
        <MazSpinner color="primary" class="text-4xl mb-3" />
        <p class="text-sm">Memuat data dari {{ endpoint }}...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16 text-rose-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium text-sm">Gagal memuat data dari server.</p>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">{{ errorMessage }}</p>
        <MazBtn @click="loadData(true)" size="sm" outline class="mt-3">Coba Lagi</MazBtn>
      </div>

      <!-- Empty State -->
      <div v-else-if="pageData.length === 0" class="flex flex-col items-center justify-center py-16 text-[color:hsl(var(--maz-muted))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="font-medium text-sm text-[color:hsl(var(--maz-foreground))]">Belum Ada Data</p>
        <p class="text-xs mt-1">Data belum tersinkronisasi atau tidak ditemukan untuk filter ini.</p>
        <MazBtn @click="loadData(true)" size="sm" color="primary" class="mt-3">
          Sinkronisasi Sekarang
        </MazBtn>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr class="border-b border-[color:hsl(var(--maz-border))] bg-slate-50/75 dark:bg-slate-800/40">
              <th class="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-12 text-center">No</th>
              <th 
                v-for="col in columns" 
                :key="col.key"
                @click="sortBy(col.key)"
                class="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer select-none whitespace-nowrap hover:text-blue-600 transition-colors"
              >
                <div class="flex items-center gap-1">
                  <span>{{ col.label }}</span>
                  <span v-if="sortKey === col.key" class="text-xs text-blue-600">
                    {{ sortOrder === 'asc' ? '▲' : '▼' }}
                  </span>
                </div>
              </th>
              <th class="py-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 w-16 text-center">Detail</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr 
              v-for="(row, idx) in sortedRows" 
              :key="idx"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-2.5 px-3 text-center font-medium text-slate-400">
                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
              </td>
              <td 
                v-for="col in columns" 
                :key="col.key"
                class="py-2.5 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap max-w-[260px] truncate"
                :title="String(row[col.key] ?? '')"
              >
                <span v-if="isCurrency(col.key, row[col.key])" class="font-semibold text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(row[col.key]) }}
                </span>
                <span v-else-if="isBoolean(row[col.key])" :class="row[col.key] ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'" class="px-2 py-0.5 rounded text-xs font-medium">
                  {{ row[col.key] ? 'Ya' : 'Tidak' }}
                </span>
                <span v-else>
                  {{ formatCell(col.key, row[col.key]) }}
                </span>
              </td>
              <td class="py-2.5 px-3 text-center">
                <button 
                  @click="openDetail(row)"
                  class="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                  title="Lihat Detail JSON"
                >
                  Lihat
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalPages > 1" class="p-3 border-t border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
        <div class="text-xs text-[color:hsl(var(--maz-muted))]">
          Halaman {{ currentPage }} dari {{ totalPages }} (Total {{ totalItems }} data)
        </div>
        <div class="flex items-center gap-1">
          <button 
            :disabled="currentPage === 1"
            @click="goToPage(1)"
            class="px-2.5 py-1 text-xs border border-[color:hsl(var(--maz-border))] rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            «
          </button>
          <button 
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            class="px-2.5 py-1 text-xs border border-[color:hsl(var(--maz-border))] rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>
          <span class="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-900">
            {{ currentPage }}
          </span>
          <button 
            :disabled="currentPage >= totalPages"
            @click="goToPage(currentPage + 1)"
            class="px-2.5 py-1 text-xs border border-[color:hsl(var(--maz-border))] rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
          <button 
            :disabled="currentPage >= totalPages"
            @click="goToPage(totalPages)"
            class="px-2.5 py-1 text-xs border border-[color:hsl(var(--maz-border))] rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            »
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal Dialog -->
    <MazDialog v-model="detailModal" :title="`Detail Data - ${title}`" width="700px">
      <div v-if="selectedRow" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div 
            v-for="(val, key) in cleanSelectedRow" 
            :key="key" 
            class="p-2.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-slate-50/50 dark:bg-slate-800/30"
          >
            <div class="text-[11px] font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-1">
              {{ formatHeaderLabel(String(key)) }}
            </div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-foreground))] break-words">
              <span v-if="isCurrency(String(key), val)" class="font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatCurrency(val) }}
              </span>
              <span v-else-if="isBoolean(val)" :class="val ? 'text-emerald-600 font-semibold' : 'text-slate-500'">
                {{ val ? 'Ya' : 'Tidak' }}
              </span>
              <span v-else>
                {{ val !== null && val !== undefined && val !== '' ? String(val) : '-' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <MazBtn @click="detailModal = false" color="primary" size="sm">Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>

    <!-- Modal Export Excel -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih data yang ingin diekspor untuk {{ title }} (Tahun {{ selectedYear }}):
        </p>
        
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">
                  Mengekspor data berdasarkan pencarian dan filter yang aktif (estimasi: {{ totalItems }} baris).
                </div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">
                  Mengekspor seluruh data tersimpan pada tahun {{ selectedYear }} (estimasi: {{ totalAllItems }} baris).
                </div>
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
import { ref, computed, onMounted } from 'vue';
import { utils, writeFile } from 'xlsx';

const props = defineProps({
  group: {
    type: String,
    default: 'dashboard'
  },
  endpoint: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  params: {
    type: Array,
    default: () => ['tahun', 'kd_klpd', 'kd_satker']
  }
});

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');

const pageData = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const totalAllItems = ref(0);

// Tahun
const currentYear = new Date().getFullYear();
const availableYears = [
  currentYear.toString(),
  (currentYear - 1).toString()
];
const selectedYear = ref(currentYear.toString());

// Satker
const selectedSatker = ref('');
const satkerList = ref([]);
const supportsSatker = computed(() => {
  return props.params.some(p => p.toLowerCase().includes('satker'));
});

// Search & Pagination
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
let searchTimer = null;

// Sorting
const sortKey = ref('');
const sortOrder = ref('asc');

// Modal Detail
const detailModal = ref(false);
const selectedRow = ref(null);
const cleanSelectedRow = computed(() => {
  if (!selectedRow.value) return {};
  const copy = { ...selectedRow.value };
  delete copy._index;
  return copy;
});

// Export Excel
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

// Kolom dinamis berdasarkan isi baris data
const columns = computed(() => {
  if (!pageData.value || pageData.value.length === 0) return [];
  
  // Ambil semua key unik dari data
  const keySet = new Set();
  pageData.value.forEach(row => {
    Object.keys(row).forEach(k => {
      if (k !== '_index') keySet.add(k);
    });
  });

  return Array.from(keySet).map(key => ({
    key,
    label: formatHeaderLabel(key)
  }));
});

// Sorting client-side untuk halaman aktif
const sortedRows = computed(() => {
  if (!sortKey.value) return pageData.value;
  return [...pageData.value].sort((a, b) => {
    const valA = a[sortKey.value];
    const valB = b[sortKey.value];
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    let res = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      res = valA - valB;
    } else {
      res = String(valA).localeCompare(String(valB));
    }
    return sortOrder.value === 'asc' ? res : -res;
  });
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const formatHeaderLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

const isCurrency = (key, val) => {
  if (typeof val !== 'number') return false;
  const lower = key.toLowerCase();
  return lower.includes('nilai') || lower.includes('pagu') || lower.includes('anggaran') || lower.includes('realisasi') || lower.includes('biaya') || lower.includes('harga') || lower.includes('nominal');
};

const isBoolean = (val) => {
  return typeof val === 'boolean';
};

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '-';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatCell = (key, val) => {
  if (val === null || val === undefined || val === '') return '-';
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  // Cek tanggal ISO
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).format(d);
      }
    } catch (_) {}
  }
  return String(val);
};

const openDetail = (row) => {
  selectedRow.value = row;
  detailModal.value = true;
};

// Ambil daftar master satker untuk dropdown
const fetchSatkerList = async () => {
  try {
    const res = await $fetch('/api/data/rup/master-satker', {
      params: { tahun: selectedYear.value, limit: 1000 }
    });
    if (res && res.data) {
      satkerList.value = res.data;
    }
  } catch (e) {
    console.warn('Gagal memuat list satker:', e);
  }
};

// Load data utama
const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  errorMessage.value = '';

  try {
    const requestParams = {
      tahun: selectedYear.value,
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      forceRefresh: force ? 'true' : undefined
    };

    if (supportsSatker.value && selectedSatker.value) {
      requestParams.kd_satker = selectedSatker.value;
      requestParams.filterSatker = selectedSatker.value;
    }

    const res = await $fetch(`/api/data/${props.group}/${props.endpoint}`, {
      params: requestParams
    });

    const raw = res.data || [];
    pageData.value = raw.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = res.meta?.totalItems ?? raw.length;
    totalPages.value = res.meta?.totalPages ?? (raw.length ? 1 : 0);
    totalAllItems.value = res.meta?.totalAllItems ?? raw.length;
  } catch (err) {
    console.error(`Error fetching /api/data/${props.group}/${props.endpoint}:`, err);
    error.value = true;
    errorMessage.value = err.message || 'Terjadi kesalahan saat memuat data';
  } finally {
    loading.value = false;
  }
};

const onFilterChange = (force = false) => {
  currentPage.value = 1;
  loadData(force);
};

const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadData(false);
  }, 400);
};

const goToPage = (page) => {
  currentPage.value = page;
  loadData(false);
};

const executeExport = async () => {
  exportLoading.value = true;
  try {
    let exportData = [];

    if (exportMode.value === 'filtered') {
      // Ambil seluruh data hasil filter
      const res = await $fetch(`/api/data/${props.group}/${props.endpoint}`, {
        params: {
          tahun: selectedYear.value,
          limit: 100000,
          search: searchQuery.value || undefined,
          kd_satker: selectedSatker.value || undefined,
          filterSatker: selectedSatker.value || undefined
        }
      });
      exportData = res.data || pageData.value;
    } else {
      // Seluruh data tanpa filter
      const res = await $fetch(`/api/data/${props.group}/${props.endpoint}`, {
        params: {
          tahun: selectedYear.value,
          limit: 100000
        }
      });
      exportData = res.data || pageData.value;
    }

    // Bersihkan field internal _index
    const cleanData = exportData.map(item => {
      const copy = { ...item };
      delete copy._index;
      return copy;
    });

    const worksheet = utils.json_to_sheet(cleanData);
    const workbook = utils.book_new();
    const sheetName = props.endpoint.replace(/\//g, '_').substring(0, 31);
    utils.book_append_sheet(workbook, worksheet, sheetName);
    writeFile(workbook, `${props.group}_${sheetName}_${selectedYear.value}.xlsx`);
    
    exportModal.value = false;
  } catch (err) {
    console.error('Export Excel failed:', err);
    alert('Gagal mengekspor data ke Excel: ' + (err.message || 'Error'));
  } finally {
    exportLoading.value = false;
  }
};

onMounted(() => {
  if (supportsSatker.value) {
    fetchSatkerList();
  }
  loadData(false);
});
</script>
