<template>
  <ClientOnly>
    <div class="space-y-6">
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-28 bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] animate-pulse"></div>
      </div>
      
      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center text-red-600 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-bold">Gagal Memuat Analitik</p>
        <p class="text-sm mt-1">Terjadi kesalahan saat mengambil ringkasan analitik.</p>
        <MazBtn @click="loadAnalytics()" color="danger" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <div v-else-if="isEmpty" class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[color:hsl(var(--maz-foreground))] mb-2">Belum Ada Data Analitik</h3>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] max-w-md mx-auto mb-6">
          Grafik dan ringkasan akan muncul di sini setelah Anda melakukan integrasi data.
        </p>
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Transaksi</h3>
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatNumber(summary.totalPesanan) }}</div>
          </div>
          
          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Nilai Realisasi</h3>
              <div class="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiahSingkat(summary.totalNilai) }}</div>
          </div>

          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Nilai PDN</h3>
              <div class="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiahSingkat(summary.totalPdn) }}</div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-teal-500 h-1.5 rounded-full" :style="`width: ${Math.round(summary.totalPdn / (summary.totalNilai || 1) * 100)}%`"></div>
            </div>
          </div>
          
          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Nilai UMK</h3>
              <div class="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiahSingkat(summary.totalUmk) }}</div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-purple-500 h-1.5 rounded-full" :style="`width: ${Math.round(summary.totalUmk / (summary.totalNilai || 1) * 100)}%`"></div>
            </div>
          </div>
        </div>

        <!-- 1. Trend Transaksi Bulanan -->
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">Tren Realisasi Pengadaan Bulanan (Berdasarkan Nilai)</h3>
          <div class="w-full h-[350px]">
            <Bar v-if="trendChartData" :data="trendChartData" :options="barOptions" />
          </div>
        </div>

        <!-- 2. Sumber Transaksi & Sumber Dana -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Sumber Transaksi (Nilai Rp)</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="sumberTransaksiChartData" :data="sumberTransaksiChartData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Sumber Dana (Nilai Rp)</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="sumberDanaChartData" :data="sumberDanaChartData" :options="doughnutOptions" />
            </div>
          </div>
        </div>

        <!-- 3. Metode dan Jenis Pengadaan -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Metode Pengadaan (Nilai Rp)</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="metodeChartData" :data="metodeChartData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Jenis Pengadaan (Nilai Rp)</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="jenisChartData" :data="jenisChartData" :options="doughnutOptions" />
            </div>
          </div>
        </div>

        <!-- 4. Top 10 Pihak Terkait -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Top 10 PPK -->
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">Top 10 PPK (Berdasarkan Nilai)</h3>
            <div class="space-y-4" v-if="summary.topPpk && summary.topPpk.length > 0">
              <div v-for="(item, index) in summary.topPpk" :key="index" class="relative">
                <div class="flex justify-between items-end mb-1 z-10 relative">
                  <span class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] truncate max-w-[65%]" :title="item.label">{{ index + 1 }}. {{ item.label }}</span>
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ formatRupiahSingkat(item.total) }}</span>
                </div>
                <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_5%)] rounded-full h-2">
                  <div class="bg-emerald-500 h-2 rounded-full" :style="`width: ${Math.max(1, (item.total / summary.topPpk[0].total) * 100)}%`"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-[color:hsl(var(--maz-muted))] py-10 text-sm">Belum ada data PPK</div>
          </div>
          
          <!-- Top 10 Penyedia -->
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">Top 10 Penyedia (Berdasarkan Nilai)</h3>
            <div class="space-y-4" v-if="summary.topPenyedia && summary.topPenyedia.length > 0">
              <div v-for="(item, index) in summary.topPenyedia" :key="index" class="relative">
                <div class="flex justify-between items-end mb-1 z-10 relative">
                  <span class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] truncate max-w-[65%]" :title="item.label">{{ index + 1 }}. {{ item.label }}</span>
                  <span class="text-xs font-bold text-blue-600 dark:text-blue-400">{{ formatRupiahSingkat(item.total) }}</span>
                </div>
                <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_5%)] rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" :style="`width: ${Math.max(1, (item.total / summary.topPenyedia[0].total) * 100)}%`"></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-[color:hsl(var(--maz-muted))] py-10 text-sm">Belum ada data Penyedia</div>
          </div>
        </div>

      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement);

const props = defineProps({
  selectedYear: { type: String, required: true }
});

const loading = ref(true);
const error = ref(false);
const isEmpty = ref(true);
const summary = ref({
  totalPesanan: 0,
  totalNilai: 0,
  totalPdn: 0,
  totalUmk: 0,
  trend: [],
  sumberTransaksi: [],
  metodePengadaan: [],
  jenisPengadaan: [],
  sumberDana: [],
  topPpk: [],
  topPenyedia: []
});

// Chart Colors
const colors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', 
  '#6366f1', '#84cc16'
];

const bgColors = colors.map(c => c + 'cc');

const trendChartData = computed(() => {
  if (!summary.value.trend?.length) return null;
  return {
    labels: summary.value.trend.map(i => i.label.substring(0, 3)),
    datasets: [
      {
        label: 'Nilai Transaksi (Rp)',
        backgroundColor: '#10b981',
        borderRadius: 4,
        data: summary.value.trend.map(i => i.total)
      }
    ]
  };
});

const sumberTransaksiChartData = computed(() => {
  if (!summary.value.sumberTransaksi?.length) return null;
  return {
    labels: summary.value.sumberTransaksi.map(i => i.label),
    datasets: [{
      data: summary.value.sumberTransaksi.map(i => i.total),
      backgroundColor: bgColors,
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };
});

const metodeChartData = computed(() => {
  if (!summary.value.metodePengadaan?.length) return null;
  return {
    labels: summary.value.metodePengadaan.map(i => i.label),
    datasets: [{
      data: summary.value.metodePengadaan.map(i => i.total),
      backgroundColor: bgColors,
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };
});

const jenisChartData = computed(() => {
  if (!summary.value.jenisPengadaan?.length) return null;
  return {
    labels: summary.value.jenisPengadaan.map(i => i.label),
    datasets: [{
      data: summary.value.jenisPengadaan.map(i => i.total),
      backgroundColor: bgColors,
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };
});

const sumberDanaChartData = computed(() => {
  if (!summary.value.sumberDana?.length) return null;
  return {
    labels: summary.value.sumberDana.map(i => i.label),
    datasets: [{
      data: summary.value.sumberDana.map(i => i.total),
      backgroundColor: bgColors,
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };
});

// Options
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => formatRupiahSingkat(context.raw)
      }
    }
  },
  scales: {
    y: {
      ticks: { callback: (val) => formatRupiahSingkat(val) }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 20 }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const raw = context.raw;
          const sum = context.chart._metasets[context.datasetIndex].total;
          const percent = ((raw / sum) * 100).toFixed(1) + '%';
          return ` ${context.label}: ${formatRupiahSingkat(raw)} (${percent})`;
        }
      }
    }
  },
  cutout: '65%'
};

const loadAnalytics = async () => {
  loading.value = true;
  error.value = false;
  isEmpty.value = false;
  
  try {
    const params = { tahun: props.selectedYear };

    const res = await $fetch('/api/summary-table/realisasi-analytics-private', {
      params
    });
    
    if (res.success && res.summary && res.summary.totalPesanan > 0) {
      summary.value = res.summary;
    } else {
      isEmpty.value = true;
    }
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

watch(() => props.selectedYear, () => {
  loadAnalytics();
});

onMounted(() => {
  loadAnalytics();
});

const formatNumber = (num) => {
  if (!num) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

const formatRupiahSingkat = (angka) => {
  if (!angka) return 'Rp 0';
  if (angka >= 1e12) return 'Rp ' + (angka / 1e12).toFixed(2) + ' T';
  if (angka >= 1e9) return 'Rp ' + (angka / 1e9).toFixed(2) + ' M';
  if (angka >= 1e6) return 'Rp ' + (angka / 1e6).toFixed(2) + ' Jt';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};
</script>
