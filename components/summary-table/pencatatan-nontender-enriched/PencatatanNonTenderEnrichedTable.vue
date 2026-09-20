<template>
  <div class="flex flex-col gap-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Pencatatan</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
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
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode Pemilihan</label>
          <MazSelect
            v-model="selectedMetode"
            :options="metodeOptions"
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

    <!-- Native Data Table -->
    <div v-else class="flex flex-col border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
      
      <div v-if="loading" class="flex flex-col items-center justify-center py-12 text-[color:hsl(var(--maz-muted))]">
        <MazSpinner size="2rem" color="primary" />
        <span class="mt-3 text-sm">Memuat data...</span>
      </div>
      
      <div v-else class="overflow-x-auto w-full">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-[color:hsl(var(--maz-muted))] bg-[color:hsl(var(--maz-foreground)_/_2%)] border-b border-[color:hsl(var(--maz-border))] uppercase">
            <tr>
              <th class="py-3 px-4 text-center font-semibold w-16">No</th>
              <th class="py-3 px-4 font-semibold min-w-[280px]">Informasi Paket</th>
              <th class="py-3 px-4 font-semibold min-w-[200px]">Satker, PPK & Penyedia</th>
              <th class="py-3 px-4 font-semibold min-w-[150px] text-right">Pagu & Realisasi</th>
              <th class="py-3 px-4 font-semibold min-w-[150px] text-center">Status Pelaksanaan</th>
              <th class="py-3 px-4 font-semibold text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr v-if="pageData.length === 0">
              <td colspan="6" class="py-8 text-center text-[color:hsl(var(--maz-muted))] italic">
                Tidak ada data yang ditemukan.
              </td>
            </tr>
            <tr 
              v-else
              v-for="(row, idx) in pageData" 
              :key="row.kd_nontender_pct || row._index || idx"
              class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
            >
              <!-- Cell Index -->
              <td class="py-3 px-4 text-center font-medium">
                {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
              </td>
              
              <!-- Cell Paket -->
              <td class="py-3 px-4">
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
              </td>
              
              <!-- Cell Satker, PPK & Penyedia -->
              <td class="py-3 px-4">
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
              </td>
              
              <!-- Cell Nilai -->
              <td class="py-3 px-4 text-right">
                <div class="flex flex-col items-end">
                  <div class="text-xs text-[color:hsl(var(--maz-muted))]">Pagu:</div>
                  <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.pagu) }}</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Realisasi:</div>
                  <div class="font-semibold text-[color:hsl(var(--maz-success))]">{{ formatRupiah(row.total_realisasi) }}</div>
                </div>
              </td>
              
              <!-- Cell Status -->
              <td class="py-3 px-4">
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
              </td>
              
              <!-- Cell Aksi -->
              <td class="py-3 px-4 text-center">
                <MazBtn size="mini" color="info" outline @click="openDetail(row)" title="Lihat Detail Non-Tender">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </MazBtn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Native Pagination -->
      <div v-if="!loading && totalPages > 0" class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[color:hsl(var(--maz-muted))]">
        <div class="flex items-center gap-4">
          <div>
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - 
            {{ Math.min(currentPage * itemsPerPage, totalItems) }} dari {{ totalItems }} paket
          </div>
          <div class="flex items-center gap-1.5">
            <span>Per halaman:</span>
            <select v-model="itemsPerPage" class="px-2 py-1 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded text-xs focus:outline-none" @change="onFilterChange(false)">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
        </div>
        
        <div class="flex gap-2">
          <MazBtn size="sm" outline :disabled="currentPage === 1 || loading" @click="currentPage--; loadData(false)">Sebelumnya</MazBtn>
          <MazBtn size="sm" outline :disabled="currentPage >= totalPages || loading" @click="currentPage++; loadData(false)">Selanjutnya</MazBtn>
        </div>
      </div>
    </div>

    <!-- Detail Modal Pencatatan Non-Tender Enriched -->
    <PencatatanNonTenderEnrichedDetailDialog v-model="detailModal" :selected-row="selectedRow" />

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data Pencatatan Non-Tender untuk Tahun Anggaran {{ selectedYear }}:
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
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data Pencatatan Non-Tender untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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
import PencatatanNonTenderEnrichedDetailDialog from './PencatatanNonTenderEnrichedDetailDialog.vue';

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
  const unique = [...new Set(realisasiList.map(r => r.penyedia_detail?.nama_penyedia || r.nama_penyedia).filter(Boolean))];
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
    const response = await $fetch('/api/data/merged/pencatatan-nontender-enriched', {
      params: { 
        tahun: props.selectedYear,
          satker: props.selectedSatker || undefined,
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
    totalPagu.value = response.meta?.totalPagu || 0;
    totalRealisasi.value = response.meta?.totalRealisasi || 0;
    
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

// Watch for year changes from parent
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
      if (selectedStatus.value !== 'ALL') params.filterStatusNontender = selectedStatus.value;
      if (selectedMetode.value !== 'ALL') params.filterMtdPemilihan = selectedMetode.value;
      if (selectedSatker.value !== 'ALL') params.filterSatker = selectedSatker.value;
    }

    const res = await $fetch('/api/data/merged/pencatatan-nontender-enriched', { params });

    if (res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Nama Paket Pencatatan': row.nama_paket || '-',
        'Kode RUP (Pencatatan)': row.kd_rup || '-',
        'Kode Pencatatan': row.kd_nontender_pct || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Nama PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'Metode Pemilihan (Pencatatan)': row.mtd_pemilihan || '-',
        'Pagu (Rp)': row.pagu || 0,
        'Total Realisasi (Rp)': row.total_realisasi || 0,
        'Status (Pencatatan)': row.status_nontender || '-',
        'Tanggal Mulai (Pencatatan)': formatDate(row.tgl_mulai_nontender),
        'Tanggal Selesai (Pencatatan)': formatDate(row.tgl_selesai_nontender),
        'Penyedia (Pencatatan)': getUniquePenyedia(row.realisasi_list).join(', '),
        // RUP Info
        'Nama Paket (RUP)': row.rup_nama_paket || '-',
        'Status PDN (RUP)': row.rup_status_pdn || '-',
        'Status UKM (RUP)': row.rup_status_ukm || '-'
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Pencatatan Non Tender");

      const wscols = [
        {wch: 5}, {wch: 40}, {wch: 15}, {wch: 20}, {wch: 30}, {wch: 30},
        {wch: 20}, {wch: 20}, {wch: 20}, {wch: 15}, {wch: 15}, {wch: 15},
        {wch: 30}, {wch: 40}, {wch: 10}, {wch: 10}
      ];
      ws['!cols'] = wscols;

      const filename = `Pencatatan_NonTender_${props.selectedYear}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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
