<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Detail Realisasi Pengadaan" max-width="1000px">
    <div v-if="selectedItem" class="space-y-6 pr-1 text-sm max-h-[75vh] overflow-y-auto">
      
      <!-- Top Grid: Total Values -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider text-[10px]">Total Nilai</span>
          <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))] mt-1">{{ formatRupiah(selectedItem.total_nilai) }}</span>
        </div>
        <div class="p-3.5 rounded-lg border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-900/10 flex flex-col justify-between">
          <span class="text-xs text-teal-700 dark:text-teal-400 font-medium uppercase tracking-wider text-[10px]">Nilai PDN</span>
          <span class="text-base font-bold text-teal-600 dark:text-teal-400 mt-1">{{ formatRupiah(selectedItem.nilai_pdn) }}</span>
        </div>
        <div class="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10 flex flex-col justify-between">
          <span class="text-xs text-purple-700 dark:text-purple-400 font-medium uppercase tracking-wider text-[10px]">Nilai UMK</span>
          <span class="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">{{ formatRupiah(selectedItem.nilai_umk) }}</span>
        </div>
      </div>

      <!-- Main Info Grids -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Card Informasi Paket & RUP -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Informasi Paket
          </h3>
          
          <!-- Sub Section Identitas Paket -->
          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Identitas Paket</div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama Paket:</span>
              <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedItem.nama_paket || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Kode Paket:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedItem.kode_paket || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Kode RUP:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedItem.kode_rup || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Tahun Anggaran:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.tahun_anggaran || '-' }}</span>
            </div>
          </div>

          <!-- Sub Section Pengadaan -->
          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Detail Pengadaan</div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Jenis Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.jenis_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Metode Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.metode_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Tahapan Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.tahapan_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Paket:</span>
              <span class="font-medium text-right ml-4">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold" 
                      :class="selectedItem.status_paket === 'Selesai' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'">
                  {{ selectedItem.status_paket || '-' }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Card Pihak & Pelaksanaan -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Pihak & Pelaksanaan
          </h3>
          
          <!-- Sub Section Instansi & Satker -->
          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Organisasi</div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama Instansi:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.nama_instansi || namaInstansi || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Satuan Kerja:</span>
              <span class="font-medium text-right ml-4 truncate" :title="selectedItem.nama_satuan_kerja || '-'">{{ selectedItem.nama_satuan_kerja || '-' }}</span>
            </div>
            <div class="flex justify-between mt-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Sumber Dana:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.sumber_dana || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Sumber Transaksi:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.sumber_transaksi || '-' }}</span>
            </div>
          </div>

          <!-- Sub Section Pelaksana -->
          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Aktor Pelaksana</div>
            <div class="flex justify-between items-start">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400 text-right ml-4">{{ selectedItem.nama_ppk || '-' }}</span>
            </div>
            <div class="flex justify-between items-start">
              <span class="text-[color:hsl(var(--maz-muted))]">Penyedia:</span>
              <span class="font-bold text-[color:hsl(var(--maz-primary))] text-right ml-4">{{ selectedItem.nama_penyedia || '-' }}</span>
            </div>
          </div>
        </div>
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
  selectedItem: {
    type: Object,
    default: () => null
  },
  namaInstansi: {
    type: String,
    default: ''
  }
});

defineEmits(['update:modelValue']);

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};
</script>
