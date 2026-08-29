<template>
  <div class="mb-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Pencatatan</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ loading ? '...' : formatRupiah(totalPagu) }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Realisasi (Rp)</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ loading ? '...' : formatRupiah(totalRealisasi) }}
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex flex-col gap-6" v-if="!loading && totalItems > 0">
      
      <!-- 1. Deviasi Realisasi vs Pagu -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Efisiensi (Realisasi vs Pagu)</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="deviasiChartData" :data="deviasiChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Efisiensi Anggaran</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status Deviasi</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Realisasi</th>
                <th class="py-3 px-2 text-right">Total Realisasi (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in deviasiTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': item.label.includes('Sesuai'),
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': item.label.includes('Overbudget'),
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': item.label.includes('Underbudget')
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.realisasi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Status Pencatatan -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Status Pencatatan</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="statusChartData" :data="statusChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Status Pelaksanaan</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Realisasi</th>
                <th class="py-3 px-2 text-right">Total Realisasi (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in statusTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold border"
                    :class="{
                      'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] border-transparent': item.label === 'Paket Selesai',
                      'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] border-transparent': item.label === 'Aktif',
                      'bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border-[color:hsl(var(--maz-border))]': !['Paket Selesai', 'Aktif'].includes(item.label)
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.realisasi) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalRealisasi) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 3. Tipe Swakelola -->
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
                <th class="py-3 px-2 text-right">% Realisasi</th>
                <th class="py-3 px-2 text-right">Total Realisasi (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in tipeTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.realisasi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Sumber Dana -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Sumber Dana</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="sumberDanaChartData" :data="sumberDanaChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Sumber Dana</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Sumber Dana</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Realisasi</th>
                <th class="py-3 px-2 text-right">Total Realisasi (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in sumberDanaTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.realisasi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Top Satker (Table Only) -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-x-auto">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Top Satuan Kerja (Berdasarkan Realisasi)</h3>
        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[600px]">
          <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
            <tr>
              <th class="py-3 px-2 w-10">No</th>
              <th class="py-3 px-2">Nama Satuan Kerja</th>
              <th class="py-3 px-2 text-right">Jumlah Paket</th>
              <th class="py-3 px-2 text-right">% Realisasi</th>
              <th class="py-3 px-2 text-right">Total Realisasi (Rp)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr v-for="(item, idx) in satkerTableData.slice(0, 10)" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
              <td class="py-3 px-2 font-medium">{{ idx + 1 }}</td>
              <td class="py-3 px-2">{{ item.label }}</td>
              <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
              <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
              <td class="py-3 px-2 text-right">{{ formatRupiah(item.realisasi) }}</td>
            </tr>
            <tr v-if="satkerTableData.length === 0">
              <td colspan="5" class="py-8 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada data Satuan Kerja</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 6. Top PPK (Table Only) -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-x-auto">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Top Pejabat Pembuat Komitmen (Berdasarkan Realisasi)</h3>
        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[600px]">
          <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
            <tr>
              <th class="py-3 px-2 w-10">No</th>
              <th class="py-3 px-2">Nama Lengkap PPK</th>
              <th class="py-3 px-2 text-right">Jumlah Paket</th>
              <th class="py-3 px-2 text-right">% Realisasi</th>
              <th class="py-3 px-2 text-right">Total Realisasi (Rp)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr v-for="(item, idx) in ppkTableData.slice(0, 10)" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
              <td class="py-3 px-2 font-medium">{{ idx + 1 }}</td>
              <td class="py-3 px-2">{{ item.label }}</td>
              <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
              <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
              <td class="py-3 px-2 text-right">{{ formatRupiah(item.realisasi) }}</td>
            </tr>
            <tr v-if="ppkTableData.length === 0">
              <td colspan="5" class="py-8 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada data PPK</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
    
    <!-- Tampilan Data Kosong -->
    <div v-if="!loading && totalItems === 0" class="mt-8 flex flex-col items-center justify-center min-h-[350px] text-center bg-[color:hsl(var(--maz-background))] rounded-2xl border border-dashed border-[color:hsl(var(--maz-border))] p-8">
      <div class="w-20 h-20 mb-5 rounded-full bg-[color:hsl(var(--maz-primary)_/_10%)] flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-[color:hsl(var(--maz-foreground))] mb-2">Belum Ada Data Terintegrasi</h3>
      <p class="text-[color:hsl(var(--maz-muted))] max-w-md mx-auto mb-6 text-sm">
        Tidak ada data pencatatan paket swakelola untuk tahun anggaran ini yang telah melalui proses integrasi (merge). Silakan jalankan proses integrasi data melalui menu Admin Sistem.
      </p>
      <NuxtLink to="/admin/system" class="inline-flex items-center justify-center px-4 py-2 bg-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-background))] hover:bg-[color:hsl(var(--maz-primary)_/_90%)] transition-colors rounded-lg font-medium text-sm">
        Ke Menu Integrasi Data
      </NuxtLink>
    </div>

    <div v-else-if="loading" class="mt-8 flex flex-col items-center justify-center min-h-[300px] text-[color:hsl(var(--maz-muted))]">
      <span class="animate-spin h-10 w-10 border-4 border-[color:hsl(var(--maz-primary))] border-t-transparent rounded-full mb-4"></span>
      <p>Memuat data dan mengkalkulasi analytics...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Doughnut, Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  },
  selectedSatker: {
    type: String,
    default: null
  }
});

const loading = ref(true);
const totalItems = ref(0);
const totalPagu = ref(0);
const totalRealisasi = ref(0);

// Chart Datas
const deviasiChartData = ref(null);
const statusChartData = ref(null);
const tipeChartData = ref(null);
const sumberDanaChartData = ref(null);

// Table Datas
const deviasiTableData = ref([]);
const statusTableData = ref([]);
const tipeTableData = ref([]);
const sumberDanaTableData = ref([]);
const satkerTableData = ref([]);
const ppkTableData = ref([]);

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: { family: 'Inter, sans-serif', size: 11 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.raw !== null) {
            label += context.raw + ' Paket';
          }
          return label;
        }
      }
    }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: { family: 'Inter, sans-serif', size: 11 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.raw !== null) {
            label += context.raw + ' Paket';
          }
          return label;
        }
      }
    }
  }
};

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const loadStatsAndAnalytics = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/summary-table/swakelola-analytics-summary', {
      params: { tahun: props.selectedYear, satker: props.selectedSatker || undefined }
    });

    if (res.success && res.summary) {
      const summary = res.summary;
      
      totalItems.value = summary.totalItems || 0;
      totalPagu.value = summary.totalPagu || 0;
      totalRealisasi.value = summary.totalRealisasi || 0;

      // 1. Deviasi
      deviasiTableData.value = summary.deviasi || [];
      deviasiChartData.value = {
        labels: deviasiTableData.value.map(i => i.label),
        datasets: [{
          data: deviasiTableData.value.map(i => i.count),
          backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
          borderWidth: 0
        }]
      };

      // 2. Status
      statusTableData.value = summary.status || [];
      statusChartData.value = {
        labels: statusTableData.value.map(i => i.label),
        datasets: [{
          data: statusTableData.value.map(i => i.count),
          backgroundColor: ['#8cc63f', '#fbbd08', '#17a2b8', '#64748b', '#ef4444'],
          borderWidth: 0
        }]
      };

      // 3. Tipe Swakelola
      tipeTableData.value = summary.tipe || [];
      tipeChartData.value = {
        labels: tipeTableData.value.map(i => i.label),
        datasets: [{
          data: tipeTableData.value.map(i => i.count),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0
        }]
      };

      // 4. Sumber Dana
      sumberDanaTableData.value = summary.sumberDana || [];
      sumberDanaChartData.value = {
        labels: sumberDanaTableData.value.map(i => i.label),
        datasets: [{
          data: sumberDanaTableData.value.map(i => i.count),
          backgroundColor: ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0
        }]
      };

      // 5 & 6. Satker and PPK
      satkerTableData.value = summary.satker || [];
      ppkTableData.value = summary.ppk || [];
    }
  } catch (err) {
    console.error('Error fetching analytics:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStatsAndAnalytics();
});

watch(() => props.selectedYear, () => {
  loadStatsAndAnalytics();
});
watch(() => props.selectedSatker, () => {
  loadStatsAndAnalytics();
});
</script>
