<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Paket Anggaran Penyedia</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar pagu anggaran dan MAK untuk paket penyedia</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Filter Tahun Dinamis -->
        <select v-model="selectedYear" class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="loadData(false)">
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
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col md:flex-row gap-4">
        <div class="max-w-md w-full">
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari MAK, kode RUP, atau satker..." 
            size="sm"
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
        <p>Memuat data paket anggaran...</p>
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
      <div v-else-if="filteredData.length === 0" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
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
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Kode RUP</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] min-w-[200px]">Satuan Kerja</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">MAK & Sumber Dana</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] text-right">Pagu (Rp)</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(item, index) in paginatedData" 
              :key="item.last_update_ref || item.id_paket_anggaran_penyedia || index"
              class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
            >
              <td class="px-6 py-4 font-medium">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4 font-semibold text-[color:hsl(var(--maz-primary))]">
                {{ item.kd_rup }}
              </td>
              <td class="px-6 py-4">
                <div class="font-medium truncate max-w-xs" :title="item.nama_satker">{{ item.nama_satker }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Kode: {{ item.kd_satker_str }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-mono text-xs p-1 bg-[color:hsl(var(--maz-foreground)_/_5%)] rounded truncate max-w-[200px]" :title="item.mak">
                  {{ item.mak }}
                </div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
                  {{ item.sumber_dana }} <span v-if="item.jenis_dana_apbn">({{ item.jenis_dana_apbn }})</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right font-medium">
                {{ formatRupiah(item.pagu) }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col items-center gap-1">
                  <span 
                    class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center"
                    :class="{
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': item.status_aktif_rup,
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': !item.status_aktif_rup
                    }"
                  >
                    {{ item.status_aktif_rup ? 'Aktif' : 'Non-Aktif' }}
                  </span>
                  <span 
                    class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center"
                    :class="{
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': item.status_umumkan_rup === 'Terumumkan',
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': item.status_umumkan_rup !== 'Terumumkan'
                    }"
                  >
                    {{ item.status_umumkan_rup }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredData.length > 0" class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Menampilkan <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ ((currentPage - 1) * itemsPerPage) + 1 }}</span> 
          sampai <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ Math.min(currentPage * itemsPerPage, filteredData.length) }}</span> 
          dari <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ filteredData.length }}</span> data
        </div>
        
        <div class="flex gap-2">
          <MazBtn 
            size="sm" 
            outline 
            :disabled="currentPage === 1" 
            @click="currentPage--"
          >
            Sebelumnya
          </MazBtn>
          <MazBtn 
            size="sm" 
            outline 
            :disabled="currentPage >= totalPages" 
            @click="currentPage++"
          >
            Selanjutnya
          </MazBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const loading = ref(true);
const error = ref(false);
const rawData = ref([]);

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

const formatRupiah = (number) => {
  if (!number) return '0';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
};

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/rup/paket-anggaran-penyedia', {
      params: { 
        tahun: selectedYear.value,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    // Asumsi response sesuai dengan struktur dari server/utils/dataManager
    rawData.value = response.data || [];
    currentPage.value = 1; // Reset page on new data
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// Computed property for client-side search and filtering
const filteredData = computed(() => {
  if (!searchQuery.value) {
    return rawData.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return rawData.value.filter(item => {
    return (
      (item.nama_satker && item.nama_satker.toLowerCase().includes(query)) ||
      (item.kd_rup && item.kd_rup.toString().includes(query)) ||
      (item.mak && item.mak.toLowerCase().includes(query))
    );
  });
});

// Computed property for current page data
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

// Total pages calculation
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage);
});

// Initial load
onMounted(() => {
  loadData(false);
});
</script>
