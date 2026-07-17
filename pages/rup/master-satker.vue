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
      
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
        <div class="max-w-md">
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari nama satker atau kode satker..." 
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
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
        <MazSpinner color="primary" class="text-[3rem] mb-4" />
        <p>Memuat data master satker...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData(true)" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- Empty State -->
      <div v-else-if="pageData.length === 0" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>Tidak ada data yang ditemukan.</p>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))]">
          <thead class="text-xs uppercase bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))]">
            <tr>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">No</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] min-w-[250px]">Satuan Kerja</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Jenis Satker</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] min-w-[200px]">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(item, index) in pageData" 
              :key="item.last_update_ref || index"
              class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
            >
              <td class="px-6 py-4 font-medium">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-[color:hsl(var(--maz-primary))]">{{ item.nama_satker }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Kode: {{ item.kd_satker_str }}</div>
              </td>
              <td class="px-6 py-4">
                {{ item.jenis_satker }}
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2.5 py-1 text-xs font-semibold rounded-full border border-transparent"
                  :class="{
                    'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-info)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': item.status_satker === 'Aktif',
                    'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': item.status_satker !== 'Aktif'
                  }"
                >
                  {{ item.status_satker }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm max-w-xs">
                {{ item.ket_satker }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="totalItems > 0" class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Menampilkan <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> 
          sampai <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span> 
          dari <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ totalItems }}</span> data
          <span v-if="totalAllItems !== totalItems" class="text-xs opacity-70">(total keseluruhan: {{ totalAllItems }})</span>
        </div>
        
        <div class="flex gap-2">
          <MazBtn 
            size="sm" 
            outline 
            :disabled="currentPage === 1 || loading" 
            @click="goToPage(currentPage - 1)"
          >
            Sebelumnya
          </MazBtn>
          <MazBtn 
            size="sm" 
            outline 
            :disabled="currentPage >= totalPages || loading" 
            @click="goToPage(currentPage + 1)"
          >
            Selanjutnya
          </MazBtn>
        </div>
      </div>
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
const itemsPerPage = 10;

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
        limit: itemsPerPage,
        search: searchQuery.value || undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    pageData.value = response.data || [];
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
