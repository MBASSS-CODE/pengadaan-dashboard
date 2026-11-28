<template>
  <div class="p-6 max-w-[1400px] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Paket RUP Saya</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">
          Daftar perencanaan RUP Penyedia dan Swakelola milik Anda beserta status realisasinya
        </p>
      </div>

      <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] pl-2">Tahun Anggaran:</span>
        <MazSelect v-model="selectedYear" :options="availableYears" size="sm" class="w-32" />
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 pb-2 border-b border-[hsl(var(--maz-border))]">
      <button
        type="button"
        class="pb-2 px-4 font-medium transition-colors duration-200 border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
        :class="activeTipe === 'penyedia' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))]'"
        @click="switchTab('penyedia')"
      >
        RUP Penyedia
      </button>
      <button
        type="button"
        class="pb-2 px-4 font-medium transition-colors duration-200 border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
        :class="activeTipe === 'swakelola' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))]'"
        @click="switchTab('swakelola')"
      >
        RUP Swakelola
      </button>
    </div>

    <div
      v-if="!loading && !ppkLinked"
      class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8 text-center max-w-2xl mx-auto"
    >
      <h2 class="text-lg font-bold text-amber-700 dark:text-amber-300 mb-2">Akun Belum Terhubung ke Data PPK</h2>
      <p class="text-sm text-[color:hsl(var(--maz-muted))]">
        Hubungi Administrator untuk menautkan akun ini ke data Master PPK sebelum melihat data RUP pribadi.
      </p>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket RUP</div>
          <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
            {{ loading ? '...' : totalAllItems.toLocaleString('id-ID') }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu RUP</div>
          <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ loading ? '...' : formatRupiah(totalPagu) }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Sudah Terealisasi</div>
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ loading ? '...' : realisasiCount.toLocaleString('id-ID') }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Belum Jalan</div>
          <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {{ loading ? '...' : belumJalanCount.toLocaleString('id-ID') }}
          </div>
        </div>
      </div>

      <!-- Filter & Table -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
        <div class="p-4 border-b border-[color:hsl(var(--maz-border))] space-y-3">
          <div class="flex flex-col md:flex-row gap-3 items-end">
            <div class="flex-1 w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase">Pencarian</label>
              <MazInput
                v-model="searchQuery"
                placeholder="Cari Nama Paket atau Kode RUP..."
                size="sm"
                clearable
                @update:model-value="onSearch"
              />
            </div>
            <div class="flex gap-2">
              <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="secondary" outline size="sm">Reset</MazBtn>
              <MazBtn @click="exportModal = true" color="success" size="sm" :disabled="loading">Export Excel</MazBtn>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MazSelect v-model="selectedStatusReal" :options="statusRealOptions" size="sm" multiple clearable placeholder="Status Realisasi" />
            <MazSelect v-model="selectedJenis" :options="jenisOptions" size="sm" multiple clearable placeholder="Jenis Pengadaan" />
            <MazSelect
              v-if="activeTipe === 'penyedia'"
              v-model="selectedMetode"
              :options="metodeOptions"
              size="sm"
              multiple
              clearable
              placeholder="Metode Pengadaan"
            />
            <MazSelect v-model="selectedStatusUmumkan" :options="statusUmumkanOptions" size="sm" placeholder="Status Umumkan" />
          </div>
        </div>

        <div v-if="loading" class="p-10 text-center text-sm text-[color:hsl(var(--maz-muted))]">
          Memuat data RUP Anda...
        </div>

        <div v-else-if="items.length === 0" class="p-10 text-center text-sm text-[color:hsl(var(--maz-muted))]">
          Tidak ada paket RUP ditemukan untuk filter saat ini.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="border-b border-[color:hsl(var(--maz-border))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">No</th>
                <th class="py-3.5 px-4">Kode RUP &amp; Nama Paket</th>
                <th class="py-3.5 px-4">Jenis &amp; Metode</th>
                <th class="py-3.5 px-4 text-right">Pagu RUP</th>
                <th class="py-3.5 px-4">Status RUP</th>
                <th class="py-3.5 px-4">Status Realisasi</th>
                <th class="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr
                v-for="(item, idx) in items"
                :key="`${item.kd_rup}_${idx}`"
                class="hover:bg-[color:hsl(var(--maz-foreground)_/_2%)] transition-colors"
              >
                <td class="py-3 px-4 text-center text-xs text-[color:hsl(var(--maz-muted))]">
                  {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>
                <td class="py-3 px-4 max-w-md">
                  <div class="font-semibold text-[color:hsl(var(--maz-foreground))] line-clamp-2">{{ item.nama_paket || '-' }}</div>
                  <div class="text-[11px] font-mono text-[color:hsl(var(--maz-muted))] mt-0.5">
                    RUP: {{ item.kd_rup }} • {{ item.sumber_dana_list || '-' }}
                  </div>
                </td>
                <td class="py-3 px-4 text-xs">
                  <div class="font-medium">{{ activeTipe === 'swakelola' ? (item.tipe_swakelola_nama || item.tipe_swakelola || 'Swakelola') : (item.jenis_pengadaan || '-') }}</div>
                  <div class="text-[color:hsl(var(--maz-muted))]">{{ activeTipe === 'swakelola' ? 'Swakelola' : (item.metode_pengadaan || '-') }}</div>
                </td>
                <td class="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  {{ formatRupiah(item.pagu) }}
                </td>
                <td class="py-3 px-4 text-xs">
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="item.status_aktif_rup ? 'bg-green-500/15 text-green-700 dark:text-green-400' : 'bg-gray-500/15 text-gray-500'"
                  >
                    {{ item.status_aktif_rup ? 'Aktif' : 'Non-Aktif' }}
                  </span>
                  <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5">{{ item.status_umumkan_rup || '-' }}</div>
                </td>
                <td class="py-3 px-4 text-xs">
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    :class="item._ppk_terealisasi ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'"
                  >
                    {{ item._ppk_status_realisasi || 'Belum Jalan' }}
                  </span>
                  <div v-if="item._ppk_transaksi_count > 0" class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5">
                    {{ item._ppk_transaksi_count }} trx • {{ formatRupiah(item._ppk_transaksi_nilai) }}
                  </div>
                </td>
                <td class="py-3 px-4 text-center">
                  <MazBtn size="xs" color="info" outline @click="openDetail(item)">Detail</MazBtn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="!loading && totalAllItems > 0"
          class="p-4 border-t border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs"
        >
          <div class="text-[color:hsl(var(--maz-muted))]">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage, totalAllItems) }} dari {{ totalAllItems }} RUP
          </div>
          <div class="flex items-center gap-2">
            <MazBtn size="xs" outline :disabled="currentPage <= 1" @click="currentPage--">Prev</MazBtn>
            <span>Hal {{ currentPage }} / {{ totalPages }}</span>
            <MazBtn size="xs" outline :disabled="currentPage >= totalPages" @click="currentPage++">Next</MazBtn>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Dialogs -->
    <RupPenyediaEnrichedDetailDialog v-if="activeTipe === 'penyedia'" v-model="detailModal" :selected-row="selectedRow" />
    <RupSwakelolaEnrichedDetailDialog v-else v-model="detailModal" :selected-row="selectedRow" />

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Ekspor RUP Pribadi ke Excel" max-width="460px">
      <div class="space-y-3 text-sm">
        <label class="flex items-start gap-2.5 p-3 rounded-lg border border-[color:hsl(var(--maz-border))] cursor-pointer">
          <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
          <div>
            <div class="font-semibold">Sesuai Filter Saat Ini</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data RUP Anda yang sesuai pencarian/filter.</div>
          </div>
        </label>
        <label class="flex items-start gap-2.5 p-3 rounded-lg border border-[color:hsl(var(--maz-border))] cursor-pointer">
          <input type="radio" v-model="exportMode" value="all" class="mt-1" />
          <div>
            <div class="font-semibold">Seluruh Data RUP Saya ({{ selectedYear }})</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh RUP {{ activeTipe }} milik Anda pada tahun {{ selectedYear }}.</div>
          </div>
        </label>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <MazBtn size="sm" outline @click="exportModal = false">Batal</MazBtn>
          <MazBtn size="sm" color="success" :loading="exportLoading" @click="executeExport">Download Excel</MazBtn>
        </div>
      </template>
    </MazDialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { utils, writeFile } from 'xlsx';
import RupPenyediaEnrichedDetailDialog from '~/components/summary-table/rup-penyedia-enriched/RupPenyediaEnrichedDetailDialog.vue';
import RupSwakelolaEnrichedDetailDialog from '~/components/summary-table/rup-swakelola-enriched/RupSwakelolaEnrichedDetailDialog.vue';

const currentYear = new Date().getFullYear();
const availableYears = [currentYear.toString(), (currentYear - 1).toString()].map((y) => ({
  label: y,
  value: y
}));
const selectedYear = ref(currentYear.toString());
const activeTipe = ref('penyedia');

const loading = ref(true);
const ppkLinked = ref(true);
const items = ref([]);
const totalAllItems = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = ref(15);

const totalPagu = ref(0);
const realisasiCount = ref(0);
const belumJalanCount = ref(0);

const searchQuery = ref('');
const selectedStatusReal = ref([]);
const selectedJenis = ref([]);
const selectedMetode = ref([]);
const selectedStatusUmumkan = ref('ALL');

const statusRealOptions = ref([]);
const jenisOptions = ref([]);
const metodeOptions = ref([]);
const statusUmumkanOptions = ref([{ label: 'Semua Status Umumkan', value: 'ALL' }]);

const detailModal = ref(false);
const selectedRow = ref(null);
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

const hasActiveFilters = computed(
  () =>
    Boolean(searchQuery.value) ||
    selectedStatusReal.value.length > 0 ||
    selectedJenis.value.length > 0 ||
    selectedMetode.value.length > 0 ||
    selectedStatusUmumkan.value !== 'ALL'
);

const buildParams = (pageVal, limitVal, applyFilters = true) => {
  const params = {
    tahun: selectedYear.value,
    tipe: activeTipe.value,
    page: pageVal,
    limit: limitVal
  };
  if (applyFilters) {
    if (searchQuery.value) params.search = searchQuery.value;
    if (selectedStatusReal.value.length) params.statusRealisasi = selectedStatusReal.value.join(',');
    if (selectedJenis.value.length) params.jenisPengadaan = selectedJenis.value.join(',');
    if (selectedMetode.value.length && activeTipe.value === 'penyedia') {
      params.metodePengadaan = selectedMetode.value.join(',');
    }
    if (selectedStatusUmumkan.value !== 'ALL') params.statusUmumkan = selectedStatusUmumkan.value;
  }
  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/ppk/rup', {
      params: buildParams(currentPage.value, itemsPerPage.value, true)
    });
    ppkLinked.value = res.ppkLinked !== false;
    items.value = res.data || [];
    totalAllItems.value = res.meta?.totalItems || 0;
    totalPages.value = res.meta?.totalPages || 1;
    totalPagu.value = res.meta?.totalPagu || 0;
    realisasiCount.value = res.meta?.realisasiCount || 0;
    belumJalanCount.value = res.meta?.belumJalanCount || 0;

    statusRealOptions.value = (res.filterOptions?.statusRealisasi || []).map((v) => ({ label: v, value: v }));
    jenisOptions.value = (res.filterOptions?.jenisPengadaan || []).map((v) => ({ label: v, value: v }));
    metodeOptions.value = (res.filterOptions?.metodePengadaan || []).map((v) => ({ label: v, value: v }));
    statusUmumkanOptions.value = [
      { label: 'Semua Status Umumkan', value: 'ALL' },
      ...(res.filterOptions?.statusUmumkan || []).map((v) => ({ label: v, value: v }))
    ];
  } catch (err) {
    console.error('Error loading PPK RUP:', err);
  } finally {
    loading.value = false;
  }
};

const switchTab = (tipe) => {
  activeTipe.value = tipe;
  resetFilters();
};

let searchTimer;
const onSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 400);
};

const resetFilters = () => {
  searchQuery.value = '';
  selectedStatusReal.value = [];
  selectedJenis.value = [];
  selectedMetode.value = [];
  selectedStatusUmumkan.value = 'ALL';
  currentPage.value = 1;
  loadData();
};

watch(currentPage, () => loadData());
watch([selectedYear, selectedStatusReal, selectedJenis, selectedMetode, selectedStatusUmumkan], () => {
  currentPage.value = 1;
  loadData();
});

const openDetail = (row) => {
  selectedRow.value = row;
  detailModal.value = true;
};

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const res = await $fetch('/api/ppk/rup', {
      params: buildParams(1, 100000, exportMode.value === 'filtered')
    });
    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Kode RUP': row.kd_rup,
        'Nama Paket': row.nama_paket || '-',
        'Pagu (Rp)': row.pagu || 0,
        'Jenis': activeTipe.value === 'swakelola' ? (row.tipe_swakelola_nama || row.tipe_swakelola || 'Swakelola') : (row.jenis_pengadaan || '-'),
        'Metode': activeTipe.value === 'swakelola' ? 'Swakelola' : (row.metode_pengadaan || '-'),
        'Sumber Dana': row.sumber_dana_list || '-',
        'PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Status Aktif': row.status_aktif_rup ? 'Aktif' : 'Non-Aktif',
        'Status Umumkan': row.status_umumkan_rup || '-',
        'Status Realisasi': row._ppk_status_realisasi || 'Belum Jalan',
        'Jumlah Transaksi': row._ppk_transaksi_count || 0,
        'Nilai Transaksi (Rp)': row._ppk_transaksi_nilai || 0
      }));
      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, activeTipe.value === 'swakelola' ? 'RUP_Swakelola_PPK' : 'RUP_Penyedia_PPK');
      const label = activeTipe.value === 'swakelola' ? 'Swakelola' : 'Penyedia';
      writeFile(
        wb,
        `RUP_${label}_PPK_Saya_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`
      );
      exportModal.value = false;
    }
  } catch (err) {
    console.error('Export RUP failed:', err);
    alert('Gagal mengekspor data RUP.');
  } finally {
    exportLoading.value = false;
  }
};

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

onMounted(() => loadData());
</script>
