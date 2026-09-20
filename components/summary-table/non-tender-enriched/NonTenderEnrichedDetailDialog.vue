<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="`Detail Non-Tender: ${selectedRow?.kd_nontender || ''}`" max-width="1000px">
    <div v-if="selectedRow" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
      
      <!-- Summary Financial Bar (4 Cards Top) -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider text-[10px]">Pagu (Sirup)</span>
          <span class="text-base font-bold text-[color:hsl(var(--maz-primary))] mt-1">
            {{ selectedRow.rup_pagu ? formatRupiah(selectedRow.rup_pagu) : 'Rp 0' }}
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col justify-between">
          <span class="text-xs text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider text-[10px]">HPS (Non-Tender)</span>
          <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {{ formatRupiah(selectedRow.hps) }}
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider text-[10px]">Selisih Pagu & HPS</span>
          <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))] mt-1">
            {{ formatRupiah(Math.abs((selectedRow.rup_pagu || 0) - (selectedRow.hps || 0))) }}
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between">
          <span class="text-xs text-blue-700 dark:text-blue-400 font-medium uppercase tracking-wider text-[10px]">Status Integrasi RUP</span>
          <span class="text-base font-bold text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
            <span v-if="selectedRow._rup_matched" class="text-green-600 dark:text-green-400">✓ Ditemukan</span>
            <span v-else class="text-red-600 dark:text-red-400">✗ Tidak Ada</span>
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
            Informasi Paket Non-Tender
          </h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket:</span>
              <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">ID Non-Tender / RUP:</span>
              <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_nontender || '-' }} / {{ selectedRow.kd_rup || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Metode Pemilihan:</span>
              <span class="font-semibold text-right ml-4">{{ selectedRow.mtd_pemilihan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jenis Pengadaan:</span>
              <span class="font-medium text-right ml-4">{{ selectedRow.jenis_pengadaan || '-' }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Status LPSE:</span>
              <span class="font-bold text-right ml-4" :class="{
                'text-[#8cc63f]': selectedRow.status_nontender === 'Selesai',
                'text-[#fbbd08]': selectedRow.status_nontender === 'Berlangsung',
                'text-[#17a2b8]': ['Pending', 'Persiapan', 'Draft', 'Belum Mulai'].includes(selectedRow.status_nontender)
              }">
                {{ selectedRow.status_nontender || '-' }}
              </span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Tanggal Buat:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_buat_paket) }}</span>
            </div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Link LPSE:</span>
              <span class="font-medium text-right ml-4">
                <a v-if="selectedRow.url_lpse" :href="selectedRow.url_lpse" target="_blank" class="text-blue-500 hover:underline">Buka LPSE</a>
                <span v-else>-</span>
              </span>
            </div>
            <div v-if="selectedRow.alasan_pembatalan" class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-destructive))] font-semibold shrink-0">Alasan Batal:</span>
              <span class="font-medium text-[color:hsl(var(--maz-destructive))] text-right ml-4">{{ selectedRow.alasan_pembatalan }}</span>
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
              <span class="font-bold text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nip_nama_ppk || '-' }}</span>
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
              <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Email / Telp:</span>
              <span class="font-medium text-right ml-4">{{ [selectedRow.ppk_email, selectedRow.ppk_telepon].filter(Boolean).join(' / ') || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Perencanaan (RUP) -->
      <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Detail Perencanaan (RUP Sirup)</span>
          </div>
          <span v-if="selectedRow.rup_status_aktif" class="px-2 py-0.5 text-[10px] rounded font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            RUP Aktif
          </span>
          <span v-else-if="selectedRow._rup_matched && !selectedRow.rup_status_aktif" class="px-2 py-0.5 text-[10px] rounded font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            RUP Tidak Aktif
          </span>
        </h3>
        
        <div v-if="selectedRow._rup_matched" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Pagu RUP Awal:</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400 text-right ml-4">{{ formatRupiah(selectedRow.rup_pagu) }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Metode (RUP):</span>
            <span class="font-semibold text-right ml-4">{{ selectedRow.rup_metode_pengadaan || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Jenis Pengadaan (RUP):</span>
            <span class="font-semibold text-right ml-4">{{ selectedRow.rup_jenis_pengadaan || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Produk Dalam Negeri (PDN):</span>
            <span class="font-medium text-right ml-4 text-blue-600 dark:text-blue-400">{{ selectedRow.rup_status_pdn || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Usaha Kecil/Mikro (UKM):</span>
            <span class="font-medium text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ selectedRow.rup_status_ukm || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Mulai Pemilihan:</span>
            <span class="font-medium text-right ml-4">{{ selectedRow.rup_tgl_awal_pemilihan || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Akhir Kontrak:</span>
            <span class="font-medium text-right ml-4">{{ selectedRow.rup_tgl_akhir_kontrak ? selectedRow.rup_tgl_akhir_kontrak.substring(0, 10) : '-' }}</span>
          </div>
          <div v-if="selectedRow.rup_nama_paket" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1 col-span-1 md:col-span-2 mt-1">
            <span class="text-[color:hsl(var(--maz-muted))] shrink-0">Nama Paket RUP:</span>
            <span class="font-medium text-right ml-4">{{ selectedRow.rup_nama_paket }}</span>
          </div>
          
          <!-- History Kaji Ulang -->
          <div v-if="selectedRow._has_kaji_ulang" class="col-span-1 md:col-span-2 mt-3 p-3 rounded border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10">
            <div class="font-semibold text-amber-700 dark:text-amber-500 mb-1 flex items-center gap-1">
              ⚠️ Paket ini mengalami revisi kaji ulang
            </div>
            <div class="flex justify-between pb-1">
              <span class="text-amber-700/80 dark:text-amber-500/80 shrink-0">Jumlah Kaji Ulang:</span>
              <span class="font-bold text-amber-800 dark:text-amber-400">{{ selectedRow.kaji_ulang_count }} Kali</span>
            </div>
            <div class="flex justify-between pb-1">
              <span class="text-amber-700/80 dark:text-amber-500/80 shrink-0">Revisi Terakhir:</span>
              <span class="font-medium text-amber-800 dark:text-amber-400">{{ selectedRow.kaji_ulang_jenis_revisi }}</span>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic p-4 text-center border border-dashed border-[color:hsl(var(--maz-border))] rounded-lg">
          Data RUP tidak ditemukan. ID RUP ({{ selectedRow.kd_rup }}) tidak ada di data tarik Sirup, kemungkinan belum ditarik dari Sirup atau dihapus.
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
