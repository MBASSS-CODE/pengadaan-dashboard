<template>
  <div class="dashboard-container">
    <div class="page-header flex justify-between items-center mb-8">
      <div>
        <h1 class="page-title">Dashboard Pengadaan</h1>
        <p class="page-subtitle">Ringkasan Realisasi dan Perencanaan Pengadaan (Tahun {{ selectedYear }})</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedYear" class="form-select" @change="loadData">
          <option :value="currentYear">{{ currentYear }}</option>
          <option :value="currentYear - 1">{{ currentYear - 1 }}</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <MazSpinner color="primary" size="3rem" />
      <p>Memuat data profil pengadaan...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="text-danger">Gagal memuat data. Silakan coba lagi.</p>
    </div>

    <!-- Data Loaded -->
    <div v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
        <div class="card bg-info-light">
          <h3>Total Belanja Pengadaan</h3>
          <div class="value">{{ formatCurrency(dashboardData.belanja_barang_jasa) }}</div>
          <div class="label">Total Pengadaan (Barang & Jasa)</div>
        </div>
        <div class="card bg-primary-light">
          <h3>Total Nilai Perencanaan</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_perencanaan) }}</div>
          <div class="label">Total RUP: {{ dashboardData.total_rup || 0 }} Paket</div>
        </div>
        <div class="card bg-secondary-light">
          <h3>Total Nilai Realisasi</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_realisasi) }}</div>
          <div class="label">Total Realisasi: {{ dashboardData.total_realisasi || 0 }} Paket</div>
        </div>
        <div class="card bg-success-light">
          <h3>Total Realisasi PDN</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_realisasi_pdn) }}</div>
          <div class="label">Rencana: {{ formatCurrency(dashboardData.total_pdn) }} ({{ dashboardData.pdn || 0 }} Paket)</div>
        </div>
        <div class="card bg-warning-light">
          <h3>Total Realisasi UMKK</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_realisasi_umkk) }}</div>
          <div class="label">Rencana: {{ formatCurrency(dashboardData.total_umkk) }} ({{ dashboardData.umkk || 0 }} Paket)</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-4 mb-6 pb-2 border-b border-[hsl(var(--maz-border))]">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'realisasi' }"
          @click="activeTab = 'realisasi'"
        >
          Realisasi Pengadaan
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'perencanaan' }"
          @click="activeTab = 'perencanaan'"
        >
          Perencanaan (RUP)
        </button>
      </div>

      <!-- Tab Content -->
      <Transition name="fade" mode="out-in">
        <DashboardRealisasi v-if="activeTab === 'realisasi'" :dashboardData="dashboardData" />
        <DashboardPerencanaan v-else-if="activeTab === 'perencanaan'" :dashboardData="dashboardData" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DashboardRealisasi from '~/components/dashboard/DashboardRealisasi.vue';
import DashboardPerencanaan from '~/components/dashboard/DashboardPerencanaan.vue';


const loading = ref(true);
const error = ref(false);
const dashboardData = ref({});
const activeTab = ref('realisasi');

const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);

const loadData = async () => {
  loading.value = true;
  error.value = false;
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
    error.value = true;
  } finally {
    loading.value = false;
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
  loadData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.form-select {
  padding: 0.5rem 1rem;
  border-radius: var(--maz-border-radius, 0.5rem);
  border: 1px solid hsl(var(--maz-border));
  background-color: hsl(var(--maz-background));
  color: hsl(var(--maz-foreground));
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  min-width: 120px;
}

.form-select:focus {
  outline: none;
  border-color: hsl(var(--maz-primary));
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--maz-foreground));
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: hsl(var(--maz-muted));
  margin: 0;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: hsl(var(--maz-muted));
}

.card {
  padding: 1.5rem;
  border-radius: var(--maz-border-radius, 0.75rem);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  border: 1px solid hsl(var(--maz-border));
}

.card h3 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: hsl(var(--maz-foreground));
  opacity: 0.8;
}

.card .value {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 700;
  color: hsl(var(--maz-foreground));
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.card .label {
  font-size: 0.85rem;
  font-weight: 600;
  color: hsl(var(--maz-muted));
}

.bg-primary-light { border-top: 4px solid hsl(var(--maz-primary)); }
.bg-secondary-light { border-top: 4px solid hsl(var(--maz-secondary)); }
.bg-success-light { border-top: 4px solid hsl(var(--maz-success)); }
.bg-warning-light { border-top: 4px solid hsl(var(--maz-warning)); }

.tab-btn {
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--maz-muted));
  padding: 0.75rem 1.5rem;
  border-radius: var(--maz-border-radius, 0.5rem);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background-color: hsl(var(--maz-foreground) / 5%);
}

.tab-btn.active {
  background-color: hsl(var(--maz-primary) / 10%);
  color: hsl(var(--maz-primary));
}

.tab-content {
  animation: fadeIn 0.3s ease;
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

.text-right {
  text-align: right !important;
}

.font-bold {
  font-weight: 700;
}

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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
</style>
