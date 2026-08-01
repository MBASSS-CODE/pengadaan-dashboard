<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">RUP Swakelola Enriched</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Data master RUP Swakelola yang diperkaya dengan data pendukung</p>
      </div>
      <div class="flex items-center gap-3 bg-[color:hsl(var(--maz-background))] p-2 rounded-lg border border-[color:hsl(var(--maz-border))] shadow-sm">
        <span class="text-sm font-medium text-[color:hsl(var(--maz-muted))] whitespace-nowrap pl-2">Tahun Anggaran:</span>
        <MazSelect
          v-model="selectedYear"
          :options="availableYears"
          size="sm"
          class="w-32"
        />
      </div>
    </div>

    <!-- Data Table Area -->
    <div class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded-xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)] flex flex-wrap gap-4 justify-between items-center">
        <div class="flex items-center gap-3">
          <MazInput
            v-model="searchQuery"
            placeholder="Cari RUP / Nama Paket / Satker..."
            left-icon="magnifying-glass"
            size="sm"
            class="w-64"
            @input="onSearch"
          />
        </div>
        <div class="text-sm font-medium text-[color:hsl(var(--maz-muted))]">
          Total: <span class="text-[color:hsl(var(--maz-foreground))]">{{ totalItems }}</span> Data
        </div>
      </div>

      <div class="flex-1 overflow-auto relative">
        <div v-if="loading" class="absolute inset-0 bg-[color:hsl(var(--maz-background)_/_50%)] flex items-center justify-center z-10 backdrop-blur-sm">
          <MazSpinner color="primary" />
        </div>

        <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] border-collapse">
          <thead class="sticky top-0 bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] text-xs uppercase shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] w-16 text-center">No</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Identitas Paket</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Satker & PPK</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Anggaran</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
              <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] w-24 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
            <tr v-if="error" class="text-center">
              <td colspan="6" class="py-12 text-red-500">{{ errorMessage }}</td>
            </tr>
            <tr v-else-if="pageData.length === 0 && !loading" class="text-center">
              <td colspan="6" class="py-12 text-[color:hsl(var(--maz-muted))]">Data tidak ditemukan.</td>
            </tr>
            <tr v-else v-for="(row, idx) in pageData" :key="row.kd_rup" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
              <td class="px-4 py-3 text-center">{{ (currentPage - 1) * itemsPerPage + idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="font-bold text-[color:hsl(var(--maz-primary))]">{{ row.nama_paket || '-' }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">RUP: {{ row.kd_rup }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium">{{ row.nama_satker || '-' }}</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1 truncate max-w-[200px]" :title="row.ppk_nama_lengkap || row.nama_ppk">
                  PPK: {{ row.ppk_nama_lengkap || row.nama_ppk || '-' }}
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ formatRupiah(row.pagu) }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-1">
                  <span v-if="row._has_pelaksanaan" class="px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700 w-fit">Tercatat</span>
                  <span v-else class="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700 w-fit">Belum Tercatat</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <MazBtn size="mini" color="info" outline @click="openDetail(row)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </MazBtn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex justify-between items-center">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Hal {{ currentPage }} dari {{ Math.ceil(totalItems / itemsPerPage) || 1 }}
        </div>
        <div class="flex gap-2">
          <MazBtn size="sm" outline :disabled="currentPage === 1 || loading" @click="currentPage--; loadData()">Sebelumnya</MazBtn>
          <MazBtn size="sm" outline :disabled="currentPage >= Math.ceil(totalItems / itemsPerPage) || loading" @click="currentPage++; loadData()">Selanjutnya</MazBtn>
        </div>
      </div>
    </div>

    <!-- Detail Dialog -->
    <MazDialog v-model="isDetailOpen" :title="`Detail RUP Swakelola: ${selectedRow?.kd_rup || ''}`" max-width="900px">
      <div v-if="selectedRow" class="space-y-6">
        <!-- Info Utama -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3">Informasi Paket</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Paket:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_paket || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tipe Swakelola:</span> <span class="font-medium text-right ml-4">{{ selectedRow.tipe_swakelola || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Total Pagu:</span> <span class="font-medium text-right ml-4">{{ formatRupiah(selectedRow.pagu) }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Umumkan:</span> <span class="font-medium text-right ml-4">{{ selectedRow.status_umumkan_rup || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">Status Aktif:</span> <span class="font-medium text-right ml-4">{{ selectedRow.status_aktif_rup ? 'Aktif' : 'Tidak Aktif' }}</span></div>
            </div>
          </div>
          <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
            <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3">Satuan Kerja & PPK</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama Satker:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_satker || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">K/L/PD:</span> <span class="font-medium text-right ml-4">{{ selectedRow.nama_klpd || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Lokasi:</span> <span class="font-medium text-right ml-4">{{ selectedRow.lokasi || '-' }}</span></div>
              <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Nama PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_nama_lengkap || selectedRow.nama_ppk || '-' }}</span></div>
              <div class="flex justify-between"><span class="text-[color:hsl(var(--maz-muted))]">NIP PPK:</span> <span class="font-medium text-right ml-4">{{ selectedRow.ppk_nip_asli || selectedRow.nip_ppk || '-' }}</span></div>
            </div>
          </div>
        </div>

        <!-- Pencatatan / Pelaksanaan -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3 flex items-center gap-2">
            Pencatatan Swakelola
            <span v-if="selectedRow._has_pelaksanaan" class="px-2 py-0.5 text-[10px] rounded bg-green-100 text-green-700">Tercatat</span>
            <span v-else class="px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-700">Belum Tercatat</span>
          </h3>
          <div v-if="selectedRow._has_pelaksanaan" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kode Pencatatan:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_kd_pct || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Status Pelaksanaan:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_status || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tgl Mulai:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_tgl_mulai || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Tgl Selesai:</span> <span class="font-medium">{{ selectedRow.pelaksanaan_tgl_selesai || '-' }}</span></div>
          </div>
          <p v-else class="text-sm text-[color:hsl(var(--maz-muted))] italic">Tidak ada data pencatatan/pelaksanaan untuk paket swakelola ini.</p>
        </div>

        <!-- History Kaji Ulang -->
        <div v-if="selectedRow._has_kaji_ulang" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-amber-200 dark:border-amber-900/50">
          <h3 class="text-sm font-bold text-amber-600 mb-3 flex items-center gap-2">
            Riwayat Kaji Ulang
            <span class="px-2 py-0.5 text-[10px] rounded bg-amber-100 text-amber-700">{{ selectedRow.kaji_ulang_count }}x Kaji Ulang</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Kaji Ulang Terakhir:</span> <span class="font-medium">{{ selectedRow.kaji_ulang_terakhir || '-' }}</span></div>
            <div class="flex justify-between border-b border-[color:hsl(var(--maz-border))] pb-1"><span class="text-[color:hsl(var(--maz-muted))]">Jenis Revisi:</span> <span class="font-medium">{{ selectedRow.kaji_ulang_jenis_revisi || '-' }}</span></div>
            <div class="flex flex-col gap-1 md:col-span-2 pt-1">
              <span class="text-[color:hsl(var(--maz-muted))]">Alasan Terakhir:</span> 
              <span class="font-medium bg-[color:hsl(var(--maz-background))] p-2 rounded border border-[color:hsl(var(--maz-border))]">{{ selectedRow.kaji_ulang_alasan || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Anak Paket Penyedia -->
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))]">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] mb-3 flex items-center gap-2">
            Paket Penyedia Dalam Swakelola
            <span class="px-2 py-0.5 text-[10px] rounded bg-blue-100 text-blue-700">{{ selectedRow.paket_penyedia_count || 0 }} Paket</span>
          </h3>
          <div v-if="selectedRow._has_paket_penyedia" class="space-y-3">
            <div v-for="paket in selectedRow.paket_penyedia_list" :key="paket.kd_rup" class="bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded p-3 text-sm flex justify-between items-start gap-4">
              <div>
                <div class="font-medium text-[color:hsl(var(--maz-primary))]">{{ paket.nama_paket || '-' }}</div>
                <div class="text-[color:hsl(var(--maz-muted))] text-xs mt-1">
                  RUP: {{ paket.kd_rup }} | {{ paket.jenis_pengadaan }} | {{ paket.metode_pengadaan }}
                </div>
              </div>
              <div class="font-bold text-right shrink-0">
                {{ formatRupiah(paket.pagu) }}
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-[color:hsl(var(--maz-muted))] italic">Tidak ada anak paket penyedia di dalam swakelola ini.</p>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end w-full">
          <MazBtn @click="isDetailOpen = false" color="primary">Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const currentYear = new Date().getFullYear();
const availableYears = [currentYear.toString(), (currentYear - 1).toString()].map(y => ({ label: y, value: y }));
const selectedYear = ref(currentYear.toString());

const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const pageData = ref([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(50);
const searchQuery = ref('');
let searchTimeout = null;

const isDetailOpen = ref(false);
const selectedRow = ref(null);

const openDetail = (row) => {
  selectedRow.value = row;
  isDetailOpen.value = true;
};

const onSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 500);
};

const formatRupiah = (num) => {
  if (!num) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
};

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await $fetch('/api/data/merged/rup-swakelola-enriched', {
      params: {
        tahun: selectedYear.value,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined
      }
    });
    if (res.success) {
      pageData.value = res.data;
      totalItems.value = res.meta.totalItems;
    } else {
      error.value = true;
      errorMessage.value = res.message || 'Gagal memuat data.';
      pageData.value = [];
    }
  } catch (err) {
    error.value = true;
    errorMessage.value = 'Gagal terhubung ke server.';
    pageData.value = [];
  } finally {
    loading.value = false;
  }
};

watch(selectedYear, () => {
  currentPage.value = 1;
  loadData();
});

onMounted(() => {
  loadData();
});
</script>
