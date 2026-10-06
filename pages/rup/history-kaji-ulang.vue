<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">History Kaji Ulang RUP</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar riwayat kaji ulang paket Rencana Umum Pengadaan</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Filter Tahun (Contoh) -->
        <select v-model="selectedYear" class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange(true)">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>

        <div class="flex gap-2">
          <MazBtn @click="exportModal = true" color="success" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Excel
          </MazBtn>
        </div>
        
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
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col lg:flex-row lg:items-center gap-4">
        <div class="flex-1 min-w-[250px] flex items-center gap-4">
          <div class="flex-grow">
            <MazInput 
              v-model="searchQuery" 
              placeholder="Cari nama satker atau alasan..." 
              size="sm"
              block
              class="w-full"
              @update:model-value="onSearchDebounced"
            >
              <template #left-icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </MazInput>
          </div>
        </div>

        <div class="w-full lg:w-48">
          <MazInput 
            type="date"
            label="Tgl Kaji Ulang"
            v-model="filterDate" 
            size="sm"
            @update:model-value="onFilterChange()"
          />
        </div>

        <div class="w-full lg:w-48">
          <select v-model="filterJenisRevisi" class="w-full px-3 py-1.5 h-[2.25rem] text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
            <option value="">Semua Jenis Revisi</option>
            <option value="SATUKESATU">SATUKESATU</option>
            <option value="PEMBATALAN">PEMBATALAN</option>
            <option value="PENGAKTIFAN">PENGAKTIFAN</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
        <MazSpinner color="primary" class="text-[3rem] mb-4" />
        <p>Memuat data riwayat kaji ulang...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
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
          { label: 'Tgl Kaji Ulang', key: 'tgl_kaji_ulang', sortable: false },
          { label: 'Satuan Kerja', key: 'satker', sortable: false, classes: 'min-w-[250px]' },
          { label: 'Kode RUP (Lama -> Baru)', key: 'kd_rup', sortable: false },
          { label: 'Jenis Revisi', key: 'jenis_revisi', sortable: false },
          { label: 'Alasan', key: 'alasan', sortable: false, classes: 'min-w-[200px]' }
        ]"
        :rows="pageData"
        @update:page="loadData(false)"
        @update:page-size="onFilterChange(false)"
      >
        <template #cell-index="{ row }">
          <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
        </template>
        
        <template #cell-tgl_kaji_ulang="{ row }">
          <span class="whitespace-nowrap">{{ formatDate(row.tgl_kaji_ulang) }}</span>
        </template>
        
        <template #cell-satker="{ row }">
          <div class="font-medium text-[color:hsl(var(--maz-primary))]">{{ row.nama_satker }}</div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">{{ row.nama_klpd }} ({{ row.kd_satker_str }})</div>
        </template>
        
        <template #cell-kd_rup="{ row }">
          <div class="flex items-center gap-2">
            <span class="text-[color:hsl(var(--maz-muted))] line-through">{{ row.kd_rup_lama }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span class="font-semibold text-[color:hsl(var(--maz-success))]">{{ row.kd_rup_baru }}</span>
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 capitalize">{{ row.jenis_paket?.toLowerCase() }}</div>
        </template>
        
        <template #cell-jenis_revisi="{ row }">
          <span 
            class="px-2.5 py-1 text-xs font-semibold rounded-full border border-transparent"
            :class="{
              'bg-[color:hsl(var(--maz-destructive)_/_15%)] text-[color:hsl(var(--maz-destructive)_/_100%)] dark:bg-[color:hsl(var(--maz-destructive)_/_20%)]': row.jenis_revisi === 'PEMBATALAN',
              'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': row.jenis_revisi === 'SATUKESATU',
              'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': !['PEMBATALAN', 'SATUKESATU'].includes(row.jenis_revisi)
            }"
          >
            {{ row.jenis_revisi }}
          </span>
        </template>
        
        <template #cell-alasan="{ row }">
          <div class="text-sm max-w-xs truncate" :title="row.alasan_kajiulang">
            {{ row.alasan_kajiulang }}
          </div>
        </template>
        </MazTable>
      </div>
    </div>

    <!-- Modal Export -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data History Kaji Ulang untuk Tahun Anggaran {{ selectedYear }}:
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
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data transaksi untuk tahun anggaran {{ selectedYear }} tanpa filter apapun (estimasi: {{ totalAllItems }} data).</div>
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

// Generate dynamic years (Current Year and 3 previous years)
const currentYear = new Date().getFullYear();
const availableYears = [
  currentYear.toString(), 
  (currentYear - 1).toString()
];
const selectedYear = ref(currentYear.toString());
const searchQuery = ref('');
const filterDate = ref('');
const filterJenisRevisi = ref('');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce timer
let searchTimer = null;

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/rup/history-kaji-ulang', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterDate: filterDate.value || undefined,
        filterJenisRevisi: filterJenisRevisi.value || undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Ketika filter berubah, reset ke halaman 1 lalu fetch
const onFilterChange = (forceRefresh = false) => {
  currentPage.value = 1;
  loadData(forceRefresh);
};

// Debounced search — tunggu 400ms setelah user berhenti mengetik
const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadData(false);
  }, 400);
};

// Navigasi halaman
const goToPage = (page) => {
  currentPage.value = page;
  loadData(false);
};

onMounted(() => {
  loadData(false);
});

// Export Excel state & functions
const exportModal = ref(false);
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
      if (filterDate.value) params.filterDate = filterDate.value;
      if (filterJenisRevisi.value) params.filterJenisRevisi = filterJenisRevisi.value;
    }

    const response = await $fetch('/api/data/rup/history-kaji-ulang', { params });
    
    if (response.data) {
      const flatData = response.data.map((row, i) => ({
        'No.': i + 1,
        'Tgl Kaji Ulang': formatDate(row.tgl_kaji_ulang),
        'Nama Satker': row.nama_satker || '-',
        'Kode Satker': row.kd_satker_str || '-',
        'Kode RUP Lama': row.kd_rup_lama || '-',
        'Kode RUP Baru': row.kd_rup_baru || '-',
        'Jenis Revisi': row.jenis_revisi || '-',
        'Alasan Kaji Ulang': row.alasan_kajiulang || '-',
        'Jenis Paket': row.jenis_paket || '-'
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "History_Kaji_Ulang");

      const wscols = [
        {wch: 5}, {wch: 20}, {wch: 40}, {wch: 15}, {wch: 15}, {wch: 15},
        {wch: 15}, {wch: 50}, {wch: 15}
      ];
      ws['!cols'] = wscols;

      const filename = `History_Kaji_Ulang_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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
