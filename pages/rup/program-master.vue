<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Program Master</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar program master dari data RUP</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Filter Tahun Dinamis -->
        <select v-model="selectedYear" class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange(true)">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        
        
        <MazBtn @click="exportModal = true" color="success" class="mr-2">
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
        v-model:search-query="searchQuery"
        search
        pagination
        :paginate-rows="false"
        :total-items="totalItems"
        :loading="loading"
        color="primary"
        hoverable
        background-even
        :headers="[
          { label: 'No', key: 'index', align: 'center', width: '4rem', sortable: false },
          { label: 'Program', key: 'program', sortable: false, classes: 'min-w-[250px]' },
          { label: 'KLPD / Satker', key: 'klpd', sortable: false, classes: 'min-w-[200px]' },
          { label: 'Pagu Program (Rp)', key: 'pagu', align: 'right', sortable: false },
          { label: 'Status', key: 'status', align: 'center', sortable: false }
        ]"
        :rows="pageData"
        @update:page="loadData(false)"
        @update:page-size="onFilterChange(false)"
        @update:search-query="onSearchDebounced"
      >
        <template #cell-index="{ row }">
          <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
        </template>
        
        <template #cell-program="{ row }">
          <div class="font-bold text-[color:hsl(var(--maz-primary))]" :title="row.nama_program">
            {{ row.nama_program }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
            Kode: {{ row.kd_program_str }} ({{ row.kd_program }})
          </div>
        </template>
        
        <template #cell-klpd="{ row }">
          <div class="font-medium text-xs truncate max-w-[250px]" :title="row.nama_klpd">{{ row.nama_klpd }}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              {{ row.kd_klpd }}
            </span>
            <span v-if="row.kd_satker" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              Satker: {{ row.kd_satker }}
            </span>
          </div>
        </template>
        
        <template #cell-pagu="{ row }">
          <div class="font-bold text-sm">{{ formatRupiah(row.pagu_program) }}</div>
          <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">TA: {{ row.tahun_anggaran }}</div>
        </template>
        
        <template #cell-status="{ row }">
          <span 
            class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full border border-transparent"
            :class="{
              'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': !row.is_deleted,
              'bg-[color:hsl(var(--maz-destructive)_/_15%)] text-[color:hsl(var(--maz-destructive)_/_100%)] dark:bg-[color:hsl(var(--maz-destructive)_/_20%)]': row.is_deleted
            }"
          >
            {{ row.is_deleted ? 'Dihapus' : 'Aktif' }}
          </span>
        </template>
        </MazTable>
      </div>
    </div>
  </div>

    <!-- Modal Export -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data untuk Tahun Anggaran {{ selectedYear }}:
        </p>
        
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data yang tampil pada tabel saat ini berdasarkan pencarian dan filter yang aktif.</div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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
</template>
<script setup>
import { utils, writeFile } from 'xlsx';
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

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce timer
let searchTimer = null;

const formatRupiah = (number) => {
  if (!number) return '0';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
};

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/rup/program-master', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
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

// Initial load
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

    if (exportMode.value === 'filtered' && typeof searchQuery !== 'undefined' && searchQuery.value) {
      params.search = searchQuery.value;
    }
    // Add additional filters if present
    if (exportMode.value === 'filtered') {
      if (typeof filterAktif !== 'undefined' && filterAktif.value && filterAktif.value !== 'ALL') params.filterAktif = filterAktif.value;
      if (typeof filterDelete !== 'undefined' && filterDelete.value && filterDelete.value !== 'ALL') params.filterDelete = filterDelete.value;
      if (typeof filterUmumkan !== 'undefined' && filterUmumkan.value && filterUmumkan.value !== 'ALL') params.filterUmumkan = filterUmumkan.value;
      if (typeof filterMetode !== 'undefined' && filterMetode.value && filterMetode.value !== 'ALL') params.filterMetode = filterMetode.value;
      if (typeof filterJenisPengadaan !== 'undefined' && filterJenisPengadaan.value && filterJenisPengadaan.value !== 'ALL') params.filterJenisPengadaan = filterJenisPengadaan.value;
    }

    const endpoint = '/api/data/rup/program-master' || (window.location.pathname.replace('/rup', '/api/data/rup'));
    const response = await $fetch(endpoint, { params });
    
    if (response.data) {
      const flatData = response.data.map((row, i) => ({

        'No.': i + 1,
        'Satuan Kerja': row.nama_satker || '-',
        'Kode Program': row.kd_program || '-',
        'Nama Program': row.nama_program || '-',
        'Kode Kegiatan': row.kd_kegiatan || '-',
        'Nama Kegiatan': row.nama_kegiatan || '-',
        'Total Anggaran': row.total_anggaran || 0
            
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Data_Export");

      const wscols = [
        {wch: 5}, {wch: 30}, {wch: 15}, {wch: 40}, {wch: 15}, {wch: 40}, {wch: 20}
      ];
      ws['!cols'] = wscols;

      const filename = "Data_Export_" + selectedYear.value + (exportMode.value === 'filtered' ? '_Filtered' : '') + ".xlsx";
      writeFile(wb, filename);
      exportModal.value = false;
    } else {
      alert('Tidak ada data untuk diekspor');
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
