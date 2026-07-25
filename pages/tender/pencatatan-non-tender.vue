<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Pencatatan Non-Tender</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar pencatatan paket pengadaan non-tender (Enriched)</p>
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
        <div class="w-full lg:w-1/4">
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
        
        <div class="w-full lg:w-1/4">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status</label>
          <MazSelect
            v-model="selectedStatus"
            :options="statusOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full lg:w-1/4">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode Pemilihan</label>
          <MazSelect
            v-model="selectedMetode"
            :options="metodeOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full lg:w-1/4">
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
            { label: 'Informasi Paket', key: 'paket', sortable: false, classes: 'min-w-[280px]' },
            { label: 'Satker, PPK & Penyedia', key: 'satker', sortable: false, classes: 'min-w-[200px]' },
            { label: 'Pagu & Realisasi', key: 'nilai', align: 'right', sortable: false, classes: 'min-w-[150px]' },
            { label: 'Status Pelaksanaan', key: 'status', align: 'center', sortable: false, classes: 'min-w-[150px]' },
            { label: 'Aksi', key: 'actions', align: 'center', width: '6rem', sortable: false }
          ]"
          :rows="pageData"
          @update:page="loadData(false)"
          @update:page-size="onFilterChange(false)"
        >
          <template #cell-index="{ row }">
            <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
          </template>
          
          <template #cell-paket="{ row }">
            <div class="font-bold text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer" @click="openDetail(row)" :title="row.nama_paket">
              {{ row.nama_paket || '-' }}
            </div>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                RUP: {{ row.kd_rup }}
              </span>
              <span v-if="row.kd_nontender_pct" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                ID: {{ row.kd_nontender_pct }}
              </span>
            </div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
              {{ row.kategori_pengadaan || '-' }}
            </div>
          </template>
          
          <template #cell-satker="{ row }">
            <div class="font-medium text-xs truncate max-w-[200px]" :title="row.nama_satker">{{ row.nama_satker || '-' }}</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
              {{ row.mtd_pemilihan || '-' }}
            </div>
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
          </template>
          
          <template #cell-nilai="{ row }">
            <div class="flex flex-col items-end">
              <div class="text-xs text-[color:hsl(var(--maz-muted))]">Pagu:</div>
              <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.pagu) }}</div>
              <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Realisasi:</div>
              <div class="font-semibold text-[color:hsl(var(--maz-success))]">{{ formatRupiah(row.total_realisasi) }}</div>
            </div>
          </template>
          
          <template #cell-status="{ row }">
            <div class="flex flex-col items-center gap-1.5 w-full">
              <span 
                class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
                :class="{
                  'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': row.status_nontender_pct_ket === 'Paket Selesai',
                  'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': row.status_nontender_pct === 'Aktif' && row.status_nontender_pct_ket !== 'Paket Selesai',
                  'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': !['Paket Selesai'].includes(row.status_nontender_pct_ket) && row.status_nontender_pct !== 'Aktif'
                }"
              >
                {{ row.status_nontender_pct_ket || row.status_nontender_pct || 'Unknown' }}
              </span>
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))] text-center mt-1 w-full flex flex-col gap-0.5">
                <span>{{ row.realisasi_list?.length || 0 }} Bukti Realisasi</span>
              </div>
            </div>
          </template>

          <template #cell-actions="{ row }">
            <MazBtn @click="openDetail(row)" size="sm" outline color="primary" class="w-full text-xs">
              Detail
            </MazBtn>
          </template>
        </MazTable>
      </div>
    </div>

    <!-- Detail Modal -->
    <MazDialog v-model="detailModal" title="Detail Paket Pencatatan" max-width="800px">
      <div v-if="selectedRow" class="space-y-6">
        <!-- Info Paket -->
        <div>
          <h3 class="text-lg font-bold text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket }}</h3>
          <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">ID RUP: {{ selectedRow.kd_rup }} | Nontender PCT: {{ selectedRow.kd_nontender_pct }}</p>
          <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-3 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <p class="text-xs text-[color:hsl(var(--maz-muted))]">Pagu Tersedia</p>
              <p class="font-semibold">{{ formatRupiah(selectedRow.pagu) }}</p>
            </div>
            <div class="p-3 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <p class="text-xs text-[color:hsl(var(--maz-muted))]">Total Realisasi</p>
              <p class="font-semibold text-[color:hsl(var(--maz-success))]">{{ formatRupiah(selectedRow.total_realisasi) }}</p>
            </div>
            <div class="p-3 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <p class="text-xs text-[color:hsl(var(--maz-muted))]">Penyedia</p>
              <p class="font-semibold text-[color:hsl(var(--maz-primary))] text-sm line-clamp-2" :title="getUniquePenyedia(selectedRow.realisasi_list).join(', ')">
                {{ getUniquePenyedia(selectedRow.realisasi_list).length > 0 ? getUniquePenyedia(selectedRow.realisasi_list).join(', ') : '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Info RUP & Pelaksanaan -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[color:hsl(var(--maz-border))] pt-4">
          <div>
            <h4 class="text-sm font-semibold mb-3 border-l-2 border-[color:hsl(var(--maz-primary))] pl-2">Detail Perencanaan (RUP)</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Pagu RUP Awal:</span>
                <span class="font-medium">{{ selectedRow.rup_pagu ? formatRupiah(selectedRow.rup_pagu) : '-' }}</span>
              </li>
              <li class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Metode (RUP):</span>
                <span class="font-medium">{{ selectedRow.rup_metode_pengadaan || '-' }}</span>
              </li>
              <li class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Status PDN:</span>
                <span class="font-medium">{{ selectedRow.rup_status_pdn || '-' }}</span>
              </li>
              <li class="flex justify-between pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Status UKM:</span>
                <span class="font-medium">{{ selectedRow.rup_status_ukm || '-' }}</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 class="text-sm font-semibold mb-3 border-l-2 border-[color:hsl(var(--maz-primary))] pl-2">Pejabat Pembuat Komitmen (PPK)</h4>
            <ul class="space-y-2 text-sm">
              <li class="flex flex-col border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Nama Lengkap:</span>
                <span class="font-medium">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span>
              </li>
              <li class="flex flex-col border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">NIP / Jabatan:</span>
                <span class="font-medium">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk }} / {{ selectedRow.ppk_jabatan || '-' }}</span>
              </li>
              <li class="flex justify-between pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Kontak:</span>
                <span class="font-medium text-xs">{{ selectedRow.ppk_email || '-' }} <br/> {{ selectedRow.ppk_telepon || '-' }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Realisasi List -->
        <div class="border-t border-[color:hsl(var(--maz-border))] pt-4">
          <h4 class="text-sm font-semibold mb-3 border-l-2 border-[color:hsl(var(--maz-primary))] pl-2">Daftar Bukti Realisasi</h4>
          
          <div v-if="selectedRow.realisasi_list && selectedRow.realisasi_list.length > 0" class="space-y-3">
            <div v-for="(real, idx) in selectedRow.realisasi_list" :key="idx" class="p-3 rounded bg-[color:hsl(var(--maz-foreground)_/_3%)] border border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p class="font-medium text-sm">{{ real.jenis_realisasi }} <span class="text-xs text-[color:hsl(var(--maz-muted))] font-normal">({{ real.no_realisasi || '-' }})</span></p>
                <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">{{ real.nama_penyedia || '-' }}</p>
                <p class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1 italic">{{ real.ket_realisasi || '' }}</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="font-bold text-[color:hsl(var(--maz-primary))]">{{ formatRupiah(real.nilai_realisasi) }}</p>
                <p class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">{{ formatDate(real.tgl_realisasi) }}</p>
              </div>
            </div>
          </div>
          <div v-else class="p-6 text-center text-[color:hsl(var(--maz-muted))] border border-dashed border-[color:hsl(var(--maz-border))] rounded-lg">
            Belum ada rincian bukti realisasi.
          </div>
        </div>

      </div>
      
      <template #footer>
        <div class="w-full flex justify-end">
          <MazBtn @click="detailModal = false" outline>Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const error = ref(false);
const detailModal = ref(false);
const selectedRow = ref(null);

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
const selectedStatus = ref('ALL');
const selectedMetode = ref('ALL');
const selectedSatker = ref('ALL');

const statusOptions = ref([{ label: 'Semua Status', value: 'ALL' }]);
const metodeOptions = ref([{ label: 'Semua Metode', value: 'ALL' }]);
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

const getUniquePenyedia = (realisasiList) => {
  if (!realisasiList || !realisasiList.length) return [];
  const unique = [...new Set(realisasiList.map(r => r.nama_penyedia).filter(Boolean))];
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
    // URL API BERUBAH: Mengambil data dari merged group
    const response = await $fetch('/api/data/merged/pencatatan-nontender-enriched', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterStatusNontender: selectedStatus.value !== 'ALL' ? selectedStatus.value : undefined, 
        filterMtdPemilihan: selectedMetode.value !== 'ALL' ? selectedMetode.value : undefined,
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
      if (response.filterOptions.statusNontender && response.filterOptions.statusNontender.length > 0) {
        statusOptions.value = [
          { label: 'Semua Status', value: 'ALL' },
          ...response.filterOptions.statusNontender.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.mtdPemilihan && response.filterOptions.mtdPemilihan.length > 0) {
        metodeOptions.value = [
          { label: 'Semua Metode', value: 'ALL' },
          ...response.filterOptions.mtdPemilihan.map(opt => ({ label: opt, value: opt }))
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

// Initial load
onMounted(() => {
  loadData(false);
});
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
