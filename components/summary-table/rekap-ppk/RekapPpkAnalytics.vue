<template>
  <ClientOnly>
    <div class="space-y-6">
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div v-for="i in 5" :key="i" class="h-28 bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] animate-pulse"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center text-red-600 dark:text-red-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-bold">Gagal Memuat Analitik</p>
        <p class="text-sm mt-1">Terjadi kesalahan saat mengambil ringkasan analitik Rekap PPK.</p>
        <MazBtn @click="loadAnalytics()" color="destructive" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <div v-else-if="isEmpty" class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-[color:hsl(var(--maz-foreground))] mb-2">Belum Ada Data Analitik PPK</h3>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] max-w-md mx-auto mb-6">
          Grafik dan ringkasan per PPK akan muncul setelah proses penggabungan data (Merge Rekap PPK) dijalankan.
        </p>
      </div>

      <div v-else class="space-y-6">
        <!-- Summary Cards (Aligned with RekapPpkTable.vue) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total PPK &amp; Paket</h3>
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatNumber(summary.totalPpk) }} PPK</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
              {{ formatNumber(summary.totalKodePaket) }} paket transaksi
            </div>
          </div>

          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow" :title="formatRupiahExact(summary.totalRupTerealisasiNilai)">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">RUP Terealisasi (Acuan)</h3>
              <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ formatRupiahSingkat(summary.totalRupTerealisasiNilai) }}</div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-blue-500 h-1.5 rounded-full" :style="`width: ${Math.min(100, rupTerealisasiPercent)}%`"></div>
            </div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-1">{{ summary.totalRupTerealisasiPaket }} dari {{ summary.totalRupTerumumkanPaket }} RUP Terumumkan</div>
          </div>

          <div class="bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm hover:shadow-md transition-shadow" :title="formatRupiahExact(summary.totalNilaiRealisasi)">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Nilai Realisasi</h3>
              <div class="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiahSingkat(summary.totalNilaiRealisasi) }}</div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-green-500 h-1.5 rounded-full" :style="`width: ${Math.min(100, summary.persentaseSerapan || 0)}%`"></div>
            </div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-1">Serapan {{ summary.persentaseSerapan || 0 }}% dari Pagu {{ formatRupiahSingkat(summary.totalRupTerumumkanNilai) }}</div>
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
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiahSingkat(summary.totalNilaiPdn) }}</div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-teal-500 h-1.5 rounded-full" :style="`width: ${Math.min(100, summary.persentasePdn || 0)}%`"></div>
            </div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-1">{{ summary.persentasePdn || 0 }}% terhadap Realisasi</div>
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
            <div class="text-2xl font-black text-[color:hsl(var(--maz-foreground))]">{{ formatRupiahSingkat(summary.totalNilaiUmk) }}</div>
            <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_10%)] rounded-full h-1.5 mt-2">
              <div class="bg-purple-500 h-1.5 rounded-full" :style="`width: ${Math.min(100, summary.persentaseUmk || 0)}%`"></div>
            </div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-1">{{ summary.persentaseUmk || 0 }}% terhadap Realisasi</div>
          </div>
        </div>

        <!-- 1. Pagu RUP Terumumkan vs Kontrak vs Selesai Per PPK -->
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">
            Perbandingan Pagu RUP Terumumkan vs Kontrak vs Selesai Per PPK
          </h3>
          <div class="w-full h-[360px]">
            <Bar v-if="paguVsRealisasiChartData" :data="paguVsRealisasiChartData" :options="barOptions" />
          </div>
        </div>

        <!-- 2. Sumber Transaksi & Beban Tahapan Paket -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">
              Komposisi Sumber Transaksi (Nilai Rp)
            </h3>
            <div class="flex-grow flex items-center justify-center min-h-[300px]">
              <Doughnut v-if="sumberTransaksiChartData" :data="sumberTransaksiChartData" :options="doughnutOptions" />
              <div v-else class="text-sm text-[color:hsl(var(--maz-muted))]">Belum ada data transaksi</div>
            </div>
          </div>

          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex flex-col">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">
              Beban Jumlah Paket Per Tahapan Tiap PPK
            </h3>
            <div class="flex-grow min-h-[300px]">
              <Bar v-if="tahapanPaketChartData" :data="tahapanPaketChartData" :options="stackedBarOptions" />
            </div>
          </div>
        </div>

        <!-- 3. Progress Leaderboards (Matches Top 10 style in RealisasiPrivateAnalytics.vue) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Peringkat Nilai Realisasi PPK -->
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">
              Peringkat Nilai Realisasi Per PPK (Klik untuk Detail)
            </h3>
            <div class="space-y-4" v-if="topRealisasiPpk.length > 0">
              <div
                v-for="(item, index) in topRealisasiPpk"
                :key="item.ppk_key || index"
                class="relative cursor-pointer group p-1.5 -mx-1.5 rounded-lg hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
                @click="openDetail(item)"
              >
                <div class="flex justify-between items-end mb-1 z-10 relative">
                  <span class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] group-hover:text-[color:hsl(var(--maz-primary))] truncate max-w-[62%]" :title="item.nama">
                    {{ index + 1 }}. {{ item.nama }}
                  </span>
                  <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatRupiahSingkat(item.total_nilai_realisasi) }} ({{ item.persentase_serapan || 0 }}%)
                  </span>
                </div>
                <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_5%)] rounded-full h-2">
                  <div
                    class="bg-emerald-500 h-2 rounded-full"
                    :style="`width: ${Math.max(2, ((item.total_nilai_realisasi || 0) / (topRealisasiPpk[0].total_nilai_realisasi || 1)) * 100)}%`"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-[color:hsl(var(--maz-muted))] py-10 text-sm">Belum ada data PPK</div>
          </div>

          <!-- Peringkat Sisa RUP Terumumkan Belum Jalan -->
          <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6">
              Sisa RUP Terumumkan Belum Terealisasi (Klik untuk Detail)
            </h3>
            <div class="space-y-4" v-if="topBelumJalanPpk.length > 0">
              <div
                v-for="(item, index) in topBelumJalanPpk"
                :key="item.ppk_key || index"
                class="relative cursor-pointer group p-1.5 -mx-1.5 rounded-lg hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
                @click="openDetail(item)"
              >
                <div class="flex justify-between items-end mb-1 z-10 relative">
                  <span class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] group-hover:text-[color:hsl(var(--maz-primary))] truncate max-w-[60%]" :title="item.nama">
                    {{ index + 1 }}. {{ item.nama }}
                  </span>
                  <span class="text-xs font-bold text-amber-600 dark:text-amber-400">
                    {{ item.rup_belum_jalan_paket }} RUP ({{ formatRupiahSingkat(item.rup_belum_jalan_nilai) }})
                  </span>
                </div>
                <div class="w-full bg-[color:hsl(var(--maz-foreground)_/_5%)] rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full"
                    :style="`width: ${Math.max(2, ((item.rup_belum_jalan_nilai || 0) / (topBelumJalanPpk[0].rup_belum_jalan_nilai || 1)) * 100)}%`"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center text-[color:hsl(var(--maz-muted))] py-10 text-sm">Semua RUP sudah memiliki transaksi</div>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      <RekapPpkDetailDialog v-model="detailModal" :selected-ppk="selectedPpk" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
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
import RekapPpkDetailDialog from './RekapPpkDetailDialog.vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const props = defineProps({
  selectedYear: { type: String, required: true },
  scopeMode: { type: String, default: 'acuan' },
  filterType: { type: String, default: 'semua' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  selectedQuarter: { type: String, default: 'TW 1' }
});

const loading = ref(true);
const error = ref(false);
const isEmpty = ref(true);
const items = ref<any[]>([]);
const summary = ref<any>({
  totalPpk: 0,
  ppkCompleted: 0,
  ppkIncomplete: 0,
  totalKodePaket: 0,
  totalRupTerumumkanPaket: 0,
  totalRupTerumumkanNilai: 0,
  totalRupTerealisasiPaket: 0,
  totalRupTerealisasiNilai: 0,
  totalNilaiRealisasi: 0,
  totalNilaiPdn: 0,
  totalNilaiUmk: 0,
  persentaseSerapan: 0,
  persentasePdn: 0,
  persentaseUmk: 0
});

const detailModal = ref(false);
const selectedPpk = ref<any>(null);

const openDetail = (ppk: any) => {
  selectedPpk.value = ppk;
  detailModal.value = true;
};

const colors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
  '#6366f1', '#84cc16'
];
const bgColors = colors.map((c) => c + 'cc');

const topRealisasiPpk = computed(() =>
  [...items.value]
    .sort((a, b) => (b.total_nilai_realisasi || 0) - (a.total_nilai_realisasi || 0))
    .slice(0, 12)
);

const rupTerealisasiPercent = computed(() => {
  const pagu = Number(summary.value?.totalRupTerumumkanNilai) || 0;
  const real = Number(summary.value?.totalRupTerealisasiNilai) || 0;
  return pagu > 0 ? Math.round((real / pagu) * 1000) / 10 : 0;
});

const topBelumJalanPpk = computed(() =>
  [...items.value]
    .filter((p) => (p.rup_belum_jalan_paket || 0) > 0)
    .sort((a, b) => (b.rup_belum_jalan_nilai || 0) - (a.rup_belum_jalan_nilai || 0))
    .slice(0, 12)
);

const paguVsRealisasiChartData = computed(() => {
  const list = topRealisasiPpk.value;
  if (!list.length) return null;
  return {
    labels: list.map((p) => (p.nama?.length > 22 ? p.nama.slice(0, 20) + '...' : p.nama)),
    datasets: [
      {
        label: 'Pagu RUP Terumumkan',
        data: list.map((p) => p.total_rup_terumumkan_nilai || 0),
        backgroundColor: '#94a3b8cc',
        borderRadius: 4
      },
      {
        label: 'Kontrak Berjalan',
        data: list.map((p) => p.nilai_kontrak || 0),
        backgroundColor: '#3b82f6cc',
        borderRadius: 4
      },
      {
        label: 'Selesai',
        data: list.map((p) => p.nilai_selesai || 0),
        backgroundColor: '#10b981cc',
        borderRadius: 4
      }
    ]
  };
});

const tahapanPaketChartData = computed(() => {
  const list = topRealisasiPpk.value;
  if (!list.length) return null;
  return {
    labels: list.map((p) => (p.nama?.length > 18 ? p.nama.slice(0, 16) + '...' : p.nama)),
    datasets: [
      {
        label: 'Pemilihan Berlangsung',
        data: list.map((p) => p.paket_pemilihan_berlangsung || 0),
        backgroundColor: '#f59e0bcc',
        borderRadius: 3
      },
      {
        label: 'Pemilihan Selesai',
        data: list.map((p) => p.paket_pemilihan_selesai || 0),
        backgroundColor: '#0ea5e9cc',
        borderRadius: 3
      },
      {
        label: 'Kontrak',
        data: list.map((p) => p.paket_kontrak || 0),
        backgroundColor: '#3b82f6cc',
        borderRadius: 3
      },
      {
        label: 'Selesai',
        data: list.map((p) => p.paket_selesai || 0),
        backgroundColor: '#10b981cc',
        borderRadius: 3
      }
    ]
  };
});

const sumberTransaksiChartData = computed(() => {
  const map: Record<string, number> = {};
  for (const ppk of items.value) {
    const bd = ppk.breakdown_sumber || {};
    for (const [key, val] of Object.entries<any>(bd)) {
      map[key] = (map[key] || 0) + (Number(val?.nilai) || 0);
    }
  }
  const entries = Object.entries(map).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  return {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: bgColors,
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };
});

const barOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.dataset.label}: ${formatRupiahSingkat(ctx.raw)}`
      }
    }
  },
  scales: {
    y: {
      ticks: { callback: (val: any) => formatRupiahSingkat(val) }
    }
  }
};

const stackedBarOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 14 } }
  },
  scales: {
    x: { stacked: true },
    y: { stacked: true, beginAtZero: true }
  }
};

const doughnutOptions: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 12, padding: 20 }
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const raw = context.raw;
          const sum = context.chart._metasets[context.datasetIndex].total || 1;
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
    const res: any = await $fetch('/api/summary-table/rekap-ppk', {
      params: {
        tahun: props.selectedYear,
        scopeMode: props.scopeMode,
        filterType: props.filterType,
        startDate: props.startDate,
        endDate: props.endDate,
        selectedQuarter: props.selectedQuarter,
        page: 1,
        limit: 1000
      }
    });

    if (res?.success && res.summary && res.data?.length > 0) {
      items.value = res.data;
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

watch(
  [
    () => props.selectedYear,
    () => props.scopeMode,
    () => props.filterType,
    () => props.startDate,
    () => props.endDate,
    () => props.selectedQuarter
  ],
  () => {
    loadAnalytics();
  }
);

onMounted(() => {
  loadAnalytics();
});

const formatNumber = (num: number) => {
  if (!num) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

const formatRupiahExact = (angka: number) => {
  if (!angka && angka !== 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

const formatRupiahSingkat = (angka: number) => {
  if (!angka) return 'Rp 0';
  if (angka >= 1e12) return 'Rp ' + (angka / 1e12).toFixed(2) + ' T';
  if (angka >= 1e9) return 'Rp ' + (angka / 1e9).toFixed(2) + ' M';
  if (angka >= 1e6) return 'Rp ' + (angka / 1e6).toFixed(2) + ' Jt';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};
</script>
