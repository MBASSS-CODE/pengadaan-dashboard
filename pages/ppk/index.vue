<template>
  <div class="p-6 max-w-[1400px] mx-auto space-y-6">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 flex-wrap">
          <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Dashboard PPK Saya</h1>
          <span
            v-if="profile"
            class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
          >
            {{ profile.nama }}
          </span>
        </div>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">
          Ringkasan RUP dan realisasi pengadaan pribadi Anda
          <span v-if="profile?.nip_asli" class="font-mono text-xs ml-1">(NIP: {{ profile.nip_asli }})</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 bg-[color:hsl(var(--maz-background))] p-2 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] pl-2">Tahun:</span>
        <MazSelect v-model="selectedYear" :options="availableYears" size="sm" class="w-28" />

        <div class="flex rounded-lg border border-[color:hsl(var(--maz-border))] overflow-hidden text-xs font-semibold">
          <button
            type="button"
            class="px-3 py-1.5 border-0 cursor-pointer transition-colors"
            :class="scopeMode === 'acuan' ? 'bg-[color:hsl(var(--maz-primary))] text-white' : 'bg-transparent text-[color:hsl(var(--maz-muted))]'"
            @click="scopeMode = 'acuan'"
          >
            Acuan V6
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border-0 cursor-pointer transition-colors"
            :class="scopeMode === 'all' ? 'bg-[color:hsl(var(--maz-primary))] text-white' : 'bg-transparent text-[color:hsl(var(--maz-muted))]'"
            @click="scopeMode = 'all'"
          >
            Semua Sumber
          </button>
        </div>

        <MazSelect v-model="filterType" :options="periodOptions" size="sm" class="w-36" />
        <MazSelect
          v-if="filterType === 'triwulan'"
          v-model="selectedQuarter"
          :options="quarterOptions"
          size="sm"
          class="w-28"
        />
        <template v-if="filterType === 'tanggal'">
          <input
            v-model="startDate"
            type="date"
            class="px-2 py-1 text-xs rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))]"
          />
          <input
            v-model="endDate"
            type="date"
            class="px-2 py-1 text-xs rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))]"
          />
        </template>

        <MazBtn
          @click="exportWorkbook"
          :loading="exportLoading"
          :disabled="!ppkLinked || loading"
          color="success"
          size="sm"
        >
          Export Excel
        </MazBtn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div
        v-for="i in 5"
        :key="i"
        class="h-28 rounded-xl border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] animate-pulse"
      ></div>
    </div>

    <!-- Unlinked Notice -->
    <div
      v-else-if="!ppkLinked"
      class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-8 text-center max-w-2xl mx-auto"
    >
      <h2 class="text-lg font-bold text-amber-700 dark:text-amber-300 mb-2">Akun Belum Terhubung ke Data PPK</h2>
      <p class="text-sm text-[color:hsl(var(--maz-muted))]">
        Akun login Anda belum ditautkan ke data Master PPK. Silakan hubungi Administrator untuk menautkan akun ini pada menu Manajemen Pengguna.
      </p>
    </div>

    <!-- Main Content -->
    <div v-else-if="metrics" class="space-y-6">
      <!-- Global Contribution Banner (Hanya Angka Agregat Instansi, Tanpa Rincian PPK Lain) -->
      <div
        v-if="globalBenchmark"
        class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="flex flex-wrap items-center gap-6">
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))]">
              Kontribusi Realisasi Terhadap Instansi ({{ selectedYear }})
            </div>
            <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
              {{ globalBenchmark.persentaseKontribusiRealisasi }}%
              <span class="text-xs font-normal text-[color:hsl(var(--maz-muted))]">
                dari total instansi {{ formatRupiahSingkat(globalBenchmark.globalTotalNilaiRealisasi) }}
              </span>
            </div>
          </div>
          <div class="h-8 w-px bg-[color:hsl(var(--maz-border))] hidden md:block"></div>
          <div>
            <div class="text-[11px] font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))]">
              Porsi Pagu RUP Terumumkan
            </div>
            <div class="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {{ globalBenchmark.persentaseKontribusiRup }}%
              <span class="text-xs font-normal text-[color:hsl(var(--maz-muted))]">
                dari total instansi {{ formatRupiahSingkat(globalBenchmark.globalTotalRupTerumumkanNilai) }}
              </span>
            </div>
          </div>
        </div>

        <NuxtLink
          to="/dashboard"
          class="text-xs font-semibold text-[color:hsl(var(--maz-primary))] hover:underline no-underline whitespace-nowrap"
        >
          Lihat Dashboard Global Instansi →
        </NuxtLink>
      </div>

      <!-- 5 KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <div class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">RUP Terumumkan</div>
          <div class="text-xl font-black text-[color:hsl(var(--maz-foreground))] mt-1.5">
            {{ formatRupiahSingkat(metrics.total_rup_terumumkan_nilai) }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
            {{ formatNumber(metrics.total_rup_terumumkan_paket) }} Paket RUP Aktif
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <div class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">RUP Terealisasi / Belum</div>
          <div class="text-xl font-black text-blue-600 dark:text-blue-400 mt-1.5">
            {{ formatNumber(metrics.paket_rup) }} <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))]">/ {{ formatNumber(metrics.total_rup_terumumkan_paket) }}</span>
          </div>
          <div class="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Belum Jalan: {{ formatNumber(metrics.rup_belum_jalan_paket) }} paket ({{ formatRupiahSingkat(metrics.rup_belum_jalan_nilai) }})
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <div class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Nilai Realisasi</div>
          <div class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
            {{ formatRupiahSingkat(metrics.total_nilai_realisasi) }}
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
            {{ formatNumber(metrics.total_kode_paket) }} Paket Transaksi ({{ scopeMode === 'acuan' ? 'Acuan V6' : 'Semua Sumber' }})
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <div class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Persentase Serapan</div>
          <div class="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1.5">
            {{ metrics.persentase_serapan || 0 }}%
          </div>
          <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
            <div
              class="bg-indigo-500 h-1.5 rounded-full"
              :style="`width: ${Math.min(100, Math.max(0, Number(metrics.persentase_serapan) || 0))}%`"
            ></div>
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <div class="text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Realisasi PDN &amp; UMK</div>
          <div class="text-sm font-bold text-teal-600 dark:text-teal-400 mt-1.5">
            PDN: {{ formatRupiahSingkat(metrics.nilai_pdn) }}
          </div>
          <div class="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">
            UMK: {{ formatRupiahSingkat(metrics.nilai_umk) }}
          </div>
        </div>
      </div>

      <!-- 4 Tahapan Cards + Quick Links -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="stage in tahapanCards"
          :key="stage.label"
          class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex justify-between items-center"
        >
          <div>
            <div class="text-xs font-semibold text-[color:hsl(var(--maz-muted))]">{{ stage.label }}</div>
            <div class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mt-0.5">{{ formatNumber(stage.count) }} Paket</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">{{ formatRupiahSingkat(stage.nilai) }}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" :class="stage.badgeClass">
            {{ metrics.total_kode_paket > 0 ? Math.round((stage.count / metrics.total_kode_paket) * 100) : 0 }}%
          </span>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/ppk/realisasi" class="no-underline">
          <MazBtn color="primary" size="sm">Buka Daftar Paket Realisasi Saya</MazBtn>
        </NuxtLink>
        <NuxtLink to="/ppk/rup" class="no-underline">
          <MazBtn color="secondary" outline size="sm">Buka Daftar Paket RUP Saya</MazBtn>
        </NuxtLink>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm">
          <h3 class="text-sm font-bold uppercase tracking-wider mb-4">Tren Realisasi Bulanan Anda ({{ selectedYear }})</h3>
          <div class="h-[300px]">
            <ClientOnly>
              <Bar v-if="trendChartData" :data="trendChartData" :options="barOptions" />
            </ClientOnly>
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm flex flex-col">
          <h3 class="text-sm font-bold uppercase tracking-wider mb-4 text-center">Distribusi Tahapan Paket</h3>
          <div class="flex-grow min-h-[280px] flex items-center justify-center">
            <ClientOnly>
              <Doughnut v-if="tahapanChartData" :data="tahapanChartData" :options="doughnutOptions" />
              <p v-else class="text-xs text-[color:hsl(var(--maz-muted))]">Belum ada paket pada filter ini.</p>
            </ClientOnly>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm">
          <h3 class="text-sm font-bold uppercase tracking-wider mb-4">Realisasi per Sumber Transaksi (Periode Terpilih)</h3>
          <div class="h-[280px]">
            <ClientOnly>
              <Bar v-if="sumberChartData" :data="sumberChartData" :options="horizontalBarOptions" />
              <p v-else class="text-xs text-[color:hsl(var(--maz-muted))]">Belum ada transaksi.</p>
            </ClientOnly>
          </div>
        </div>

        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm flex flex-col">
          <h3 class="text-sm font-bold uppercase tracking-wider mb-4 text-center">Distribusi Metode Pengadaan Anda</h3>
          <div class="flex-grow min-h-[280px] flex items-center justify-center">
            <ClientOnly>
              <Doughnut v-if="metodeChartData" :data="metodeChartData" :options="doughnutOptions" />
              <p v-else class="text-xs text-[color:hsl(var(--maz-muted))]">Belum ada paket pada filter ini.</p>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { utils, writeFile } from 'xlsx';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const currentYear = new Date().getFullYear();
const availableYears = [currentYear.toString(), (currentYear - 1).toString()].map((y) => ({
  label: y,
  value: y
}));

const selectedYear = ref(currentYear.toString());
const scopeMode = ref('acuan');
const filterType = ref('semua');
const selectedQuarter = ref('TW 1');
const startDate = ref('');
const endDate = ref('');

const periodOptions = [
  { label: 'Semua Periode', value: 'semua' },
  { label: 'Per Triwulan', value: 'triwulan' },
  { label: 'Rentang Tanggal', value: 'tanggal' }
];
const quarterOptions = ['TW 1', 'TW 2', 'TW 3', 'TW 4'].map((q) => ({ label: q, value: q }));

const loading = ref(true);
const exportLoading = ref(false);
const ppkLinked = ref(true);
const profile = ref(null);
const metrics = ref(null);
const charts = ref(null);
const globalBenchmark = ref(null);

const buildQueryParams = (extra = {}) => ({
  tahun: selectedYear.value,
  scopeMode: scopeMode.value,
  filterType: filterType.value,
  selectedQuarter: filterType.value === 'triwulan' ? selectedQuarter.value : undefined,
  startDate: filterType.value === 'tanggal' ? startDate.value : undefined,
  endDate: filterType.value === 'tanggal' ? endDate.value : undefined,
  ...extra
});

const loadOverview = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/ppk/overview', { params: buildQueryParams() });
    ppkLinked.value = res.ppkLinked !== false;
    profile.value = res.profile;
    metrics.value = res.metrics;
    charts.value = res.charts;
    globalBenchmark.value = res.globalBenchmark;
  } catch (err) {
    console.error('Error loading PPK overview:', err);
  } finally {
    loading.value = false;
  }
};

watch([selectedYear, scopeMode, filterType, selectedQuarter, startDate, endDate], () => {
  if (filterType.value === 'tanggal' && (!startDate.value || !endDate.value)) return;
  loadOverview();
});

onMounted(() => {
  loadOverview();
});

const tahapanCards = computed(() => {
  if (!metrics.value) return [];
  return [
    {
      label: 'Pemilihan Berlangsung',
      count: metrics.value.paket_pemilihan_berlangsung || 0,
      nilai: metrics.value.nilai_pemilihan_berlangsung || 0,
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
    },
    {
      label: 'Pemilihan Selesai',
      count: metrics.value.paket_pemilihan_selesai || 0,
      nilai: metrics.value.nilai_pemilihan_selesai || 0,
      badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
    },
    {
      label: 'Kontrak',
      count: metrics.value.paket_kontrak || 0,
      nilai: metrics.value.nilai_kontrak || 0,
      badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
    },
    {
      label: 'Selesai',
      count: metrics.value.paket_selesai || 0,
      nilai: metrics.value.nilai_selesai || 0,
      badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    }
  ];
});

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6', '#ec4899'];

const trendChartData = computed(() => {
  const list = charts.value?.trend || [];
  if (!list.length) return null;
  return {
    labels: list.map((i) => i.label),
    datasets: [
      {
        label: 'Nilai Realisasi (Rp)',
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        data: list.map((i) => i.nilai)
      }
    ]
  };
});

const tahapanChartData = computed(() => {
  const list = (charts.value?.tahapan || []).filter((i) => i.count > 0);
  if (!list.length) return null;
  return {
    labels: list.map((i) => i.label),
    datasets: [
      {
        data: list.map((i) => i.count),
        backgroundColor: ['#f59e0b', '#0ea5e9', '#6366f1', '#10b981'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };
});

const sumberChartData = computed(() => {
  const list = charts.value?.sumber || [];
  if (!list.length) return null;
  return {
    labels: list.map((i) => i.label),
    datasets: [
      {
        label: 'Nilai Realisasi (Rp)',
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
        data: list.map((i) => i.nilai)
      }
    ]
  };
});

const metodeChartData = computed(() => {
  const list = charts.value?.metode || [];
  if (!list.length) return null;
  return {
    labels: list.map((i) => i.label),
    datasets: [
      {
        data: list.map((i) => i.nilai),
        backgroundColor: chartColors,
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => formatRupiahSingkat(ctx.raw) } }
  },
  scales: {
    y: { ticks: { callback: (val) => formatRupiahSingkat(val) } }
  }
};

const horizontalBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (ctx) => formatRupiahSingkat(ctx.raw) } }
  },
  scales: {
    x: { ticks: { callback: (val) => formatRupiahSingkat(val) } }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } }
  },
  cutout: '62%'
};

const exportWorkbook = async () => {
  exportLoading.value = true;
  try {
    const res = await $fetch('/api/ppk/overview', {
      params: buildQueryParams({ includeDetails: '1' })
    });
    if (!res?.success || !res.metrics) return;

    const wb = utils.book_new();
    const m = res.metrics;

    const summaryRows = [
      {
        'Nama PPK': m.nama,
        'NIP': m.nip_asli || '-',
        'Jabatan': m.jabatan || '-',
        'Unit Kerja': m.unit_kerja || '-',
        'Tahun': selectedYear.value,
        'Cakupan': scopeMode.value === 'acuan' ? 'Acuan E-Katalog V6' : 'Semua Sumber',
        'RUP Terumumkan (Paket)': m.total_rup_terumumkan_paket || 0,
        'RUP Terumumkan (Rp)': m.total_rup_terumumkan_nilai || 0,
        'RUP Terealisasi (Paket)': m.paket_rup || 0,
        'RUP Belum Jalan (Paket)': m.rup_belum_jalan_paket || 0,
        'Total Paket Realisasi': m.total_kode_paket || 0,
        'Total Nilai Realisasi (Rp)': m.total_nilai_realisasi || 0,
        'Serapan (%)': m.persentase_serapan || 0,
        'Nilai PDN (Rp)': m.nilai_pdn || 0,
        'Nilai UMK (Rp)': m.nilai_umk || 0
      }
    ];
    utils.book_append_sheet(wb, utils.json_to_sheet(summaryRows), 'Ringkasan PPK');

    const rupRows = (res.detailRupList || []).map((r, idx) => ({
      'No': idx + 1,
      'Kode RUP': r.kd_rup,
      'Tipe': r.tipe_paket,
      'Nama Paket': r.nama_paket,
      'Pagu (Rp)': r.pagu || 0,
      'Jenis Pengadaan': r.jenis_pengadaan || '-',
      'Metode Pengadaan': r.metode_pengadaan || '-',
      'Status Umumkan': r.status_umumkan_rup || '-',
      'Jumlah Transaksi': r.transaksi_count || 0,
      'Nilai Transaksi (Rp)': r.transaksi_nilai || 0
    }));
    utils.book_append_sheet(wb, utils.json_to_sheet(rupRows), 'Daftar RUP Saya');

    const paketRows = (res.detailPaketList || []).map((p, idx) => ({
      'No': idx + 1,
      'Kode Paket': p.kode_paket,
      'Kode RUP': p.kode_rup,
      'Nama Paket': p.nama_paket,
      'Sumber Transaksi': p.sumber_transaksi,
      'Metode Pengadaan': p.metode_pengadaan,
      'Jenis Pengadaan': p.jenis_pengadaan,
      'Penyedia': p.nama_penyedia,
      'Tahapan': p.tahapan_pengadaan,
      'Status': p.status_paket,
      'Nilai Pagu (Rp)': p.rup_pagu || 0,
      'Total Realisasi (Rp)': p.total_nilai || 0,
      'Nilai PDN (Rp)': p.nilai_pdn || 0,
      'Nilai UMK (Rp)': p.nilai_umk || 0
    }));
    utils.book_append_sheet(wb, utils.json_to_sheet(paketRows), 'Paket Realisasi Saya');

    const safeName = (m.nama || 'PPK').replace(/[^a-zA-Z0-9_-]+/g, '_');
    writeFile(wb, `Rekap_Pribadi_${safeName}_${selectedYear.value}.xlsx`);
  } catch (err) {
    console.error('Failed to export PPK workbook:', err);
    alert('Gagal mengekspor data ke Excel.');
  } finally {
    exportLoading.value = false;
  }
};

const formatNumber = (num) => new Intl.NumberFormat('id-ID').format(Number(num) || 0);

const formatRupiahSingkat = (angka) => {
  const n = Number(angka) || 0;
  if (n >= 1e12) return 'Rp ' + (n / 1e12).toFixed(2) + ' T';
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(2) + ' M';
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(2) + ' Jt';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n);
};
</script>
