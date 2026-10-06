<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Peserta Tender</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar peserta dan pemenang paket pengadaan tender</p>
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
      
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col lg:flex-row gap-4 items-end">
        <div class="w-full lg:w-1/2">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari penyedia, NPWP, ID tender..." 
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
        
        <div class="w-full lg:w-1/2">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Pemenang</label>
          <MazSelect
            v-model="selectedPemenang"
            :options="[
              { label: 'Semua Status Pemenang', value: 'ALL' },
              { label: 'Pemenang Saja', value: '1' },
              { label: 'Bukan Pemenang', value: '0' }
            ]"
            size="sm"
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
            { label: 'Informasi Penyedia', key: 'penyedia', sortable: false, classes: 'min-w-[280px]' },
            { label: 'Kode & Referensi Tender', key: 'tender', sortable: false, classes: 'min-w-[200px]' },
            { label: 'Nilai Penawaran (Rp)', key: 'nilai', align: 'right', sortable: false, classes: 'min-w-[180px]' },
            { label: 'Status Pemenang', key: 'status', align: 'center', sortable: false, classes: 'min-w-[160px]' }
          ]"
          :rows="pageData"
          @update:page="loadData(false)"
          @update:page-size="onFilterChange(false)"
        >
          <template #cell-index="{ row }">
            <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
          </template>
          
          <template #cell-penyedia="{ row }">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))]">
              {{ row.nama_penyedia || '-' }}
            </div>
            <div class="flex items-center gap-1.5 mt-2 flex-wrap">
              <span v-if="row.npwp_penyedia || row.npwp_penyedia_16" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                NPWP: {{ row.npwp_penyedia || row.npwp_penyedia_16 }}
              </span>
              <span v-if="row.kd_penyedia" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                ID Penyedia: {{ row.kd_penyedia }}
              </span>
              <span v-if="row.kd_peserta" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                ID Peserta: {{ row.kd_peserta }}
              </span>
            </div>
            <div v-if="row.alasan" class="text-xs text-[color:hsl(var(--maz-muted))] mt-1.5 italic">
              Catatan: {{ row.alasan }}
            </div>
          </template>
          
          <template #cell-tender="{ row }">
            <div class="font-semibold text-xs text-[color:hsl(var(--maz-primary))]">
              ID Tender: {{ row.kd_tender || '-' }}
            </div>
            <div v-if="row.kd_pkt_dce" class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
              DCE ID: {{ row.kd_pkt_dce }}
            </div>
            <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">
              Satker: {{ row.kd_satker_str || row.kd_satker || '-' }} (LPSE: {{ row.kd_lpse || '-' }})
            </div>
          </template>
          
          <template #cell-nilai="{ row }">
            <div class="flex flex-col items-end">
              <div class="text-xs text-[color:hsl(var(--maz-muted))]">Penawaran:</div>
              <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">
                {{ row.nilai_penawaran !== null && row.nilai_penawaran !== undefined ? formatRupiah(row.nilai_penawaran) : '-' }}
              </div>
              <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Terkoreksi:</div>
              <div class="font-semibold text-[color:hsl(var(--maz-primary))]">
                {{ row.nilai_terkoreksi !== null && row.nilai_terkoreksi !== undefined ? formatRupiah(row.nilai_terkoreksi) : '-' }}
              </div>
            </div>
          </template>
          
          <template #cell-status="{ row }">
            <div class="flex flex-col items-center gap-1.5 w-full">
              <span 
                class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
                :class="{
                  'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': Boolean(row.pemenang),
                  'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': !Boolean(row.pemenang)
                }"
              >
                {{ Boolean(row.pemenang) ? 'Pemenang' : 'Peserta' }}
              </span>
              <span 
                v-if="Boolean(row.pemenang)"
                class="text-[10px] font-medium text-center"
                :class="Boolean(row.pemenang_terverifikasi) ? 'text-[color:hsl(var(--maz-success))]' : 'text-[color:hsl(var(--maz-muted))]'"
              >
                {{ Boolean(row.pemenang_terverifikasi) ? 'Terverifikasi' : 'Belum Verifikasi' }}
              </span>
            </div>
          </template>
        </MazTable>
      </div>
    </div>
  </div>

    <!-- Modal Export -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data untuk Tahun Anggaran {{ typeof selectedYear !== 'undefined' ? selectedYear : new Date().getFullYear() }}:
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
                <div class="font-semibold text-sm">Seluruh Data (Satu Tahun)</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data untuk tahun anggaran yang dipilih tanpa filter apapun.</div>
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
const selectedPemenang = ref('ALL');

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce timer
let searchTimer = null;

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
};

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/tender/peserta-tender', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterPemenang: selectedPemenang.value !== 'ALL' ? selectedPemenang.value : undefined,
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

// Debounce pencarian agar tidak hit API setiap ketik huruf
const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    onFilterChange(false);
  }, 500);
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
    let params = {
      tahun: typeof selectedYear !== 'undefined' ? selectedYear.value : new Date().getFullYear(),
      page: 1,
      limit: 100000
    };

    if (exportMode.value === 'filtered') {
      const filterParams = {
         
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterPemenang: selectedPemenang.value !== 'ALL' ? selectedPemenang.value : undefined,
        forceRefresh: undefined
      
      };
      params = { ...params, ...filterParams, page: 1, limit: 100000 };
      delete params.forceRefresh;
    }

    const endpoint = '/api/data/tender/peserta-tender' || (window.location.pathname.replace('/tender', '/api/data/tender'));
    const response = await $fetch(endpoint, { params });
    
    if (response.data) {
      const flatData = response.data.map((row, i) => {
        const cleanRow = { 'No.': i + 1 };
        for (const key in row) {
          if (!key.startsWith('_')) {
             cleanRow[key] = row[key];
          }
        }
        return cleanRow;
      });

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Data_Export");

      const filename = "Data_Export_" + (typeof selectedYear !== 'undefined' ? selectedYear.value : new Date().getFullYear()) + (exportMode.value === 'filtered' ? '_Filtered' : '') + ".xlsx";
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
