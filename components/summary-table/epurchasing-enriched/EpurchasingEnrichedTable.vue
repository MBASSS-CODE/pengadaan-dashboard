<template>
  <ClientOnly>
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
      <!-- Search/Filter Bar -->
      <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col gap-4">
        <!-- Search Row -->
        <div class="w-full flex items-center gap-4">
          <div class="flex-grow">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
            <MazInput 
              v-model="searchQuery" 
              placeholder="Cari Order ID, RUP, atau Nama Penyedia..." 
              size="sm"
              @update:model-value="onSearch"
              clearable
            >
              <template #left-icon>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 text-[color:hsl(var(--maz-muted))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </template>
            </MazInput>
          </div>
          <div class="mt-5 flex gap-2">
            <MazBtn @click="exportModal = true" color="success" size="sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </MazBtn>
          </div>
        </div>

        <!-- Filters Row -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Pesanan</label>
            <MazSelect
              v-model="filterStatus"
              :options="statusOptions"
              multiple
              size="sm"
              placeholder="Semua Status"
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status Pengiriman</label>
            <MazSelect
              v-model="filterShipmentStatus"
              :options="shipmentStatusOptions"
              multiple
              size="sm"
              placeholder="Semua Status"
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="w-full">
            <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Kategori Penyedia</label>
            <MazSelect
              v-model="filterStatusUmkk"
              :options="statusUmkkOptions"
              multiple
              size="sm"
              placeholder="Semua Kategori"
              @update:model-value="onFilterChange"
            />
          </div>
          <div class="w-full flex items-center justify-between pb-1 text-xs text-[color:hsl(var(--maz-muted))]">
            <span>Total: <strong class="text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</strong> data</span>
            <MazBtn v-if="hasActiveFilters" @click="resetFilters" color="danger" size="sm" outline class="h-[32px]">
              Reset
            </MazBtn>
          </div>
        </div>
      </div>

      <!-- Empty State Banner (No Data merged) -->
      <div v-if="!loading && !error && (totalAllItems === 0 && !hasActiveFilters && searchQuery === '')" class="p-8 text-center bg-amber-500/10 border-b border-[color:hsl(var(--maz-border))]">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-1">Data Belum Di-merge</h2>
        <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-4 max-w-md mx-auto">Tidak ada data E-Purchasing Enriched untuk tahun {{ selectedYear }}.</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="font-medium">Gagal memuat data dari server.</p>
        <MazBtn @click="loadData()" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] text-xs font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">
              <th class="py-3 px-4 text-center w-16">No</th>
              <th class="py-3 px-4 min-w-[200px]">Order ID & Tanggal</th>
              <th class="py-3 px-4 min-w-[200px]">Profil Penyedia</th>
              <th class="py-3 px-4 min-w-[250px]">Tautan RUP Penyedia</th>
              <th class="py-3 px-4 min-w-[200px]">PPK</th>
              <th class="py-3 px-4 min-w-[150px]">Status Pesanan</th>
              <th class="py-3 px-4 text-right min-w-[150px]">Total Nilai</th>
              <th class="py-3 px-4 text-center w-20">Aksi</th>
            </tr>
          </thead>
          <tbody class="align-top relative">
            <tr v-if="loading && items.length === 0">
              <td colspan="7" class="py-12 text-center">
                <MazSpinner color="primary" class="mx-auto" />
                <p class="text-[color:hsl(var(--maz-muted))] mt-3 text-sm">Memuat data E-Purchasing...</p>
              </td>
            </tr>
            <tr v-else-if="items.length === 0 && !loading" class="border-b border-[color:hsl(var(--maz-border))]">
              <td colspan="7" class="py-12 text-center text-[color:hsl(var(--maz-muted))]">
                Tidak ada data yang cocok dengan filter pencarian.
              </td>
            </tr>
            <template v-for="(item, index) in items" :key="item.order_id">
              <tr class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_2%)] transition-colors group">
                <td class="py-4 px-4 text-center text-sm font-medium text-[color:hsl(var(--maz-muted))]">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                
                <!-- Order ID -->
                <td class="py-4 px-4">
                  <div class="font-bold text-[color:hsl(var(--maz-primary))] text-base mb-1">{{ item.order_id }}</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))] flex items-center gap-1.5 mb-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ formatDate(item.order_date) }}
                  </div>
                </td>
                
                <!-- Penyedia -->
                <td class="py-4 px-4">
                  <div class="font-bold text-[color:hsl(var(--maz-foreground))] text-sm">{{ item.penyedia_nama || 'Tidak diketahui' }}</div>
                  <div v-if="item.penyedia_npwp" class="text-xs font-mono text-[color:hsl(var(--maz-muted))] mb-1">{{ item.penyedia_npwp }}</div>
                  <div class="mt-1">
                    <span v-if="item.penyedia_status_umkk && item.penyedia_status_umkk !== 'Non-UMKM'" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {{ item.penyedia_status_umkk }}
                    </span>
                    <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      Non-UMKM
                    </span>
                  </div>
                </td>

                <!-- RUP -->
                <td class="py-4 px-4">
                  <div v-if="item.rup_code" class="text-sm">
                    <div class="font-bold text-teal-600 dark:text-teal-400 mb-0.5">{{ item.rup_code }}</div>
                    <div class="text-[color:hsl(var(--maz-foreground))] text-xs line-clamp-2 leading-relaxed" :title="item.rup_nama_paket">
                      {{ item.rup_nama_paket || item.rup_name }}
                    </div>
                  </div>
                  <div v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">
                    Tautan RUP tidak tersedia
                  </div>
                </td>

                <!-- PPK -->
                <td class="py-4 px-4">
                  <div v-if="item.ppk_nama_lengkap || item.rup_nama_ppk" class="text-sm">
                    <div class="font-bold text-[color:hsl(var(--maz-foreground))] text-xs mb-0.5">{{ item.ppk_nama_lengkap || item.rup_nama_ppk }}</div>
                    <div class="text-[color:hsl(var(--maz-muted))] text-[10px] font-mono">
                      NIP: {{ item.ppk_nip_asli || item.rup_nip_ppk || '-' }}
                    </div>
                  </div>
                  <div v-else class="text-xs text-[color:hsl(var(--maz-muted))] italic">
                    -
                  </div>
                </td>

                <!-- Status -->
                <td class="py-4 px-4">
                  <div class="mb-1.5 flex flex-col gap-1">
                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
                          :class="item.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'">
                      {{ item.status }}
                    </span>
                    <span class="text-[10px] text-[color:hsl(var(--maz-muted))]">Pengiriman: {{ item.shipment_status }}</span>
                  </div>
                </td>
                
                <!-- Total -->
                <td class="py-4 px-4 text-right">
                  <div class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(item.total) }}</div>
                  <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">{{ item.total_qty }} unit</div>
                </td>

                <!-- Actions -->
                <td class="py-4 px-4 text-center">
                  <MazBtn @click="openDetail(item)" color="primary" size="sm" outline class="!p-2" title="Lihat Detail">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </MazBtn>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-[color:hsl(var(--maz-muted))]">
          Menampilkan <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ items.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }}</span> - <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ (currentPage - 1) * itemsPerPage + items.length }}</span> dari <span class="font-bold text-[color:hsl(var(--maz-foreground))]">{{ totalAllItems }}</span> data
        </div>
        <div class="flex items-center gap-2">
          <MazBtn @click="currentPage--" :disabled="currentPage === 1" color="transparent" size="sm" class="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </MazBtn>
          <div class="flex items-center gap-1">
            <template v-for="p in visiblePages" :key="p">
              <span v-if="p === '...'" class="text-[color:hsl(var(--maz-muted))] px-1">...</span>
              <MazBtn v-else @click="currentPage = p" :color="currentPage === p ? 'primary' : 'transparent'" size="sm" class="!w-8 !h-8 !p-0 rounded-md font-medium" :class="currentPage !== p ? 'text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))] hover:bg-[color:hsl(var(--maz-foreground)_/_5%)]' : ''">
                {{ p }}
              </MazBtn>
            </template>
          </div>
          <MazBtn @click="currentPage++" :disabled="currentPage === totalPages" color="transparent" size="sm" class="!px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </MazBtn>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-[color:hsl(var(--maz-muted))]">Per halaman:</span>
          <MazSelect v-model="itemsPerPage" :options="[{label:'10',value:10},{label:'25',value:25},{label:'50',value:50},{label:'100',value:100}]" size="sm" class="w-20" />
        </div>
      </div>
    </div>

    <!-- Modal Detail -->
    <MazDialog v-model="detailModal" :title="`Detail E-Purchasing: ${selectedItem?.order_id}`" width="900px" scrollable>
      <div v-if="selectedItem" class="flex flex-col gap-6 text-[color:hsl(var(--maz-foreground))]">
        <!-- Banner RUP Match -->
        <div v-if="selectedItem._rup_matched" class="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex gap-4">
          <div class="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-teal-800 dark:text-teal-300">Terkoneksi dengan Master RUP Penyedia</h3>
            <p class="text-xs text-teal-600/80 dark:text-teal-400/80 mt-1">Order ini berhasil di-merge dengan Paket RUP {{ selectedItem.rup_code }}.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Info Transaksi -->
          <div class="rounded-xl border border-[color:hsl(var(--maz-border))] p-5 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 class="font-bold text-sm text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-4 flex items-center gap-2">
              Informasi Pesanan
            </h3>
            
            <div class="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Order ID</p>
                <p class="text-sm font-bold">{{ selectedItem.order_id }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Tanggal Pesanan</p>
                <p class="text-sm font-medium">{{ formatDate(selectedItem.order_date) }}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Status Transaksi</p>
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-[color:hsl(var(--maz-foreground)_/_5%)] border border-[color:hsl(var(--maz-border))]">
                  {{ selectedItem.status }}
                </span>
              </div>
              <div>
                <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Status Pengiriman</p>
                <span class="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-[color:hsl(var(--maz-foreground)_/_5%)] border border-[color:hsl(var(--maz-border))]">
                  {{ selectedItem.shipment_status }}
                </span>
              </div>
              <div>
                <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Produk Lokal</p>
                <p class="text-sm font-medium">{{ selectedItem.flag_minikom }}</p>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
              <div class="flex justify-between items-center">
                <p class="text-xs uppercase text-[color:hsl(var(--maz-muted))] font-bold">Total Pembelian</p>
                <p class="text-lg font-black text-[color:hsl(var(--maz-primary))]">{{ formatRupiah(selectedItem.total) }}</p>
              </div>
              <div class="flex justify-between items-center mt-1">
                <p class="text-[10px] text-[color:hsl(var(--maz-muted))]">Ongkos Kirim</p>
                <p class="text-xs font-medium">{{ formatRupiah(selectedItem.shipping_fee || 0) }}</p>
              </div>
            </div>
          </div>

          <!-- Info Penyedia -->
          <div class="rounded-xl border border-[color:hsl(var(--maz-border))] p-5 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <h3 class="font-bold text-sm text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-4 flex items-center gap-2">
              Profil Penyedia
            </h3>
            
            <div class="flex flex-col gap-4">
              <div>
                <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Nama Perusahaan / Penyedia</p>
                <p class="text-base font-bold text-purple-600 dark:text-purple-400">{{ selectedItem.penyedia_nama || 'Tidak diketahui' }}</p>
                <p class="text-xs font-mono text-[color:hsl(var(--maz-muted))] mt-1">ID: {{ selectedItem.kode_penyedia }}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">NPWP</p>
                  <p class="text-sm font-medium">{{ selectedItem.penyedia_npwp || '-' }}</p>
                </div>
                <div>
                  <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Status UMKM</p>
                  <p class="text-sm font-medium">{{ selectedItem.penyedia_status_umkk || '-' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Info PPK -->
        <div v-if="selectedItem.ppk_nama_lengkap || selectedItem.rup_nama_ppk" class="rounded-xl border border-[color:hsl(var(--maz-border))] p-5 relative overflow-hidden mt-2">
          <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <h3 class="font-bold text-sm text-[color:hsl(var(--maz-muted))] uppercase tracking-wider mb-4 flex items-center gap-2">
            Informasi PPK
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Nama PPK</p>
              <p class="text-sm font-bold text-[color:hsl(var(--maz-foreground))]">{{ selectedItem.ppk_nama_lengkap || selectedItem.rup_nama_ppk }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">NIP</p>
              <p class="text-sm font-medium font-mono">{{ selectedItem.ppk_nip_asli || selectedItem.rup_nip_ppk || '-' }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Jabatan</p>
              <p class="text-sm font-medium">{{ selectedItem.ppk_jabatan || '-' }}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase text-[color:hsl(var(--maz-muted))] mb-1 font-semibold">Kontak</p>
              <p class="text-xs text-[color:hsl(var(--maz-muted))]">{{ selectedItem.ppk_telepon || '-' }} / {{ selectedItem.ppk_email || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="w-full flex justify-end">
          <MazBtn @click="detailModal = false" color="transparent">Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>
  </ClientOnly>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
const { selectedYear } = defineProps({ selectedYear: { type: String, required: true } });

const loading = ref(true);
const error = ref(false);
const items = ref([]);
const totalAllItems = ref(0);

const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const searchQuery = ref('');

const detailModal = ref(false);
const selectedItem = ref(null);
const exportModal = ref(false);

const filterStatus = ref([]);
const filterShipmentStatus = ref([]);
const filterStatusUmkk = ref([]);

const statusOptions = ref([]);
const shipmentStatusOptions = ref([]);
const statusUmkkOptions = ref([]);

const hasActiveFilters = computed(() => {
  return filterStatus.value.length > 0 || filterShipmentStatus.value.length > 0 || filterStatusUmkk.value.length > 0;
});

const loadData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const params = {
      tahun: selectedYear,
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      status: filterStatus.value.join(','),
      shipmentStatus: filterShipmentStatus.value.join(','),
      statusUmkk: filterStatusUmkk.value.join(',')
    };

    const res = await $fetch('/api/summary-table/epurchasing', { params });
    if (res.success) {
      items.value = res.data;
      totalAllItems.value = res.meta.totalItems;
      totalPages.value = res.meta.totalPages;
      
      statusOptions.value = (res.filterOptions?.status || []).map(v => ({ label: v || 'NULL', value: v }));
      shipmentStatusOptions.value = (res.filterOptions?.shipmentStatus || []).map(v => ({ label: v || 'NULL', value: v }));
      statusUmkkOptions.value = (res.filterOptions?.statusUmkk || []).map(v => ({ label: v || 'NULL', value: v }));
    } else {
      error.value = true;
      items.value = [];
    }
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const debouncedLoadData = (() => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      loadData();
    }, 500);
  };
})();

watch([currentPage, itemsPerPage], () => { loadData(); });
watch(() => selectedYear, () => { currentPage.value = 1; loadData(); });

const onSearch = () => { currentPage.value = 1; debouncedLoadData(); };
const onFilterChange = () => { currentPage.value = 1; loadData(); };

const resetFilters = () => {
  filterStatus.value = [];
  filterShipmentStatus.value = [];
  filterStatusUmkk.value = [];
  searchQuery.value = '';
  currentPage.value = 1;
  loadData();
};

const openDetail = (item) => {
  selectedItem.value = item;
  detailModal.value = true;
};

const formatRupiah = (angka) => {
  if (!angka && angka !== 0) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const visiblePages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

onMounted(() => { loadData(); });
</script>
