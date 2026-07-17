<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Paket Swakelola</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar detil paket swakelola, penyelenggara, dan pagu</p>
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
            placeholder="Cari paket, RUP, Satker, Penyelenggara..." 
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

        <div class="flex flex-col sm:flex-row w-full lg:w-2/3 gap-4">
          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Aktif</label>
            <select v-model="filterAktif" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
              <option value="ALL">Semua Status Aktif</option>
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>
          
          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Hapus</label>
            <select v-model="filterDelete" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
              <option value="ALL">Semua Status Hapus</option>
              <option value="false">Tidak Dihapus</option>
              <option value="true">Dihapus</option>
            </select>
          </div>

          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Umumkan</label>
            <select v-model="filterUmumkan" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange()">
              <option value="ALL">Semua Status Umumkan</option>
              <option v-for="status in filterOptionsUmumkan" :key="status" :value="status">{{ status }}</option>
            </select>
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
      <MazTable
        v-else
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
          { label: 'Informasi Paket', key: 'paket', sortable: false, classes: 'min-w-[250px]' },
          { label: 'Penyelenggara & PPK', key: 'penyelenggara', sortable: false, classes: 'min-w-[200px]' },
          { label: 'Pagu (Rp)', key: 'pagu', align: 'right', sortable: false },
          { label: 'Status', key: 'status', align: 'center', sortable: false, classes: 'min-w-[120px]' }
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
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              RUP: {{ row.kd_rup }}
            </span>
            <span v-if="row.tipe_swakelola" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              Tipe {{ row.tipe_swakelola }}
            </span>
          </div>
          <div v-if="row.uraian_pekerjaan" class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 truncate max-w-xs" :title="row.uraian_pekerjaan">
            {{ row.uraian_pekerjaan }}
          </div>
        </template>
        
        <template #cell-penyelenggara="{ row }">
          <div class="font-medium text-xs truncate max-w-[200px]" :title="row.nama_satker_penyelenggara || row.nama_klpd_penyelenggara || row.nama_satker">
            {{ row.nama_satker_penyelenggara || row.nama_klpd_penyelenggara || row.nama_satker }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 flex flex-col gap-0.5">
            <span title="Pejabat Pembuat Komitmen" v-if="row.nama_ppk">PPK: <span class="font-medium">{{ row.nama_ppk }}</span></span>
            <span v-if="row.nip_ppk">NIP: {{ row.nip_ppk }}</span>
          </div>
        </template>
        
        <template #cell-pagu="{ row }">
          <div class="font-bold text-sm">{{ formatRupiah(row.pagu) }}</div>
          <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">TA: {{ row.tahun_anggaran }}</div>
        </template>
        
        <template #cell-status="{ row }">
          <div class="flex flex-col items-center gap-1.5 w-full">
            <span 
              class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
              :class="{
                'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': row.status_aktif_rup && !row.status_delete_rup,
                'bg-[color:hsl(var(--maz-destructive)_/_15%)] text-[color:hsl(var(--maz-destructive)_/_100%)] dark:bg-[color:hsl(var(--maz-destructive)_/_20%)]': row.status_delete_rup || !row.status_aktif_rup
              }"
            >
              {{ row.status_delete_rup ? 'Dihapus' : (row.status_aktif_rup ? 'Aktif' : 'Non-Aktif') }}
            </span>
            <span 
              v-if="row.status_umumkan_rup"
              class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
              :class="{
                'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': row.status_umumkan_rup === 'Terumumkan',
                'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': row.status_umumkan_rup !== 'Terumumkan'
              }"
            >
              {{ row.status_umumkan_rup }}
            </span>
          </div>
        </template>
      </MazTable>
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

// Filter options dari server
const filterOptionsUmumkan = ref([]);

// Generate dynamic years
const currentYear = new Date().getFullYear();
const availableYears = [
  (currentYear + 1).toString(),
  currentYear.toString(), 
  (currentYear - 1).toString()
];
const selectedYear = ref(currentYear.toString());
const searchQuery = ref('');

// Filter states
const filterAktif = ref('ALL');
const filterDelete = ref('ALL');
const filterUmumkan = ref('ALL');

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
    const response = await $fetch('/api/data/rup/paket-swakelola', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterAktif: filterAktif.value !== 'ALL' ? filterAktif.value : undefined,
        filterDelete: filterDelete.value !== 'ALL' ? filterDelete.value : undefined,
        filterUmumkan: filterUmumkan.value !== 'ALL' ? filterUmumkan.value : undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;

    // Update filter options dari server
    if (response.filterOptions?.statusUmumkan) {
      filterOptionsUmumkan.value = response.filterOptions.statusUmumkan;
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
</script>
