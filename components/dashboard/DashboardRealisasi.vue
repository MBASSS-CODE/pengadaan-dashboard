<template>
  <div class="tab-content">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div class="chart-card lg:col-span-1">
            <h3 class="chart-title">% Realisasi Pengadaan</h3>
            <div class="chart-wrapper doughnut-wrapper gauge-wrapper">
              <Doughnut :data="persentaseRealisasiData.chartData" :options="gaugeOptions" />
              <div class="gauge-text">
                <span class="gauge-percent">{{ persentaseRealisasiData.percent }}%</span>
                <span class="gauge-label">% Realisasi</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:col-span-2">
            <div class="chart-card" v-for="(metric, index) in progressMetrics" :key="index">
              <h3 class="chart-title">{{ metric.title }}</h3>
              <div class="custom-progress-wrapper">
                <div class="progress-label">{{ metric.label }}</div>
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
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              <div class="progress-footer" v-html="metric.footerText"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div class="chart-card lg:col-span-2">
            <h3 class="chart-title">Pagu Per Jenis Proses</h3>
            <div class="chart-wrapper doughnut-wrapper">
              <Doughnut :data="realisasiPaguDoughnutData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="chart-card lg:col-span-3">
            <h3 class="chart-title">Ringkasan Per Jenis Proses</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>JENIS PROSES</th>
                    <th class="text-right">JUMLAH PAKET</th>
                    <th class="text-right">% PAGU</th>
                    <th class="text-right">TOTAL PAGU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in realisasiRingkasanData" :key="index">
                    <td>{{ item.label }}</td>
                    <td class="text-right">{{ item.count }}</td>
                    <td class="text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                    <td class="text-right">{{ formatCurrency(item.pagu) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-bold">
                    <td>Total</td>
                    <td class="text-right">{{ realisasiRingkasanData.reduce((acc, curr) => acc + curr.count, 0) }}</td>
                    <td class="text-right">100%</td>
                    <td class="text-right">{{ formatCurrency(realisasiRingkasanData.reduce((acc, curr) => acc + curr.pagu, 0)) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div class="chart-card lg:col-span-2">
            <h3 class="chart-title">Proporsi Jumlah Paket Pelaksanaan</h3>
            <div class="chart-wrapper doughnut-wrapper">
              <Doughnut :data="realisasiMetodeDoughnutData" :options="doughnutOptions" />
            </div>
          </div>
          <div class="chart-card lg:col-span-3">
            <h3 class="chart-title">Ringkasan Realisasi Metode Pelaksanaan</h3>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>METODE PELAKSANAAN</th>
                    <th class="text-right">JUMLAH PAKET</th>
                    <th class="text-right">% PAGU</th>
                    <th class="text-right">TOTAL PAGU</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in realisasiMetodeTableData" :key="index">
                    <td>{{ item.label }}</td>
                    <td class="text-right">{{ item.count }}</td>
                    <td class="text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                    <td class="text-right">{{ formatCurrency(item.pagu) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-bold">
                    <td>Total</td>
                    <td class="text-right">{{ realisasiMetodeTableData.reduce((acc, curr) => acc + curr.count, 0) }}</td>
                    <td class="text-right">100%</td>
                    <td class="text-right">{{ formatCurrency(realisasiMetodeTableData.reduce((acc, curr) => acc + curr.pagu, 0)) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div class="chart-card lg:col-span-2">
            <h3 class="chart-title">Realisasi Jenis Pengadaan (Penyedia)</h3>
            <div class="chart-wrapper pie-wrapper">
              <Pie :data="realisasiJenisPengadaanChartData" :options="pieOptions" />
            </div>
          </div>
          <div class="chart-card lg:col-span-3">
            <h3 class="chart-title">Ringkasan Realisasi Jenis Pengadaan</h3>
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
                  <tr v-for="(item, index) in realisasiJenisPengadaanTableData" :key="index">
                    <td>{{ item.label }}</td>
                    <td class="text-right">{{ item.count }}</td>
                    <td class="text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                    <td class="text-right">{{ formatCurrency(item.pagu) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="font-bold">
                    <td>Total</td>
                    <td class="text-right">{{ realisasiJenisPengadaanTableData.reduce((acc, curr) => acc + curr.count, 0) }}</td>
                    <td class="text-right">100%</td>
                    <td class="text-right">{{ formatCurrency(realisasiJenisPengadaanTableData.reduce((acc, curr) => acc + curr.pagu, 0)) }}</td>
                  </tr>
                </tfoot>
              </table>
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


// --- Realisasi Charts & Data ---
const persentaseRealisasiData = computed(() => {
  const d = dashboardData.value;
  const realisasi = d.total_nilai_realisasi || 0;
  const perencanaan = d.total_nilai_perencanaan || 0;
  let percent = 0;
  if (perencanaan > 0) {
    percent = (realisasi / perencanaan) * 100;
  }
  
  return {
    percent: percent.toFixed(2),
    chartData: {
      labels: ['Realisasi', 'Sisa'],
      datasets: [
        {
          data: [percent, 100 - percent],
          backgroundColor: ['hsl(164 76% 46%)', 'hsl(220 13% 91%)'],
          borderWidth: 0,
          cutout: '80%'
        }
      ]
    }
  };
});

const progressMetrics = computed(() => {
  const d = dashboardData.value;
  
  const createMetric = (title, label, realisasi, perencanaan, footerFormat) => {
    let percent = 0;
    if (perencanaan > 0) percent = (realisasi / perencanaan) * 100;
    
    const fRealisasi = formatCurrency(realisasi);
    const fPerencanaan = formatCurrency(perencanaan);
    
    let footerText = '';
    if (footerFormat === 'realisasi_first') {
       footerText = `Perencanaan: ${fPerencanaan} <br/> Realisasi: <span class="text-emerald-600">${fRealisasi}</span>`;
    } else if (footerFormat === 'umkk') {
       footerText = `Total Nilai Perencanaan UMKK: ${fPerencanaan}<br/>Total Nilai Realisasi UMKK: <span class="text-emerald-600">${fRealisasi}</span>`;
    } else if (footerFormat === 'pdn') {
       footerText = `Total Nilai Perencanaan PDN: ${fPerencanaan}<br/>Total Nilai Realisasi PDN: <span class="text-emerald-600">${fRealisasi}</span>`;
    }

    return { title, label, realisasi, perencanaan, percent, footerText };
  };

  return [
    createMetric('Realisasi Penyedia', 'Realisasi', d.pelaksanaan_total_penyedia || 0, d.perencanaan_total_penyedia || 0, 'realisasi_first'),
    createMetric('Realisasi Swakelola', 'Realisasi', d.pelaksanaan_total_swakelola || 0, d.perencanaan_total_swakelola || 0, 'realisasi_first'),
    createMetric('% Capaian Realisasi UMKK terhadap Rencana UMKK', 'Total Nilai\nRealisasi\nUMKK', d.total_nilai_realisasi_umkk || 0, d.total_umkk || 0, 'umkk'),
    createMetric('% Capaian Realisasi PDN terhadap Rencana PDN', 'Total Nilai\nRealisasi\nPDN', d.total_nilai_realisasi_pdn || 0, d.total_pdn || 0, 'pdn')
  ];
});

const realisasiMetodeTableData = computed(() => {
  const d = dashboardData.value;
  const data = [
    { label: 'E-Purchasing', count: d.pelaksanaan_epurchasing || 0, pagu: d.pelaksanaan_total_epurchasing || 0 },
    { label: 'Jasa Konsultasi', count: d.pelaksanaan_jasa_konsultasi || 0, pagu: d.pelaksanaan_total_jasa_konsultasi || 0 },
    { label: 'Jasa Lainnya', count: d.pelaksanaan_jasa_lainnya || 0, pagu: d.pelaksanaan_total_jasa_lainnya || 0 },
    { label: 'Langsung', count: d.pelaksanaan_langsung || 0, pagu: d.pelaksanaan_total_langsung || 0 },
    { label: 'Seleksi', count: d.pelaksanaan_seleksi || 0, pagu: d.pelaksanaan_total_seleksi || 0 }
  ];
  
  // Sort descending by pagu
  data.sort((a, b) => b.pagu - a.pagu);
  
  const totalPagu = data.reduce((acc, curr) => acc + curr.pagu, 0);
  return data.map(item => ({
    ...item,
    persentase: totalPagu > 0 ? ((item.pagu / totalPagu) * 100).toFixed(2) + '%' : '0.00%'
  }));
});

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

const realisasiRingkasanData = computed(() => {
  const d = dashboardData.value;
  
  const tenderCount = (d.pelaksanaan_tender || 0) + (d.pelaksanaan_tender_cepat || 0);
  const tenderPagu = (d.pelaksanaan_total_tender || 0) + (d.pelaksanaan_total_tender_cepat || 0);
  
  const nonTenderCount = (d.pelaksanaan_langsung || 0) + (d.pelaksanaan_seleksi || 0) + (d.pelaksanaan_penunjukan || 0);
  const nonTenderPagu = (d.pelaksanaan_total_langsung || 0) + (d.pelaksanaan_total_seleksi || 0) + (d.pelaksanaan_total_penunjukan || 0);
  
  const pencatatanNonTenderCount = d.pelaksanaan_dikecualikan || 0;
  const pencatatanNonTenderPagu = d.pelaksanaan_total_dikecualikan || 0;
  
  const swakelolaCount = d.pelaksanaan_swakelola || 0;
  const swakelolaPagu = d.pelaksanaan_total_swakelola || 0;
  
  const epurchasingCount = d.pelaksanaan_epurchasing || 0;
  const epurchasingPagu = d.pelaksanaan_total_epurchasing || 0;
  
  const data = [
    { label: 'Tender', count: tenderCount, pagu: tenderPagu },
    { label: 'Non-Tender', count: nonTenderCount, pagu: nonTenderPagu },
    { label: 'Pencatatan Non-Tender', count: pencatatanNonTenderCount, pagu: pencatatanNonTenderPagu },
    { label: 'Pencatatan Swakelola', count: swakelolaCount, pagu: swakelolaPagu },
    { label: 'E-Katalog/E-Purchasing', count: epurchasingCount, pagu: epurchasingPagu }
  ];
  
  // Sort descending by pagu
  data.sort((a, b) => b.pagu - a.pagu);
  
  const totalPagu = data.reduce((acc, curr) => acc + curr.pagu, 0);
  return data.map(item => ({
    ...item,
    persentase: totalPagu > 0 ? ((item.pagu / totalPagu) * 100).toFixed(2) + '%' : '0.00%'
  }));
});

const realisasiPaguDoughnutData = computed(() => {
  const tableData = realisasiRingkasanData.value;
  return {
    labels: tableData.map(item => item.label),
    datasets: [
      {
        backgroundColor: [
          'hsl(210 100% 56%)',
          'hsl(40 97% 59%)',
          'hsl(164 76% 46%)',
          'hsl(356.95 95.91% 57.73%)',
          'hsl(272 99% 54%)'
        ],
        data: tableData.map(item => item.pagu)
      }
    ]
  };
});

const realisasiJenisPengadaanTableData = computed(() => {
  const d = dashboardData.value;
  const data = [
    { label: 'Jasa Konsultansi', count: d.pelaksanaan_jasa_konsultasi || 0, pagu: d.pelaksanaan_total_jasa_konsultasi || 0 },
    { label: 'Jasa Lainnya', count: d.pelaksanaan_jasa_lainnya || 0, pagu: d.pelaksanaan_total_jasa_lainnya || 0 },
    { label: 'Pekerjaan Konstruksi', count: d.pelaksanaan_pekerjaan_konstruksi || 0, pagu: d.pelaksanaan_total_pekerjaan_konstruksi || 0 },
    { label: 'Pengadaan Barang', count: d.pelaksanaan_barang || 0, pagu: d.pelaksanaan_total_barang || 0 }
  ];
  
  // Sort descending by pagu
  data.sort((a, b) => b.pagu - a.pagu);
  
  const totalPagu = data.reduce((acc, curr) => acc + curr.pagu, 0);
  return data.map(item => ({
    ...item,
    persentase: totalPagu > 0 ? ((item.pagu / totalPagu) * 100).toFixed(2) + '%' : '0.00%'
  }));
});

const realisasiJenisPengadaanChartData = computed(() => {
  const d = dashboardData.value;
  return {
    labels: ['Jasa Konsultansi', 'Jasa Lainnya', 'Pekerjaan Konstruksi', 'Pengadaan Barang'],
    datasets: [
      {
        backgroundColor: [
          '#FF8A65',
          '#9575CD',
          '#4DD0E1',
          '#B0BEC5'
        ],
        data: [
          d.pelaksanaan_total_jasa_konsultasi || 0,
          d.pelaksanaan_total_jasa_lainnya || 0,
          d.pelaksanaan_total_pekerjaan_konstruksi || 0,
          d.pelaksanaan_total_barang || 0
        ]
      }
    ]
  };
});

</script>
