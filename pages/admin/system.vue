<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Sistem & Cache</h1>
      <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Status penyimpanan data dan penggunaan memori (RAM)</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- RAM Usage Card -->
      <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">RAM Digunakan</h2>
            <p class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1" v-if="!loading">{{ formatBytes(stats.ramSizeBytes) }}</p>
            <div v-else class="h-8 w-24 bg-[color:hsl(var(--maz-foreground)_/_10%)] animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Memori yang dikonsumsi oleh data cache di server node.js</p>
      </div>

      <!-- JSON Size Card -->
      <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Ukuran Data (Disk)</h2>
            <p class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1" v-if="!loading">{{ formatBytes(stats.totalSizeBytes) }}</p>
            <div v-else class="h-8 w-24 bg-[color:hsl(var(--maz-foreground)_/_10%)] animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Total ukuran dari seluruh file JSON yang tersimpan di disk</p>
      </div>

      <!-- JSON Files Card -->
      <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total File JSON</h2>
            <p class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1" v-if="!loading">{{ stats.totalFiles }} File</p>
            <div v-else class="h-8 w-16 bg-[color:hsl(var(--maz-foreground)_/_10%)] animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Jumlah berkas fisik cache (terpisah per tahun/endpoint)</p>
      </div>
    </div>

    <!-- Actions Area -->
    <div class="flex justify-end gap-3">
      <MazBtn @click="fetchStats" :loading="loading" color="primary" outline>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Status
      </MazBtn>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const stats = ref({
  totalFiles: 0,
  totalSizeBytes: 0,
  ramSizeBytes: 0
});

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/admin/system-stats');
    if (res.success) {
      stats.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load system stats', error);
  } finally {
    loading.value = false;
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

onMounted(() => {
  fetchStats();
});
</script>
