<template>
  <div class="p-6 max-w-[1400px] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Paket Realisasi Saya</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">
          Daftar lengkap paket realisasi pengadaan yang menjadi tanggung jawab Anda
        </p>
      </div>

      <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] pl-2">Tahun Anggaran:</span>
        <MazSelect v-model="selectedYear" :options="availableYears" size="sm" class="w-32" />
      </div>
    </div>

    <div
      v-if="!loading && !ppkLinked"
      class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8 text-center max-w-2xl mx-auto"
    >
      <h2 class="text-lg font-bold text-amber-700 dark:text-amber-300 mb-2">Akun Belum Terhubung ke Data PPK</h2>
      <p class="text-sm text-[color:hsl(var(--maz-muted))]">
        Hubungi Administrator untuk menautkan akun ini ke data Master PPK sebelum melihat data realisasi pribadi.
      </p>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Transaksi</div>
          <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
            {{ loading ? '...' : totalAllItems.toLocaleString('id-ID') }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai Realisasi</div>
          <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {{ loading ? '...' : formatRupiah(totalNilai) }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai PDN</div>
          <div class="text-xl font-bold text-teal-600 dark:text-teal-400">
            {{ loading ? '...' : formatRupiah(totalPdn) }}
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
          <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Nilai UMK</div>
          <div class="text-xl font-bold text-purple-600 dark:text-purple-400">
            {{ loading ? '...' : formatRupiah(totalUmk) }}
          </div>
        </div>
      </div>

      <!-- Filter & Table Card -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
        <div class="p-4 border-b border-[color:hsl(var(--maz-border))] space-y-4">
          <div class="flex flex-col md:flex-row gap-3 items-end">
            <div class="flex-1 w-full">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase">Pencarian</label>
              <MazInput
                v-model="searchQuery"
                placeholder="Cari Nama Paket, Kode Paket, Kode RUP, Penyedia, atau MAK..."
                size="sm"
                clearable
                @update:model-value="onSearch"
              />
            </div>
            <div class="w-full md:w-44">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase">Periode</label>
              <MazSelect v-model="filterType" :options="periodOptions" size="sm" />
            </div>
            <div v-if="filterType === 'triwulan'" class="w-full md:w-32">
              <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase">Triwulan</label>
              <MazSelect v-model="selectedQuarter" :options="quarterOptions" size="sm" />
            </div>
            <template v-if="filterType === 'tanggal'">
              <div>
                <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase">Mulai</label>
                <input v-model="startDate" type="date" class="px-2.5 py-1.5 text-xs rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase">Sampai</label>
                <input v-model="endDate" type="date" class="px-2.5 py-1.5 text-xs rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]" />
              </div>
            </template>

            <div class="flex gap-2">
              <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="secondary" outline size="sm">Reset</MazBtn>
              <MazBtn @click="exportModal = true" color="success" size="sm" :disabled="loading">Export Excel</MazBtn>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MazSelect v-model="selectedSumber" :options="sumberOptions" size="sm" multiple clearable placeholder="Sumber Transaksi" />
            <MazSelect v-model="selectedMetode" :options="metodeOptions" size="sm" multiple clearable placeholder="Metode Pengadaan" />
            <MazSelect v-model="selectedTahapan" :options="tahapanOptions" size="sm" multiple clearable placeholder="Tahapan" />
            <MazSelect v-model="selectedPenyedia" :options="penyediaOptions" size="sm" multiple clearable search placeholder="Penyedia" />
          </div>
        </div>

        <div v-if="loading" class="p-10 text-center text-sm text-[color:hsl(var(--maz-muted))]">
          Memuat paket realisasi...
        </div>

        <div v-else-if="items.length === 0" class="p-10 text-center text-sm text-[color:hsl(var(--maz-muted))]">
          Tidak ada paket realisasi ditemukan untuk filter saat ini.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="border-b border-[color:hsl(var(--maz-border))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
                <th class="py-3.5 px-4 w-12 text-center">No</th>
                <th class="py-3.5 px-4">Paket &amp; Kode</th>
                <th class="py-3.5 px-4">Sumber &amp; Metode</th>
                <th class="py-3.5 px-4">Penyedia</th>
                <th class="py-3.5 px-4">Tahapan</th>
                <th class="py-3.5 px-4 text-right">Realisasi / Pagu</th>
                <th class="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr
                v-for="(item, idx) in items"
                :key="`${item.kode_paket}_${idx}`"
                class="hover:bg-[color:hsl(var(--maz-foreground)_/_2%)] transition-colors"
              >
                <td class="py-3 px-4 text-center text-xs text-[color:hsl(var(--maz-muted))]">
                  {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>
                <td class="py-3 px-4 max-w-sm">
                  <div class="font-semibold text-[color:hsl(var(--maz-foreground))] line-clamp-2">{{ item.nama_paket }}</div>
                  <div class="text-[11px] font-mono text-[color:hsl(var(--maz-muted))] mt-0.5">
                    Paket: {{ item.kode_paket }} • RUP: {{ item.kode_rup || '-' }}
                  </div>
                </td>
                <td class="py-3 px-4 text-xs">
                  <div class="font-semibold">{{ item.sumber_transaksi }}</div>
                  <div class="text-[color:hsl(var(--maz-muted))]">{{ item.metode_pengadaan }} • {{ item.jenis_pengadaan_enriched || item.jenis_pengadaan || '-' }}</div>
                </td>
                <td class="py-3 px-4 text-xs">
                  <div class="font-medium">{{ item.nama_penyedia || '-' }}</div>
                  <div v-if="item.penyedia_status_umkk" class="text-[10px] text-purple-600 dark:text-purple-400">
                    {{ item.penyedia_status_umkk }}
                  </div>
                </td>
                <td class="py-3 px-4 text-xs">
                  <div class="font-semibold">{{ item.tahapan_pengadaan || '-' }}</div>
                  <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">{{ item.status_paket || '-' }}</div>
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                  <div class="font-bold text-emerald-600 dark:text-emerald-400">{{ formatRupiah(item.total_nilai) }}</div>
                  <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">Pagu: {{ formatRupiah(item.nilai_pagu) }}</div>
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
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage, totalAllItems) }} dari {{ totalAllItems }} paket
          </div>
          <div class="flex items-center gap-2">
            <MazBtn size="xs" outline :disabled="currentPage <= 1" @click="currentPage--">Prev</MazBtn>
            <span>Hal {{ currentPage }} / {{ totalPages }}</span>
            <MazBtn size="xs" outline :disabled="currentPage >= totalPages" @click="currentPage++">Next</MazBtn>
          </div>
        </div>
      </div>
    </template>

    <!-- Detail Dialog -->
    <RealisasiPrivateDetailDialog v-model="detailModal" :selected-item="selectedItem" />

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Ekspor Realisasi Pribadi ke Excel" max-width="460px">
      <div class="space-y-3 text-sm">
        <label class="flex items-start gap-2.5 p-3 rounded-lg border border-[color:hsl(var(--maz-border))] cursor-pointer">
          <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
          <div>
            <div class="font-semibold">Sesuai Filter Saat Ini</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor paket milik Anda yang tampil sesuai pencarian/filter.</div>
          </div>
        </label>
        <label class="flex items-start gap-2.5 p-3 rounded-lg border border-[color:hsl(var(--maz-border))] cursor-pointer">
          <input type="radio" v-model="exportMode" value="all" class="mt-1" />
          <div>
            <div class="font-semibold">Seluruh Paket Realisasi Saya ({{ selectedYear }})</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh paket realisasi milik Anda pada tahun {{ selectedYear }}.</div>
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
import RealisasiPrivateDetailDialog from '~/components/summary-table/realisasi/RealisasiPrivateDetailDialog.vue';

const currentYear = new Date().getFullYear();
const availableYears = [currentYear.toString(), (currentYear - 1).toString()].map((y) => ({
  label: y,
  value: y
}));
const selectedYear = ref(currentYear.toString());

const periodOptions = [
  { label: 'Semua Periode', value: 'semua' },
  { label: 'Per Triwulan', value: 'triwulan' },
  { label: 'Rentang Tanggal', value: 'tanggal' }
];
const quarterOptions = ['TW 1', 'TW 2', 'TW 3', 'TW 4'].map((q) => ({ label: q, value: q }));

const loading = ref(true);
const ppkLinked = ref(true);
const items = ref([]);
const totalAllItems = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const itemsPerPage = ref(15);

const totalNilai = ref(0);
const totalPdn = ref(0);
const totalUmk = ref(0);

const searchQuery = ref('');
const filterType = ref('semua');
const selectedQuarter = ref('TW 1');
const startDate = ref('');
const endDate = ref('');
const selectedSumber = ref([]);
const selectedMetode = ref([]);
const selectedTahapan = ref([]);
const selectedPenyedia = ref([]);

const sumberOptions = ref([]);
const metodeOptions = ref([]);
const tahapanOptions = ref([]);
const penyediaOptions = ref([]);

const detailModal = ref(false);
const selectedItem = ref(null);
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

const hasActiveFilters = computed(
  () =>
    Boolean(searchQuery.value) ||
    filterType.value !== 'semua' ||
    selectedSumber.value.length > 0 ||
    selectedMetode.value.length > 0 ||
    selectedTahapan.value.length > 0 ||
    selectedPenyedia.value.length > 0
);

const buildParams = (pageVal, limitVal, applyFilters = true) => {
  const params = {
    tahun: selectedYear.value,
    page: pageVal,
    limit: limitVal
  };
  if (applyFilters) {
    if (searchQuery.value) params.search = searchQuery.value;
    if (filterType.value !== 'semua') {
      params.filterType = filterType.value;
      if (filterType.value === 'triwulan') params.selectedQuarter = selectedQuarter.value;
      if (filterType.value === 'tanggal') {
        params.startDate = startDate.value;
        params.endDate = endDate.value;
      }
    }
    if (selectedSumber.value.length) params.sumberTransaksi = selectedSumber.value.join(',');
    if (selectedMetode.value.length) params.metodePengadaan = selectedMetode.value.join(',');
    if (selectedTahapan.value.length) params.tahapanPengadaan = selectedTahapan.value.join(',');
    if (selectedPenyedia.value.length) params.penyedia = selectedPenyedia.value.join(',');
  }
  return params;
};

const loadData = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/ppk/realisasi', {
      params: buildParams(currentPage.value, itemsPerPage.value, true)
    });
    ppkLinked.value = res.ppkLinked !== false;
    items.value = res.data || [];
    totalAllItems.value = res.meta?.totalItems || 0;
    totalPages.value = res.meta?.totalPages || 1;
    totalNilai.value = res.meta?.totalNilai || 0;
    totalPdn.value = res.meta?.totalPdn || 0;
    totalUmk.value = res.meta?.totalUmk || 0;

    sumberOptions.value = (res.filterOptions?.sumberTransaksi || []).map((v) => ({ label: v, value: v }));
    metodeOptions.value = (res.filterOptions?.metodePengadaan || []).map((v) => ({ label: v, value: v }));
    tahapanOptions.value = (res.filterOptions?.tahapanPengadaan || []).map((v) => ({ label: v, value: v }));
    penyediaOptions.value = (res.filterOptions?.penyedia || []).map((v) => ({ label: v, value: v }));
  } catch (err) {
    console.error('Error loading PPK realisasi:', err);
  } finally {
    loading.value = false;
  }
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
  filterType.value = 'semua';
  startDate.value = '';
  endDate.value = '';
  selectedSumber.value = [];
  selectedMetode.value = [];
  selectedTahapan.value = [];
  selectedPenyedia.value = [];
  currentPage.value = 1;
  loadData();
};

watch(currentPage, () => loadData());
watch(
  [selectedYear, filterType, selectedQuarter, startDate, endDate, selectedSumber, selectedMetode, selectedTahapan, selectedPenyedia],
  () => {
    if (filterType.value === 'tanggal' && (!startDate.value || !endDate.value)) return;
    currentPage.value = 1;
    loadData();
  }
);

const openDetail = (item) => {
  selectedItem.value = item;
  detailModal.value = true;
};

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const res = await $fetch('/api/ppk/realisasi', {
      params: buildParams(1, 100000, exportMode.value === 'filtered')
    });
    if (res.success && res.data) {
      const flatData = res.data.map((row, i) => ({
        'No.': i + 1,
        'Nama Instansi': row.nama_instansi || '-',
        'Satuan Kerja': row.nama_satuan_kerja || '-',
        'Kode Paket': row.kode_paket || '-',
        'Kode RUP': row.kode_rup || '-',
        'Tahun': row.tahun_anggaran || selectedYear.value,
        'Sumber Transaksi': row.sumber_transaksi || '-',
        'Sumber Dana': row.sumber_dana || '-',
        'Penyedia': row.nama_penyedia || '-',
        'PPK': row.nama_ppk || '-',
        'Metode': row.metode_pengadaan || '-',
        'Jenis': row.jenis_pengadaan_enriched || row.jenis_pengadaan || '-',
        'Nama Paket': row.nama_paket || '-',
        'Status Paket': row.status_paket || '-',
        'Tahapan': row.tahapan_pengadaan || '-',
        'Nilai Pagu (Rp)': row.nilai_pagu || 0,
        'Total Realisasi (Rp)': row.total_nilai || 0,
        'Nilai PDN (Rp)': row.nilai_pdn || 0,
        'Nilai UMK (Rp)': row.nilai_umk || 0,
        'Tanggal Transaksi': row.tgl_transaksi || '-',
        'Kode MAK': Array.isArray(row.mak_list) && row.mak_list.length ? row.mak_list.join(', ') : '-'
      }));
      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Realisasi_PPK_Saya');
      writeFile(
        wb,
        `Realisasi_PPK_Saya_${selectedYear.value}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`
      );
      exportModal.value = false;
    }
  } catch (err) {
    console.error('Export failed:', err);
    alert('Gagal mengekspor data.');
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
