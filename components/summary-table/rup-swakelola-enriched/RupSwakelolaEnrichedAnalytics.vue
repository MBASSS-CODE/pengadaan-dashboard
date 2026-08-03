<template>
  <div class="mb-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Swakelola</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Sudah Tercatat (Inaproc)</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ loading ? '...' : tercatatCount.toLocaleString('id-ID') }}
          <span class="text-sm font-medium ml-1 text-green-500/70">({{ loading ? '...' : tercatatPercentage }})</span>
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ loading ? '...' : formatRupiah(totalPagu) }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">PPK Tervalidasi</div>
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ loading ? '...' : ppkCompletedCount.toLocaleString('id-ID') }}
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex flex-col gap-6" v-if="!loading">
      
      <!-- 1. Tipe Swakelola -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Tipe Swakelola</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="tipeChartData" :data="tipeChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Tipe Swakelola</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Tipe Swakelola</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in byTipe" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 2. Status Pencatatan Pelaksanaan -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Status Pencatatan (Inaproc)</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="statusChartData" :data="statusChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Pencatatan Pelaksanaan</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status Pencatatan</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in byStatusPelaksanaan" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': item.label === 'Tercatat',
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': item.label === 'Belum Tercatat'
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 3. Kaji Ulang -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Riwayat Kaji Ulang</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="kajiUlangChartData" :data="kajiUlangChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Kaji Ulang RUP</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status Kaji Ulang</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in byKajiUlang" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                    :class="{
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': item.label === 'Ada Kaji Ulang',
                      'bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-foreground))]': item.label === 'Tanpa Revisi'
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 4. Top Lists -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Satker -->
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Top 5 Satuan Kerja (Pagu Terbesar)</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[400px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Satker</th>
                <th class="py-3 px-2 text-right">Paket</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-if="!topSatker.length">
                <td colspan="3" class="py-4 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada data</td>
              </tr>
              <tr v-for="(item, idx) in topSatker" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2 font-medium truncate max-w-[200px]" :title="item.label">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Top PPK -->
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Top 5 Pejabat Pembuat Komitmen</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[400px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Nama PPK</th>
                <th class="py-3 px-2 text-right">Paket</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-if="!topPpk.length">
                <td colspan="3" class="py-4 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada data</td>
              </tr>
              <tr v-for="(item, idx) in topPpk" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2 font-medium truncate max-w-[200px]" :title="item.label">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>

    <!-- Error/Loading state -->
    <div v-if="loading" class="py-20 flex flex-col items-center justify-center text-[color:hsl(var(--maz-muted))]">
      <MazSpinner color="primary" class="mb-4" />
      <p>Memuat data dan mengkalkulasi analytics...</p>
    </div>
    
    <div v-else-if="error" class="py-20 flex flex-col items-center justify-center text-[color:hsl(var(--maz-destructive))]">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="font-medium">Gagal memuat data analytics dari server.</p>
      <MazBtn @click="loadStatsAndAnalytics()" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps({
  year: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const error = ref(false);

const totalItems = ref(0);
const totalPagu = ref(0);
const ppkCompletedCount = ref(0);
const tercatatCount = ref(0);
const tercatatPercentage = ref('0%');

const byTipe = ref([]);
const byStatusPelaksanaan = ref([]);
const bySumberDana = ref([]);
const byKajiUlang = ref([]);
const byStatusUmumkan = ref([]);
const topSatker = ref([]);
const topPpk = ref([]);

// Chart Palettes (Using Tailwind colors mapped to hex)
const palette = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) label += ': ';
          if (context.parsed !== null) label += context.parsed.toLocaleString('id-ID');
          return label + ' Paket';
        }
      }
    }
  }
};

const pieOptions = {
  ...doughnutOptions,
  cutout: '0%'
};

// Computed Charts
const tipeChartData = computed(() => {
  if (!byTipe.value.length) return null;
  return {
    labels: byTipe.value.map(i => i.label),
    datasets: [{
      data: byTipe.value.map(i => i.count),
      backgroundColor: palette,
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
});

const statusChartData = computed(() => {
  if (!byStatusPelaksanaan.value.length) return null;
  const labels = byStatusPelaksanaan.value.map(i => i.label);
  const data = byStatusPelaksanaan.value.map(i => i.count);
  const bg = labels.map(l => {
    if (l === 'Tercatat') return '#10b981'; // green-500
    if (l === 'Belum Tercatat') return '#f59e0b'; // amber-500
    return '#64748b'; // slate-500
  });
  
  return {
    labels,
    datasets: [{ data, backgroundColor: bg, borderWidth: 0, hoverOffset: 4 }]
  };
});

const kajiUlangChartData = computed(() => {
  if (!byKajiUlang.value.length) return null;
  const labels = byKajiUlang.value.map(i => i.label);
  const data = byKajiUlang.value.map(i => i.count);
  const bg = labels.map(l => {
    if (l === 'Ada Kaji Ulang') return '#3b82f6'; // blue-500
    if (l === 'Tanpa Revisi') return '#94a3b8'; // slate-400
    return '#64748b';
  });
  
  return {
    labels,
    datasets: [{ data, backgroundColor: bg, borderWidth: 0, hoverOffset: 4 }]
  };
});

const formatRupiah = (angka) => {
  if (!angka) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(angka);
};

const loadStatsAndAnalytics = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/summary-table/rup-swakelola-analytics-summary', {
      params: { tahun: props.year }
    });
    
    if (res.success && res.summary) {
      const s = res.summary;
      totalItems.value = s.totalItems || 0;
      totalPagu.value = s.totalPagu || 0;
      ppkCompletedCount.value = s.ppkCompletedCount || 0;
      tercatatCount.value = s.tercatatCount || 0;
      tercatatPercentage.value = s.tercatatPercentage || '0%';
      
      byTipe.value = s.byTipe || [];
      byStatusPelaksanaan.value = s.byStatusPelaksanaan || [];
      bySumberDana.value = s.bySumberDana || [];
      byKajiUlang.value = s.byKajiUlang || [];
      byStatusUmumkan.value = s.byStatusUmumkan || [];
      topSatker.value = s.topSatker || [];
      topPpk.value = s.topPpk || [];
    } else {
      throw new Error('Data tidak tersedia');
    }
  } catch (err) {
    console.error('Error fetching analytics:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

watch(() => props.year, () => {
  loadStatsAndAnalytics();
});

onMounted(() => {
  loadStatsAndAnalytics();
});
</script>
