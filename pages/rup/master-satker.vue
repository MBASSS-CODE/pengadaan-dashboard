<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Master Satuan Kerja</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar master satker Rencana Umum Pengadaan</p>
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
          { label: 'Satuan Kerja', key: 'satker', sortable: false, classes: 'min-w-[250px]' },
          { label: 'Jenis Satker', key: 'jenis_satker', sortable: false },
          { label: 'Status', key: 'status', sortable: false },
          { label: 'Keterangan', key: 'ket_satker', sortable: false, classes: 'min-w-[200px]' }
        ]"
        :rows="pageData"
        @update:page="loadData(false)"
        @update:page-size="onFilterChange(false)"
        @update:search-query="onSearchDebounced"
      >
        <template #cell-index="{ row }">
          <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
        </template>
        
        <template #cell-satker="{ row }">
          <div class="font-medium text-[color:hsl(var(--maz-primary))]">{{ row.nama_satker }}</div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Kode: {{ row.kd_satker_str }}</div>
        </template>
        
        <template #cell-status="{ row }">
          <span 
            class="px-2.5 py-1 text-xs font-semibold rounded-full border border-transparent"
            :class="{
              'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-info)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': row.status_satker === 'Aktif',
              'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': row.status_satker !== 'Aktif'
            }"
          >
            {{ row.status_satker }}
          </span>
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

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/rup/master-satker', {
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
</script>
