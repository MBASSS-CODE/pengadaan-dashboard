<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Sistem & Cache</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Status penyimpanan data, memori, dan penjadwalan</p>
      </div>
      
      <div class="flex gap-2">
        <MazBtn @click="fetchStats" :loading="loading" color="primary" outline size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </MazBtn>
        <MazBtn @click="syncAllEndpoints" :loading="syncLoading" color="danger" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Sync Semua Sekarang
        </MazBtn>
      </div>
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
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Memori cache pada server node.js</p>
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
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Total ukuran file JSON di disk</p>
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
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Jumlah berkas fisik cache tersimpan</p>
      </div>
    </div>

    <!-- Endpoint Aktif (Checklist) -->
    <div class="mb-8">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
        <div class="p-6 border-b border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Endpoint Aktif
            </h2>
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Centang endpoint yang ingin diambil datanya dari API Inaproc dan ditampilkan di dashboard</p>
          </div>
          <MazBtn @click="saveEndpointsConfig" :loading="savingEndpoints" color="primary" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Perubahan
          </MazBtn>
        </div>

        <div v-if="endpointConfigLoading" class="p-10 flex items-center justify-center">
          <MazSpinner color="primary" />
        </div>

        <div v-else class="p-6">
          <div v-for="(items, group) in endpointRegistry" :key="group" class="mb-6 last:mb-0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-primary))]">{{ group }}</h3>
              <button 
                @click="toggleAllGroup(group)" 
                class="text-xs font-medium text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer"
              >
                {{ isAllGroupActive(group) ? 'Nonaktifkan Semua' : 'Aktifkan Semua' }}
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <label 
                v-for="item in items" 
                :key="item.endpoint"
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200"
                :class="{
                  'border-[color:hsl(var(--maz-primary)_/_40%)] bg-[color:hsl(var(--maz-primary)_/_5%)]': isEndpointActive(group, item.endpoint),
                  'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]': !isEndpointActive(group, item.endpoint)
                }"
              >
                <input 
                  type="checkbox" 
                  :checked="isEndpointActive(group, item.endpoint)"
                  @change="toggleEndpoint(group, item.endpoint)"
                  class="mt-0.5 w-4 h-4 accent-[hsl(var(--maz-primary))] rounded cursor-pointer"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-[color:hsl(var(--maz-foreground))]">{{ item.label }}</div>
                  <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5 leading-snug">{{ item.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="endpointSaveMessage" class="mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            {{ endpointSaveMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Pengaturan Cron Job -->
      <div class="lg:col-span-1">
        <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Jadwal Sinkronisasi
          </h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-[color:hsl(var(--maz-muted))] mb-2">Format Cron (Menit Jam * * *)</label>
            <MazInput 
              v-model="cronSchedule" 
              placeholder="0 6,12 * * *" 
              :disabled="savingCron"
            />
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-2">
              Contoh: <br/>
              <code class="bg-[color:hsl(var(--maz-foreground)_/_10%)] px-1 py-0.5 rounded">0 6,12 * * *</code> (Setiap jam 06:00 dan 12:00)<br/>
              <code class="bg-[color:hsl(var(--maz-foreground)_/_10%)] px-1 py-0.5 rounded">0 */4 * * *</code> (Setiap 4 jam)<br/>
              <code class="bg-[color:hsl(var(--maz-foreground)_/_10%)] px-1 py-0.5 rounded">30 8 * * *</code> (Setiap jam 08:30 pagi)
            </p>
          </div>
          
          <MazBtn @click="saveCron" :loading="savingCron" color="primary" block>
            Simpan Jadwal
          </MazBtn>
          
          <div v-if="saveMessage" class="mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            {{ saveMessage }}
          </div>
        </div>
      </div>

      <!-- Log Aktivitas -->
      <div class="lg:col-span-2">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden h-full flex flex-col">
          <div class="p-6 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
            <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Riwayat Hit Endpoint (API)
            </h2>
          </div>
          
          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))]">
              <thead class="text-xs uppercase bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))]">
                <tr>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Grup</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Endpoint</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Hasil Data</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Terakhir Sinkronisasi</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="logs.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-[color:hsl(var(--maz-muted))]">Belum ada aktivitas sinkronisasi tercatat.</td>
                </tr>
                <tr 
                  v-for="(log, index) in logs" 
                  :key="index"
                  class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
                >
                  <td class="px-6 py-4 font-medium uppercase text-[color:hsl(var(--maz-primary))]">{{ log.group }}</td>
                  <td class="px-6 py-4 font-mono text-xs">{{ log.endpoint }}</td>
                  <td class="px-6 py-4 text-center font-bold">{{ log.count }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(log.lastUpdated) }}</td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2.5 py-1 text-xs font-semibold rounded-full border border-transparent"
                      :class="{
                        'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': log.status === 'Success',
                        'bg-[color:hsl(var(--maz-destructive)_/_15%)] text-[color:hsl(var(--maz-destructive)_/_100%)] dark:bg-[color:hsl(var(--maz-destructive)_/_20%)]': log.status !== 'Success'
                      }"
                    >
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const syncLoading = ref(false);
const savingCron = ref(false);
const saveMessage = ref('');

const cronSchedule = ref('0 6,12 * * *');
const logs = ref([]);

const stats = ref({
  totalFiles: 0,
  totalSizeBytes: 0,
  ramSizeBytes: 0
});

// ─── Endpoint Config State ──────────────────────────────────────────────────
const endpointConfigLoading = ref(true);
const savingEndpoints = ref(false);
const endpointSaveMessage = ref('');
const endpointRegistry = ref({});
const localActiveEndpoints = ref({});

const fetchEndpointsConfig = async () => {
  endpointConfigLoading.value = true;
  try {
    const res = await $fetch('/api/admin/endpoints-config');
    if (res.success) {
      endpointRegistry.value = res.data.registry;
      // Deep clone to avoid mutation issues
      localActiveEndpoints.value = JSON.parse(JSON.stringify(res.data.activeEndpoints));
    }
  } catch (error) {
    console.error('Failed to load endpoints config', error);
  } finally {
    endpointConfigLoading.value = false;
  }
};

const isEndpointActive = (group, endpoint) => {
  return localActiveEndpoints.value[group]?.includes(endpoint) ?? false;
};

const toggleEndpoint = (group, endpoint) => {
  if (!localActiveEndpoints.value[group]) {
    localActiveEndpoints.value[group] = [];
  }
  const idx = localActiveEndpoints.value[group].indexOf(endpoint);
  if (idx === -1) {
    localActiveEndpoints.value[group].push(endpoint);
  } else {
    localActiveEndpoints.value[group].splice(idx, 1);
  }
};

const isAllGroupActive = (group) => {
  const registry = endpointRegistry.value[group];
  if (!registry) return false;
  return registry.every(item => isEndpointActive(group, item.endpoint));
};

const toggleAllGroup = (group) => {
  const registry = endpointRegistry.value[group];
  if (!registry) return;
  
  if (isAllGroupActive(group)) {
    // Nonaktifkan semua
    localActiveEndpoints.value[group] = [];
  } else {
    // Aktifkan semua
    localActiveEndpoints.value[group] = registry.map(item => item.endpoint);
  }
};

const saveEndpointsConfig = async () => {
  savingEndpoints.value = true;
  endpointSaveMessage.value = '';
  try {
    const res = await $fetch('/api/admin/endpoints-config', {
      method: 'POST',
      body: { activeEndpoints: localActiveEndpoints.value }
    });
    if (res.success) {
      endpointSaveMessage.value = res.message;
      setTimeout(() => { endpointSaveMessage.value = '' }, 3000);
    } else {
      alert('Gagal: ' + res.message);
    }
  } catch (error) {
    alert('Terjadi kesalahan saat menyimpan konfigurasi endpoint');
  } finally {
    savingEndpoints.value = false;
  }
};

// ─── Existing Functions ─────────────────────────────────────────────────────

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/admin/system-stats');
    if (res.success) {
      stats.value = res.data;
    }
    await fetchCronInfo();
  } catch (error) {
    console.error('Failed to load system stats', error);
  } finally {
    loading.value = false;
  }
};

const fetchCronInfo = async () => {
  try {
    const res = await $fetch('/api/admin/cron');
    if (res.success) {
      if (res.data.config?.schedule) cronSchedule.value = res.data.config.schedule;
      if (res.data.logs) {
        // Urutkan dari yang terbaru
        logs.value = res.data.logs.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      }
    }
  } catch (error) {
    console.error('Failed to load cron config', error);
  }
};

const saveCron = async () => {
  savingCron.value = true;
  saveMessage.value = '';
  try {
    const res = await $fetch('/api/admin/cron', {
      method: 'POST',
      body: { schedule: cronSchedule.value }
    });
    if (res.success) {
      saveMessage.value = res.message;
      setTimeout(() => { saveMessage.value = '' }, 3000);
    } else {
      alert('Gagal: ' + res.message);
    }
  } catch (error) {
    alert('Terjadi kesalahan saat menyimpan jadwal');
  } finally {
    savingCron.value = false;
  }
};

const syncAllEndpoints = async () => {
  if (!confirm('Apakah Anda yakin ingin menyinkronkan ulang seluruh data sekarang? Proses ini akan berjalan di latar belakang dan mungkin membutuhkan waktu beberapa saat.')) {
    return;
  }
  
  syncLoading.value = true;
  try {
    const res = await $fetch('/api/admin/cron-sync', { method: 'POST' });
    if (res.success) {
      alert('Berhasil: ' + res.message);
      // Wait a bit and refresh logs
      setTimeout(fetchCronInfo, 2000);
    }
  } catch (error) {
    alert('Terjadi kesalahan saat memicu sinkronisasi');
  } finally {
    syncLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
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
  fetchEndpointsConfig();
});
</script>
