<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Realisasi Pengadaan</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Data Realisasi Pengadaan (Internal) yang mencakup E-Katalog, Non Tender, dan Tender</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
          <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Periode:</span>
          <MazSelect
            v-model="filterType"
            :options="filterOptions"
            size="sm"
            class="w-44"
          />
          
          <template v-if="filterType === 'tanggal'">
            <ClientOnly>
              <MazDatePicker
                v-model="dateRange"
                label="Pilih Rentang Waktu"
                range
                double
                auto-close
                color="primary"
                size="sm"
                class="w-64"
              />
              <template #fallback>
                <div class="h-8 w-64 bg-[color:hsl(var(--maz-border))] animate-pulse rounded"></div>
              </template>
            </ClientOnly>
          </template>
          
          <template v-if="filterType === 'triwulan'">
            <MazSelect
              v-model="selectedQuarter"
              :options="quarterOptions"
              size="sm"
              class="w-40"
            />
          </template>
        </div>

        <div class="flex items-center gap-2 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
          <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Tahun Anggaran:</span>
          <MazSelect
            v-model="selectedYear"
            :options="availableYears"
            size="sm"
            class="w-32"
          />
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-6 pb-2 border-b border-[hsl(var(--maz-border))]">
      <button 
        class="pb-2 px-4 font-medium transition-colors duration-200 border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none" 
        :class="activeTab === 'analytics' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
        @click="activeTab = 'analytics'"
      >
        Analytics Dashboard
      </button>
      <button 
        class="pb-2 px-4 font-medium transition-colors duration-200 border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none" 
        :class="activeTab === 'table' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
        @click="activeTab = 'table'"
      >
        Data Table
      </button>
    </div>

    <!-- Tab Content -->
    <ClientOnly>
      <Transition name="fade" mode="out-in">
        <div :key="activeTab">
          <RealisasiPrivateAnalytics v-if="activeTab === 'analytics'" :selected-year="selectedYear" :filter-type="filterType" :start-date="dateRange.start" :end-date="dateRange.end" :selected-quarter="selectedQuarter" />
          <RealisasiPrivateTable v-else-if="activeTab === 'table'" :selected-year="selectedYear" :filter-type="filterType" :start-date="dateRange.start" :end-date="dateRange.end" :selected-quarter="selectedQuarter" />
        </div>
      </Transition>
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import RealisasiPrivateAnalytics from '~/components/summary-table/realisasi/RealisasiPrivateAnalytics.vue';
import RealisasiPrivateTable from '~/components/summary-table/realisasi/RealisasiPrivateTable.vue';

const activeTab = ref('analytics');

const currentYear = new Date().getFullYear();
const availableYears = [
  currentYear.toString(),
  (currentYear - 1).toString()
].map(y => ({ label: y, value: y }));

const selectedYear = ref(currentYear.toString());

const filterType = ref('semua');
const filterOptions = [
  { label: 'Sepanjang Tahun', value: 'semua' },
  { label: 'Tanggal', value: 'tanggal' },
  { label: 'Triwulan', value: 'triwulan' }
];

const dateRange = ref({
  start: `${currentYear}-01-01`,
  end: new Date().toISOString().split('T')[0]
});
const selectedQuarter = ref('TW 1');
const quarterOptions = [
  { label: 'TW 1 (Jan-Mar)', value: 'TW 1' },
  { label: 'TW 2 (Apr-Jun)', value: 'TW 2' },
  { label: 'TW 3 (Jul-Sep)', value: 'TW 3' },
  { label: 'TW 4 (Okt-Des)', value: 'TW 4' }
];
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
