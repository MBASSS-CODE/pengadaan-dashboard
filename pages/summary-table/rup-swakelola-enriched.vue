<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">RUP Swakelola Enriched</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Data master RUP Swakelola yang diperkaya dengan data pendukung</p>
      </div>
      <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Tahun Anggaran:</span>
        <MazSelect
          v-model="selectedYear"
          :options="availableYears"
          size="sm"
          class="w-32"
        />
      </div>
    </div>

    <!-- Data Table Area -->
    <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-wrap gap-4 justify-between items-center">
        <div class="flex items-center gap-3">
          <MazInput
            v-model="searchQuery"
            placeholder="Cari RUP / Nama Paket / Satker..."
            left-icon="magnifying-glass"
            size="sm"
            class="w-64"
            @input="onSearch"
          />
        </div>
        <div class="text-sm font-medium text-[color:hsl(var(--maz-muted))]">
          Total: <span class="text-[color:hsl(var(--maz-foreground))]">{{ totalItems }}</span> Data
        </div>
      </div>

      <div class="flex-1 overflow-auto relative">
        <div v-if="loading" class="absolute inset-0 bg-[color:hsl(var(--maz-background)_/_50%)] flex items-center justify-center z-10 backdrop-blur-sm">
          <MazSpinner color="primary" />
        </div>

        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] border-collapse">
          <thead class="sticky top-0 bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] text-xs uppercase shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] w-16 text-center">No</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Identitas Paket</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Satker & PPK</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Anggaran</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
            <tr v-if="error" class="text-center">
              <td colspan="5" class="py-12 text-red-500">{{ errorMessage }}</td>
            </tr>
            <tr v-else-if="pageData.length === 0 && !loading" class="text-center">
              <td colspan="5" class="py-12 text-[color:hsl(var(--maz-muted))]">Data tidak ditemukan.</td>
            </tr>
            <tr v-else v-for="(row, idx) in pageData" :key="row.kd_rup" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
              <td class="px-4 py-3 text-center">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="font-bold text-[color:hsl(var(--maz-primary))]">{{ row.nama_paket || '-' }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">RUP: {{ row.kd_rup }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium">{{ row.nama_satker || '-' }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 truncate max-w-[200px]" :title="row.ppk_nama_lengkap || row.nama_ppk">
                  PPK: {{ row.ppk_nama_lengkap || row.nama_ppk || '-' }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ formatRupiah(row.pagu) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span v-if="row._has_pelaksanaan" class="px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700 w-fit">Tercatat</span>
                  <span v-else class="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 w-fit">Belum Tercatat</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex justify-between items-center">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Hal {{ currentPage }} dari {{ Math.ceil(totalItems / itemsPerPage) || 1 }}
        </div>
        <div class="flex gap-2">
          <MazBtn size="sm" outline :disabled="currentPage === 1 || loading" @click="currentPage--; loadData()">Sebelumnya</MazBtn>
          <MazBtn size="sm" outline :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage) || loading" @click="currentPage++; loadData()">Selanjutnya</MazBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const currentYear = new Date().getFullYear();
const availableYears = [currentYear.toString(), (currentYear - 1).toString()].map(y => ({ label: y, value: y }));
const selectedYear = ref(currentYear.toString());

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const pageData = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(50);
const searchQuery = ref('');
let searchTimeout = null;

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 500);
};

const formatRupiah = (num) => {
  if (!num) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/data/merged/rup-swakelola-enriched', {
      params: {
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined
      }
    });
    if (res.success) {
      pageData.value = res.data;
      totalItems.value = res.meta.totalItems;
    } else {
      error.value = true;
      errorMessage.value = res.message || 'Gagal memuat data.';
      pageData.value = [];
    }
  } catch (err) {
    error.value = true;
    errorMessage.value = 'Gagal terhubung ke server.';
    pageData.value = [];
  } finally {
    loading.value = false;
  }
};

watch(selectedYear, () => {
  currentPage.value = 1;
  loadData();
});

onMounted(() => {
  loadData();
});
</script>
