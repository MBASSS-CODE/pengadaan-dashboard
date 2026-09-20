<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="`Detail Pencatatan Non-Tender: ${selectedRow?.kd_nontender_pct || ''}`" max-width="1000px">
    <div v-if="selectedRow" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
      
      <!-- Summary Financial Bar (4 Cards Top) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider text-[10px]">Total Pagu (RUP)</span>
          <span class="text-base font-bold text-[color:hsl(var(--maz-primary))] mt-1">
            {{ selectedRow.rup_pagu ? formatRupiah(selectedRow.rup_pagu) : formatRupiah(selectedRow.pagu) }}
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col justify-between">
          <span class="text-xs text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider text-[10px]">Total Realisasi / HPS</span>
          <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {{ formatRupiah(selectedRow.total_realisasi || selectedRow.hps || selectedRow.pagu) }}
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider text-[10px]">Selisih / Sisa Pagu</span>
          <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))] mt-1">
            {{ formatRupiah(((selectedRow.rup_pagu || selectedRow.pagu || 0) - (selectedRow.total_realisasi || selectedRow.hps || 0))) }}
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between">
          <span class="text-xs text-blue-700 dark:text-blue-400 font-medium uppercase tracking-wider text-[10px]">Total Realisasi</span>
          <span class="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
            {{ selectedRow.realisasi_list?.length || 0 }} Bukti Realisasi
          </span>
        </div>
      </div>

      <!-- Grid 1: Informasi Utama & Satker/PPK -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Informasi Paket -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informasi Paket Pencatatan
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket:</span>
              <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">ID Pencatatan Non-Tender:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_nontender_pct || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Kode RUP:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_rup || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Metode Pemilihan:</span>
              <span class="font-semibold text-right ml-4">{{ selectedRow.mtd_pemilihan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jenis / Kategori Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.kategori_pengadaan || selectedRow.jenis_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Status Pelaksanaan:</span>
              <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">
                {{ selectedRow.status_nontender_pct_ket || selectedRow.status_nontender_pct || selectedRow.status_nontender || '-' }}
              </span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Tanggal Mulai:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_mulai_nontender) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Tanggal Selesai:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_selesai_nontender) }}</span>
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
          
          <!-- Satker -->
          <div class="space-y-2 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Satuan Kerja</div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Satker:</span>
              <span class="font-semibold text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Kode Satker:</span>
              <span class="font-mono text-right ml-4">{{ selectedRow.kd_satker || '-' }}</span>
            </div>
            <div v-if="selectedRow.satker_jenis || selectedRow.satker_status" class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jenis / Status Satker:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.satker_jenis || '-' }} / {{ selectedRow.satker_status || '-' }}</span>
            </div>
          </div>

          <!-- PPK -->
          <div class="space-y-2 text-xs pt-1">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))] flex items-center justify-between">
              <span>Pejabat Pembuat Komitmen (PPK)</span>
              <span v-if="selectedRow._ppk_completed" class="text-green-600 dark:text-green-400 font-normal">✓ Lengkap</span>
              <span v-else class="text-amber-600 dark:text-amber-400 font-normal">⚠️ Belum Lengkap</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama PPK:</span>
              <span class="font-bold text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">NIP PPK:</span>
              <span class="font-mono text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jabatan PPK:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.ppk_jabatan || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Kontak:</span>
              <span class="font-medium text-right ml-4">{{ [selectedRow.ppk_email, selectedRow.ppk_telepon].filter(Boolean).join(' / ') || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Perencanaan (RUP) -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Detail Perencanaan (RUP)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Pagu RUP Awal:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 text-right ml-4">{{ selectedRow.rup_pagu ? formatRupiah(selectedRow.rup_pagu) : '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Metode (RUP):</span>
            <span class="font-semibold text-right ml-4">{{ selectedRow.rup_metode_pengadaan || selectedRow.mtd_pemilihan || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Status PDN:</span>
            <span class="font-medium text-right ml-4 text-blue-600 dark:text-blue-400">{{ selectedRow.rup_status_pdn || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Status UKM:</span>
            <span class="font-medium text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ selectedRow.rup_status_ukm || '-' }}</span>
          </div>
          <div v-if="selectedRow.rup_nama_paket" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1 col-span-1 md:col-span-2">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket RUP:</span>
            <span class="font-medium text-right ml-4">{{ selectedRow.rup_nama_paket }}</span>
          </div>
        </div>
      </div>

      <!-- Daftar Bukti Realisasi -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Daftar Bukti Realisasi Non-Tender</span>
          </div>
          <span class="px-2 py-0.5 text-[10px] rounded font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {{ selectedRow.realisasi_list?.length || 0 }} Bukti Realisasi
          </span>
        </h3>

        <div v-if="selectedRow.realisasi_list && selectedRow.realisasi_list.length > 0" class="overflow-x-auto">
          <table class="w-full text-xs text-left border border-[color:hsl(var(--maz-border))]">
            <thead class="bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-muted))] uppercase text-[10px]">
              <tr>
                <th class="p-2 border-b border-r text-center w-8">No</th>
                <th class="p-2 border-b border-r">Jenis & No. Bukti</th>
                <th class="p-2 border-b border-r">Tanggal</th>
                <th class="p-2 border-b border-r">Nama Penyedia</th>
                <th class="p-2 border-b border-r">Keterangan</th>
                <th class="p-2 border-b text-right">Nilai Realisasi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <tr v-for="(real, rIdx) in selectedRow.realisasi_list" :key="rIdx">
                <td class="p-2 border-r text-center font-medium">{{ rIdx + 1 }}</td>
                <td class="p-2 border-r">
                  <div class="font-semibold text-[color:hsl(var(--maz-primary))]">{{ real.jenis_realisasi || 'Bukti' }}</div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] font-mono">{{ real.no_realisasi || '-' }}</div>
                </td>
                <td class="p-2 border-r whitespace-nowrap">{{ formatDate(real.tgl_realisasi) }}</td>
                <td class="p-2 border-r">
                  <div class="font-medium text-[color:hsl(var(--maz-primary))]">{{ real.penyedia_detail?.nama_penyedia || real.nama_penyedia || '-' }}</div>
                  <div v-if="real.penyedia_detail" class="mt-1 flex flex-wrap gap-1">
                    <span class="text-[9px] font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" title="NPWP">
                      {{ real.penyedia_detail.npwp || '-' }}
                    </span>
                    <span v-if="real.penyedia_detail.status_umkk !== undefined" class="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-1 py-0.5 rounded">
                      {{ real.penyedia_detail.status_umkk === 1 ? 'UMKK' : 'Non-UMKK' }}
                    </span>
                  </div>
                </td>
                <td class="p-2 border-r text-[10px] text-[color:hsl(var(--maz-muted))] max-w-[200px] italic">{{ real.ket_realisasi || '-' }}</td>
                <td class="p-2 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{{ formatRupiah(real.nilai_realisasi) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic p-2">Belum ada rincian bukti realisasi yang dicatat untuk paket ini.</p>
      </div>

    </div>
    
    <template #footer>
      <div class="w-full flex justify-end">
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

const formatRupiah = (number) => {
  if (number === null || number === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
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
</script>
