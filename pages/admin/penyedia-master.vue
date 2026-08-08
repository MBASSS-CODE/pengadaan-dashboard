<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Data Master Penyedia</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Ekstrak Kode Penyedia dari data e-Purchasing. Data akan dilengkapi secara otomatis menggunakan API eksternal nantinya.</p>
        <div class="mt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="text-sm font-medium text-amber-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span v-if="isCronEnabled">Antrean otomatis berjalan dalam: {{ countdownText }}</span>
            <span v-else class="text-red-500">Antrean otomatis sedang dimatikan</span>
          </div>
          <MazSwitch v-model="isCronEnabled" @update:model-value="toggleCron" size="sm" color="success" />
          <span class="text-xs font-medium" :class="isCronEnabled ? 'text-green-600' : 'text-red-500'">
            {{ isCronEnabled ? 'Aktif' : 'Mati' }}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <MazBtn @click="processQueue" :loading="processing" color="secondary" outline size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Proses 10 Antrean
        </MazBtn>
        <MazBtn @click="fetchPenyedia" :loading="loading" color="primary" outline size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </MazBtn>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <div class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total Penyedia</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1">{{ meta.totalFromApi }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <div class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Sudah Dilengkapi</div>
        <div class="text-2xl font-bold text-green-600 mt-1">{{ meta.totalCompleted }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <div class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Belum Dilengkapi</div>
        <div class="text-2xl font-bold text-amber-500 mt-1">{{ meta.totalIncomplete }}</div>
      </div>
    </div>

    <!-- Data List -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      
      <!-- Search -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
        <div class="w-full md:w-1/3">
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari kode penyedia..." 
            size="sm"
          >
            <template #left-icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </MazInput>
        </div>
      </div>

      <div v-if="loading" class="p-10 flex items-center justify-center">
        <MazSpinner color="primary" />
      </div>

      <div v-else class="divide-y divide-[color:hsl(var(--maz-border))] max-h-[600px] overflow-y-auto">
        <div 
          v-for="(item, idx) in filteredList" 
          :key="item.kode_penyedia" 
          class="p-4 transition-colors flex items-center gap-4 cursor-pointer hover:bg-[color:hsl(var(--maz-foreground)_/_5%)]"
          :class="{ 'bg-[color:hsl(var(--maz-foreground)_/_2%)]': idx % 2 === 0 }"
          @click="openDetail(item)"
        >
          <div class="mt-1">
            <span 
              v-if="item.status_api === 'SUCCESS'"
              class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              title="Sukses"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span 
              v-else-if="item.status_api === 'FAILED'"
              class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              title="Gagal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
            <span 
              v-else
              class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              title="Antrean / Pending"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <div class="text-sm font-bold text-[color:hsl(var(--maz-primary))] break-all">Kode: {{ item.kode_penyedia }}</div>
              
              <span v-if="item.status_api === 'SUCCESS'" class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 whitespace-nowrap">Data Lengkap</span>
              <span v-else-if="item.status_api === 'FAILED'" class="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 whitespace-nowrap">Gagal (Retry: {{ item.retry_count }})</span>
              <span v-else class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">Mengantre...</span>
            </div>
            
            <div v-if="item.status_api === 'SUCCESS'" class="text-xs text-[color:hsl(var(--maz-foreground))] mt-1 font-medium">
              {{ item.nama_penyedia }} 
              <span class="text-[color:hsl(var(--maz-muted))]">| NPWP: {{ item.npwp }}</span>
              <span v-if="item.nib" class="text-[color:hsl(var(--maz-muted))]"> | NIB: {{ item.nib }}</span>
              <span v-if="item.email" class="text-[color:hsl(var(--maz-muted))]"> | Email: {{ item.email }}</span>
            </div>
            <div v-else class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
              Menunggu proses background sinkronisasi penyedia.
            </div>
          </div>
        </div>

        <div v-if="filteredList.length === 0" class="p-10 text-center text-[color:hsl(var(--maz-muted))]">
          <p class="font-medium">Belum ada data penyedia atau pencarian tidak ditemukan.</p>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification" class="fixed bottom-6 right-6 z-50 max-w-sm">
      <div 
        class="px-4 py-3 rounded-lg shadow-lg text-sm font-medium border"
        :class="{
          'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800': notificationType === 'success',
          'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800': notificationType === 'error'
        }"
      >
        {{ notification }}
      </div>
    </div>
    <!-- Detail Modal -->
    <MazDialog v-model="detailModal" :title="`Detail Penyedia: ${selectedItem?.nama_penyedia || selectedItem?.kode_penyedia || ''}`" max-width="800px">
      <div v-if="selectedItem" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Kode Penyedia</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))] break-all">{{ selectedItem.kode_penyedia || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Nama Penyedia</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.nama_penyedia || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">NPWP</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.npwp || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">NIB</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.nib || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Email</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.email || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Telepon</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.telepon || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Bentuk Usaha</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.bentuk_usaha || '-' }}</div>
          </div>
          <div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Status UMKK</div>
            <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.status_umkk || '-' }}</div>
          </div>
        </div>
        <div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))]">Jenis Perusahaan / KBLI</div>
          <div class="font-medium text-[color:hsl(var(--maz-foreground))] whitespace-pre-wrap">{{ selectedItem.jenis_perusahaan || '-' }}</div>
        </div>
        <div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))]">Alamat</div>
          <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.alamat || '-' }}</div>
        </div>
      </div>
    </MazDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const loading = ref(true);
const processing = ref(false);
const list = ref([]);
const meta = ref({ totalFromApi: 0, totalCompleted: 0, totalIncomplete: 0 });
const searchQuery = ref('');
const countdownText = ref('');
const isCronEnabled = ref(true);
const cronToggleLoading = ref(false);
const detailModal = ref(false);
const selectedItem = ref(null);
let countdownInterval = null;
let intervalId = null;

const notification = ref('');
const notificationType = ref('success');
let notificationTimer = null;

const showNotification = (msg, type = 'success') => {
  notification.value = msg;
  notificationType.value = type;
  if (notificationTimer) clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => { notification.value = ''; }, 3000);
};

const filteredList = computed(() => {
  if (!searchQuery.value) return list.value;
  const q = searchQuery.value.toLowerCase();
  return list.value.filter(item => item.kode_penyedia && item.kode_penyedia.toLowerCase().includes(q));
});

const openDetail = (item) => {
  if (item.status_api === 'SUCCESS') {
    selectedItem.value = item;
    detailModal.value = true;
  } else {
    showNotification('Detail belum tersedia. Menunggu antrean sinkronisasi.', 'error');
  }
};

const fetchPenyedia = async () => {
  loading.value = true;
  try {
    const tahun = new Date().getFullYear().toString();
    const res = await $fetch('/api/admin/penyedia-master', { params: { tahun } });
    if (res.success) {
      list.value = res.data;
      meta.value = res.meta;
      if (res.warning) {
        showNotification(res.warning, 'error');
      }
    }
  } catch (error) {
    console.error('Failed to load Penyedia', error);
    showNotification('Gagal memuat data penyedia', 'error');
  } finally {
    loading.value = false;
  }
};

const processQueue = async () => {
  processing.value = true;
  try {
    const res = await $fetch('/api/admin/process-penyedia', { method: 'POST' });
    if (res.success) {
      showNotification('Berhasil memproses 10 antrean', 'success');
      await fetchPenyedia(); // refresh list
    }
  } catch (err) {
    console.error('Failed to process queue', err);
    showNotification('Gagal memproses antrean manual', 'error');
  } finally {
    processing.value = false;
  }
};

const toggleCron = async () => {
  cronToggleLoading.value = true;
  try {
    const res = await $fetch('/api/admin/toggle-penyedia-cron', {
      method: 'POST',
      body: { enablePenyedia: isCronEnabled.value }
    });
    if (res.success) {
      isCronEnabled.value = res.data.enablePenyedia !== false;
      showNotification(res.message, 'success');
    } else {
      isCronEnabled.value = !isCronEnabled.value;
      showNotification(res.message, 'error');
    }
  } catch (error) {
    isCronEnabled.value = !isCronEnabled.value;
    showNotification('Gagal mengubah status cron.', 'error');
  } finally {
    cronToggleLoading.value = false;
  }
};

const updateCountdown = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const nextMinute = Math.ceil((minutes + 1) / 15) * 15; // next 15-minute mark
  const nextRun = new Date(now);
  if (nextMinute === 60) {
    nextRun.setHours(now.getHours() + 1);
    nextRun.setMinutes(0);
  } else {
    nextRun.setMinutes(nextMinute);
  }
  nextRun.setSeconds(0);
  nextRun.setMilliseconds(0);

  const diff = nextRun - now;
  if (diff <= 0) {
    countdownText.value = 'Memulai proses...';
  } else {
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    countdownText.value = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
};

onMounted(async () => {
  await fetchPenyedia();
  
  try {
    const cronRes = await $fetch('/api/admin/cron');
    if (cronRes.success && cronRes.data && cronRes.data.config) {
      isCronEnabled.value = cronRes.data.config.enablePenyedia !== false;
    }
  } catch (e) {
    console.error('Failed to fetch cron config', e);
  }

  // Polling every 30 seconds
  intervalId = setInterval(fetchPenyedia, 30000);

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (intervalId) clearInterval(intervalId);
});
</script>
