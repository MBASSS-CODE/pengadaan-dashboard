<template>
  <ClientOnly>
    <div>
    <!-- Detail Modal Pencatatan Swakelola Enriched -->
    <MazDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="`Detail Pencatatan Swakelola: ${selectedRow?.kd_swakelola_pct || ''}`" max-width="1000px">
      <div v-if="selectedRow" class="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-sm">
        
        <!-- Summary Financial Bar (4 Cards Top) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
            <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium">Total Pagu Swakelola</span>
            <span class="text-base font-bold text-[color:hsl(var(--maz-primary))] mt-1">{{ formatRupiah(selectedRow.pagu) }}</span>
          </div>
          <div class="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10 flex flex-col justify-between">
            <span class="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Total Realisasi</span>
            <span class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ formatRupiah(selectedRow.total_realisasi) }}</span>
          </div>
          <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
            <span class="text-xs text-[color:hsl(var(--maz-muted))] font-medium">Sisa Pagu</span>
            <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))] mt-1">
              {{ formatRupiah((selectedRow.pagu || 0) - (selectedRow.total_realisasi || 0)) }}
            </span>
          </div>
          <div class="p-3.5 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-between">
            <span class="text-xs text-blue-700 dark:text-blue-400 font-medium">Capaian Realisasi</span>
            <span class="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
              {{ selectedRow.pagu ? ((selectedRow.total_realisasi / selectedRow.pagu) * 100).toFixed(1) : 0 }}%
            </span>
          </div>
        </div>

        <!-- Grid 1: Informasi Utama & Satker/PPK -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Card Informasi Swakelola -->
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Informasi Paket Swakelola
            </h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Nama Paket:</span>
                <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-primary))]">{{ selectedRow.nama_paket || '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">ID Pencatatan:</span>
                <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_swakelola_pct || '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Kode RUP:</span>
                <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_rup || '-' }}</span>
              </div>
              <div v-if="selectedRow.kd_pkt_dce" class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Kode DCE:</span>
                <span class="font-mono font-medium text-right ml-4">{{ selectedRow.kd_pkt_dce }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Tipe Swakelola:</span>
                <span class="font-semibold text-right ml-4">{{ selectedRow.tipe_swakelola_nama || 'Tipe ' + selectedRow.tipe_swakelola }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Status Swakelola:</span>
                <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">
                  {{ selectedRow.status_swakelola_pct_ket || selectedRow.status_swakelola_pct || '-' }}
                </span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Sumber Dana:</span>
                <span class="font-medium text-right ml-4">{{ selectedRow.sumber_dana || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[color:hsl(var(--maz-muted))]">Capaian PDN / UMK:</span>
                <div class="text-right ml-4 font-semibold">
                  <span class="text-blue-600 dark:text-blue-400">PDN: {{ selectedRow.nilai_pdn_pct || 0 }}%</span>
                  <span class="text-[color:hsl(var(--maz-muted))] mx-1">|</span>
                  <span class="text-emerald-600 dark:text-emerald-400">UMK: {{ selectedRow.nilai_umk_pct || 0 }}%</span>
                </div>
              </div>
              <div v-if="selectedRow.alasan_pembatalan" class="flex justify-between pt-1 text-red-600 dark:text-red-400">
                <span class="font-medium">Alasan Pembatalan:</span>
                <span class="text-right ml-4">{{ selectedRow.alasan_pembatalan }}</span>
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
            <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
              <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Satuan Kerja</div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Nama Satker:</span> <span class="font-semibold text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Kode Satker:</span> <span class="font-mono text-right ml-4">{{ selectedRow.kd_satker || selectedRow.kd_satker_str || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">K/L/PD:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_klpd || '-' }} ({{ selectedRow.kd_klpd || '-' }})</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Jenis / Status Satker:</span> <span class="font-medium text-right ml-4">{{ selectedRow.satker_jenis || '-' }} / {{ selectedRow.satker_status || '-' }}</span></div>
              <div v-if="selectedRow.satker_alamat" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Alamat Satker:</span> <span class="font-medium text-right ml-4">{{ selectedRow.satker_alamat }}</span></div>
            </div>

            <!-- PPK -->
            <div class="space-y-1.5 text-xs pt-1">
              <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))] flex items-center justify-between">
                <span>Pejabat Pembuat Komitmen (PPK)</span>
                <span v-if="selectedRow._ppk_completed" class="text-green-600 dark:text-green-400 font-normal">✓ Match Master</span>
                <span v-else class="text-amber-600 dark:text-amber-400 font-normal">⚠️ Masked</span>
              </div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span> <span class="font-bold text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span> <span class="font-mono text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span></div>
              <div v-if="selectedRow.ppk_jabatan" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Jabatan PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_jabatan }}</span></div>
              <div v-if="selectedRow.ppk_email || selectedRow.ppk_telepon" class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Kontak:</span> <span class="font-medium text-right ml-4">{{ [selectedRow.ppk_email, selectedRow.ppk_telepon].filter(Boolean).join(' / ') }}</span></div>
            </div>
          </div>
        </div>

        <!-- Grid 2: Timeline Pelaksanaan & Detail RUP Swakelola -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Card Jadwal & Timeline -->
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Jadwal & Waktu Pelaksanaan
            </h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Buat Paket:</span>
                <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_buat_paket) }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Mulai Paket:</span>
                <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_mulai_paket) }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Tanggal Selesai Paket:</span>
                <span class="font-medium text-right ml-4">{{ formatDate(selectedRow.tgl_selesai_paket) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[color:hsl(var(--maz-muted))]">Kode LPSE:</span>
                <span class="font-mono text-right ml-4">{{ selectedRow.kd_lpse || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- Card Detail RUP Induk -->
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Detail RUP Perencanaan (Swakelola)
            </h3>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Nama Paket RUP:</span>
                <span class="font-semibold text-right ml-4 text-[color:hsl(var(--maz-foreground))]">{{ selectedRow.rup_nama_paket || selectedRow.nama_paket || '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Pagu RUP Awal:</span>
                <span class="font-bold text-right ml-4 text-emerald-600 dark:text-emerald-400">{{ selectedRow.rup_pagu ? formatRupiah(selectedRow.rup_pagu) : '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1">
                <span class="text-[color:hsl(var(--maz-muted))]">Status Aktif RUP:</span>
                <div class="flex gap-1 ml-4 justify-end flex-wrap">
                  <span v-if="selectedRow.rup_status_aktif" class="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-semibold">Aktif</span>
                  <span v-else class="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">Non-Aktif</span>
                </div>
              </div>
              <div class="flex justify-between">
                <span class="text-[color:hsl(var(--maz-muted))]">Sasaran Swakelola:</span>
                <span class="font-medium text-right ml-4 line-clamp-2" :title="selectedRow.rup_sasaran">{{ selectedRow.rup_sasaran || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Uraian Pekerjaan -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Uraian Pekerjaan
          </h3>
          <div class="text-xs">
            <div class="p-3 bg-[color:hsl(var(--maz-background))] rounded border border-[color:hsl(var(--maz-border))] max-h-48 overflow-y-auto text-[color:hsl(var(--maz-foreground))]">
              <ul v-if="selectedRow.uraian_pekerjaan" class="space-y-2">
                <li v-for="(item, i) in formatTextToList(selectedRow.uraian_pekerjaan)" :key="i" class="flex items-start gap-2">
                  <span class="text-[color:hsl(var(--maz-primary))] mt-0.5 text-[10px]">●</span>
                  <span class="leading-relaxed" v-html="item"></span>
                </li>
              </ul>
              <div v-else class="italic text-[color:hsl(var(--maz-muted))]">Tidak ada data uraian pekerjaan.</div>
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
              <span>Daftar Bukti Realisasi Swakelola</span>
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
                  <th class="p-2 border-b border-r">Pelaksana / Penyedia</th>
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
                    <div class="font-medium">{{ real.nama_penyedia || real.nama_pelaksana || '-' }}</div>
                    <div v-if="real.npwp_pelaksana" class="text-[10px] text-[color:hsl(var(--maz-muted))] font-mono">NPWP: {{ real.npwp_pelaksana }}</div>
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
    </div>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedRow: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

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

const formatTextToList = (text) => {
  if (!text) return [];
  // if text contains html tags, don't split by \n, just return as single item
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return [text];
  }
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*•]\s*/, ''));
};
</script>
