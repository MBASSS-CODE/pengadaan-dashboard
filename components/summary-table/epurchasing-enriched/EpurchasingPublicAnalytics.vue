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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Pesanan</h3>
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
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Nilai Pembelian</h3>
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
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Terkoneksi RUP</h3>
              <div class="p-2 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatNumber(summary.terkoneksiRup) }} <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))]">/ {{ formatNumber(summary.totalPesanan) }}</span></div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-teal-500 h-1.5 rounded-full" :style="`width: ${Math.round(summary.terkoneksiRup / (summary.totalPesanan || 1) * 100)}%`"></div>
            </div>
          </div>
          
          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Penyedia UMKM</h3>
              <div class="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatNumber(umkmCount) }}</div>
          </div>
        </div>

        <!-- 1. Trend Transaksi Bulanan -->
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">Tren E-Purchasing Bulanan (Nilai Transaksi)</h3>
          <div class="w-full h-[350px]">
            <Bar v-if="trendChartData" :data="trendChartData" :options="barOptions" />
          </div>
        </div>

        <!-- 2. Distribusi Kategori UMKM, Produk Lokal, Sumber Dana -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Distribusi Kategori UMKM</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="umkmChartData" :data="umkmChartData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Produk Dalam Negeri (Lokal)</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="minikomChartData" :data="minikomChartData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Sumber Dana</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="sumberDanaChartData" :data="sumberDanaChartData" :options="doughnutOptions" />
            </div>
          </div>
        </div>

        <!-- 3. Metode dan Jenis Pengadaan -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Metode Pengadaan</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="metodeChartData" :data="metodeChartData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Jenis Pengadaan</h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="jenisChartData" :data="jenisChartData" :options="doughnutOptions" />
            </div>
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
  terkoneksiRup: 0,
  trend: [],
  umkm: [],
  rupConnection: [],
  orderStatus: [],
  minikom: [],
  metodePengadaan: [],
  jenisPengadaan: [],
  sumberDana: []
});

const umkmCount = computed(() => {
  return summary.value.umkm
    .filter(i => i.label !== 'Non-UMKM' && i.label !== 'Tidak Diketahui')
    .reduce((acc, curr) => acc + curr.count, 0);
});

// Chart Colors
const colors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', 
  '#6366f1', '#84cc16'
];

const bgColors = colors.map(c => c + 'cc');

const trendChartData = computed(() => {
  if (!summary.value.trend.length) return null;
  return {
    labels: summary.value.trend.map(i => i.label.substring(0, 3)),
    datasets: [
      {
        label: 'Nilai Transaksi (Rp)',
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        data: summary.value.trend.map(i => i.total)
      }
    ]
  };
});

const umkmChartData = computed(() => {
  if (!summary.value.umkm.length) return null;
  return {
    labels: summary.value.umkm.map(i => i.label),
    datasets: [{
      data: summary.value.umkm.map(i => i.total),
      backgroundColor: bgColors,
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };
});

const minikomChartData = computed(() => {
  if (!summary.value.minikom.length) return null;
  return {
    labels: summary.value.minikom.map(i => i.label),
    datasets: [{
      data: summary.value.minikom.map(i => i.count),
      backgroundColor: ['#3b82f6', '#f59e0b'],
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
      data: summary.value.metodePengadaan.map(i => i.count),
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
      data: summary.value.jenisPengadaan.map(i => i.count),
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
      data: summary.value.sumberDana.map(i => i.count),
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
          return ` ${context.label}: ${formatNumber(raw)} (${percent})`;
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

    const res = await $fetch('/api/summary-table/epurchasing-analytics-summary-public', {
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
