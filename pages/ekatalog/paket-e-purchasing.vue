<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Paket e-Purchasing</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Daftar paket e-Purchasing e-Katalog</p>
      </div>
      
      <div class="flex items-center gap-3 w-full md:w-auto">
        <select v-model="selectedYear" class="px-4 py-2 bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-foreground))] rounded-lg focus:outline-none focus:border-[color:hsl(var(--maz-primary))] transition-colors" @change="onFilterChange(true)">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        
        <MazBtn @click="loadData(true)" :loading="loading" color="primary">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </MazBtn>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col lg:flex-row gap-4 items-end flex-wrap">
        <div class="w-full lg:flex-1 min-w-[200px]">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari RUP, satker, order ID..." 
            size="sm"
            @update:model-value="onSearchDebounced"
          >
            <template #left-icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MazInput>
        </div>
        
        <div class="w-full lg:w-48">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Order</label>
          <MazSelect
            v-model="selectedStatus"
            :options="statusOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full lg:w-48">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pengiriman</label>
          <MazSelect
            v-model="selectedShipmentStatus"
            :options="shipmentOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>

        <div class="w-full lg:w-40">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Sumber Dana</label>
          <MazSelect
            v-model="selectedFundingSource"
            :options="fundingOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full lg:w-64">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Satuan Kerja</label>
          <MazSelect
            v-model="selectedSatker"
            :options="satkerOptions"
            size="sm"
            search
            @update:model-value="onFilterChange(false)"
          />
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData(true)" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- MazTable Data Table -->
      <div v-else class="overflow-x-auto w-full">
        <MazTable
          size="sm"
          v-model:page="currentPage"
          v-model:page-size="itemsPerPage"
          pagination
          :paginate-rows="false"
          :total-items="totalItems"
          :loading="loading"
          color="primary"
          hoverable
          background-even
          :headers="[
            { label: 'No', key: 'index', align: 'center', width: '4rem', sortable: false },
            { label: 'Informasi RUP', key: 'paket', sortable: false, classes: 'min-w-[280px]' },
            { label: 'Order ID & Satker', key: 'satker', sortable: false, classes: 'min-w-[220px]' },
            { label: 'Nilai Transaksi', key: 'nilai', align: 'right', sortable: false, classes: 'min-w-[150px]' },
            { label: 'Status Pengiriman', key: 'status', align: 'center', sortable: false, classes: 'min-w-[150px]' }
          ]"
          :rows="pageData"
          @update:page="loadData(false)"
          @update:page-size="onFilterChange(false)"
        >
          <template #cell-index="{ row }">
            <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
          </template>
          
          <template #cell-paket="{ row }">
            <div 
              class="font-bold text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer" 
              :title="row.rup_name" 
            >
              {{ row.rup_name || '-' }}
            </div>
            <div class="flex items-center gap-1.5 mt-2 flex-wrap">
              <span v-if="row.rup_code" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                RUP: {{ row.rup_code }}
              </span>
              <span v-if="row.mak" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
                MAK: {{ row.mak }}
              </span>
            </div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 truncate max-w-[280px]" :title="row.rup_desc">
              {{ row.rup_desc || '-' }}
            </div>
            <div class="flex items-center gap-3 text-[11px] text-[color:hsl(var(--maz-muted))] mt-1">
              <span v-if="row.funding_source">Sumber Dana: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ row.funding_source }}</strong></span>
            </div>
          </template>
          
          <template #cell-satker="{ row }">
            <div class="font-bold text-xs text-[color:hsl(var(--maz-foreground))]">Order ID: {{ row.order_id || '-' }}</div>
            <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">
              Order Date: {{ formatDate(row.order_date) }}
            </div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-2 truncate max-w-[220px]" :title="row.nama_satker">
              Satker: {{ row.nama_satker || '-' }}
            </div>
          </template>
          
          <template #cell-nilai="{ row }">
            <div class="flex flex-col items-end">
              <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.total) }}</div>
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">
                Total Qty: {{ row.total_qty }} | Produk: {{ row.count_product }}
              </div>
              <div v-if="row.shipping_fee > 0" class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">
                Ongkir: {{ formatRupiah(row.shipping_fee) }}
              </div>
            </div>
          </template>
          
          <template #cell-status="{ row }">
            <div class="flex flex-col items-center gap-1.5 w-full">
              <span 
                class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
                :class="{
                  'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': row.status === 'COMPLETED',
                  'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': row.status === 'ON_PROCESS',
                  'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': !['COMPLETED', 'ON_PROCESS'].includes(row.status)
                }"
              >
                {{ row.status || 'Unknown' }}
              </span>
              <div class="flex items-center gap-1 text-[10px] mt-1 text-[color:hsl(var(--maz-muted))]">
                <span>Shipment:</span>
                <span :class="{
                  'text-[color:hsl(var(--maz-success))] font-bold': row.shipment_status === 'COMPLETED',
                  'text-[color:hsl(var(--maz-foreground))] font-bold': row.shipment_status !== 'COMPLETED'
                }">{{ row.shipment_status || '-' }}</span>
              </div>
            </div>
          </template>
        </MazTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const error = ref(false);

const pageData = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const totalAllItems = ref(0);

const currentYear = new Date().getFullYear();
const availableYears = [
  currentYear.toString(), 
  (currentYear - 1).toString()
];
const selectedYear = ref(currentYear.toString());
const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedShipmentStatus = ref('ALL');
const selectedFundingSource = ref('ALL');
const selectedSatker = ref('ALL');

const statusOptions = ref([{ label: 'Semua Status', value: 'ALL' }]);
const shipmentOptions = ref([{ label: 'Semua Pengiriman', value: 'ALL' }]);
const fundingOptions = ref([{ label: 'Semua Sumber', value: 'ALL' }]);
const satkerOptions = ref([{ label: 'Semua Satker', value: 'ALL' }]);

const currentPage = ref(1);
const itemsPerPage = ref(10);

let searchTimer = null;

const formatRupiah = (number) => {
  if (!number && number !== 0) return '0';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(number);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/ekatalog/paket-e-purchasing', {
      params: { 
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterStatus: selectedStatus.value !== 'ALL' ? selectedStatus.value : undefined,
        filterShipmentStatus: selectedShipmentStatus.value !== 'ALL' ? selectedShipmentStatus.value : undefined,
        filterFundingSource: selectedFundingSource.value !== 'ALL' ? selectedFundingSource.value : undefined,
        filterSatker: selectedSatker.value !== 'ALL' ? selectedSatker.value : undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
    
    if (response.filterOptions) {
      if (response.filterOptions.status) {
        statusOptions.value = [
          { label: 'Semua Status', value: 'ALL' },
          ...response.filterOptions.status.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.shipmentStatus) {
        shipmentOptions.value = [
          { label: 'Semua Pengiriman', value: 'ALL' },
          ...response.filterOptions.shipmentStatus.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.fundingSource) {
        fundingOptions.value = [
          { label: 'Semua Sumber', value: 'ALL' },
          ...response.filterOptions.fundingSource.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.satker) {
        satkerOptions.value = [
          { label: 'Semua Satker', value: 'ALL' },
          ...response.filterOptions.satker.map(opt => ({ label: opt, value: opt }))
        ];
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const onFilterChange = (forceRefresh = false) => {
  currentPage.value = 1;
  loadData(forceRefresh);
};

const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    onFilterChange(false);
  }, 500);
};

onMounted(() => {
  loadData(false);
});
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
