<template>
  <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
    <div class="p-6 border-b border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Integrasi Data: Pencatatan Swakelola
        </h2>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Gabungkan Pencatatan Swakelola dengan Realisasi, RUP, Satker, dan PPK</p>
      </div>
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))]">Tahun:</span>
          <div class="flex bg-[color:hsl(var(--maz-foreground)_/_5%)] p-1 rounded-lg">
            <button v-for="y in availableYears" :key="y"
              @click="selectedYear = y; fetchMergeStatus()"
              class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
              :class="selectedYear === y ? 'bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-primary))] shadow-sm border border-[color:hsl(var(--maz-border))]' : 'text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
            >
              {{ y }}
            </button>
          </div>
        </div>
        <MazBtn @click="runMerge" :loading="mergeLoading" color="primary" size="sm" :disabled="!mergeStatus.allRequiredFound">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Jalankan Merge Pencatatan Swakelola
        </MazBtn>
      </div>
    </div>

    <div class="p-6">
      <!-- Alur / Stepper -->
      <div class="mb-6">
        <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Alur Integrasi Data</h3>
        <div class="w-full overflow-x-auto pb-2">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 sm:w-max">
            <div v-for="(step, idx) in mergeSteps" :key="idx" class="flex items-center shrink-0">
              <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border whitespace-nowrap"
                :class="{
                  'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400': step.status === 'done',
                  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400': step.status === 'waiting',
                  'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400': step.status === 'error',
                  'bg-[color:hsl(var(--maz-foreground)_/_5%)] border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-muted))]': step.status === 'idle'
                }"
              >
                <span v-if="step.status === 'done'">✅</span>
                <span v-else-if="step.status === 'waiting'">⏳</span>
                <span v-else-if="step.status === 'error'">❌</span>
                <span v-else>⬜</span>
                {{ step.label }}
              </div>
              <svg v-if="idx < mergeSteps.length - 1" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1 text-[color:hsl(var(--maz-muted))] hidden sm:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Prasyarat -->
      <div class="mb-6">
        <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Prasyarat Data Sumber</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div v-for="src in mergeStatus.prerequisites" :key="src.endpoint"
            class="flex items-center gap-3 p-3 rounded-lg border text-sm"
            :class="{
              'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10': src.found,
              'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10': !src.found && src.required,
              'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]': !src.found && !src.required
            }"
          >
            <span class="text-lg">{{ src.found ? '✅' : (src.required ? '❌' : '⬜') }}</span>
            <div class="min-w-0 flex-1">
              <div class="font-semibold text-[color:hsl(var(--maz-foreground))] truncate">
                {{ src.label }}
                <span v-if="src.required" class="text-red-500 text-[10px] ml-1">WAJIB</span>
              </div>
              <div class="text-[10px] text-[color:hsl(var(--maz-muted))]">
                {{ src.found ? `${src.count} records` : 'Belum tersedia' }} · {{ src.group }}/{{ src.endpoint }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Merge Result -->
      <div v-if="mergeStatus.lastMerge" class="mb-6">
        <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Merge Terakhir</h3>
        <div class="p-4 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]">
          <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span><strong>Waktu:</strong> {{ formatDate(mergeStatus.lastMerge.timestamp) }}</span>
            <span><strong>Trigger:</strong> {{ mergeStatus.lastMerge.trigger }}</span>
            <span><strong>Durasi:</strong> {{ mergeStatus.lastMerge.duration_ms }}ms</span>
            <span><strong>Total:</strong> {{ mergeStatus.lastMerge.result?.total_records }} records</span>
            <span>
              <strong>Status:</strong>
              <span :class="mergeStatus.lastMerge.status === 'success' ? 'text-green-600' : 'text-red-600'">{{ mergeStatus.lastMerge.status }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Merge History -->
      <div v-if="mergeStatus.history?.length">
        <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Riwayat Merge</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))]">
            <thead class="text-xs uppercase bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))]">
              <tr>
                <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Waktu</th>
                <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Trigger</th>
                <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Records</th>
                <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Durasi</th>
                <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in mergeStatus.history" :key="h.id" class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(h.timestamp) }}</td>
                <td class="px-4 py-3 font-mono text-xs">{{ h.trigger }}</td>
                <td class="px-4 py-3 text-center font-bold">{{ h.result?.total_records || 0 }}</td>
                <td class="px-4 py-3 text-center">{{ h.duration_ms }}ms</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 text-xs font-semibold rounded-full"
                    :class="h.status === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'"
                  >{{ h.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="mergeMessage" class="mt-4 p-3 rounded-lg text-sm" :class="mergeSuccess ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
        {{ mergeMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const currentYear = new Date().getFullYear();
const availableYears = [currentYear.toString(), (currentYear - 1).toString()];
const selectedYear = ref(currentYear.toString());

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

const mergeLoading = ref(false);
const mergeMessage = ref('');
const mergeSuccess = ref(false);
const mergeStatus = ref({
  prerequisites: [],
  allRequiredFound: false,
  lastMerge: null,
  history: []
});

const mergeSteps = computed(() => {
  const hasData = mergeStatus.value.prerequisites?.some(s => s.found && s.endpoint === 'pencatatan-swakelola');
  const hasPpk = mergeStatus.value.prerequisites?.find(s => s.endpoint === 'ppk-master');
  const lastMerge = mergeStatus.value.lastMerge;

  return [
    { label: '1. Sync Data', status: hasData ? 'done' : 'waiting' },
    { label: '2. Data Dukung', status: mergeStatus.value.allRequiredFound ? 'done' : 'waiting' },
    { label: '3. PPK Dilengkapi', status: hasPpk?.count > 0 ? 'done' : 'waiting' },
    { label: '4. Merge', status: lastMerge?.status === 'success' ? 'done' : (lastMerge?.status === 'failed' ? 'error' : 'idle') },
    { label: '5. Selesai', status: lastMerge?.status === 'success' ? 'done' : 'idle' }
  ];
});

const fetchMergeStatus = async () => {
  try {
    const tahun = selectedYear.value;
    const res = await $fetch('/api/admin/merge-pencatatan-swakelola-status', { params: { tahun } });
    if (res.success) {
      mergeStatus.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load merge status', error);
  }
};

const runMerge = async () => {
  mergeLoading.value = true;
  mergeMessage.value = '';
  try {
    const tahun = selectedYear.value;
    const res = await $fetch('/api/admin/merge-pencatatan-swakelola', {
      method: 'POST',
      body: { tahun }
    });
    mergeSuccess.value = res.success;
    mergeMessage.value = res.message;
    if (res.success) {
      await fetchMergeStatus();
      setTimeout(() => { mergeMessage.value = ''; }, 5000);
    }
  } catch (error) {
    mergeSuccess.value = false;
    mergeMessage.value = 'Terjadi kesalahan saat menjalankan merge';
  } finally {
    mergeLoading.value = false;
  }
};

onMounted(() => {
  fetchMergeStatus();
});
</script>
