<template>
  <div class="tab-content">
        <div class="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
          <div class="chart-card lg:col-span-2">
            <h3 class="chart-title">% Pengisian RUP</h3>
            <div class="chart-wrapper doughnut-wrapper gauge-wrapper">
              <Doughnut :data="persentasePengisianRUPData.chartData" :options="gaugeOptions" />
              <div class="gauge-text">
                <span class="gauge-percent">{{ persentasePengisianRUPData.percent }}%</span>
                <span class="gauge-label text-muted" style="font-size: 0.75rem; margin-top: 0.25rem;">Total RUP<br/>100.0%</span>
              </div>
            </div>
          </div>

          <div class="chart-card flex flex-col justify-between lg:col-span-5">
            <div v-for="(metric, index) in perencanaanProgressMetrics" :key="index" :class="{'mb-4': index < perencanaanProgressMetrics.length - 1}">
              <div class="flex justify-between items-end mb-2" :class="{'mt-4': index > 0}">
                <h3 class="chart-title !mb-0 text-sm">{{ metric.title }}</h3>
              </div>
              <div class="custom-progress-wrapper !mb-1">
                <div class="progress-label w-[80px]">{{ metric.labelLeft }}</div>
                <div class="progress-container">
                  <div class="progress-track">
                    <div 
                      class="progress-fill" 
                      :style="{ width: Math.min(metric.percent, 100) + '%' }"
                    >
                      <span class="progress-text" v-if="metric.percent >= 10">
                        {{ metric.percent.toFixed(2) }}%
                      </span>
                    </div>
                    <div class="progress-remainder">
                      <span class="progress-text text-dark" v-if="(100 - metric.percent) >= 10">
                        {{ (100 - metric.percent).toFixed(2) }}%
                      </span>
                    </div>
                  </div>
                  <div class="progress-ticks">
                    <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>
              </div>
              <div class="progress-footer" style="margin-top: 0; font-size: 0.75rem;" v-html="metric.footerText"></div>
              <hr v-if="index < perencanaanProgressMetrics.length - 1" style="border: 0; border-top: 1px dashed hsl(var(--maz-border)); margin-top: 1rem; margin-bottom: 0;" />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div class="chart-card lg:col-span-2">
            <h3 class="chart-title">Metode Pemilihan (Penyedia)</h3>
            <div class="chart-wrapper pie-wrapper">
              <Pie :data="perencanaanMetodePieData" :options="pieOptions" />
            </div>
          </div>
          <div class="chart-card lg:col-span-3">
            <h3 class="chart-title">Ringkasan Metode Pemilihan (Penyedia)</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>METODE PEMILIHAN</th>
                    <th class="text-right">JUMLAH PAKET</th>
                    <th class="text-right">% PAGU</th>
                    <th class="text-right">TOTAL PAGU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in perencanaanMetodeTableData" :key="index">
                    <td>{{ item.label }}</td>
                    <td class="text-right">{{ item.count }}</td>
                    <td class="text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                    <td class="text-right">{{ formatCurrency(item.pagu) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-bold">
                    <td>Total</td>
                    <td class="text-right">{{ perencanaanMetodeTableData.reduce((acc, curr) => acc + curr.count, 0) }}</td>
                    <td class="text-right">100%</td>
                    <td class="text-right">{{ formatCurrency(perencanaanMetodeTableData.reduce((acc, curr) => acc + curr.pagu, 0)) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div class="chart-card lg:col-span-2">
            <h3 class="chart-title">Jenis Pengadaan (Penyedia)</h3>
            <div class="chart-wrapper pie-wrapper">
              <Pie :data="perencanaanJenisPieData" :options="pieOptions" />
            </div>
          </div>
          <div class="chart-card lg:col-span-3">
            <h3 class="chart-title">Ringkasan Jenis Pengadaan (Penyedia)</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>JENIS PENGADAAN</th>
                    <th class="text-right">JUMLAH PAKET</th>
                    <th class="text-right">% PAGU</th>
                    <th class="text-right">TOTAL PAGU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in perencanaanJenisTableData" :key="index">
                    <td>{{ item.label }}</td>
                    <td class="text-right">{{ item.count }}</td>
                    <td class="text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                    <td class="text-right">{{ formatCurrency(item.pagu) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-bold">
                    <td>Total</td>
                    <td class="text-right">{{ perencanaanJenisTableData.reduce((acc, curr) => acc + curr.count, 0) }}</td>
                    <td class="text-right">100%</td>
                    <td class="text-right">{{ formatCurrency(perencanaanJenisTableData.reduce((acc, curr) => acc + curr.pagu, 0)) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="chart-card">
            <h3 class="chart-title">Proporsi Jumlah Paket PDN vs Impor</h3>
            <div class="chart-wrapper doughnut-wrapper">
              <Doughnut :data="perencanaanPDNDoughnutData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="chart-card">
            <h3 class="chart-title">Proporsi Jumlah Paket UMKK vs Non-UMKK</h3>
            <div class="chart-wrapper doughnut-wrapper">
              <Doughnut :data="perencanaanUMKKDoughnutData" :options="doughnutOptions" />
            </div>
          </div>
        </div>
      </div>
  
</template>

<script setup>
import { computed } from 'vue';
import { Bar, Doughnut, Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const formatCurrency = (value) => {
  if (value === undefined || value === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};


const props = defineProps({
  dashboardData: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
const dashboardData = computed(() => props.dashboardData);


// --- Chart Options ---
const chartOptionsWithLegend = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
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

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(context.parsed);
          }
          return label;
        }
      }
    }
  }
};

const gaugeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  }
};


// --- Perencanaan Charts ---
const persentasePengisianRUPData = computed(() => {
  const d = dashboardData.value;
  const belanja = d.belanja_barang_jasa || 0;
  const perencanaan = d.total_nilai_perencanaan || 0;
  
  let percent = 0;
  if (belanja > 0) percent = (perencanaan / belanja) * 100;
  
  const formattedPercent = percent.toFixed(2);
  const chartFill = Math.min(percent, 100);
  const chartEmpty = Math.max(100 - percent, 0);

  return {
    percent: formattedPercent,
    chartData: {
      labels: ['Pengisian', 'Sisa'],
      datasets: [{
        data: [chartFill, chartEmpty],
        backgroundColor: ['#4DD0E1', '#E0E0E0'],
        borderWidth: 0,
        cutout: '75%'
      }]
    }
  };
});

const perencanaanProgressMetrics = computed(() => {
  const d = dashboardData.value;
  const createComparison = (title, labelLeft, labelRight, valLeft, valRight) => {
    const total = valLeft + valRight;
    let percentLeft = 0;
    if (total > 0) percentLeft = (valLeft / total) * 100;
    return {
      title,
      labelLeft,
      labelRight,
      percent: percentLeft,
      footerText: `${labelLeft}: ${formatCurrency(valLeft)}<br/>${labelRight}: ${formatCurrency(valRight)}`
    };
  };

  return [
    createComparison('Penyedia/Swakelola', 'Penyedia', 'Swakelola', d.perencanaan_total_penyedia || 0, d.perencanaan_total_swakelola || 0),
    createComparison('PDN/Impor', 'PDN', 'Impor', d.total_pdn || 0, d.total_non_pdn || 0),
    createComparison('UMKK/Non UMKK', 'UMKK', 'Non UMKK', d.total_umkk || 0, d.total_non_umkk || 0)
  ];
});

const perencanaanMetodeTableData = computed(() => {
  const d = dashboardData.value;
  const data = [
    { label: 'Dikecualikan', count: d.perencanaan_dikecualikan || 0, pagu: d.perencanaan_total_dikecualikan || 0 },
    { label: 'E-Purchasing', count: d.perencanaan_epurchasing || 0, pagu: d.perencanaan_total_epurchasing || 0 },
    { label: 'Lainnya', count: d.perencanaan_lainnya || 0, pagu: d.perencanaan_total_lainnya || 0 },
    { label: 'Pengadaan Langsung', count: d.perencanaan_langsung || 0, pagu: d.perencanaan_total_langsung || 0 },
    { label: 'Penunjukan Langsung', count: d.perencanaan_penunjukan || 0, pagu: d.perencanaan_total_penunjukan || 0 },
    { label: 'Tender/Tender Cepat/Seleksi', count: (d.perencanaan_tender || 0) + (d.perencanaan_tender_cepat || 0) + (d.perencanaan_seleksi || 0), pagu: (d.perencanaan_total_tender || 0) + (d.perencanaan_total_tender_cepat || 0) + (d.perencanaan_total_seleksi || 0) }
  ];
  
  data.sort((a, b) => b.pagu - a.pagu);
  
  const totalPagu = data.reduce((acc, curr) => acc + curr.pagu, 0);
  return data.map(item => ({
    ...item,
    persentase: totalPagu > 0 ? ((item.pagu / totalPagu) * 100).toFixed(2) + '%' : '0.00%'
  }));
});

const perencanaanMetodePieData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['Dikecualikan', 'E-Purchasing', 'Lainnya', 'Pengadaan Langsung', 'Penunjukan Langsung', 'Tender/Tender Cepat/Seleksi'],
    datasets: [{
      backgroundColor: ['#4DD0E1', '#B0BEC5', '#BA68C8', '#FF8A65', '#9575CD', '#4FC3F7'],
      data: [
        d.perencanaan_total_dikecualikan || 0,
        d.perencanaan_total_epurchasing || 0,
        d.perencanaan_total_lainnya || 0,
        d.perencanaan_total_langsung || 0,
        d.perencanaan_total_penunjukan || 0,
        (d.perencanaan_total_tender || 0) + (d.perencanaan_total_tender_cepat || 0) + (d.perencanaan_total_seleksi || 0)
      ]
    }]
  };
});

const perencanaanJenisTableData = computed(() => {
  const d = dashboardData.value;
  const data = [
    { label: 'Jasa Konsultansi', count: d.perencanaan_jasa_konsultasi || 0, pagu: d.perencanaan_total_jasa_konsultasi || 0 },
    { label: 'Jasa Lainnya', count: d.perencanaan_jasa_lainnya || 0, pagu: d.perencanaan_total_jasa_lainnya || 0 },
    { label: 'Pekerjaan Konstruksi', count: d.perencanaan_pekerjaan_konstruksi || 0, pagu: d.perencanaan_total_pekerjaan_konstruksi || 0 },
    { label: 'Pengadaan Barang', count: d.perencanaan_barang || 0, pagu: d.perencanaan_total_barang || 0 },
    { label: 'Terintegrasi', count: d.perencanaan_terintegrasi || 0, pagu: d.perencanaan_total_terintegrasi || 0 }
  ];
  
  data.sort((a, b) => b.pagu - a.pagu);
  
  const totalPagu = data.reduce((acc, curr) => acc + curr.pagu, 0);
  return data.map(item => ({
    ...item,
    persentase: totalPagu > 0 ? ((item.pagu / totalPagu) * 100).toFixed(2) + '%' : '0.00%'
  }));
});

const perencanaanJenisPieData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['Jasa Konsultansi', 'Jasa Lainnya', 'Pekerjaan Konstruksi', 'Pengadaan Barang', 'Terintegrasi'],
    datasets: [{
      backgroundColor: ['#B0BEC5', '#4DD0E1', '#FF8A65', '#4FC3F7', '#BA68C8'],
      data: [
        d.perencanaan_total_jasa_konsultasi || 0,
        d.perencanaan_total_jasa_lainnya || 0,
        d.perencanaan_total_pekerjaan_konstruksi || 0,
        d.perencanaan_total_barang || 0,
        d.perencanaan_total_terintegrasi || 0
      ]
    }]
  };
});

const perencanaanPDNDoughnutData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['PDN', 'Non-PDN (Impor)'],
    datasets: [{
      backgroundColor: ['#4DD0E1', '#B0BEC5'],
      data: [d.pdn || 0, d.non_pdn || 0]
    }]
  };
});

const perencanaanUMKKDoughnutData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['UMKK', 'Non-UMKK'],
    datasets: [{
      backgroundColor: ['#BA68C8', '#B0BEC5'],
      data: [d.umkk || 0, d.non_umkk || 0]
    }]
  };
});

</script>
