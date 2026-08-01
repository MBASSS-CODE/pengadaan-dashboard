<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Non-Tender Enriched</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Summary Table hasil integrasi data (Merge) Non-Tender dengan RUP, Satker, dan PPK</p>
      </div>

      <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Tahun Anggaran:</span>
        <MazSelect
          v-model="selectedYear"
          :options="availableYears"
          size="sm"
          class="w-32"
        />
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
    <Transition name="fade" mode="out-in">
      <div :key="activeTab">
        <NonTenderEnrichedAnalytics v-if="activeTab === 'analytics'" :selected-year="selectedYear" />
        <NonTenderEnrichedTable v-else-if="activeTab === 'table'" :selected-year="selectedYear" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import NonTenderEnrichedAnalytics from '~/components/summary-table/non-tender-enriched/NonTenderEnrichedAnalytics.vue';
import NonTenderEnrichedTable from '~/components/summary-table/non-tender-enriched/NonTenderEnrichedTable.vue';

const activeTab = ref('analytics');

const currentYear = new Date().getFullYear();
const availableYears = [
  currentYear.toString(),
  (currentYear - 1).toString()
].map(y => ({ label: y, value: y }));

const selectedYear = ref(currentYear.toString());
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
