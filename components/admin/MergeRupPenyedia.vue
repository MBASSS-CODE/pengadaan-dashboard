<template>
  <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
            <div class="p-6 border-b border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Integrasi Data Master: RUP Penyedia
                </h2>
                <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Gabungkan RUP Penyedia (sebagai data induk) dengan Satker, Anggaran, Kaji Ulang, PPK, dan Swakelola Induk</p>
              </div>
              <MazBtn @click="runRpMerge" :loading="rpMergeLoading" color="secondary" size="sm" :disabled="!rpMergeStatus.allRequiredFound">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Jalankan Merge RUP
              </MazBtn>
            </div>
      
            <div class="p-6">
              <!-- Alur / Stepper -->
              <div class="mb-6">
                <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Alur Integrasi RUP</h3>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
                  <div v-for="(step, idx) in rpMergeSteps" :key="idx" class="flex items-center">
                    <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border"
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
                    <svg v-if="idx < rpMergeSteps.length - 1" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1 text-[color:hsl(var(--maz-muted))] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
      
              <!-- Prasyarat -->
              <div class="mb-6">
                <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Prasyarat Data Dukung</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div v-for="src in rpMergeStatus.prerequisites" :key="src.endpoint"
                    class="flex items-center gap-3 p-3 rounded-lg border text-sm"
                    :class="{
                      'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10': src.found,
                      'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10': !src.found && src.required,
                      'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]': !src.found && !src.required
                    }"
                  >
                    <span class="text-lg">{{ src.found ? '✅' : (src.required ? '❌' : '⬜') }}</span>
                    <div class="min-w-0">
                      <div class="font-semibold text-[color:hsl(var(--maz-foreground))]">
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
              <div v-if="rpMergeStatus.lastMerge" class="mb-6">
                <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Merge Terakhir</h3>
                <div class="p-4 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]">
                  <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <span><strong>Waktu:</strong> {{ formatDate(rpMergeStatus.lastMerge.timestamp) }}</span>
                    <span><strong>Trigger:</strong> {{ rpMergeStatus.lastMerge.trigger }}</span>
                    <span><strong>Durasi:</strong> {{ rpMergeStatus.lastMerge.duration_ms }}ms</span>
                    <span><strong>Total:</strong> {{ rpMergeStatus.lastMerge.result?.total_records }} records</span>
                    <span>
                      <strong>Status:</strong>
                      <span :class="rpMergeStatus.lastMerge.status === 'success' ? 'text-green-600' : 'text-red-600'">{{ rpMergeStatus.lastMerge.status }}</span>
                    </span>
                  </div>
                </div>
              </div>
      
              <!-- Merge History -->
              <div v-if="rpMergeStatus.history?.length">
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
                      <tr v-for="h in rpMergeStatus.history" :key="h.id" class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
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
      
              <div v-if="rpMergeMessage" class="mt-4 p-3 rounded-lg text-sm" :class="rpMergeSuccess ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                {{ rpMergeMessage }}
              </div>
            </div>
          </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

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

const rpMergeLoading = ref(false);
const rpMergeMessage = ref('');
const rpMergeSuccess = ref(false);
const rpMergeStatus = ref({
  prerequisites: [],
  allRequiredFound: false,
  lastMerge: null,
  history: []
});

const rpMergeSteps = computed(() => {
  const hasData = rpMergeStatus.value.prerequisites?.some(s => s.found && s.endpoint === 'paket-penyedia');
  const hasPpk = rpMergeStatus.value.prerequisites?.find(s => s.endpoint === 'ppk-master');
  const lastMerge = rpMergeStatus.value.lastMerge;

  return [
    { label: '1. Sync RUP', status: hasData ? 'done' : 'waiting' },
    { label: '2. Data Dukung', status: rpMergeStatus.value.allRequiredFound ? 'done' : 'waiting' },
    { label: '3. PPK Dilengkapi', status: hasPpk?.count > 0 ? 'done' : 'waiting' },
    { label: '4. Merge', status: lastMerge?.status === 'success' ? 'done' : (lastMerge?.status === 'failed' ? 'error' : 'idle') },
    { label: '5. Dataset Ready', status: lastMerge?.status === 'success' ? 'done' : 'idle' }
  ];
});

const fetchRpMergeStatus = async () => {
  try {
    const tahun = new Date().getFullYear().toString();
    const res = await $fetch('/api/admin/merge-rup-penyedia-status', { params: { tahun } });
    if (res.success) {
      rpMergeStatus.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load RP merge status', error);
  }
};

const runRpMerge = async () => {
  rpMergeLoading.value = true;
  rpMergeMessage.value = '';
  try {
    const tahun = new Date().getFullYear().toString();
    const res = await $fetch('/api/admin/merge-rup-penyedia', {
      method: 'POST',
      body: { tahun }
    });
    rpMergeSuccess.value = res.success;
    rpMergeMessage.value = res.message;
    if (res.success) {
      await fetchRpMergeStatus();
      setTimeout(() => { rpMergeMessage.value = ''; }, 5000);
    }
  } catch (error) {
    rpMergeSuccess.value = false;
    rpMergeMessage.value = 'Terjadi kesalahan saat menjalankan merge';
  } finally {
    rpMergeLoading.value = false;
  }
};

onMounted(() => {
  fetchRpMergeStatus();
});
</script>
