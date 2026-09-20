<template>
  <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="`Detail E-Purchasing: ${selectedItem?.order_id}`" max-width="1000px" scrollable>
    <div v-if="selectedItem" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
      
      <!-- Banner RUP Match -->
      <div v-if="selectedItem._rup_matched" class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex gap-4">
        <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-teal-800 dark:text-teal-300">Terkoneksi dengan Master RUP Penyedia</h3>
          <p class="text-xs text-teal-600/80 dark:text-teal-400/80 mt-1">Order ini berhasil di-merge dengan Paket RUP <span class="font-mono font-bold">{{ selectedItem.rup_code }}</span>.</p>
        </div>
      </div>

      <!-- Grid Utama: Info Transaksi & Penyedia -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Card Informasi Transaksi -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Informasi Transaksi E-Purchasing
          </h3>
          
          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Identitas Pesanan</div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Order ID:</span>
              <span class="font-semibold text-right ml-4 font-mono text-[color:hsl(var(--maz-primary))]">{{ selectedItem.order_id || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Pesanan:</span>
              <span class="font-medium text-right ml-4">{{ formatDate(selectedItem.order_date) }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))] pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Status & Label</div>
            <div class="flex justify-between items-center">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Transaksi:</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                {{ selectedItem.status || '-' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[color:hsl(var(--maz-muted))]">Status Pengiriman:</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {{ selectedItem.shipment_status || '-' }}
              </span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[color:hsl(var(--maz-muted))]">Produk Lokal:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.flag_minikom || '-' }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Nilai Transaksi</div>
            <div class="flex justify-between items-center">
              <span class="text-[color:hsl(var(--maz-muted))]">Ongkos Kirim:</span>
              <span class="font-medium text-right ml-4">{{ formatRupiah(selectedItem.shipping_fee || 0) }}</span>
            </div>
            <div class="flex justify-between items-center bg-[color:hsl(var(--maz-foreground)_/_2%)] p-2 rounded mt-1">
              <span class="text-[color:hsl(var(--maz-muted))] font-bold">Total Pembelian:</span>
              <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400 text-sm">{{ formatRupiah(selectedItem.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Card Profil Penyedia -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Profil Penyedia
          </h3>
          
          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Perusahaan</div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama Penyedia:</span>
              <span class="font-bold text-right ml-4 text-purple-600 dark:text-purple-400">{{ selectedItem.penyedia_nama || 'Tidak diketahui' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">ID Penyedia:</span>
              <span class="font-mono text-right ml-4">{{ selectedItem.kode_penyedia || '-' }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold text-[color:hsl(var(--maz-foreground))] uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Legalitas & Kualifikasi</div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">NPWP:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.penyedia_npwp || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[color:hsl(var(--maz-muted))]">Status UMKM:</span>
              <span class="font-medium text-right ml-4">{{ selectedItem.penyedia_status_umkk || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Informasi PPK -->
      <div v-if="selectedItem.ppk_nama_lengkap || selectedItem.rup_nama_ppk" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
        <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Pejabat Pembuat Komitmen (PPK)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span>
            <span class="font-bold text-right ml-4">{{ selectedItem.ppk_nama_lengkap || selectedItem.rup_nama_ppk }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span>
            <span class="font-mono text-right ml-4">{{ selectedItem.ppk_nip_asli || selectedItem.rup_nip_ppk || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))]">Jabatan:</span>
            <span class="font-medium text-right ml-4">{{ selectedItem.ppk_jabatan || '-' }}</span>
          </div>
          <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
            <span class="text-[color:hsl(var(--maz-muted))]">Kontak:</span>
            <span class="font-medium text-right ml-4">{{ selectedItem.ppk_telepon || '-' }} / {{ selectedItem.ppk_email || '-' }}</span>
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
  }
});

defineEmits(['update:modelValue']);

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};
</script>
