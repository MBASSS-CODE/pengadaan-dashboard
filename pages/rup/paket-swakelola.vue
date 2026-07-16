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
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col lg:flex-row gap-4 items-end">
        <div class="w-full lg:w-1/3">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari paket, RUP, Satker, Penyelenggara..." 
            size="sm"
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
            <select v-model="filterAktif" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors">
              <option value="ALL">Semua Status Aktif</option>
              <option value="true">Aktif</option>
              <option value="false">Non-Aktif</option>
            </select>
          </div>
          
          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Hapus</label>
            <select v-model="filterDelete" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors">
              <option value="ALL">Semua Status Hapus</option>
              <option value="false">Tidak Dihapus</option>
              <option value="true">Dihapus</option>
            </select>
          </div>

          <div class="w-full sm:w-1/3">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Umumkan</label>
            <select v-model="filterUmumkan" class="w-full px-3 py-2 text-sm bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors">
              <option value="ALL">Semua Status Umumkan</option>
              <option v-for="status in uniqueStatusUmumkan" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-muted))]">
        <MazSpinner color="primary" class="text-[3rem] mb-4" />
        <p>Memuat data paket swakelola...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
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
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] w-16">No</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] min-w-[250px]">Informasi Paket</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] min-w-[200px]">Penyelenggara & PPK</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] text-right">Pagu (Rp)</th>
              <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center min-w-[120px]">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(item, index) in paginatedData" 
              :key="item.last_update_ref || item.kd_rup || index"
              class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
            >
              <td class="px-6 py-4 font-medium">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td class="px-6 py-4">
                <div class="font-bold text-[color:hsl(var(--maz-primary))]" :title="item.nama_paket">
                  {{ item.nama_paket || '-' }}
                </div>
                <div class="flex items-center gap-2 mt-1 flex-wrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                    RUP: {{ item.kd_rup }}
                  </span>
                  <span v-if="item.tipe_swakelola" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                    Tipe {{ item.tipe_swakelola }}
                  </span>
                </div>
                <div v-if="item.uraian_pekerjaan" class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 truncate max-w-xs" :title="item.uraian_pekerjaan">
                  {{ item.uraian_pekerjaan }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-xs truncate max-w-[200px]" :title="item.nama_satker_penyelenggara || item.nama_klpd_penyelenggara || item.nama_satker">
                  {{ item.nama_satker_penyelenggara || item.nama_klpd_penyelenggara || item.nama_satker }}
                </div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 flex flex-col gap-0.5">
                  <span title="Pejabat Pembuat Komitmen" v-if="item.nama_ppk">PPK: <span class="font-medium">{{ item.nama_ppk }}</span></span>
                  <span v-if="item.nip_ppk">NIP: {{ item.nip_ppk }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="font-bold text-sm">{{ formatRupiah(item.pagu) }}</div>
                <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">TA: {{ item.tahun_anggaran }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col items-center gap-1.5 w-full">
                  <span 
                    class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
                    :class="{
                      'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': item.status_aktif_rup && !item.status_delete_rup,
                      'bg-[color:hsl(var(--maz-destructive)_/_15%)] text-[color:hsl(var(--maz-destructive)_/_100%)] dark:bg-[color:hsl(var(--maz-destructive)_/_20%)]': item.status_delete_rup || !item.status_aktif_rup
                    }"
                  >
                    {{ item.status_delete_rup ? 'Dihapus' : (item.status_aktif_rup ? 'Aktif' : 'Non-Aktif') }}
                  </span>
                  <span 
                    v-if="item.status_umumkan_rup"
                    class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
                    :class="{
                      'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': item.status_umumkan_rup === 'Terumumkan',
                      'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': item.status_umumkan_rup !== 'Terumumkan'
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

// Extract unique status_umumkan_rup for dropdown
const uniqueStatusUmumkan = computed(() => {
  const statuses = new Set();
  rawData.value.forEach(item => {
    if (item.status_umumkan_rup) statuses.add(item.status_umumkan_rup);
  });
  return Array.from(statuses).sort();
});

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
    const response = await $fetch('/api/data/rup/paket-swakelola', {
      params: { 
        tahun: selectedYear.value,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
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
  return rawData.value.filter(item => {
    // 1. Filter Status Aktif
    if (filterAktif.value !== 'ALL') {
      const boolAktif = filterAktif.value === 'true';
      if (item.status_aktif_rup !== boolAktif) return false;
    }
    
    // 2. Filter Status Delete
    if (filterDelete.value !== 'ALL') {
      const boolDelete = filterDelete.value === 'true';
      if (item.status_delete_rup !== boolDelete) return false;
    }

    // 3. Filter Status Umumkan
    if (filterUmumkan.value !== 'ALL') {
      if (item.status_umumkan_rup !== filterUmumkan.value) return false;
    }

    // 4. Text Search
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const matchSearch = (
        (item.nama_paket && item.nama_paket.toLowerCase().includes(query)) ||
        (item.nama_satker && item.nama_satker.toLowerCase().includes(query)) ||
        (item.nama_satker_penyelenggara && item.nama_satker_penyelenggara.toLowerCase().includes(query)) ||
        (item.nama_klpd_penyelenggara && item.nama_klpd_penyelenggara.toLowerCase().includes(query)) ||
        (item.nama_ppk && item.nama_ppk.toLowerCase().includes(query)) ||
        (item.kd_rup && item.kd_rup.toString().includes(query)) ||
        (item.nip_ppk && item.nip_ppk.toString().includes(query))
      );
      if (!matchSearch) return false;
    }

    return true;
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
