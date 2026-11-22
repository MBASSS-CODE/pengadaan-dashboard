<template>
  <div class="space-y-6">
    <!-- Top Action Card -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[color:hsl(var(--maz-primary))]"></span>
          Merge Rekapitulasi Per PPK
        </h2>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
          Menggunakan <strong>Dashboard Realisasi Table</strong> sebagai sumber transaksi kanonik (default acuan E-Katalog &amp; opsi semua sumber Non-E-Katalog), digabungkan dengan RUP (Penyedia &amp; Swakelola), E-Purchasing (V6 &amp; V5), Non-Tender, Tender, Pencatatan Swakelola, Master Satker, History Kaji Ulang, serta Master PPK &amp; Penyedia.
        </p>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <div class="flex rounded-lg border border-[color:hsl(var(--maz-border))] overflow-hidden">
          <button
            v-for="yr in availableYears"
            :key="yr"
            type="button"
            class="px-3 py-1.5 text-xs font-semibold transition-colors"
            :class="selectedYear === yr ? 'bg-[color:hsl(var(--maz-primary))] text-white' : 'bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))] hover:bg-[color:hsl(var(--maz-muted))/0.1]'"
            @click="changeYear(yr)"
          >
            {{ yr }}
          </button>
        </div>

        <MazBtn
          color="primary"
          size="sm"
          :loading="isMerging"
          :disabled="!allRequiredFound || isMerging"
          @click="runMerge"
        >
          {{ isMerging ? 'Memproses Merge...' : 'Jalankan Merge Rekap PPK' }}
        </MazBtn>
      </div>
    </div>

    <!-- Stepper Pipeline -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm">
      <div class="text-xs font-semibold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-4">Alur Proses Merge Rekap PPK</div>
      <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div
          v-for="step in pipelineSteps"
          :key="step.id"
          class="flex items-center gap-3 p-3 rounded-lg border"
          :class="step.done ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-muted))/0.05]'"
        >
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            :class="step.done ? 'bg-emerald-500 text-white' : 'bg-[color:hsl(var(--maz-muted))/0.2] text-[color:hsl(var(--maz-muted))]'"
          >
            {{ step.done ? '✓' : step.id }}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] truncate">{{ step.title }}</div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] truncate">{{ step.subtitle }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prerequisites Grid -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))]">Sumber Data &amp; Prasyarat ({{ selectedYear }})</h3>
        <span
          class="text-xs px-2.5 py-0.5 rounded-full font-medium"
          :class="allRequiredFound ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'"
        >
          {{ allRequiredFound ? 'Prasyarat Wajib Terpenuhi' : 'Data Wajib Belum Lengkap' }}
        </span>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <MazSpinner size="2em" />
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="src in prerequisites"
          :key="`${src.group}-${src.endpoint}`"
          class="p-3 rounded-lg border flex items-center justify-between gap-3"
          :class="src.found ? 'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]' : (src.required ? 'border-rose-500/40 bg-rose-500/5' : 'border-amber-500/30 bg-amber-500/5')"
        >
          <div class="min-w-0">
            <div class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))] flex items-center gap-1.5">
              <span class="truncate">{{ src.label }}</span>
              <span v-if="src.required" class="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400">Wajib</span>
            </div>
            <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5 truncate">{{ src.group }}/{{ src.endpoint }}</div>
          </div>
          <div class="text-right shrink-0">
            <div
              class="text-xs font-bold"
              :class="src.found ? 'text-emerald-600 dark:text-emerald-400' : (src.required ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400')"
            >
              {{ src.found ? `${src.count.toLocaleString('id-ID')} rec` : 'Kosong' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Last Merge Result & Anomalies -->
    <div v-if="lastMerge" class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))]">Hasil Merge Terakhir</h3>
          <p class="text-xs text-[color:hsl(var(--maz-muted))]">
            Dieksekusi {{ formatDateTime(lastMerge.timestamp) }} • Trigger: <span class="font-semibold">{{ lastMerge.trigger }}</span> • Durasi: {{ lastMerge.duration_ms }} ms
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
            :class="lastMerge.status === 'success' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : (lastMerge.status === 'partial' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400')"
          >
            {{ lastMerge.status }}
          </span>
          <NuxtLink to="/summary-table/rekap-ppk">
            <MazBtn size="xs" color="secondary">Lihat Rekap PPK</MazBtn>
          </NuxtLink>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 rounded-lg bg-[color:hsl(var(--maz-muted))/0.06] border border-[color:hsl(var(--maz-border))]">
          <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">Total PPK</div>
          <div class="text-lg font-bold text-[color:hsl(var(--maz-foreground))]">{{ lastMerge.records_output || 0 }}</div>
        </div>
        <div class="p-3 rounded-lg bg-[color:hsl(var(--maz-muted))/0.06] border border-[color:hsl(var(--maz-border))]">
          <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">PPK Profil Lengkap</div>
          <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ lastMerge.ppk_matched || 0 }}</div>
        </div>
        <div class="p-3 rounded-lg bg-[color:hsl(var(--maz-muted))/0.06] border border-[color:hsl(var(--maz-border))]">
          <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">PPK Belum Terpetakan</div>
          <div class="text-lg font-bold text-amber-600 dark:text-amber-400">{{ lastMerge.ppk_unmatched || 0 }}</div>
        </div>
        <div class="p-3 rounded-lg bg-[color:hsl(var(--maz-muted))/0.06] border border-[color:hsl(var(--maz-border))]">
          <div class="text-[11px] text-[color:hsl(var(--maz-muted))]">Total Sumber Input</div>
          <div class="text-lg font-bold text-[color:hsl(var(--maz-foreground))]">{{ (lastMerge.records_input || 0).toLocaleString('id-ID') }}</div>
        </div>
      </div>

      <!-- Anomalies -->
      <div v-if="lastMerge.anomalies && lastMerge.anomalies.length > 0" class="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Catatan Anomali ({{ lastMerge.anomalies.length }})
          </div>
          <NuxtLink to="/admin/ppk-master" class="text-xs font-semibold text-[color:hsl(var(--maz-primary))] hover:underline">
            Lengkapi Master PPK &rarr;
          </NuxtLink>
        </div>
        <ul class="space-y-1 max-h-40 overflow-y-auto text-xs text-[color:hsl(var(--maz-muted))]">
          <li v-for="(anom, idx) in lastMerge.anomalies" :key="idx" class="flex items-start gap-2">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">{{ typeof anom === 'string' ? 'INFO' : (anom.type || 'INFO') }}</span>
            <span>{{ typeof anom === 'string' ? anom : (anom.message || anom) }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Merge History Table -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-5 shadow-sm">
      <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] mb-3">Riwayat Merge Rekap PPK</h3>
      <div v-if="history.length === 0" class="text-xs text-[color:hsl(var(--maz-muted))] py-6 text-center">
        Belum ada riwayat merge Rekap PPK untuk tahun {{ selectedYear }}.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-xs text-left">
          <thead class="border-b border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-muted))]">
            <tr>
              <th class="py-2 pr-3">Waktu</th>
              <th class="py-2 px-3">Trigger</th>
              <th class="py-2 px-3">Status</th>
              <th class="py-2 px-3 text-right">PPK Output</th>
              <th class="py-2 px-3 text-right">Matched / Unmatched</th>
              <th class="py-2 pl-3 text-right">Durasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
            <tr v-for="h in history" :key="h.id">
              <td class="py-2 pr-3 whitespace-nowrap">{{ formatDateTime(h.timestamp) }}</td>
              <td class="py-2 px-3">{{ h.trigger }}</td>
              <td class="py-2 px-3">
                <span
                  class="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  :class="h.status === 'success' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : (h.status === 'partial' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400')"
                >
                  {{ h.status }}
                </span>
              </td>
              <td class="py-2 px-3 text-right font-semibold">{{ h.records_output || 0 }}</td>
              <td class="py-2 px-3 text-right">{{ h.ppk_matched || 0 }} / {{ h.ppk_unmatched || 0 }}</td>
              <td class="py-2 pl-3 text-right">{{ h.duration_ms || 0 }} ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const currentYear = new Date().getFullYear();
const availableYears = [String(currentYear), String(currentYear - 1)];
const selectedYear = ref(String(currentYear));

const isLoading = ref(true);
const isMerging = ref(false);
const prerequisites = ref<any[]>([]);
const allRequiredFound = ref(false);
const lastMerge = ref<any>(null);
const history = ref<any[]>([]);

const pipelineSteps = computed(() => {
  const hasRealisasi = prerequisites.value.some((p) => p.endpoint === 'realisasi/table' && p.found);
  const hasRup = prerequisites.value.some((p) => p.endpoint === 'paket-penyedia' && p.found);
  const hasTx = prerequisites.value.some((p) => ['ekatalog', 'tender'].includes(p.group) && p.found);
  const hasMasterPpk = prerequisites.value.some((p) => p.endpoint === 'ppk-master' && p.found);
  const hasOutput = Boolean(lastMerge.value && lastMerge.value.status !== 'failed');

  return [
    { id: 1, title: 'Realisasi Acuan', subtitle: 'Dashboard Realisasi Table', done: hasRealisasi },
    { id: 2, title: 'Data RUP', subtitle: 'Penyedia & Swakelola', done: hasRup },
    { id: 3, title: 'Pengayaan PPK', subtitle: 'E-Katalog, Tender & Master PPK', done: hasTx || hasMasterPpk },
    { id: 4, title: 'Agregasi 12 PPK', subtitle: 'Acuan Standar + All Sumber', done: hasOutput },
    { id: 5, title: 'Dataset Ready', subtitle: 'Rekap PPK Enriched v2', done: hasOutput }
  ];
});

const fetchStatus = async () => {
  isLoading.value = true;
  try {
    const res: any = await $fetch(`/api/admin/merge-rekap-ppk-status?tahun=${selectedYear.value}`);
    if (res?.success && res.data) {
      prerequisites.value = res.data.prerequisites || [];
      allRequiredFound.value = Boolean(res.data.allRequiredFound);
      lastMerge.value = res.data.lastMerge || null;
      history.value = res.data.history || [];
    }
  } catch (err) {
    console.error('Error fetching Rekap PPK merge status:', err);
  } finally {
    isLoading.value = false;
  }
};

const changeYear = (yr: string) => {
  selectedYear.value = yr;
  fetchStatus();
};

const runMerge = async () => {
  isMerging.value = true;
  try {
    await $fetch('/api/admin/merge-rekap-ppk', {
      method: 'POST',
      body: { tahun: selectedYear.value }
    });
    await fetchStatus();
  } catch (err) {
    console.error('Error running Rekap PPK merge:', err);
  } finally {
    isMerging.value = false;
  }
};

const formatDateTime = (ts: string) => {
  if (!ts) return '-';
  try {
    return new Date(ts).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return ts;
  }
};

onMounted(() => {
  fetchStatus();
});
</script>
