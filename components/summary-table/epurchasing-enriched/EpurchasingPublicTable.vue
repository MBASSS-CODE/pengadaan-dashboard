<template>
  <ClientOnly>
    <div class="flex flex-col gap-4">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pesanan</div>
          <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
            {{ loading ? '...' : totalAllItems.toLocaleString('id-ID') }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai Pembelian</div>
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ loading ? '...' : formatRupiah(totalBelanja) }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Terkoneksi RUP</div>
          <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {{ loading ? '...' : rupMatched.toLocaleString('id-ID') }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Penyedia UMKM</div>
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ loading ? '...' : umkmCount.toLocaleString('id-ID') }}
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
              placeholder="Cari Order ID, Nama Paket, atau Kode RUP..." 
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
            <MazBtn @click="exportModal = true" color="success" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </MazBtn>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="flex justify-between items-end">
          <div class="text-xs text-[color:hsl(var(--maz-muted))]">
            <span>Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</strong> data</span>
          </div>
        </div>
      </div>

      <!-- Empty State Banner (No Data merged) -->
      <div v-if="!loading && !error && (totalAllItems === 0 && searchQuery === '')" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-1">Data Belum Di-merge</h2>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-4 max-w-md mx-auto">Tidak ada data E-Purchasing Enriched untuk tahun {{ selectedYear }}.</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData()" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
              <th class="py-3 px-4 text-center">No.</th>
              <th class="py-3 px-4">Nama Instansi</th>
              <th class="py-3 px-4">Nama Satuan Kerja</th>
              <th class="py-3 px-4 text-center">Tahun Anggaran</th>
              <th class="py-3 px-4 text-center">Cara Pengadaan</th>
              <th class="py-3 px-4 text-center">Metode Pengadaan</th>
              <th class="py-3 px-4 text-center">Jenis Pengadaan</th>
              <th class="py-3 px-4 min-w-[200px]">Nama Paket</th>
              <th class="py-3 px-4 text-center">Kode RUP</th>
              <th class="py-3 px-4 text-center">Sumber Dana</th>
              <th class="py-3 px-4 text-center">Produk Dalam Negeri</th>
              <th class="py-3 px-4 text-right">Total Nilai (Rp)</th>
            </tr>
          </thead>
          <tbody class="align-middle relative">
            <tr v-if="loading && items.length === 0">
              <td colspan="12" class="py-12 text-center">
                <MazSpinner color="primary" class="mx-auto" />
                <p class="text-[color:hsl(var(--maz-muted))] mt-3 text-sm">Memuat data E-Purchasing...</p>
              </td>
            </tr>
            <tr v-else-if="items.length === 0 && !loading" class="border-b border-[color:hsl(var(--maz-border))]">
              <td colspan="12" class="py-12 text-center text-[color:hsl(var(--maz-muted))]">
                Tidak ada data yang cocok dengan filter pencarian.
              </td>
            </tr>
            <template v-for="(item, index) in items" :key="item.order_id">
              <tr class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_2%)] transition-colors group text-sm">
                <td class="py-3 px-4 text-center font-medium text-[color:hsl(var(--maz-muted))]">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                
                <td class="py-3 px-4 max-w-[200px] truncate" :title="namaInstansi">
                  {{ namaInstansi }}
                </td>
                
                <td class="py-3 px-4 max-w-[200px] truncate" :title="item.nama_satker || '-'">
                  {{ item.nama_satker || '-' }}
                </td>
                
                <td class="py-3 px-4 text-center">
                  {{ item.fiscal_year || '-' }}
                </td>
                
                <td class="py-3 px-4 text-center">
                  E-Purchasing
                </td>
                
                <td class="py-3 px-4 text-center">
                  {{ item.rup_metode_pengadaan || 'E-Purchasing' }}
                </td>
                
                <td class="py-3 px-4 text-center">
                  {{ item.rup_jenis_pengadaan || '-' }}
                </td>
                
                <td class="py-3 px-4 max-w-[250px] truncate font-medium text-[color:hsl(var(--maz-primary))]" :title="item.rup_nama_paket || item.rup_name || item.rup_desc || '-'">
                  {{ item.rup_nama_paket || item.rup_name || item.rup_desc || '-' }}
                </td>
                
                <td class="py-3 px-4 text-center font-medium">
                  {{ item.rup_code || '-' }}
                </td>
                
                <td class="py-3 px-4 text-center">
                  {{ item.funding_source || '-' }}
                </td>
                
                <td class="py-3 px-4 text-center">
                  {{ item.flag_minikom || '-' }}
                </td>
                
                <td class="py-3 px-4 text-right font-bold text-[color:hsl(var(--maz-foreground))]">
                  {{ formatRupiah(item.total) }}
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Menampilkan <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span> - <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ (currentPage - 1) * itemsPerPage + items.length }}</span> dari <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</span> data
        </div>
        <div class="flex items-center gap-2">
          <MazBtn @click="currentPage--" :disabled="currentPage === 1" color="transparent" size="sm" class="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </MazBtn>
          <div class="flex items-center gap-1">
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="text-[color:hsl(var(--maz-muted))] px-1">...</span>
              <MazBtn v-else @click="currentPage = p" :color="currentPage === p ? 'primary' : 'transparent'" size="sm" class="!w-8 !h-8 !p-0 rounded-md font-medium" :class="currentPage !== p ? 'text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))] hover:bg-[color:hsl(var(--maz-foreground)_/_5%)]' : ''">
                {{ p }}
              </MazBtn>
            </template>
          </div>
          <MazBtn @click="currentPage++" :disabled="currentPage === totalPages" color="transparent" size="sm" class="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </MazBtn>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-[color:hsl(var(--maz-muted))]">Per halaman:</span>
          <MazSelect v-model="itemsPerPage" :options="[{label:'10',value:10},{label:'25',value:25},{label:'50',value:50},{label:'100',value:100}]" size="sm" class="w-20" />
        </div>
      </div>
    </div>

    <!-- Modal Export -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data E-Purchasing (Public) untuk Tahun Anggaran {{ selectedYear }}:
        </p>
        
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data yang tampil pada tabel saat ini berdasarkan pencarian yang aktif (estimasi: {{ totalAllItems }} data).</div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data transaksi publik untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
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
  </ClientOnly>
</template>

<script setup>
import { ref, watch, onMounted, computed, toRefs } from 'vue';
import { utils, writeFile } from 'xlsx';
import { useRuntimeConfig } from '#imports';

const props = defineProps({
  selectedYear: { type: String, required: true }
});
const { selectedYear } = toRefs(props);

const config = useRuntimeConfig();
const namaInstansi = config.public.namaInstansi || 'KEMENTERIAN PENDAYAGUNAAN APARATUR NEGARA DAN REFORMASI BIROKRASI';

const loading = ref(true);
const error = ref(false);
const items = ref([]);
const totalAllItems = ref(0);
const totalBelanja = ref(0);
const rupMatched = ref(0);
const umkmCount = ref(0);

const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const searchQuery = ref('');

const exportModal = ref(false);

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const params = {
      tahun: selectedYear.value,
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
    };

    const res = await $fetch('/api/summary-table/epurchasing-public', { params });
    if (res.success) {
      items.value = res.data;
      totalAllItems.value = res.meta.totalItems;
      totalPages.value = res.meta.totalPages;
      totalBelanja.value = res.meta.totalBelanja || 0;
      rupMatched.value = res.meta.rupMatched || 0;
      umkmCount.value = res.meta.umkmCount || 0;
    } else {
      error.value = true;
      items.value = [];
    }
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const debouncedLoadData = (() => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loadData();
    }, 500);
  };
})();

watch([currentPage, itemsPerPage], () => { loadData(); });
watch(() => selectedYear.value, () => { currentPage.value = 1; loadData(); });

const onSearch = () => { currentPage.value = 1; debouncedLoadData(); };

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const exportMode = ref('filtered');
const exportLoading = ref(false);

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      tahun: selectedYear.value,
      page: 1,
      limit: 100000
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) params.search = searchQuery.value;
    }

    const res = await $fetch('/api/summary-table/epurchasing-public', { params });

    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No.': i + 1,
        'Nama Instansi': namaInstansi,
        'Nama Satuan Kerja': row.nama_satker || '-',
        'Tahun Anggaran': row.fiscal_year || '-',
        'Cara Pengadaan': 'E-Purchasing',
        'Metode Pengadaan': row.rup_metode_pengadaan || 'E-Purchasing',
        'Jenis Pengadaan': row.rup_jenis_pengadaan || '-',
        'Nama Paket': row.rup_nama_paket || row.rup_name || row.rup_desc || '-',
        'Kode RUP': row.rup_code || '-',
        'Sumber Dana': row.funding_source || '-',
        'Produk Dalam Negeri': row.flag_minikom || '-',
        'Total Nilai (Rp)': row.total || 0
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "E-Purchasing");

      const wscols = [
        {wch: 5}, {wch: 40}, {wch: 40}, {wch: 15}, {wch: 15}, {wch: 20},
        {wch: 20}, {wch: 50}, {wch: 15}, {wch: 15}, {wch: 20}, {wch: 20}
      ];
      ws['!cols'] = wscols;

      const filename = `EPurchasing_Public_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
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

onMounted(() => { loadData(); });
</script>
