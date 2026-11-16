<template>
  <MazDialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Detail Kinerja & Pengadaan PPK"
    max-width="1050px"
  >
    <div v-if="selectedPpk" class="space-y-6 pr-1 text-sm max-h-[75vh] overflow-y-auto">
      <!-- Top Grid: Total Values (Matches RealisasiPrivateDetailDialog) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-3.5 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-col justify-between">
          <span class="text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider text-[10px]">Total Realisasi (Kontrak + Selesai)</span>
          <span class="text-base font-bold text-[color:hsl(var(--maz-foreground))] mt-1">{{ formatRupiah(selectedPpk.total_nilai_realisasi) }}</span>
          <span class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5">
            Serapan: <strong class="text-emerald-600 dark:text-emerald-400">{{ selectedPpk.persentase_serapan || 0 }}%</strong> dari Pagu Terumumkan
          </span>
        </div>
        <div class="p-3.5 rounded-lg border border-teal-200 dark:border-teal-900/40 bg-teal-50/50 dark:bg-teal-900/10 flex flex-col justify-between">
          <span class="text-teal-700 dark:text-teal-400 font-medium uppercase tracking-wider text-[10px]">Total Nilai PDN</span>
          <span class="text-base font-bold text-teal-600 dark:text-teal-400 mt-1">{{ formatRupiah(selectedPpk.nilai_pdn) }}</span>
          <span class="text-[11px] text-teal-700/80 dark:text-teal-400/80 mt-0.5">Produk Dalam Negeri</span>
        </div>
        <div class="p-3.5 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-900/10 flex flex-col justify-between">
          <span class="text-purple-700 dark:text-purple-400 font-medium uppercase tracking-wider text-[10px]">Total Nilai UMK</span>
          <span class="text-base font-bold text-purple-600 dark:text-purple-400 mt-1">{{ formatRupiah(selectedPpk.nilai_umk) }}</span>
          <span class="text-[11px] text-purple-700/80 dark:text-purple-400/80 mt-0.5">Usaha Mikro, Kecil &amp; Koperasi</span>
        </div>
      </div>

      <!-- Main Info Grids -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Card Identitas & RUP -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Identitas &amp; Kuota RUP PPK
          </h3>

          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Profil Pejabat</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span>
              <span class="font-semibold text-right text-emerald-600 dark:text-emerald-400">{{ selectedPpk.nama || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">NIP Asli:</span>
              <span class="font-mono font-medium text-right">{{ selectedPpk.nip_asli || '-' }}</span>
            </div>
            <div v-if="selectedPpk.jabatan" class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Jabatan / Unit:</span>
              <span class="font-medium text-right">{{ [selectedPpk.jabatan, selectedPpk.unit_kerja].filter(Boolean).join(' • ') }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Satuan Kerja:</span>
              <span class="font-medium text-right truncate max-w-[240px]" :title="selectedPpk.nama_satuan_kerja">{{ selectedPpk.nama_satuan_kerja || '-' }}</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Rekap RUP</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">RUP Terumumkan:</span>
              <span class="font-semibold text-right">{{ selectedPpk.total_rup_terumumkan_paket || 0 }} pkt ({{ formatRupiah(selectedPpk.total_rup_terumumkan_nilai) }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">RUP Terealisasi (Acuan):</span>
              <span class="font-semibold text-right text-blue-600 dark:text-blue-400">{{ selectedPpk.paket_rup || 0 }} pkt ({{ formatRupiah(selectedPpk.nilai_rup) }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">RUP Belum Jalan:</span>
              <span class="font-semibold text-right text-amber-600 dark:text-amber-400">{{ selectedPpk.rup_belum_jalan_paket || 0 }} pkt ({{ formatRupiah(selectedPpk.rup_belum_jalan_nilai) }})</span>
            </div>
          </div>
        </div>

        <!-- Card Ringkasan Tahapan -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-3">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ringkasan Tahapan Pelaksanaan
          </h3>

          <div class="space-y-1.5 text-xs pb-2 border-b border-[color:hsl(var(--maz-border))]">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Distribusi Paket ({{ selectedPpk.total_kode_paket || 0 }} Paket)</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Pemilihan Berlangsung:</span>
              <span class="font-medium text-right text-amber-600 dark:text-amber-400">{{ selectedPpk.paket_pemilihan_berlangsung || 0 }} pkt ({{ formatRupiah(selectedPpk.nilai_pemilihan_berlangsung) }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Pemilihan Selesai:</span>
              <span class="font-medium text-right text-sky-600 dark:text-sky-400">{{ selectedPpk.paket_pemilihan_selesai || 0 }} pkt ({{ formatRupiah(selectedPpk.nilai_pemilihan_selesai) }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Kontrak Berjalan:</span>
              <span class="font-semibold text-right text-indigo-600 dark:text-indigo-400">{{ selectedPpk.paket_kontrak || 0 }} pkt ({{ formatRupiah(selectedPpk.nilai_kontrak) }})</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Paket Selesai:</span>
              <span class="font-semibold text-right text-emerald-600 dark:text-emerald-400">{{ selectedPpk.paket_selesai || 0 }} pkt ({{ formatRupiah(selectedPpk.nilai_selesai) }})</span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs pt-1">
            <div class="font-bold uppercase text-[10px] tracking-wider text-[color:hsl(var(--maz-muted))]">Statistik Tambahan</div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Total Penyedia Unik:</span>
              <span class="font-semibold text-right">{{ selectedPpk.penyedia_count || 0 }} penyedia</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-[color:hsl(var(--maz-muted))]">Riwayat Kaji Ulang RUP:</span>
              <span class="font-semibold text-right">{{ selectedPpk.kaji_ulang_count || 0 }} kali</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inner Tabs (Underline style matching realisasi-pengadaan) -->
      <div class="flex gap-4 pb-2 border-b border-[color:hsl(var(--maz-border))]">
        <button
          type="button"
          class="pb-2 px-3 text-xs font-semibold transition-colors border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
          :class="activeTab === 'paket' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
          @click="activeTab = 'paket'"
        >
          Daftar Paket ({{ packetList.length }})
        </button>
        <button
          type="button"
          class="pb-2 px-3 text-xs font-semibold transition-colors border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
          :class="activeTab === 'rup' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
          @click="activeTab = 'rup'"
        >
          Daftar RUP ({{ rupList.length }})
        </button>
        <button
          type="button"
          class="pb-2 px-3 text-xs font-semibold transition-colors border-0 border-b-2 bg-transparent cursor-pointer focus:outline-none"
          :class="activeTab === 'codes' ? 'border-[color:hsl(var(--maz-primary))] text-[color:hsl(var(--maz-primary))]' : 'border-transparent text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))]'"
          @click="activeTab = 'codes'"
        >
          Salin Kode RUP &amp; Paket
        </button>
      </div>

      <!-- Tab 1: Daftar Paket -->
      <div v-if="activeTab === 'paket'" class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <MazInput
            v-model="paketSearch"
            placeholder="Cari kode paket, kode RUP, nama paket, penyedia..."
            size="sm"
            clearable
            class="w-full sm:w-80"
          />
          <MazSelect
            v-model="paketTahapanFilter"
            :options="paketTahapanOptions"
            size="sm"
            class="w-full sm:w-56"
          />
        </div>

        <div class="overflow-x-auto max-h-[340px] border border-[color:hsl(var(--maz-border))] rounded-lg">
          <table class="w-full text-xs text-left">
            <thead class="sticky top-0 bg-[color:hsl(var(--maz-background))] border-b border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-muted))] uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th class="p-3">Kode Paket / RUP</th>
                <th class="p-3">Nama Paket</th>
                <th class="p-3">Pelaksanaan</th>
                <th class="p-3">Penyedia</th>
                <th class="p-3">Tahapan</th>
                <th class="p-3 text-right">Nilai Transaksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-if="filteredPakets.length === 0">
                <td colspan="6" class="p-6 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada paket ditemukan.</td>
              </tr>
              <tr v-for="(pkt, idx) in filteredPakets" :key="`${pkt.kode_paket}-${idx}`" class="hover:bg-[color:hsl(var(--maz-foreground)_/_2%)]">
                <td class="p-3 align-top whitespace-nowrap">
                  <div class="font-mono font-semibold text-[color:hsl(var(--maz-foreground))]">{{ pkt.kode_paket }}</div>
                  <div class="font-mono text-[10px] text-[color:hsl(var(--maz-muted))]">RUP: {{ pkt.kode_rup || '-' }}</div>
                </td>
                <td class="p-3 align-top min-w-[220px]">
                  <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ pkt.nama_paket }}</div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">{{ pkt.jenis_pengadaan }}</div>
                </td>
                <td class="p-3 align-top whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {{ pkt.sumber_transaksi }}
                  </span>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">{{ pkt.metode_pengadaan }}</div>
                </td>
                <td class="p-3 align-top min-w-[150px]">
                  <div class="font-semibold text-[color:hsl(var(--maz-primary))]">{{ pkt.nama_penyedia || '-' }}</div>
                </td>
                <td class="p-3 align-top whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold" :class="tahapanBadgeClass(pkt.tahapan_rekap)">
                    {{ tahapanLabel(pkt.tahapan_rekap) }}
                  </span>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">{{ pkt.tahapan_pengadaan }}</div>
                </td>
                <td class="p-3 align-top text-right whitespace-nowrap">
                  <div class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(pkt.total_nilai) }}</div>
                  <div v-if="pkt.nilai_pdn > 0 || pkt.nilai_umk > 0" class="text-[10px] text-[color:hsl(var(--maz-muted))]">
                    <span class="text-teal-600 dark:text-teal-400">PDN: {{ formatCompact(pkt.nilai_pdn) }}</span> •
                    <span class="text-purple-600 dark:text-purple-400">UMK: {{ formatCompact(pkt.nilai_umk) }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Daftar RUP -->
      <div v-else-if="activeTab === 'rup'" class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <MazInput
            v-model="rupSearch"
            placeholder="Cari kode RUP atau nama paket..."
            size="sm"
            clearable
            class="w-full sm:w-80"
          />
          <MazSelect
            v-model="rupStatusFilter"
            :options="rupStatusOptions"
            size="sm"
            class="w-full sm:w-56"
          />
        </div>

        <div class="overflow-x-auto max-h-[340px] border border-[color:hsl(var(--maz-border))] rounded-lg">
          <table class="w-full text-xs text-left">
            <thead class="sticky top-0 bg-[color:hsl(var(--maz-background))] border-b border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-muted))] uppercase text-[10px] tracking-wider z-10">
              <tr>
                <th class="p-3">Kode RUP</th>
                <th class="p-3">Nama Paket &amp; Metode</th>
                <th class="p-3">Status Umumkan</th>
                <th class="p-3 text-right">Pagu RUP</th>
                <th class="p-3 text-right">Realisasi Transaksi</th>
                <th class="p-3 text-center">Kaji Ulang</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-if="filteredRups.length === 0">
                <td colspan="6" class="p-6 text-center text-[color:hsl(var(--maz-muted))]">Tidak ada RUP ditemukan.</td>
              </tr>
              <tr v-for="r in filteredRups" :key="r.kd_rup" class="hover:bg-[color:hsl(var(--maz-foreground)_/_2%)]">
                <td class="p-3 align-top whitespace-nowrap">
                  <div class="font-mono font-semibold text-[color:hsl(var(--maz-foreground))]">{{ r.kd_rup }}</div>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[color:hsl(var(--maz-muted))]">{{ r.tipe_paket }}</span>
                </td>
                <td class="p-3 align-top min-w-[240px]">
                  <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ r.nama_paket }}</div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))]">{{ r.metode_pengadaan }} • {{ r.jenis_pengadaan }}</div>
                </td>
                <td class="p-3 align-top whitespace-nowrap">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-semibold"
                    :class="r.is_terumumkan_aktif ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                  >
                    {{ r.status_umumkan_rup }} {{ r.status_aktif_rup ? '(Aktif)' : '(Non-Aktif)' }}
                  </span>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-0.5">PDN: {{ r.status_pdn }} • UKM: {{ r.status_ukm }}</div>
                </td>
                <td class="p-3 align-top text-right whitespace-nowrap font-semibold">
                  {{ formatRupiah(r.pagu) }}
                </td>
                <td class="p-3 align-top text-right whitespace-nowrap">
                  <div v-if="r.transaksi_count > 0" class="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {{ r.transaksi_count }} pkt ({{ formatRupiah(r.transaksi_nilai) }})
                  </div>
                  <span v-else class="text-amber-600 dark:text-amber-400 font-medium">Belum ada transaksi</span>
                </td>
                <td class="p-3 align-top text-center">
                  <span v-if="r.kaji_ulang_count > 0" class="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                    {{ r.kaji_ulang_count }}x
                  </span>
                  <span v-else class="text-[color:hsl(var(--maz-muted))]">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Salin Kode -->
      <div v-else-if="activeTab === 'codes'" class="space-y-4">
        <div class="p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))]">
              Daftar Kode RUP Terealisasi ({{ selectedPpk.paket_rup || 0 }} kode)
            </div>
            <MazBtn size="xs" color="primary" outline @click="copyText(selectedPpk.list_kode_rup, 'rup')">
              {{ copiedTarget === 'rup' ? 'Tersalin!' : 'Salin Kode RUP' }}
            </MazBtn>
          </div>
          <textarea
            readonly
            rows="3"
            class="w-full p-2.5 text-xs font-mono rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] text-[color:hsl(var(--maz-foreground))]"
            :value="selectedPpk.list_kode_rup || '-'"
          />
        </div>

        <div class="p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-xs font-semibold text-[color:hsl(var(--maz-foreground))]">
              Daftar Kode Paket Transaksi ({{ selectedPpk.total_kode_paket || 0 }} kode)
            </div>
            <MazBtn size="xs" color="primary" outline @click="copyText(selectedPpk.list_kode_paket, 'paket')">
              {{ copiedTarget === 'paket' ? 'Tersalin!' : 'Salin Kode Paket' }}
            </MazBtn>
          </div>
          <textarea
            readonly
            rows="4"
            class="w-full p-2.5 text-xs font-mono rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] text-[color:hsl(var(--maz-foreground))]"
            :value="selectedPpk.list_kode_paket || '-'"
          />
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  selectedPpk: any | null;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const activeTab = ref<'paket' | 'rup' | 'codes'>('paket');
const paketSearch = ref('');
const paketTahapanFilter = ref('ALL');
const rupSearch = ref('');
const rupStatusFilter = ref('ALL');
const copiedTarget = ref<string | null>(null);

const paketTahapanOptions = [
  { label: 'Semua Tahapan', value: 'ALL' },
  { label: 'Pemilihan Berlangsung', value: 'pemilihan_berlangsung' },
  { label: 'Pemilihan Selesai', value: 'pemilihan_selesai' },
  { label: 'Kontrak', value: 'kontrak' },
  { label: 'Selesai', value: 'selesai' }
];

const rupStatusOptions = [
  { label: 'Semua RUP', value: 'ALL' },
  { label: 'Sudah Ada Transaksi', value: 'TEREALISASI' },
  { label: 'Terumumkan Belum Jalan', value: 'BELUM_JALAN' },
  { label: 'Non-Aktif / Draft', value: 'NON_AKTIF' }
];

watch(
  () => props.selectedPpk,
  () => {
    activeTab.value = 'paket';
    paketSearch.value = '';
    paketTahapanFilter.value = 'ALL';
    rupSearch.value = '';
    rupStatusFilter.value = 'ALL';
  }
);

const packetList = computed<any[]>(() => props.selectedPpk?.detail_paket_list || []);
const rupList = computed<any[]>(() => props.selectedPpk?.detail_rup_list || []);

const filteredPakets = computed(() => {
  const q = paketSearch.value.trim().toLowerCase();
  return packetList.value.filter((p) => {
    if (paketTahapanFilter.value !== 'ALL' && p.tahapan_rekap !== paketTahapanFilter.value) {
      return false;
    }
    if (q) {
      const hay = `${p.kode_paket} ${p.kode_rup} ${p.nama_paket} ${p.nama_penyedia} ${p.sumber_transaksi}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});

const filteredRups = computed(() => {
  const q = rupSearch.value.trim().toLowerCase();
  return rupList.value.filter((r) => {
    if (rupStatusFilter.value === 'TEREALISASI' && !(r.transaksi_count > 0 && r.is_terumumkan_aktif)) {
      return false;
    }
    if (rupStatusFilter.value === 'BELUM_JALAN' && !(r.transaksi_count === 0 && r.is_terumumkan_aktif)) {
      return false;
    }
    if (rupStatusFilter.value === 'NON_AKTIF' && r.is_terumumkan_aktif) {
      return false;
    }
    if (q) {
      const hay = `${r.kd_rup} ${r.nama_paket} ${r.metode_pengadaan} ${r.jenis_pengadaan}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
});

const tahapanLabel = (t: string) => {
  switch (t) {
    case 'pemilihan_berlangsung':
      return 'Pemilihan Berlangsung';
    case 'pemilihan_selesai':
      return 'Pemilihan Selesai';
    case 'kontrak':
      return 'Kontrak';
    case 'selesai':
      return 'Selesai';
    default:
      return t;
  }
};

const tahapanBadgeClass = (t: string) => {
  switch (t) {
    case 'pemilihan_berlangsung':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'pemilihan_selesai':
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
    case 'kontrak':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'selesai':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
  }
};

const formatRupiah = (angka: number) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(angka);
};

const formatCompact = (val: number) => {
  const num = Number(val) || 0;
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(2)} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)} Jt`;
  return formatRupiah(num);
};

const copyText = async (text: string, target: string) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    copiedTarget.value = target;
    setTimeout(() => {
      if (copiedTarget.value === target) copiedTarget.value = null;
    }, 1500);
  } catch (err) {
    console.error('Copy failed', err);
  }
};
</script>
