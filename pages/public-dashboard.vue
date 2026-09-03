<template>
  <div class="min-h-screen bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))] font-sans pb-20">
    <!-- Navbar -->
    <nav class="sticky top-0 w-full z-50 bg-[color:hsl(var(--maz-background)_/_80%)] backdrop-blur-md border-b border-[color:hsl(var(--maz-border))] py-4 px-6 md:px-12 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer" @click="navigateTo('/')">
          Pengadaan Dashboard Publik
        </span>
      </div>
      <div class="flex items-center gap-4">
        <button 
          @click="toggleTheme" 
          class="theme-toggle-btn"
          title="Toggle Dark Mode"
        >
          <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-400 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[color:hsl(var(--maz-foreground))] transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        <MazBtn @click="navigateTo('/login')" color="primary" class="font-semibold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-transform flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Masuk Admin
        </MazBtn>
      </div>
    </nav>

    <div class="max-w-[1400px] mx-auto px-6 py-8">
      <div class="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold mb-1">Dashboard Publik Pengadaan</h1>
          <p class="text-[color:hsl(var(--maz-muted))]">Ringkasan Realisasi dan E-Purchasing (Tahun {{ selectedYear }})</p>
        </div>
        <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
          <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Tahun Anggaran:</span>
          <select v-model="selectedYear" class="p-1 rounded bg-transparent border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] font-semibold focus:outline-none" @change="loadDashboardData">
            <option :value="currentYear.toString()">{{ currentYear }}</option>
            <option :value="(currentYear - 1).toString()">{{ currentYear - 1 }}</option>
          </select>
        </div>
      </div>

      <!-- Ringkasan Global -->
      <div v-if="dashboardLoading" class="flex flex-col items-center justify-center py-12 gap-4 text-[color:hsl(var(--maz-muted))]">
        <ClientOnly>
          <MazSpinner color="primary" size="3rem" />
        </ClientOnly>
        <p>Memuat ringkasan data...</p>
      </div>
      <div v-else-if="dashboardError" class="text-center py-12 text-[color:hsl(var(--maz-destructive))] bg-red-50 dark:bg-red-900/10 rounded-xl">
        <p>Gagal memuat ringkasan. Silakan coba lagi.</p>
      </div>
      <div v-else class="mb-12">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[color:hsl(var(--maz-border))] pb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Ringkasan Total Pengadaan
        </h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <div class="border-t-4 border-t-blue-500 bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border-x border-b border-[color:hsl(var(--maz-border))] shadow-sm">
            <h3 class="text-xs font-bold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-2">Total Belanja Pengadaan</h3>
            <div class="text-xl font-black text-[color:hsl(var(--maz-foreground))] mb-1 break-words">{{ formatCurrency(dashboardData.belanja_barang_jasa) }}</div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-muted))]">Total Pengadaan (Barang & Jasa)</div>
          </div>
          <div class="border-t-4 border-t-indigo-500 bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border-x border-b border-[color:hsl(var(--maz-border))] shadow-sm">
            <h3 class="text-xs font-bold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-2">Total Nilai Perencanaan</h3>
            <div class="text-xl font-black text-[color:hsl(var(--maz-foreground))] mb-1 break-words">{{ formatCurrency(dashboardData.total_nilai_perencanaan) }}</div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-muted))]">Total RUP: {{ dashboardData.total_rup || 0 }} Paket</div>
          </div>
          <div class="border-t-4 border-t-teal-500 bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border-x border-b border-[color:hsl(var(--maz-border))] shadow-sm">
            <h3 class="text-xs font-bold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-2">Total Nilai Realisasi</h3>
            <div class="text-xl font-black text-[color:hsl(var(--maz-foreground))] mb-1 break-words">{{ formatCurrency(dashboardData.total_nilai_realisasi) }}</div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-muted))]">Total Realisasi: {{ dashboardData.total_realisasi || 0 }} Paket</div>
          </div>
          <div class="border-t-4 border-t-green-500 bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border-x border-b border-[color:hsl(var(--maz-border))] shadow-sm">
            <h3 class="text-xs font-bold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-2">Total Realisasi PDN</h3>
            <div class="text-xl font-black text-[color:hsl(var(--maz-foreground))] mb-1 break-words">{{ formatCurrency(dashboardData.total_nilai_realisasi_pdn) }}</div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-muted))]">Rencana: {{ formatCurrency(dashboardData.total_pdn) }} ({{ dashboardData.pdn || 0 }} Paket)</div>
          </div>
          <div class="border-t-4 border-t-amber-500 bg-[color:hsl(var(--maz-background))] p-5 rounded-xl border-x border-b border-[color:hsl(var(--maz-border))] shadow-sm">
            <h3 class="text-xs font-bold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-2">Total Realisasi UMKK</h3>
            <div class="text-xl font-black text-[color:hsl(var(--maz-foreground))] mb-1 break-words">{{ formatCurrency(dashboardData.total_nilai_realisasi_umkk) }}</div>
            <div class="text-xs font-medium text-[color:hsl(var(--maz-muted))]">Rencana: {{ formatCurrency(dashboardData.total_umkk) }} ({{ dashboardData.umkk || 0 }} Paket)</div>
          </div>
        </div>

        <h3 class="text-lg font-bold mb-4 mt-8">Grafik Perencanaan Pengadaan</h3>
        <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] p-6 rounded-xl shadow-sm mb-8">
          <DashboardPerencanaan :dashboardData="dashboardData" />
        </div>

        <h3 class="text-lg font-bold mb-4 mt-8">Grafik Realisasi Pengadaan</h3>
        <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] p-6 rounded-xl shadow-sm">
          <DashboardRealisasi :dashboardData="dashboardData" />
        </div>
      </div>

      <!-- Realisasi Pengadaan -->
      <div class="mb-12">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2 border-b border-[color:hsl(var(--maz-border))] pb-2 mt-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Data dan Analisa Realisasi Pengadaan 
        </h2>
        
        <div class="flex gap-4 mb-6 pb-2 border-b border-[color:hsl(var(--maz-border))]">
          <button 
            @click="activeRealisasiTab = 'table'" 
            class="pb-2 px-4 font-medium transition-colors duration-200 border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
            :class="activeRealisasiTab === 'table' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
          >
            Data Tabel Realisasi
          </button>
          <button 
            @click="activeRealisasiTab = 'analytics'" 
            class="pb-2 px-4 font-medium transition-colors duration-200 border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
            :class="activeRealisasiTab === 'analytics' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
          >
            Analytics Realisasi
          </button>
        </div>
        
        <div v-show="activeRealisasiTab === 'table'">
          <RealisasiPublicTable :selectedYear="selectedYear" />
        </div>
        
        <div v-show="activeRealisasiTab === 'analytics'">
          <RealisasiPublicAnalytics :selectedYear="selectedYear" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import DashboardRealisasi from '~/components/dashboard/DashboardRealisasi.vue';
import DashboardPerencanaan from '~/components/dashboard/DashboardPerencanaan.vue';
import RealisasiPublicTable from '~/components/summary-table/realisasi-publik/RealisasiPublicTable.vue';
import RealisasiPublicAnalytics from '~/components/summary-table/realisasi-publik/RealisasiPublicAnalytics.vue';

definePageMeta({
  layout: 'blank'
});

const theme = ref('light');
const toggleTheme = () => {
  if (process.client) {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark', 'maz-is-dark');
      document.documentElement.classList.remove('maz-is-light');
    } else {
      document.documentElement.classList.remove('dark', 'maz-is-dark');
      document.documentElement.classList.add('maz-is-light');
    }
  }
};

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear.toString());
const activeRealisasiTab = ref('analytics');

const dashboardLoading = ref(true);
const dashboardError = ref(false);
const dashboardData = ref({});

const loadDashboardData = async () => {
  dashboardLoading.value = true;
  dashboardError.value = false;
  try {
    const res = await $fetch('/api/dashboard', {
      params: {
        tahun: selectedYear.value,
        jenis: '1',
        instansi: 'K22',
        view: 'Nilai'
      }
    });
    if (res.data && res.data.data) {
      dashboardData.value = res.data.data;
    } else {
      dashboardData.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    dashboardError.value = true;
  } finally {
    dashboardLoading.value = false;
  }
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

onMounted(() => {
  if (process.client) {
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  loadDashboardData();
});
</script>

<style scoped>
.theme-toggle-btn {
  background: hsl(var(--maz-foreground) / 5%);
  border: 1px solid hsl(var(--maz-border));
  padding: 0.6rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: hsl(var(--maz-foreground));
}

.theme-toggle-btn:hover {
  background-color: hsl(var(--maz-foreground) / 10%);
  transform: rotate(15deg) scale(1.05);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* DashboardRealisasi Chart Styles - Must be global to affect child component */
.chart-card {
  background-color: hsl(var(--maz-background));
  border-radius: var(--maz-border-radius, 0.75rem);
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid hsl(var(--maz-border));
}

.chart-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: hsl(var(--maz-foreground));
}

.chart-wrapper {
  height: 350px;
  position: relative;
  width: 100%;
}

.doughnut-wrapper {
  height: 300px;
  display: flex;
  justify-content: center;
  position: relative;
}

.pie-wrapper {
  height: 300px;
  display: flex;
  justify-content: center;
  position: relative;
}

.gauge-wrapper {
  position: relative;
}

.gauge-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
}

.gauge-percent {
  font-size: 2.25rem;
  font-weight: 800;
  color: hsl(var(--maz-foreground));
  line-height: 1.2;
}

.gauge-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--maz-muted));
}

/* Custom Progress Bar */
.custom-progress-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.progress-label {
  font-weight: 600;
  color: hsl(var(--maz-muted));
  width: 100px;
  text-align: right;
  line-height: 1.2;
  white-space: pre-line;
}

.progress-container {
  flex: 1;
}

.progress-track {
  display: flex;
  height: 40px;
  background-color: hsl(220 13% 91%);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  background-color: hsl(164 76% 46%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  transition: width 0.5s ease;
  min-width: 0;
}

.progress-remainder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.text-dark {
  color: hsl(var(--maz-foreground));
  opacity: 0.8;
}

.progress-ticks {
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: hsl(var(--maz-muted));
  padding: 0 2px;
}

.progress-footer {
  font-size: 0.9rem;
  color: hsl(var(--maz-muted));
  font-weight: 500;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .custom-progress-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .progress-container {
    width: 100%;
  }
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid hsl(var(--maz-border));
}

.data-table th {
  font-weight: 600;
  color: hsl(var(--maz-muted));
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: hsl(var(--maz-foreground) / 5%);
}

.data-table tfoot td {
  background-color: hsl(var(--maz-background));
  border-top: 2px solid hsl(var(--maz-border));
}
</style>
