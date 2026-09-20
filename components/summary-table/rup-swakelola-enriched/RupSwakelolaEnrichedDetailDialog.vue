<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="`Detail RUP Swakelola: ${selectedRow?.kd_rup || ''}`" max-width="1000px">
    <div v-if="selectedRow" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
      
      <!-- Grid 1: Informasi Utama & Satker -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Informasi Paket -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informasi Paket RUP Swakelola
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama Paket:</span>
              <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Kode RUP:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_rup || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Tipe Swakelola:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.tipe_swakelola || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Total Pagu:</span>
              <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ formatRupiah(selectedRow.pagu) }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Status RUP:</span>
              <div class="flex gap-1 ml-4 justify-end flex-wrap">
                <span v-if="selectedRow.status_aktif_rup" class="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">Aktif</span>
                <span v-else class="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Non-Aktif</span>
                <span v-if="selectedRow.status_umumkan_rup" class="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold">{{ selectedRow.status_umumkan_rup }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Satuan Kerja & PPK -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4" />
            </svg>
            Satuan Kerja & PPK
          </h3>
          
          <!-- Sub Section Satker -->
          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Satuan Kerja</div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Nama Satker:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">K/L/PD:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_klpd || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Lokasi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.lokasi || '-' }}</span></div>
          </div>

          <!-- Sub Section PPK -->
          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))] flex items-center justify-between">
              <span>Pejabat Pembuat Komitmen (PPK)</span>
            </div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span> <span class="font-bold text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span></div>
            <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span> <span class="font-mono text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span></div>
          </div>
        </div>
      </div>

      <!-- Pencatatan / Pelaksanaan -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Pencatatan Swakelola & Jadwal
          <span v-if="selectedRow._has_pelaksanaan" class="px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-2 font-semibold">Tercatat</span>
          <span v-else class="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 ml-2 font-semibold">Belum Tercatat</span>
        </h3>
        <div v-if="selectedRow._has_pelaksanaan" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kode Pencatatan:</span> <span class="font-medium text-right ml-4 font-mono">{{ selectedRow.pelaksanaan_kd_pct || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Pelaksanaan:</span> <span class="font-medium text-right ml-4">{{ selectedRow.pelaksanaan_status || '-' }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tanggal Mulai:</span> <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.pelaksanaan_tgl_mulai) }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tanggal Selesai:</span> <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.pelaksanaan_tgl_selesai) }}</span></div>
        </div>
        <p v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">Tidak ada data pencatatan/pelaksanaan untuk paket swakelola ini.</p>
      </div>

      <!-- History Kaji Ulang -->
      <div v-if="selectedRow._has_kaji_ulang" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-amber-200 dark:border-amber-900/50 space-y-3">
        <h3 class="text-sm font-bold text-amber-600 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Riwayat Kaji Ulang
          <span class="px-2 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ml-2">{{ selectedRow.kaji_ulang_count }}x Kaji Ulang</span>
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kaji Ulang Terakhir:</span> <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.kaji_ulang_terakhir) }}</span></div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Jenis Revisi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.kaji_ulang_jenis_revisi || '-' }}</span></div>
          <div class="flex flex-col gap-1 md:col-span-2 pt-1">
            <span class="text-[color:hsl(var(--maz-muted))]">Alasan Terakhir:</span> 
            <span class="font-medium bg-[color:hsl(var(--maz-background))] p-2 rounded border border-[color:hsl(var(--maz-border))] italic">{{ selectedRow.kaji_ulang_alasan || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Anak Paket Penyedia -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Paket Penyedia Dalam Swakelola
          <span class="px-2 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ml-2 font-semibold">{{ selectedRow.paket_penyedia_count || 0 }} Paket</span>
        </h3>
        <div v-if="selectedRow._has_paket_penyedia" class="space-y-3">
          <div v-for="paket in selectedRow.paket_penyedia_list" :key="paket.kd_rup" class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded p-3 text-xs flex justify-between items-start gap-4 hover:border-[color:hsl(var(--maz-primary))] transition-colors">
            <div>
              <div class="font-medium text-[color:hsl(var(--maz-primary))] text-sm mb-1">{{ paket.nama_paket || '-' }}</div>
              <div class="text-[color:hsl(var(--maz-muted))] flex items-center gap-2 flex-wrap">
                <span class="font-mono bg-[color:hsl(var(--maz-foreground)_/_5%)] px-1.5 py-0.5 rounded">RUP: {{ paket.kd_rup }}</span>
                <span>{{ paket.jenis_pengadaan }}</span>
                <span class="text-[10px]">&bull;</span>
                <span>{{ paket.metode_pengadaan }}</span>
              </div>
            </div>
            <div class="font-bold text-right shrink-0 text-emerald-600 dark:text-emerald-400">
              {{ formatRupiah(paket.pagu) }}
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">Tidak ada anak paket penyedia di dalam swakelola ini.</p>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-end w-full">
        <MazBtn @click="$emit('update:modelValue', false)" color="primary" size="sm">Tutup</MazBtn>
      </div>
    </template>
  </MazDialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: () => null
  }
});

defineEmits(['update:modelValue']);

const formatRupiah = (num) => {
  if (!num) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const str = dateString.substring(0, 10);
  if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = str.split('-');
    return `${day}-${month}-${year}`;
  }
  if (str.match(/^\d{4}-\d{2}$/)) {
    const [year, month] = str.split('-');
    return `${month}-${year}`;
  }
  return str;
};
</script>
