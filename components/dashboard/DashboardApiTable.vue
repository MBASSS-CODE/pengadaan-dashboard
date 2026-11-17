<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[color:hsl(var(--maz-primary)_/_12%)] text-[color:hsl(var(--maz-primary))] border border-[color:hsl(var(--maz-primary)_/_25%)]">
            {{ group }}/{{ endpoint }}
          </span>
          <span
            v-if="params && params.length"
            class="px-2 py-0.5 rounded text-[11px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]"
          >
            Param: {{ params.join(', ') }}
          </span>
        </div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">{{ title }}</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">
          {{ subtitle || `Data dari endpoint ${group}/${endpoint}` }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <!-- Filter Tahun Dinamis -->
        <select
          v-model="selectedYear"
          class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors"
          @change="onFilterChange(true)"
        >
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>

        <MazBtn
          @click="exportModal = true"
          color="success"
          :disabled="loading || totalItems === 0"
          class="mr-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </MazBtn>

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
      <!-- Search & Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col lg:flex-row gap-4 items-end justify-between">
        <div class="w-full lg:flex-1 lg:max-w-md">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">
            {{ isSummaryView ? 'Filter Metrik' : 'Pencarian' }}
          </label>
          <MazInput
            v-if="!isSummaryView"
            v-model="searchQuery"
            placeholder="Cari data di semua kolom..."
            size="sm"
            clearable
            @update:model-value="onSearchDebounced"
          >
            <template #left-icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MazInput>
          <MazInput
            v-else
            v-model="metricSearch"
            placeholder="Cari nama metrik ringkasan..."
            size="sm"
            clearable
          >
            <template #left-icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MazInput>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 w-full lg:w-auto">
          <!-- Filter Satker Lokal (jika data memiliki kolom satker) -->
          <div v-if="satkerOptions.length > 1 && !isSummaryView" class="w-full sm:w-64">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">
              Satuan Kerja
            </label>
            <MazSelect
              v-model="selectedSatker"
              :options="satkerOptions"
              size="sm"
              search
              @update:model-value="onFilterChange(false)"
            />
          </div>

          <!-- Toggle Summary Cards / Table View jika data berupa single-object ringkasan -->
          <div v-if="canShowSummaryCards" class="flex items-center gap-2">
            <MazBtn
              :color="viewMode === 'cards' ? 'primary' : 'transparent'"
              :outline="viewMode !== 'cards'"
              size="sm"
              @click="viewMode = 'cards'"
            >
              Ringkasan
            </MazBtn>
            <MazBtn
              :color="viewMode === 'table' ? 'primary' : 'transparent'"
              :outline="viewMode !== 'table'"
              size="sm"
              @click="viewMode = 'table'"
            >
              Tabel
            </MazBtn>
          </div>

          <div class="text-xs text-[color:hsl(var(--maz-muted))] pb-2 whitespace-nowrap">
            Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalItems.toLocaleString('id-ID') }}</strong> data
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <p v-if="errorMessage" class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">{{ errorMessage }}</p>
        <MazBtn @click="loadData(true)" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- Loading State for Summary View -->
      <div v-else-if="loading && isSummaryView" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
        <MazSpinner color="primary" class="text-4xl mb-3" />
        <p class="text-sm">Memuat data {{ title }}...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && pageData.length === 0" class="flex flex-col items-center justify-center py-16 text-[color:hsl(var(--maz-muted))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="font-medium text-sm text-[color:hsl(var(--maz-foreground))]">Belum Ada Data</p>
        <p class="text-xs mt-1">Data belum tersinkronisasi atau tidak ditemukan untuk filter ini.</p>
        <MazBtn @click="loadData(true)" size="sm" color="primary" class="mt-4">Sinkronisasi Sekarang</MazBtn>
      </div>

      <!-- Summary KPI Cards View (untuk endpoint */summary atau single-object) -->
      <div v-else-if="isSummaryView && (summaryEntries.length > 0 || summaryArraySections.length > 0)" class="p-6 space-y-6">
        <div v-if="filteredSummaryEntries.length === 0 && summaryArraySections.length === 0" class="py-12 text-center text-sm text-[color:hsl(var(--maz-muted))]">
          Tidak ada metrik yang cocok dengan pencarian "{{ metricSearch }}".
        </div>
        <div v-else-if="filteredSummaryEntries.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="item in filteredSummaryEntries"
            :key="item.key"
            class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col justify-between"
          >
            <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1.5">
              {{ item.label }}
            </div>
            <div
              class="text-lg font-bold break-words"
              :class="item.isCurrency ? 'text-green-600 dark:text-green-400' : item.isPercent ? 'text-[color:hsl(var(--maz-primary))]' : 'text-[color:hsl(var(--maz-foreground))]'"
            >
              {{ item.formatted }}
            </div>
          </div>
        </div>

        <!-- Tabel rincian jika ada properti array (mis. progress di realisasi-rup/summary) -->
        <div v-for="section in summaryArraySections" :key="section.key" class="space-y-3">
          <h2 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))]">
            {{ section.label }}
          </h2>
          <div class="rounded-xl border border-[color:hsl(var(--maz-border))] overflow-x-auto">
            <MazTable
              size="sm"
              color="primary"
              hoverable
              background-even
              :headers="section.headers"
              :rows="section.rows"
            >
              <template v-for="col in section.columns" :key="col.key" #[`cell-${col.key}`]="{ row }">
                <span v-if="isCurrency(col.key, row[col.key])" class="font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                  {{ formatCurrency(row[col.key]) }}
                </span>
                <span v-else-if="typeof row[col.key] === 'number'" class="font-medium whitespace-nowrap">
                  {{ Number(row[col.key]).toLocaleString('id-ID') }}
                </span>
                <span v-else class="text-xs whitespace-nowrap">
                  {{ formatCell(col.key, row[col.key]) }}
                </span>
              </template>
            </MazTable>
          </div>
        </div>
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
          :headers="tableHeaders"
          :rows="pageData"
          @update:page="loadData(false)"
          @update:page-size="onFilterChange(false)"
        >
          <template #cell-index="{ row }">
            <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
          </template>

          <template v-for="col in columns" :key="col.key" #[`cell-${col.key}`]="{ row }">
            <span
              v-if="isCurrency(col.key, row[col.key])"
              class="font-bold text-green-600 dark:text-green-400 whitespace-nowrap"
            >
              {{ formatCurrency(row[col.key]) }}
            </span>
            <span
              v-else-if="isPercentage(col.key, row[col.key])"
              class="font-semibold text-[color:hsl(var(--maz-primary))] whitespace-nowrap"
            >
              {{ formatPercent(row[col.key]) }}
            </span>
            <span
              v-else-if="isBoolean(row[col.key])"
              class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full border border-transparent leading-none"
              :class="row[col.key]
                ? 'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]'
                : 'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]'"
            >
              {{ row[col.key] ? 'Ya' : 'Tidak' }}
            </span>
            <span
              v-else-if="typeof row[col.key] === 'number'"
              class="font-medium text-[color:hsl(var(--maz-foreground))] whitespace-nowrap"
            >
              {{ Number(row[col.key]).toLocaleString('id-ID') }}
            </span>
            <span
              v-else
              class="text-xs text-[color:hsl(var(--maz-foreground))] block max-w-[260px] truncate"
              :title="formatCell(col.key, row[col.key])"
            >
              {{ formatCell(col.key, row[col.key]) }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <MazBtn @click="openDetail(row)" size="xs" color="primary" outline>
              Lihat
            </MazBtn>
          </template>
        </MazTable>
      </div>
    </div>

    <!-- Detail Modal Dialog -->
    <MazDialog v-model="detailModal" :title="`Detail Data - ${title}`" width="720px">
      <div v-if="selectedRow" class="space-y-4 max-h-[60vh] overflow-y-auto pr-2 py-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="(val, key) in cleanSelectedRow"
            :key="key"
            class="p-3 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]"
          >
            <div class="text-[11px] font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-1">
              {{ formatHeaderLabel(String(key)) }}
            </div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-foreground))] break-words">
              <span v-if="isCurrency(String(key), val)" class="font-bold text-green-600 dark:text-green-400">
                {{ formatCurrency(val) }}
              </span>
              <span v-else-if="isPercentage(String(key), val)" class="font-bold text-[color:hsl(var(--maz-primary))]">
                {{ formatPercent(val) }}
              </span>
              <span
                v-else-if="isBoolean(val)"
                class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                :class="val
                  ? 'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)]'
                  : 'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-muted))]'"
              >
                {{ val ? 'Ya' : 'Tidak' }}
              </span>
              <span v-else-if="typeof val === 'number'" class="font-semibold">
                {{ Number(val).toLocaleString('id-ID') }}
              </span>
              <span v-else>
                {{ formatCell(String(key), val) }}
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
          Pilih mode ekspor data untuk {{ title }} (Tahun Anggaran {{ selectedYear }}):
        </p>

        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">
                  Mengekspor data yang tampil berdasarkan pencarian dan filter yang aktif (estimasi: {{ totalItems }} baris).
                </div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">
                  Mengekspor seluruh data tersimpan pada tahun anggaran {{ selectedYear }} (estimasi: {{ totalAllItems }} baris).
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
    default: () => ['tahun', 'jenis', 'instansi']
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

// Filter Satker Lokal (dari filterOptions hasil server cache)
const selectedSatker = ref('ALL');
const satkerOptions = ref([{ label: 'Semua Satuan Kerja', value: 'ALL' }]);

// Search & Pagination
const searchQuery = ref('');
const metricSearch = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
let searchTimer = null;

// Mode Tampilan (Kartu Ringkasan vs Tabel)
const viewMode = ref('cards');

// Modal Detail
const detailModal = ref(false);
const selectedRow = ref(null);

// Export Excel
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

/**
 * Unwrap { data: { ... } } & flatten simple nested object keys so every metric/column renders cleanly
 */
const normalizeRow = (item) => {
  if (!item || typeof item !== 'object') return {};
  let source = item;
  if (
    source.data &&
    typeof source.data === 'object' &&
    !Array.isArray(source.data) &&
    Object.keys(source).filter((k) => k !== '_index').length === 1
  ) {
    source = source.data;
  }

  const normalized = {};
  for (const [key, val] of Object.entries(source)) {
    if (key === '_index') continue;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const [subKey, subVal] of Object.entries(val)) {
        normalized[`${key}_${subKey}`] = subVal;
      }
    } else {
      normalized[key] = val;
    }
  }
  return normalized;
};

const cleanSelectedRow = computed(() => {
  if (!selectedRow.value) return {};
  const copy = { ...selectedRow.value };
  delete copy._index;
  return copy;
});

// Tampilkan kartu ringkasan otomatis untuk endpoint summary atau single-object lebar
const canShowSummaryCards = computed(() => {
  if (totalAllItems.value !== 1 || pageData.value.length !== 1) return false;
  const keys = Object.keys(pageData.value[0] || {}).filter((k) => k !== '_index');
  return props.endpoint.endsWith('/summary') || keys.length >= 6;
});

const isSummaryView = computed(() => {
  return canShowSummaryCards.value && viewMode.value === 'cards';
});

const formatHeaderLabel = (key) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const isPercentage = (key, val) => {
  if (typeof val !== 'number') return false;
  const lower = key.toLowerCase();
  return (
    lower.includes('persen') ||
    lower.includes('percent') ||
    lower.includes('capaian') ||
    lower.includes('komitmen') ||
    lower.includes('thd_') ||
    (lower.startsWith('pelaksanaan_pdn') && val <= 100) ||
    (lower.startsWith('perencanaan_pdn') && val <= 100) ||
    (lower.startsWith('perencanaan_epurchasing') && val <= 100)
  );
};

const isCurrency = (key, val) => {
  if (typeof val !== 'number') return false;
  if (isPercentage(key, val)) return false;
  const lower = key.toLowerCase();
  if (
    lower.includes('paket') ||
    lower.includes('jumlah') ||
    lower.includes('count') ||
    lower === 'total_realisasi' ||
    lower === 'total_rup' ||
    lower === 'total_pembayaran'
  ) {
    return false;
  }
  return (
    lower.includes('nilai') ||
    lower.includes('pagu') ||
    lower.includes('anggaran') ||
    lower.includes('realisasi') ||
    lower.includes('biaya') ||
    lower.includes('harga') ||
    lower.includes('nominal') ||
    lower.includes('belanja') ||
    lower.includes('pembayaran') ||
    lower.includes('total_pelaksanaan') ||
    lower.includes('total_perencanaan') ||
    lower.includes('total_epurchasing') ||
    lower.includes('pdn_pelaksanaan') ||
    lower.includes('pelaksanaan_epurchasing') ||
    lower.includes('pelaksanaan_total') ||
    lower.includes('perencanaan_total')
  );
};

const isBoolean = (val) => typeof val === 'boolean';

const formatCurrency = (val) => {
  if (val === null || val === undefined) return '-';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatPercent = (val) => {
  if (val === null || val === undefined) return '-';
  return `${Number(val).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`;
};

const formatCell = (key, val) => {
  if (val === null || val === undefined || val === '') return '-';
  if (Array.isArray(val)) return val.length ? `${val.length} item` : '-';
  if (typeof val === 'object') return JSON.stringify(val);
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

const summaryEntries = computed(() => {
  if (!pageData.value.length) return [];
  const row = pageData.value[0];
  return Object.entries(row)
    .filter(([key, val]) => key !== '_index' && !(Array.isArray(val) && val.length > 0 && typeof val[0] === 'object'))
    .map(([key, val]) => {
      const currency = isCurrency(key, val);
      const percent = isPercentage(key, val);
      let formatted = '-';
      if (currency) formatted = formatCurrency(val);
      else if (percent) formatted = formatPercent(val);
      else if (isBoolean(val)) formatted = val ? 'Ya' : 'Tidak';
      else if (typeof val === 'number') formatted = Number(val).toLocaleString('id-ID');
      else formatted = formatCell(key, val);

      return {
        key,
        label: formatHeaderLabel(key),
        isCurrency: currency,
        isPercent: percent,
        formatted
      };
    });
});

const summaryArraySections = computed(() => {
  if (!pageData.value.length) return [];
  const row = pageData.value[0];
  return Object.entries(row)
    .filter(([key, val]) => key !== '_index' && Array.isArray(val) && val.length > 0 && typeof val[0] === 'object')
    .map(([key, val]) => {
      const keySet = new Set();
      val.forEach((item) => {
        Object.keys(item || {}).forEach((k) => keySet.add(k));
      });
      const cols = Array.from(keySet).map((k) => ({ key: k, label: formatHeaderLabel(k) }));
      return {
        key,
        label: formatHeaderLabel(key),
        columns: cols,
        headers: cols.map((c) => ({ label: c.label, key: c.key, sortable: false, classes: 'whitespace-nowrap' })),
        rows: val
      };
    });
});

const filteredSummaryEntries = computed(() => {
  const q = metricSearch.value.trim().toLowerCase();
  if (!q) return summaryEntries.value;
  return summaryEntries.value.filter(
    (entry) =>
      entry.label.toLowerCase().includes(q) ||
      entry.key.toLowerCase().includes(q) ||
      entry.formatted.toLowerCase().includes(q)
  );
});

// Kolom dinamis berdasarkan isi baris data
const columns = computed(() => {
  if (!pageData.value || pageData.value.length === 0) return [];

  const keySet = new Set();
  pageData.value.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (k !== '_index') keySet.add(k);
    });
  });

  return Array.from(keySet).map((key) => ({
    key,
    label: formatHeaderLabel(key)
  }));
});

const tableHeaders = computed(() => {
  return [
    { label: 'No', key: 'index', align: 'center', width: '4rem', sortable: false },
    ...columns.value.map((col) => ({
      label: col.label,
      key: col.key,
      sortable: false,
      classes: 'whitespace-nowrap'
    })),
    { label: 'Aksi', key: 'actions', align: 'center', width: '5rem', sortable: false }
  ];
});

const openDetail = (row) => {
  selectedRow.value = row;
  detailModal.value = true;
};

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
      filterSatker: selectedSatker.value !== 'ALL' ? selectedSatker.value : undefined,
      forceRefresh: force ? 'true' : undefined
    };

    const res = await $fetch(`/api/data/${props.group}/${props.endpoint}`, {
      params: requestParams
    });

    const raw = res.data || [];
    pageData.value = raw.map((item, index) => ({ ...normalizeRow(item), _index: index }));
    totalItems.value = res.meta?.totalItems ?? raw.length;
    totalPages.value = res.meta?.totalPages ?? (raw.length ? 1 : 0);
    totalAllItems.value = res.meta?.totalAllItems ?? raw.length;

    if (res.filterOptions?.satker) {
      satkerOptions.value = [
        { label: 'Semua Satuan Kerja', value: 'ALL' },
        ...res.filterOptions.satker.map((s) => ({ label: s, value: s }))
      ];
    }
  } catch (err) {
    console.error(`Error fetching /api/data/${props.group}/${props.endpoint}:`, err);
    error.value = true;
    errorMessage.value = err.data?.statusMessage || err.message || 'Terjadi kesalahan saat memuat data';
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

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const requestParams = {
      tahun: selectedYear.value,
      page: 1,
      limit: 100000
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) requestParams.search = searchQuery.value;
      if (selectedSatker.value !== 'ALL') requestParams.filterSatker = selectedSatker.value;
    }

    const res = await $fetch(`/api/data/${props.group}/${props.endpoint}`, {
      params: requestParams
    });

    const exportData = (res.data || pageData.value).map((item, idx) => ({
      No: idx + 1,
      ...normalizeRow(item)
    }));

    const worksheet = utils.json_to_sheet(exportData);
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
  loadData(false);
});
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
