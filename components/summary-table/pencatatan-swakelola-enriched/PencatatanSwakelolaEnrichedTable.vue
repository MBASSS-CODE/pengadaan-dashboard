<template>
  <div class="flex flex-col gap-4">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket Pencatatan</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ loading ? '...' : formatRupiah(totalPagu) }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Realisasi (Rp)</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ loading ? '...' : formatRupiah(totalRealisasi) }}
        </div>
      </div>
    </div>

    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-[0_4px_15px_rgba(0,0,0,0.05)] overflow-hidden">
      <!-- Search/Filter Bar -->
    <div class="p-4 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] flex flex-col gap-4">
      <!-- Search Row -->
      <div class="w-full flex items-center gap-4">
        <div class="flex-grow">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Pencarian</label>
          <MazInput 
            v-model="searchQuery" 
            placeholder="Cari paket, satker, PPK..." 
            size="sm"
            @update:model-value="onSearchDebounced"
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
      <div class="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-4 items-end">
        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Status</label>
          <MazSelect
            v-model="selectedStatus"
            :options="statusOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Tipe Swakelola</label>
          <MazSelect
            v-model="selectedTipe"
            :options="tipeOptions"
            size="sm"
            @update:model-value="onFilterChange(false)"
          />
        </div>
        
        <div class="w-full">
          <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1.5 uppercase tracking-wider">Satuan Kerja</label>
          <MazSelect
            v-model="selectedSatker"
            :options="satkerOptions"
            size="sm"
            search
            @update:model-value="onFilterChange(false)"
          />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="flex flex-col items-center justify-center py-20 text-[color:hsl(var(--maz-destructive))]">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="font-medium">Gagal memuat data dari server.</p>
      <MazBtn @click="loadData(true)" size="sm" outline class="mt-4">Coba Lagi</MazBtn>
    </div>

    <!-- MazTable Data Table -->
    <div v-else class="overflow-x-auto w-full">
      <MazTable
        size="sm"
        v-model:page="currentPage"
        v-model:page-size="itemsPerPage"
        pagination
        :paginate-rows="false"
        :total-items="totalItems"
        :loading="loading"
        color="primary"
        hoverable
        background-even
        :headers="[
          { label: 'No', key: 'index', align: 'center', width: '4rem', sortable: false },
          { label: 'Informasi Paket', key: 'paket', sortable: false, classes: 'min-w-[280px]' },
          { label: 'Satker & PPK', key: 'satker', sortable: false, classes: 'min-w-[200px]' },
          { label: 'Pagu & Realisasi', key: 'nilai', align: 'right', sortable: false, classes: 'min-w-[150px]' },
          { label: 'Status Pelaksanaan', key: 'status', align: 'center', sortable: false, classes: 'min-w-[150px]' },
          { label: 'Aksi', key: 'actions', align: 'center', width: '6rem', sortable: false }
        ]"
        :rows="pageData"
        @update:page="loadData(false)"
        @update:page-size="onFilterChange(false)"
      >
        <template #cell-index="{ row }">
          <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + (row._index || 0) + 1 }}</span>
        </template>
        
        <template #cell-paket="{ row }">
          <div class="font-bold text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer" @click="openDetail(row)" :title="row.nama_paket">
            {{ row.nama_paket || '-' }}
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              RUP: {{ row.kd_rup }}
            </span>
            <span v-if="row.kd_swakelola_pct" class="px-2 py-0.5 rounded text-[10px] font-medium bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))] border border-[color:hsl(var(--maz-border))]">
              ID: {{ row.kd_swakelola_pct }}
            </span>
          </div>
          <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">
            {{ row.tipe_swakelola_nama || 'Tipe Swakelola -' }}
          </div>
        </template>
        
        <template #cell-satker="{ row }">
          <div class="font-medium text-xs truncate max-w-[200px]" :title="row.nama_satker">{{ row.nama_satker || '-' }}</div>
          <div class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1 font-semibold flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            {{ row.ppk_nama_lengkap || row.nama_ppk || '-' }}
          </div>
          <div v-if="getUniquePenyedia(row.realisasi_list).length > 0" class="text-[10px] text-[color:hsl(var(--maz-primary))] mt-1.5 font-medium flex items-start gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
            </svg>
            <span class="line-clamp-2 leading-tight" :title="getUniquePenyedia(row.realisasi_list).join(', ')">
              {{ getUniquePenyedia(row.realisasi_list).join(', ') }}
            </span>
          </div>
        </template>
        
        <template #cell-nilai="{ row }">
          <div class="flex flex-col items-end">
            <div class="text-xs text-[color:hsl(var(--maz-muted))]">Pagu:</div>
            <div class="font-bold text-sm text-[color:hsl(var(--maz-foreground))]">{{ formatRupiah(row.pagu) }}</div>
            <div class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Realisasi:</div>
            <div class="font-semibold text-[color:hsl(var(--maz-success))]">{{ formatRupiah(row.total_realisasi) }}</div>
          </div>
        </template>
        
        <template #cell-status="{ row }">
          <div class="flex flex-col items-center gap-1.5 w-full">
            <span 
              class="px-2.5 py-1 text-[0.7rem] font-semibold rounded-full w-full text-center border border-transparent leading-none"
              :class="{
                'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': row.status_swakelola_pct_ket === 'Paket Selesai',
                'bg-[color:hsl(var(--maz-primary)_/_15%)] text-[color:hsl(var(--maz-primary)_/_100%)] dark:bg-[color:hsl(var(--maz-primary)_/_20%)]': row.status_swakelola_pct === 'Aktif' && row.status_swakelola_pct_ket !== 'Paket Selesai',
                'bg-[color:hsl(var(--maz-muted)_/_15%)] text-[color:hsl(var(--maz-foreground)_/_80%)] dark:bg-[color:hsl(var(--maz-muted)_/_20%)]': row.status_swakelola_pct !== 'Aktif' && row.status_swakelola_pct_ket !== 'Paket Selesai'
              }"
            >
              {{ row.status_swakelola_pct_ket || row.status_swakelola_pct || 'Unknown' }}
            </span>
            <div class="text-[10px] text-[color:hsl(var(--maz-muted))] text-center mt-1 w-full flex flex-col gap-0.5">
              <span>{{ row.realisasi_list?.length || 0 }} Bukti Realisasi</span>
            </div>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <MazBtn size="mini" color="info" outline @click="openDetail(row)" title="Lihat Detail Swakelola">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </MazBtn>
        </template>
      </MazTable>
    </div>

    <!-- Detail Modal Pencatatan Swakelola Enriched -->
    <MazDialog v-model="detailModal" :title="`Detail Pencatatan Swakelola: ${selectedRow?.kd_swakelola_pct || ''}`" max-width="1000px">
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
                <span class="font-medium text-right ml-4">PDN: {{ selectedRow.nilai_pdn_pct || 0 }}% | UMK: {{ selectedRow.nilai_umk_pct || 0 }}%</span>
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
                <span class="font-medium text-right ml-4">{{ selectedRow.rup_status_aktif ? 'Aktif' : 'Non-Aktif' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[color:hsl(var(--maz-muted))]">Sasaran Swakelola:</span>
                <span class="font-medium text-right ml-4 line-clamp-2" :title="selectedRow.rup_sasaran">{{ selectedRow.rup_sasaran || '-' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Uraian Pekerjaan -->
        <div v-if="selectedRow.uraian_pekerjaan" class="bg-[color:hsl(var(--maz-foreground)_/_2%)] p-4 rounded-lg border border-[color:hsl(var(--maz-border))] space-y-2">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-primary))] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Uraian Pekerjaan
          </h3>
          <div class="p-3 bg-[color:hsl(var(--maz-background))] rounded border border-[color:hsl(var(--maz-border))] max-h-36 overflow-y-auto text-xs text-[color:hsl(var(--maz-foreground))]" v-html="selectedRow.uraian_pekerjaan">
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
          <MazBtn @click="detailModal = false" color="primary" size="sm">Tutup</MazBtn>
        </div>
      </template>
    </MazDialog>

    <!-- Export Modal -->
    <MazDialog v-model="exportModal" title="Export ke Excel (XLSX)">
      <div class="flex flex-col gap-4 py-2">
        <p class="text-sm text-[color:hsl(var(--maz-muted))]">
          Pilih mode ekspor data Pencatatan Swakelola untuk Tahun Anggaran {{ selectedYear }}:
        </p>
        
        <div class="bg-[color:hsl(var(--maz-foreground)_/_2%)] border border-[color:hsl(var(--maz-border))] p-4 rounded-lg">
          <div class="flex flex-col gap-3">
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="filtered" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Sesuai Filter Saat Ini</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor data yang tampil pada tabel saat ini berdasarkan pencarian dan filter yang aktif (estimasi: {{ totalItems }} data).</div>
              </div>
            </label>
            <label class="flex items-start gap-3 cursor-pointer">
              <input type="radio" v-model="exportMode" value="all" class="mt-1" />
              <div>
                <div class="font-semibold text-sm">Seluruh Data (Tahun {{ selectedYear }})</div>
                <div class="text-xs text-[color:hsl(var(--maz-muted))]">Mengekspor seluruh data Pencatatan Swakelola untuk tahun anggaran {{ selectedYear }} tanpa filter apapun.</div>
              </div>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <MazBtn @click="exportModal = false" color="transparent" size="sm">Batal</MazBtn>
          <MazBtn @click="executeExport" :loading="exportLoading" color="success" size="sm">Download Excel</MazBtn>
        </div>
      </template>
    </MazDialog>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { utils, writeFile } from 'xlsx';

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const error = ref(false);
const detailModal = ref(false);
const selectedRow = ref(null);

// Data dari server (sudah dipaginasi)
const pageData = ref([]);
const totalItems = ref(0);
const totalPages = ref(0);
const totalAllItems = ref(0);
const totalPagu = ref(0);
const totalRealisasi = ref(0);

const searchQuery = ref('');
const selectedStatus = ref('ALL');
const selectedTipe = ref('ALL');
const selectedSatker = ref('ALL');

const statusOptions = ref([{ label: 'Semua Status', value: 'ALL' }]);
const tipeOptions = ref([{ label: 'Semua Tipe', value: 'ALL' }]);
const satkerOptions = ref([{ label: 'Semua Satker', value: 'ALL' }]);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Debounce timer
let searchTimer = null;

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

const getUniquePenyedia = (realisasiList) => {
  if (!realisasiList || !realisasiList.length) return [];
  const unique = [...new Set(realisasiList.map(r => r.nama_penyedia || r.nama_pelaksana).filter(Boolean))];
  return unique;
};

const openDetail = (row) => {
  selectedRow.value = row;
  detailModal.value = true;
};

const loadData = async (force = false) => {
  loading.value = true;
  error.value = false;
  try {
    const response = await $fetch('/api/data/merged/pencatatan-swakelola-enriched', {
      params: { 
        tahun: props.selectedYear,
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value || undefined,
        filterStatusSwakelola: selectedStatus.value !== 'ALL' ? selectedStatus.value : undefined, 
        filterTipeSwakelola: selectedTipe.value !== 'ALL' ? selectedTipe.value : undefined,
        filterSatker: selectedSatker.value !== 'ALL' ? selectedSatker.value : undefined,
        forceRefresh: force ? 'true' : undefined
      }
    });
    
    const rawItems = response.data || [];
    pageData.value = rawItems.map((item, index) => ({ ...item, _index: index }));
    totalItems.value = response.meta?.totalItems || 0;
    totalPages.value = response.meta?.totalPages || 0;
    totalAllItems.value = response.meta?.totalAllItems || 0;
    totalPagu.value = response.meta?.totalPagu || 0;
    totalRealisasi.value = response.meta?.totalRealisasi || 0;
    
    if (response.filterOptions) {
      if (response.filterOptions.statusSwakelola && response.filterOptions.statusSwakelola.length > 0) {
        statusOptions.value = [
          { label: 'Semua Status', value: 'ALL' },
          ...response.filterOptions.statusSwakelola.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.tipeSwakelola && response.filterOptions.tipeSwakelola.length > 0) {
        tipeOptions.value = [
          { label: 'Semua Tipe', value: 'ALL' },
          ...response.filterOptions.tipeSwakelola.map(opt => ({ label: opt, value: opt }))
        ];
      }
      if (response.filterOptions.satker && response.filterOptions.satker.length > 0) {
        satkerOptions.value = [
          { label: 'Semua Satker', value: 'ALL' },
          ...response.filterOptions.satker.map(opt => ({ label: opt, value: opt }))
        ];
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// Ketika filter berubah, reset ke halaman 1 lalu fetch
const onFilterChange = (forceRefresh = false) => {
  currentPage.value = 1;
  loadData(forceRefresh);
};

// Debounce pencarian agar tidak hit API setiap ketik huruf
const onSearchDebounced = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    onFilterChange(false);
  }, 500);
};

watch(() => props.selectedYear, () => {
  onFilterChange(true);
});

// Initial load
onMounted(() => {
  loadData(false);
});

// ─── Export Logic ───────────────────────────────────────────
const exportModal = ref(false);
const exportMode = ref('filtered');
const exportLoading = ref(false);

const executeExport = async () => {
  exportLoading.value = true;
  try {
    const params = {
      tahun: props.selectedYear,
      page: 1,
      limit: 100000 // limit besar untuk mengambil seluruh data
    };

    if (exportMode.value === 'filtered') {
      if (searchQuery.value) params.search = searchQuery.value;
      if (selectedStatus.value !== 'ALL') params.filterStatusSwakelola = selectedStatus.value;
      if (selectedTipe.value !== 'ALL') params.filterTipeSwakelola = selectedTipe.value;
      if (selectedSatker.value !== 'ALL') params.filterSatker = selectedSatker.value;
    }

    const res = await $fetch('/api/data/merged/pencatatan-swakelola-enriched', { params });

    if (res.data) {
      const flatData = res.data.map((row, i) => ({
        'No': i + 1,
        'Nama Paket Pencatatan': row.nama_paket || '-',
        'Kode RUP (Pencatatan)': row.kd_rup || '-',
        'Kode Pencatatan': row.kd_swakelola_pct || '-',
        'Satuan Kerja': row.nama_satker || '-',
        'Nama PPK': row.ppk_nama_lengkap || row.nama_ppk || '-',
        'Tipe Swakelola': row.tipe_swakelola || '-',
        'Pagu (Rp)': row.pagu || 0,
        'Total Realisasi (Rp)': row.total_realisasi || 0,
        'Status (Pencatatan)': row.status_swakelola || '-',
        'Penyedia (Pencatatan)': getUniquePenyedia(row.realisasi_list).join(', '),
        // RUP Info
        'Nama Paket (RUP)': row.rup_nama_paket || '-',
        'Sasaran (RUP)': row.rup_sasaran || '-'
      }));

      const ws = utils.json_to_sheet(flatData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Pencatatan Swakelola");

      const wscols = [
        {wch: 5}, {wch: 40}, {wch: 15}, {wch: 20}, {wch: 30}, {wch: 30},
        {wch: 15}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 30},
        {wch: 40}, {wch: 30}
      ];
      ws['!cols'] = wscols;

      const filename = `Pencatatan_Swakelola_${props.selectedYear}${exportMode.value === 'filtered' ? '_Filtered' : ''}.xlsx`;
      writeFile(wb, filename);
      exportModal.value = false;
    }
  } catch (err) {
    console.error('Failed to export:', err);
    alert('Gagal melakukan ekspor data. Silakan coba lagi.');
  } finally {
    exportLoading.value = false;
  }
};
</script>

<style scoped>
:deep(.m-table-wrapper) {
  overflow-x: auto !important;
}
</style>
