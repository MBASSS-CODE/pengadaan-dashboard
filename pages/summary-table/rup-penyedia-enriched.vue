<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Master RUP Penyedia Enriched</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Data Perencanaan RUP Penyedia yang diperkaya dengan realisasi, PPK, dan anggaran</p>
      </div>

      <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Tahun Anggaran:</span>
        <MazSelect
          v-model="selectedYear"
          :options="availableYears"
          size="sm"
          class="w-32"
          @update:model-value="loadData()"
        />
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket RUP</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">{{ loading ? '...' : totalItems.toLocaleString('id-ID') }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Sudah Realisasi (Inaproc)</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ loading ? '...' : realisasiCount.toLocaleString('id-ID') }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ loading ? '...' : formatRupiah(totalPagu) }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">PPK Tervalidasi</div>
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ loading ? '...' : ppkCount.toLocaleString('id-ID') }}</div>
      </div>
    </div>

    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col gap-4">
        <!-- Search Row -->
        <div class="w-full flex items-center gap-4">
          <div class="flex-grow">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
            <MazInput 
              v-model="searchQuery" 
              placeholder="Cari RUP, Satker, Nama Paket, PPK..." 
              size="sm"
              @update:model-value="onSearch"
              clearable
            >
              <template #left-icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </MazInput>
          </div>
          <div class="mt-5 flex gap-2">
            <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="danger" size="sm" outline>Reset Filter</MazBtn>
            <MazBtn @click="exportModal = true" color="success" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </MazBtn>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Realisasi</label>
            <MazSelect v-model="filterStatusRealisasi" :options="statusRealisasiOptions" size="sm" clearable multiple @update:model-value="onFilterChange" />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Sumber Dana</label>
            <MazSelect v-model="filterSumberDana" :options="sumberDanaOptions" size="sm" clearable multiple @update:model-value="onFilterChange" />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Metode Pengadaan</label>
            <MazSelect v-model="filterMetodePengadaan" :options="metodePengadaanOptions" size="sm" clearable multiple @update:model-value="onFilterChange" />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Jenis Pengadaan</label>
            <MazSelect v-model="filterJenisPengadaan" :options="jenisPengadaanOptions" size="sm" clearable multiple @update:model-value="onFilterChange" />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">PPK</label>
            <MazSelect v-model="filterPpk" :options="ppkOptions" size="sm" clearable multiple search @update:model-value="onFilterChange" />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Umumkan</label>
            <select v-model="filterUmumkan" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
              <option value="ALL">Semua Status Umumkan</option>
              <option v-for="status in filterOptionsUmumkan" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
        </div>
      </div>
      <!-- Loading State -->
      <div v-if="loading && pageData.length === 0" class="p-12 flex justify-center items-center flex-col gap-4">
        <MazSpinner color="primary" />
        <span class="text-[color:hsl(var(--maz-muted))] font-medium">Memuat data Enriched...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 flex justify-center items-center flex-col text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server. Pastikan Anda sudah menjalankan proses Merge.</p>
        <div class="flex gap-2 mt-4">
          <MazBtn @click="loadData()" size="sm" outline>Coba Lagi</MazBtn>
          <NuxtLink to="/admin/data-merge">
            <MazBtn size="sm" color="secondary">Buka Kelola Merge</MazBtn>
          </NuxtLink>
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
          :headers="[
            { label: 'No', key: 'index', align: 'center', width: '4rem', sortable: false },
            { label: 'Informasi RUP Penyedia', key: 'paket', sortable: false, classes: 'min-w-[300px]' },
            { label: 'Anggaran & Pelaksanaan', key: 'pelaksanaan', sortable: false, classes: 'min-w-[220px]' },
            { label: 'Profil PPK & Satker', key: 'entitas', sortable: false, classes: 'min-w-[250px]' }
          ]"
          :rows="pageData"
          @update:page="loadData()"
        >
          <template #cell-index="{ row }">
            <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
          </template>
          
          <template #cell-paket="{ row }">
            <div class="font-bold text-[color:hsl(var(--maz-primary))]">
              {{ row.nama_paket || '-' }}
            </div>
            <div class="flex items-center gap-2 mt-2 flex-wrap">
              <span class="px-2 py-0.5 rounded text-[10px] font-medium text-[color:hsl(var(--maz-foreground))] border border-[color:hsl(var(--maz-border))]">
                RUP: {{ row.kd_rup }}
              </span>
              <span v-if="row.status_aktif_rup" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Aktif
              </span>
              <span v-if="row.status_umumkan_rup === 'Sudah' || row.status_umumkan_rup === 'Terumumkan'" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Terumumkan
              </span>
            </div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1.5 flex flex-wrap gap-2">
              <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.metode_pengadaan }}</span>
              <span class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{{ row.jenis_pengadaan }}</span>
              
              <span v-if="row.status_pdn" class="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400 font-semibold" title="Produk Dalam Negeri">{{ row.status_pdn }}</span>
              <span v-if="row.status_ukm" class="px-1.5 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400 font-semibold" title="Usaha Kecil/Mikro">{{ row.status_ukm }}</span>
            </div>
            
            <div v-if="row._has_kaji_ulang" class="mt-2 text-[10px] text-blue-600 dark:text-amber-400 flex items-center">
              ⚠️ Pernah Kaji Ulang ({{ row.kaji_ulang_count }}x) - Tipe: {{ row.kaji_ulang_jenis_revisi }}
            </div>
          </template>

          <template #cell-pelaksanaan="{ row }">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col items-start border-b border-[color:hsl(var(--maz-border))] pb-2">
                <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Pagu RUP</div>
                <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.pagu) }}</div>
                <div v-if="row._has_anggaran" class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">
                  SD: {{ row.sumber_dana_list }} 
                  <span v-if="row.anggaran_list?.length">({{ row.anggaran_list.length }} MAK)</span>
                </div>
              </div>
              
              <div class="pt-1">
                <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-1">Status Realisasi (Inaproc)</div>
                <div v-if="row._has_realisasi" class="text-xs flex flex-col gap-1">
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold border"
                      :class="{
                        'bg-[#8cc63f] text-gray-900 border-[#8cc63f]': row.realisasi_status === 'Selesai',
                        'bg-[#fbbd08] text-gray-900 border-[#fbbd08]': row.realisasi_status === 'Berlangsung',
                        'bg-[#17a2b8] text-white border-[#17a2b8]': ['Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(row.realisasi_status),
                        'bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border-[color:hsl(var(--maz-border))]': !['Selesai', 'Berlangsung', 'Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(row.realisasi_status)
                      }"
                    >
                      {{ row.realisasi_status }}
                    </span>
                    <span class="text-[10px] text-[color:hsl(var(--maz-muted))]">via {{ row.realisasi_metode }}</span>
                  </div>
                  <div class="text-[10px] mt-1">HPS: <span class="font-medium text-[color:hsl(var(--maz-primary))]">{{ formatRupiah(row.realisasi_hps) }}</span></div>
                </div>
                <div v-else class="text-[10px] text-amber-600 dark:text-amber-500 flex items-center mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Belum ada paket / Belum Tender
                </div>
              </div>
            </div>
          </template>
          
          <template #cell-entitas="{ row }">
            <div class="mb-3">
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-1">Pejabat Pembuat Komitmen</div>
              <div v-if="row._ppk_completed" class="flex flex-col">
                <div class="font-bold text-xs text-[color:hsl(var(--maz-foreground))] flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  {{ row.ppk_nama_lengkap }}
                </div>
                <div class="text-[10px] text-[color:hsl(var(--maz-muted))] font-mono mt-0.5">{{ row.ppk_nip_asli }}</div>
              </div>
              <div v-else class="text-xs flex flex-col">
                <span class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ row.nama_ppk }}</span>
                <span class="text-[10px] text-amber-600 dark:text-amber-500">⚠️ Masked: {{ row.nip_ppk }}</span>
              </div>
            </div>
            
            <div class="border-t border-[color:hsl(var(--maz-border))] pt-2 mt-2">
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-1">Satuan Kerja</div>
              <div class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] max-w-[250px] truncate" :title="row.nama_satker">
                {{ row.nama_satker }}
              </div>
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">Kode: {{ row.kd_satker }}</div>
            </div>
          </template>
        </MazTable>
      </div>
    </div>

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data RUP Penyedia Enriched untuk Tahun Anggaran {{ selectedYear }}:
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
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data master untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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

// ─── Filter State ───────────────────────────────────────────
const searchQuery = ref('');
let searchTimeout = null;

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 500);
};

const showFilters = ref(false);
const filterJenisPengadaan = ref(null);
const filterMetodePengadaan = ref(null);
const filterStatusRealisasi = ref(null);
const filterSumberDana = ref(null);
const filterPpk = ref(null);
const ppkOptions = ref([]);
const filterUmumkan = ref('ALL');
const filterOptionsUmumkan = ref([]);

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
    (filterJenisPengadaan.value && filterJenisPengadaan.value.length > 0) ||
    (filterMetodePengadaan.value && filterMetodePengadaan.value.length > 0) ||
    (filterStatusRealisasi.value && filterStatusRealisasi.value.length > 0) ||
    (filterSumberDana.value && filterSumberDana.value.length > 0) ||
    (filterPpk.value && filterPpk.value.length > 0) ||
    filterUmumkan.value !== 'ALL';
});

const onFilterChange = () => {
  currentPage.value = 1;
  loadData();
};

const resetFilters = () => {
  searchQuery.value = '';
  filterJenisPengadaan.value = null;
  filterMetodePengadaan.value = null;
  filterStatusRealisasi.value = null;
  filterSumberDana.value = null;
  filterPpk.value = null;
  filterUmumkan.value = 'ALL';
  onFilterChange();
};

const jenisPengadaanOptions = [
  { label: 'Barang', value: 'Barang' },
  { label: 'Pekerjaan Konstruksi', value: 'Pekerjaan Konstruksi' },
  { label: 'Jasa Konsultansi Badan Usaha Konstruksi', value: 'Jasa Konsultansi Badan Usaha Konstruksi' },
  { label: 'Jasa Konsultansi Perorangan Non Konstruksi', value: 'Jasa Konsultansi Perorangan Non Konstruksi' },
  { label: 'Jasa Konsultansi Badan Usaha Non Konstruksi', value: 'Jasa Konsultansi Badan Usaha Non Konstruksi' },
  { label: 'Jasa Lainnya', value: 'Jasa Lainnya' }
];

const metodePengadaanOptions = [
  { label: 'Tender', value: 'Tender' },
  { label: 'E-Purchasing', value: 'E-Purchasing' },
  { label: 'Pengadaan Langsung', value: 'Pengadaan Langsung' },
  { label: 'Penunjukan Langsung', value: 'Penunjukan Langsung' },
  { label: 'Tender Cepat', value: 'Tender Cepat' }
];

const statusRealisasiOptions = [
  { label: 'Selesai', value: 'Selesai' },
  { label: 'Berlangsung', value: 'Berlangsung' },
  { label: 'Persiapan', value: 'Persiapan' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' }
];

const sumberDanaOptions = [
  { label: 'APBN', value: 'APBN' },
  { label: 'APBD', value: 'APBD' },
  { label: 'BLU', value: 'BLU' },
  { label: 'PNBP', value: 'PNBP' }
];

const loading = ref(true);
const error = ref(false);

const pageData = ref([]);
const totalItems = ref(0);
const totalPagu = ref(0);
const realisasiCount = ref(0);
const ppkCount = ref(0);

const currentYear = new Date().getFullYear();
const availableYears = [
  (currentYear + 1).toString(),
  currentYear.toString(),
  (currentYear - 1).toString(),
  (currentYear - 2).toString()
].map(y => ({ label: y, value: y }));

const selectedYear = ref(currentYear.toString());
const currentPage = ref(1);
const itemsPerPage = ref(50);

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/summary-table/rup-penyedia-enriched', {
      params: {
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        jenisPengadaan: filterJenisPengadaan.value ? filterJenisPengadaan.value.join(',') : undefined,
        metodePengadaan: filterMetodePengadaan.value ? filterMetodePengadaan.value.join(',') : undefined,
        statusRealisasi: filterStatusRealisasi.value ? filterStatusRealisasi.value.join(',') : undefined,
        sumberDana: filterSumberDana.value ? filterSumberDana.value.join(',') : undefined,
        ppk: filterPpk.value ? filterPpk.value.join(',') : undefined,
        statusUmumkan: filterUmumkan.value !== 'ALL' ? filterUmumkan.value : undefined
      }
    });

    if (res.success) {
      pageData.value = res.data.map((item, index) => ({
        ...item,
        _index: index
      }));
      totalItems.value = res.meta.totalItems;

      if (res.filterOptions && res.filterOptions.namaPpk) {
        ppkOptions.value = res.filterOptions.namaPpk.map(opt => ({ label: opt, value: opt }));
      }
      
      if (res.filterOptions && res.filterOptions.statusUmumkan) {
        filterOptionsUmumkan.value = res.filterOptions.statusUmumkan;
      }
      
      // Hitung agregasi jika ini halaman pertama
      if (currentPage.value === 1 && res.meta) {
        totalPagu.value = res.meta.totalPagu || 0;
        realisasiCount.value = res.meta.realisasiCount || 0;
        ppkCount.value = res.meta.ppkCount || 0;
      }
    } else {
      error.value = true;
      pageData.value = [];
      totalItems.value = 0;
    }
  } catch (err) {
    console.error('Gagal fetch data RUP Penyedia Enriched:', err);
    error.value = true;
    pageData.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};
// ─── Export Logic ───────────────────────────────────────────
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      tahun: selectedYear.value,
      page: 1,
      limit: 100000 // limit besar untuk mengambil seluruh data
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) params.search = searchQuery.value;
      if (filterJenisPengadaan.value) params.jenisPengadaan = filterJenisPengadaan.value.join(',');
      if (filterMetodePengadaan.value) params.metodePengadaan = filterMetodePengadaan.value.join(',');
      if (filterStatusRealisasi.value) params.statusRealisasi = filterStatusRealisasi.value.join(',');
      if (filterSumberDana.value) params.sumberDana = filterSumberDana.value.join(',');
      if (filterPpk.value) params.ppk = filterPpk.value.join(',');
      if (filterUmumkan.value !== 'ALL') params.statusUmumkan = filterUmumkan.value;
    }

    const res = await $fetch('/api/summary-table/rup-penyedia-enriched', { params });

    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Kode RUP': row.kd_rup,
        'Nama Paket': row.nama_paket,
        'Pagu (Rp)': row.pagu,
        'Metode Pengadaan': row.metode_pengadaan,
        'Jenis Pengadaan': row.jenis_pengadaan,
        'Sumber Dana': row.sumber_dana_list || '-',
        'Nama PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Status Aktif': row.status_aktif_rup ? 'Aktif' : 'Non-Aktif',
        'Status Umumkan': row.status_umumkan_rup || '-',
        'Status Realisasi': row.realisasi_status || '-',
        'HPS Realisasi (Rp)': row.realisasi_hps || 0,
        'Metode Realisasi': row.realisasi_metode || '-',
        'PDN': row.status_pdn || '-',
        'UKM': row.status_ukm || '-',
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "RUP Penyedia");

      const wscols = [
        {wch: 5}, {wch: 15}, {wch: 40}, {wch: 15}, {wch: 20}, {wch: 20},
        {wch: 15}, {wch: 30}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15},
        {wch: 15}, {wch: 15}, {wch: 10}, {wch: 10}
      ];
      ws['!cols'] = wscols;

      const filename = `RUP_Penyedia_Enriched_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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

onMounted(() => {
  loadData();
});
</script>
