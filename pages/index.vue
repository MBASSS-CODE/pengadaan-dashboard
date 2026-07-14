<template>
  <div class="dashboard-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard Profil Pengadaan</h1>
        <p class="page-subtitle">Ringkasan Realisasi dan Perencanaan Pengadaan (Tahun 2026)</p>
      </div>
      <div class="header-actions">
        <!-- Optional filter inputs can be added here -->
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
      <div class="summary-cards">
        <div class="card bg-primary-light">
          <h3>Total Nilai Perencanaan</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_perencanaan) }}</div>
          <div class="label">Total RUP: {{ dashboardData.total_rup }}</div>
        </div>
        <div class="card bg-secondary-light">
          <h3>Total Nilai Realisasi</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_realisasi) }}</div>
          <div class="label">Total Realisasi: {{ dashboardData.total_realisasi }}</div>
        </div>
        <div class="card bg-success-light">
          <h3>Total Realisasi PDN</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_realisasi_pdn) }}</div>
          <div class="label">Paket PDN: {{ dashboardData.total_pdn }}</div>
        </div>
        <div class="card bg-warning-light">
          <h3>Total Realisasi UMKK</h3>
          <div class="value">{{ formatCurrency(dashboardData.total_nilai_realisasi_umkk) }}</div>
          <div class="label">Paket UMKK: {{ dashboardData.total_umkk }}</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
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

      <!-- Tab Content: Realisasi -->
      <div v-if="activeTab === 'realisasi'" class="tab-content">
        <div class="charts-grid">
          <div class="chart-card">
            <h3 class="chart-title">Nilai Realisasi Berdasarkan Metode Pelaksanaan</h3>
            <div class="chart-wrapper">
              <Bar :data="realisasiMetodeChartData" :options="chartOptions" />
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">Proporsi Metode Pelaksanaan</h3>
            <div class="chart-wrapper doughnut-wrapper">
              <Doughnut :data="realisasiMetodeDoughnutData" :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Perencanaan -->
      <div v-if="activeTab === 'perencanaan'" class="tab-content">
        <div class="charts-grid">
          <div class="chart-card">
            <h3 class="chart-title">Nilai Perencanaan Berdasarkan Jenis</h3>
            <div class="chart-wrapper">
              <Bar :data="perencanaanJenisChartData" :options="chartOptions" />
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">Proporsi Metode Perencanaan</h3>
            <div class="chart-wrapper doughnut-wrapper">
              <Doughnut :data="perencanaanDoughnutData" :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const loading = ref(true);
const error = ref(false);
const dashboardData = ref({});
const activeTab = ref('realisasi');

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/dashboard', {
      params: {
        tahun: '2026',
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

// --- Realisasi Charts ---
const realisasiMetodeChartData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['E-Purchasing', 'Jasa Konsultasi', 'Jasa Lainnya', 'Langsung', 'Seleksi'],
    datasets: [
      {
        label: 'Total Nilai (Rp)',
        backgroundColor: 'hsl(210 100% 56%)',
        data: [
          d.pelaksanaan_total_epurchasing || 0,
          d.pelaksanaan_total_jasa_konsultasi || 0,
          d.pelaksanaan_total_jasa_lainnya || 0,
          d.pelaksanaan_total_langsung || 0,
          d.pelaksanaan_total_seleksi || 0
        ]
      }
    ]
  };
});

const realisasiMetodeDoughnutData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['E-Purchasing', 'Jasa Konsultasi', 'Jasa Lainnya', 'Langsung', 'Seleksi'],
    datasets: [
      {
        backgroundColor: [
          'hsl(210 100% 56%)',
          'hsl(272 99% 54%)',
          'hsl(164 76% 46%)',
          'hsl(40 97% 59%)',
          'hsl(356.95 95.91% 57.73%)'
        ],
        data: [
          d.pelaksanaan_epurchasing || 0,
          d.pelaksanaan_jasa_konsultasi || 0,
          d.pelaksanaan_jasa_lainnya || 0,
          d.pelaksanaan_langsung || 0,
          d.pelaksanaan_seleksi || 0
        ]
      }
    ]
  };
});

// --- Perencanaan Charts ---
const perencanaanJenisChartData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['Barang', 'Jasa Konsultasi', 'Jasa Lainnya', 'Konstruksi', 'Penyedia'],
    datasets: [
      {
        label: 'Total Nilai (Rp)',
        backgroundColor: 'hsl(272 99% 54%)',
        data: [
          d.perencanaan_total_barang || 0,
          d.perencanaan_total_jasa_konsultasi || 0,
          d.perencanaan_total_jasa_lainnya || 0,
          d.perencanaan_total_pekerjaan_konstruksi || 0,
          d.perencanaan_total_penyedia || 0
        ]
      }
    ]
  };
});

const perencanaanDoughnutData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['Barang', 'Jasa Konsultasi', 'Jasa Lainnya', 'Langsung', 'Swakelola'],
    datasets: [
      {
        backgroundColor: [
          'hsl(210 100% 56%)',
          'hsl(272 99% 54%)',
          'hsl(164 76% 46%)',
          'hsl(40 97% 59%)',
          'hsl(80 75% 47%)'
        ],
        data: [
          d.perencanaan_barang || 0,
          d.perencanaan_jasa_konsultasi || 0,
          d.perencanaan_jasa_lainnya || 0,
          d.perencanaan_langsung || 0,
          d.perencanaan_swakelola || 0
        ]
      }
    ]
  };
});

// --- Chart Options ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--maz-foreground));
  margin-bottom: 0.5rem;
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

.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid hsl(var(--maz-border));
  padding-bottom: 0.5rem;
}

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

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
