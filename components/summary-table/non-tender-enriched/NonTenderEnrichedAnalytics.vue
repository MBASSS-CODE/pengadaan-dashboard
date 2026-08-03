<template>
  <div class="mb-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Non-Tender</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Terintegrasi RUP</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ loading ? '...' : rupMatchedCount.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total HPS (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ loading ? '...' : formatRupiah(totalHps) }}
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
      
      <!-- 1. Deviasi HPS vs Pagu -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Deviasi HPS vs Pagu RUP</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="deviasiChartData" :data="deviasiChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Kepatuhan Anggaran</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status Deviasi</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% HPS</th>
                <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
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
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Status Non-Tender -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Status Pelaksanaan (Inaproc)</h3>
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
                <th class="py-3 px-2 text-right">% HPS</th>
                <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in statusTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold border"
                    :class="{
                      'bg-[#8cc63f] text-gray-900 border-[#8cc63f]': item.label === 'Selesai',
                      'bg-[#fbbd08] text-gray-900 border-[#fbbd08]': item.label === 'Berlangsung',
                      'bg-[#17a2b8] text-white border-[#17a2b8]': ['Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(item.label),
                      'bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border-[color:hsl(var(--maz-border))]': !['Selesai', 'Berlangsung', 'Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(item.label)
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalHps) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 3. Metode Pengadaan -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Metode Pemilihan</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="metodeChartData" :data="metodeChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Metode Pemilihan</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Metode Pemilihan</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% HPS</th>
                <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in metodeTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Jenis Pengadaan -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Jenis Pengadaan</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="jenisChartData" :data="jenisChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Jenis Pengadaan</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Jenis Pengadaan</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% HPS</th>
                <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in jenisTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Kaji Ulang -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Status Kaji Ulang</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="kajiUlangChartData" :data="kajiUlangChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] lg:col-span-3 overflow-x-auto flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Kaji Ulang</h3>
          <div class="overflow-x-auto flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
                <tr>
                  <th class="py-3 px-2">Status</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% HPS</th>
                  <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in kajiUlangTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2">
                    <span class="px-2 py-1 rounded text-xs font-semibold"
                      :class="{
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': item.label === 'Ada Kaji Ulang',
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400': item.label === 'Tanpa Revisi'
                      }"
                    >
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 6. Top Satker (Table Only) -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-x-auto">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Top Satuan Kerja (Berdasarkan HPS)</h3>
        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[600px]">
          <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
            <tr>
              <th class="py-3 px-2 w-10">No</th>
              <th class="py-3 px-2">Nama Satuan Kerja</th>
              <th class="py-3 px-2 text-right">Jumlah Paket</th>
              <th class="py-3 px-2 text-right">% HPS</th>
              <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr v-for="(item, idx) in satkerTableData.slice(0, 10)" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
              <td class="py-3 px-2 font-medium">{{ idx + 1 }}</td>
              <td class="py-3 px-2">{{ item.label }}</td>
              <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
              <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
              <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
            </tr>
            <tr v-if="satkerTableData.length === 0">
              <td colspan="5" class="py-8 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada data Satuan Kerja</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 7. Top PPK (Table Only) -->
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-x-auto">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Top Pejabat Pembuat Komitmen (Berdasarkan HPS)</h3>
        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[600px]">
          <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
            <tr>
              <th class="py-3 px-2 w-10">No</th>
              <th class="py-3 px-2">Nama Lengkap PPK</th>
              <th class="py-3 px-2 text-right">Jumlah Paket</th>
              <th class="py-3 px-2 text-right">% HPS</th>
              <th class="py-3 px-2 text-right">Total HPS (Rp)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr v-for="(item, idx) in ppkTableData.slice(0, 10)" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
              <td class="py-3 px-2 font-medium">{{ idx + 1 }}</td>
              <td class="py-3 px-2">{{ item.label }}</td>
              <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
              <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
              <td class="py-3 px-2 text-right">{{ formatRupiah(item.hps) }}</td>
            </tr>
            <tr v-if="ppkTableData.length === 0">
              <td colspan="5" class="py-8 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada data PPK</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
    
    <div v-else class="mt-8 flex flex-col items-center justify-center min-h-[300px] text-[color:hsl(var(--maz-muted))]">
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
  }
});

const loading = ref(true);
const totalItems = ref(0);
const totalHps = ref(0);
const rupMatchedCount = ref(0);
const ppkCompletedCount = ref(0);

// Chart Datas
const deviasiChartData = ref(null);
const statusChartData = ref(null);
const metodeChartData = ref(null);
const jenisChartData = ref(null);
const kajiUlangChartData = ref(null);

// Table Datas
const deviasiTableData = ref([]);
const statusTableData = ref([]);
const metodeTableData = ref([]);
const jenisTableData = ref([]);
const kajiUlangTableData = ref([]);
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
    const res = await $fetch('/api/summary-table/nontender-analytics-summary', {
      params: { tahun: props.selectedYear }
    });

    if (res.success && res.summary) {
      const summary = res.summary;
      
      totalItems.value = summary.totalItems || 0;
      totalHps.value = summary.totalHps || 0;
      rupMatchedCount.value = summary.rupMatchedCount || 0;
      ppkCompletedCount.value = summary.ppkCompletedCount || 0;

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

      // 3. Metode
      metodeTableData.value = summary.metode || [];
      metodeChartData.value = {
        labels: metodeTableData.value.map(i => i.label),
        datasets: [{
          data: metodeTableData.value.map(i => i.count),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6'],
          borderWidth: 0
        }]
      };

      // 4. Jenis
      jenisTableData.value = summary.jenis || [];
      jenisChartData.value = {
        labels: jenisTableData.value.map(i => i.label),
        datasets: [{
          data: jenisTableData.value.map(i => i.count),
          backgroundColor: ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#64748b', '#10b981'],
          borderWidth: 0
        }]
      };

      // 5. Kaji Ulang
      kajiUlangTableData.value = summary.kajiUlang || [];
      kajiUlangChartData.value = {
        labels: kajiUlangTableData.value.map(i => i.label),
        datasets: [{
          data: kajiUlangTableData.value.map(i => i.count),
          backgroundColor: ['#f59e0b', '#94a3b8'],
          borderWidth: 0
        }]
      };

      // 6. Satker
      satkerTableData.value = summary.satker || [];
      
      // 7. PPK
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
</script>
