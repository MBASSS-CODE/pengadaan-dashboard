<template>
  <div class="mb-6">
    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Paket RUP</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-primary))]">
          {{ loading ? '...' : totalItems.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Sudah Realisasi (Inaproc)</div>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400">
          {{ loading ? '...' : realisasiCount.toLocaleString('id-ID') }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">Total Pagu (Rp)</div>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ loading ? '...' : formatRupiah(totalPagu) }}
        </div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-4 shadow-sm">
        <div class="text-xs text-[color:hsl(var(--maz-muted))] font-medium uppercase tracking-wider mb-1">PPK Tervalidasi</div>
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {{ loading ? '...' : ppkCount.toLocaleString('id-ID') }}
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex flex-col gap-6" v-if="!loading">
      
      <!-- 1. Metode Pengadaan -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Metode Pengadaan</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="metodeChartData" :data="metodeChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Metode Pengadaan</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Metode Pengadaan</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in metodeTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 2. Jenis Pengadaan -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Jenis Pengadaan</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="jenisChartData" :data="jenisChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Jenis Pengadaan</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Jenis Pengadaan</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in jenisTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">{{ item.label }}</td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 3. Status Realisasi -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Status Realisasi (Inaproc)</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="statusChartData" :data="statusChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Status Realisasi</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status Realisasi</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in statusTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': item.label === 'Selesai',
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400': item.label === 'Dalam Proses' || item.label === 'Persiapan' || item.label === 'Draft',
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400': item.label === 'Belum Dimulai',
                      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': item.label === 'Dibatalkan' || item.label === 'Batal'
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 4. Produk Dalam Negeri (PDN) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Proporsi Penggunaan PDN</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="pdnChartData" :data="pdnChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Penggunaan PDN</h3>
          <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
            <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
              <tr>
                <th class="py-3 px-2">Status PDN</th>
                <th class="py-3 px-2 text-right">Jumlah Paket</th>
                <th class="py-3 px-2 text-right">% Pagu</th>
                <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
              <tr v-for="(item, idx) in pdnTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                <td class="py-3 px-2">
                  <span class="px-2 py-1 rounded text-xs font-semibold"
                    :class="{
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400': item.label === 'PDN',
                      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400': item.label === 'Non-PDN'
                    }"
                  >
                    {{ item.label }}
                  </span>
                </td>
                <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                <td class="py-3 px-2">Total</td>
                <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                <td class="py-3 px-2 text-right">100%</td>
                <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 5. Pejabat Pembuat Komitmen (PPK) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Top 10 PPK (Berdasarkan Pagu)</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Bar v-if="ppkChartData" :data="ppkChartData" :options="barOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-hidden flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Beban Kerja PPK</h3>
          <div class="overflow-x-auto overflow-y-auto max-h-[350px] flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))] sticky top-0 bg-[color:hsl(var(--maz-background))]">
                <tr>
                  <th class="py-3 px-2">Nama PPK</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in ppkTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2">
                    <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ item.label }}</div>
                  </td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
              <tfoot class="sticky bottom-0 bg-[color:hsl(var(--maz-background))]">
                <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                  <td class="py-3 px-2">Total</td>
                  <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right">100%</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- 6. Usaha Kecil/Menengah (UKM) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Keterlibatan UKM</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="ukmChartData" :data="ukmChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Keterlibatan UKM</h3>
          <div class="overflow-x-auto flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
                <tr>
                  <th class="py-3 px-2">Status UKM</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in ukmTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2">
                    <span class="px-2 py-1 rounded text-xs font-semibold"
                      :class="{
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': item.label.includes('Usaha Kecil') || item.label.includes('UKM'),
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400': !item.label.includes('Usaha Kecil') && !item.label.includes('UKM')
                      }"
                    >
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                  <td class="py-3 px-2">Total</td>
                  <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right">100%</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- 7. Sumber Dana -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Distribusi Sumber Dana</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="sdChartData" :data="sdChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-hidden flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Sumber Dana</h3>
          <div class="overflow-x-auto overflow-y-auto max-h-[350px] flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))] sticky top-0 bg-[color:hsl(var(--maz-background))]">
                <tr>
                  <th class="py-3 px-2">Sumber Dana</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in sdTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2">
                    <div class="font-medium text-[color:hsl(var(--maz-foreground))]">{{ item.label }}</div>
                  </td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
              <tfoot class="sticky bottom-0 bg-[color:hsl(var(--maz-background))]">
                <tr class="font-bold border-t-2 border-[color:hsl(var(--maz-border))]">
                  <td class="py-3 px-2">Total</td>
                  <td class="py-3 px-2 text-right">{{ totalItems.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right">100%</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(totalPagu) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- 8. Tren Jadwal Pemilihan (Line) -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Tren Jadwal Pemilihan (Bulan)</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Line v-if="tglChartData" :data="tglChartData" :options="lineOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-hidden flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Distribusi Paket per Bulan</h3>
          <div class="overflow-x-auto overflow-y-auto max-h-[350px] flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))] sticky top-0 bg-[color:hsl(var(--maz-background))]">
                <tr>
                  <th class="py-3 px-2">Bulan</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in tglTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2 font-medium">{{ item.label }}</td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 9. Kinerja Satuan Kerja -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Top 10 Satker (Berdasarkan Pagu)</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Bar v-if="satkerChartData" :data="satkerChartData" :options="barOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-hidden flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Kinerja Satker</h3>
          <div class="overflow-x-auto overflow-y-auto max-h-[350px] flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))] sticky top-0 bg-[color:hsl(var(--maz-background))]">
                <tr>
                  <th class="py-3 px-2">Satuan Kerja</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in satkerTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2 font-medium">{{ item.label }}</td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 10. Risiko Kaji Ulang -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Analisis Kaji Ulang Paket</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Pie v-if="kajiUlangChartData" :data="kajiUlangChartData" :options="pieOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Kaji Ulang</h3>
          <div class="overflow-x-auto flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
                <tr>
                  <th class="py-3 px-2">Status Kaji Ulang</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in kajiUlangTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2">
                    <span class="px-2 py-1 rounded text-xs font-semibold"
                      :class="{
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': item.label === 'Ada Kaji Ulang / Revisi',
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': item.label === 'Tanpa Revisi'
                      }"
                    >
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 11. Kepatuhan Pengumuman -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-2 flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-6 text-center">Status Pengumuman RUP</h3>
          <div class="flex-grow flex items-center justify-center min-h-[300px]">
            <Doughnut v-if="umumkanChartData" :data="umumkanChartData" :options="doughnutOptions" />
            <div v-else class="text-[color:hsl(var(--maz-muted))] text-sm">Tidak ada data</div>
          </div>
        </div>
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] p-6 shadow-sm lg:col-span-3 overflow-x-auto flex flex-col">
          <h3 class="text-sm font-bold text-[color:hsl(var(--maz-foreground))] uppercase tracking-wider mb-4">Ringkasan Pengumuman</h3>
          <div class="overflow-x-auto flex-grow">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))] min-w-[500px]">
              <thead class="text-xs text-[color:hsl(var(--maz-muted))] uppercase border-b border-[color:hsl(var(--maz-border))]">
                <tr>
                  <th class="py-3 px-2">Status Pengumuman</th>
                  <th class="py-3 px-2 text-right">Jumlah Paket</th>
                  <th class="py-3 px-2 text-right">% Pagu</th>
                  <th class="py-3 px-2 text-right">Total Pagu (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[color:hsl(var(--maz-border))]">
                <tr v-for="(item, idx) in umumkanTableData" :key="idx" class="hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                  <td class="py-3 px-2">
                    <span class="px-2 py-1 rounded text-xs font-semibold"
                      :class="{
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': item.label === 'Terumumkan',
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400': item.label === 'Draft / Belum Diumumkan'
                      }"
                    >
                      {{ item.label }}
                    </span>
                  </td>
                  <td class="py-3 px-2 text-right">{{ item.count.toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-2 text-right font-medium text-[color:hsl(var(--maz-primary))]">{{ item.persentase }}</td>
                  <td class="py-3 px-2 text-right">{{ formatRupiah(item.pagu) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
    
    <div v-else class="mt-8 flex flex-col items-center justify-center min-h-[300px] text-[color:hsl(var(--maz-muted))]">
      <span class="animate-spin h-10 w-10 border-4 border-[color:hsl(var(--maz-primary))] border-t-transparent rounded-full mb-4"></span>
      <p>Memuat data dan mengkalkulasi analytics...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { Doughnut, Pie, Bar, Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const props = defineProps({
  selectedYear: {
    type: String,
    required: true
  }
});

const loading = ref(true);
const totalItems = ref(0);
const totalPagu = ref(0);
const realisasiCount = ref(0);
const ppkCount = ref(0);

// Chart Datas
const metodeChartData = ref(null);
const jenisChartData = ref(null);
const statusChartData = ref(null);
const pdnChartData = ref(null);
const ppkChartData = ref(null);
const ukmChartData = ref(null);
const sdChartData = ref(null);
const tglChartData = ref(null);
const satkerChartData = ref(null);
const kajiUlangChartData = ref(null);
const umumkanChartData = ref(null);

// Table Datas
const metodeTableData = ref([]);
const jenisTableData = ref([]);
const statusTableData = ref([]);
const pdnTableData = ref([]);
const ppkTableData = ref([]);
const ukmTableData = ref([]);
const sdTableData = ref([]);
const tglTableData = ref([]);
const satkerTableData = ref([]);
const kajiUlangTableData = ref([]);
const umumkanTableData = ref([]);

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: { family: 'Inter, sans-serif', size: 11 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.raw !== null) {
            label += context.raw + ' Paket';
          }
          return label;
        }
      }
    }
  }
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: { family: 'Inter, sans-serif', size: 11 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.raw !== null) {
            label += context.raw + ' Paket';
          }
          return label;
        }
      }
    }
  }
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return formatRupiah(context.raw);
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        font: { family: 'Inter, sans-serif', size: 10 },
        callback: function(value) {
          if (value >= 1000000000) return (value / 1000000000) + 'M';
          if (value >= 1000000) return (value / 1000000) + 'Jt';
          return value;
        }
      }
    },
    y: {
      ticks: {
        font: { family: 'Inter, sans-serif', size: 10 }
      }
    }
  }
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return context.raw + ' Paket';
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const formatRupiah = (number) => {
  if (number === null || number === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const calcPercent = (value, total) => {
  if (!total || total === 0) return '0%';
  return ((value / total) * 100).toFixed(2) + '%';
};

const buildTableData = (mapObj, totalPaguVal) => {
  return Object.keys(mapObj).map(key => ({
    label: key,
    count: mapObj[key].count,
    pagu: mapObj[key].pagu,
    persentase: calcPercent(mapObj[key].pagu, totalPaguVal)
  })).sort((a, b) => b.pagu - a.pagu); // sort descending by pagu
};

const loadStatsAndAnalytics = async () => {
  loading.value = true;
  try {
    // Fetch all data for the year to aggregate
    const res = await $fetch('/api/summary-table/rup-penyedia-enriched', {
      params: {
        tahun: props.selectedYear,
        page: 1,
        limit: 100000 // Get all data for analytics
      }
    });

    if (res.success && res.data) {
      // 1. Basic Stats
      const data = res.data;
      totalItems.value = res.meta?.totalItems || data.length;
      totalPagu.value = res.meta?.totalPagu || data.reduce((sum, item) => sum + (Number(item.pagu) || 0), 0);
      realisasiCount.value = res.meta?.realisasiCount || data.filter(i => i._has_realisasi).length;
      ppkCount.value = res.meta?.ppkCount || 0; // Using meta value if available

      // 2. Metode Pengadaan
      const metodeMap = {};
      data.forEach(item => {
        const m = item.metode_pengadaan || 'Tidak Ditetapkan';
        if (!metodeMap[m]) metodeMap[m] = { count: 0, pagu: 0 };
        metodeMap[m].count += 1;
        metodeMap[m].pagu += (Number(item.pagu) || 0);
      });
      metodeTableData.value = buildTableData(metodeMap, totalPagu.value);
      metodeChartData.value = {
        labels: metodeTableData.value.map(i => i.label),
        datasets: [{
          data: metodeTableData.value.map(i => i.count),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b', '#ec4899', '#14b8a6'],
          borderWidth: 0
        }]
      };

      // 3. Jenis Pengadaan
      const jenisMap = {};
      data.forEach(item => {
        const j = item.jenis_pengadaan || 'Tidak Ditetapkan';
        if (!jenisMap[j]) jenisMap[j] = { count: 0, pagu: 0 };
        jenisMap[j].count += 1;
        jenisMap[j].pagu += (Number(item.pagu) || 0);
      });
      jenisTableData.value = buildTableData(jenisMap, totalPagu.value);
      jenisChartData.value = {
        labels: jenisTableData.value.map(i => i.label),
        datasets: [{
          data: jenisTableData.value.map(i => i.count),
          backgroundColor: ['#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#64748b', '#10b981'],
          borderWidth: 0
        }]
      };

      // 4. Status Realisasi
      const statusMap = {};
      data.forEach(item => {
        const s = item._has_realisasi ? (item.realisasi_status || 'Dalam Proses') : 'Belum Dimulai';
        if (!statusMap[s]) statusMap[s] = { count: 0, pagu: 0 };
        statusMap[s].count += 1;
        statusMap[s].pagu += (Number(item.pagu) || 0);
      });
      statusTableData.value = buildTableData(statusMap, totalPagu.value);
      statusChartData.value = {
        labels: statusTableData.value.map(i => i.label),
        datasets: [{
          data: statusTableData.value.map(i => i.count),
          backgroundColor: ['#f59e0b', '#10b981', '#64748b', '#3b82f6', '#ef4444'],
          borderWidth: 0
        }]
      };

      // 5. PDN vs Non-PDN
      const pdnMap = { 'PDN': { count: 0, pagu: 0 }, 'Non-PDN': { count: 0, pagu: 0 } };
      data.forEach(item => {
        const isPdn = item.status_pdn === 'PDN' || item.status_pdn === 'Ya' || item.status_pdn === true;
        const key = isPdn ? 'PDN' : 'Non-PDN';
        pdnMap[key].count += 1;
        pdnMap[key].pagu += (Number(item.pagu) || 0);
      });
      pdnTableData.value = buildTableData(pdnMap, totalPagu.value);
      pdnChartData.value = {
        labels: pdnTableData.value.map(i => i.label),
        datasets: [{
          data: pdnTableData.value.map(i => i.count),
          backgroundColor: ['#10b981', '#cbd5e1'],
          borderWidth: 0
        }]
      };

      // 6. PPK (Top 10)
      const ppkMap = {};
      data.forEach(item => {
        const p = item.ppk_nama_lengkap || item.nama_ppk || 'Tidak Ada PPK';
        if (!ppkMap[p]) ppkMap[p] = { count: 0, pagu: 0 };
        ppkMap[p].count += 1;
        ppkMap[p].pagu += (Number(item.pagu) || 0);
      });
      ppkTableData.value = buildTableData(ppkMap, totalPagu.value);
      
      const top10Ppk = ppkTableData.value.slice(0, 10);
      
      ppkChartData.value = {
        labels: top10Ppk.map(i => {
          let label = i.label;
          if (label.length > 25) {
            label = label.substring(0, 25) + '...';
          }
          return label;
        }),
        datasets: [{
          label: 'Total Pagu',
          data: top10Ppk.map(i => i.pagu),
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.7,
        }]
      };

      // 7. UKM
      const ukmMap = {};
      data.forEach(item => {
        // Find best match for UKM status
        const u = item.status_ukm || item.usaha_kecil || item.umkk || (item.is_ukm ? 'Usaha Kecil/Menengah' : 'Tidak Ditetapkan');
        if (!ukmMap[u]) ukmMap[u] = { count: 0, pagu: 0 };
        ukmMap[u].count += 1;
        ukmMap[u].pagu += (Number(item.pagu) || 0);
      });
      ukmTableData.value = buildTableData(ukmMap, totalPagu.value);
      ukmChartData.value = {
        labels: ukmTableData.value.map(i => i.label),
        datasets: [{
          data: ukmTableData.value.map(i => i.count),
          backgroundColor: ['#3b82f6', '#cbd5e1', '#f59e0b', '#10b981'],
          borderWidth: 0
        }]
      };

      // 8. Sumber Dana
      const sdMap = {};
      data.forEach(item => {
        let sdList = item.sumber_dana_list || item.sumber_dana || 'Tidak Diketahui';
        // handle array or string
        let sources = [];
        if (Array.isArray(sdList)) {
          sources = sdList;
        } else if (typeof sdList === 'string') {
          sources = sdList.split(',').map(s => s.trim());
        } else {
          sources = [String(sdList)];
        }
        
        sources.forEach(sd => {
          if (!sdMap[sd]) sdMap[sd] = { count: 0, pagu: 0 };
          sdMap[sd].count += 1;
          // Note: total pagu is divided if there are multiple sources, or we just count it.
          // For simplicity, we add the pagu to all sources involved.
          sdMap[sd].pagu += (Number(item.pagu) || 0) / sources.length; 
        });
      });
      sdTableData.value = buildTableData(sdMap, totalPagu.value);
      sdChartData.value = {
        labels: sdTableData.value.map(i => i.label),
        datasets: [{
          data: sdTableData.value.map(i => i.count),
          backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#64748b'],
          borderWidth: 0
        }]
      };

      // 9. Tren Jadwal Pemilihan (Bulan)
      const bulanNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const tglMap = {};
      data.forEach(item => {
        let bulanLabel = 'Tidak Ditetapkan';
        if (item.tgl_awal_pemilihan) {
          const d = new Date(item.tgl_awal_pemilihan);
          if (!isNaN(d.getTime())) {
            bulanLabel = bulanNames[d.getMonth()];
          }
        }
        if (!tglMap[bulanLabel]) tglMap[bulanLabel] = { count: 0, pagu: 0, _idx: bulanNames.indexOf(bulanLabel) };
        tglMap[bulanLabel].count += 1;
        tglMap[bulanLabel].pagu += (Number(item.pagu) || 0);
      });
      tglTableData.value = Object.keys(tglMap).map(key => ({
        label: key,
        count: tglMap[key].count,
        pagu: tglMap[key].pagu,
        persentase: calcPercent(tglMap[key].pagu, totalPagu.value),
        _idx: tglMap[key]._idx
      })).sort((a, b) => {
        if (a._idx === -1) return 1;
        if (b._idx === -1) return -1;
        return a._idx - b._idx;
      });
      tglChartData.value = {
        labels: tglTableData.value.map(i => i.label),
        datasets: [{
          label: 'Jumlah Paket',
          data: tglTableData.value.map(i => i.count),
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 4
        }]
      };

      // 10. Kinerja Satuan Kerja
      const satkerMap = {};
      data.forEach(item => {
        const p = item.nama_satker || 'Tidak Ada Satker';
        if (!satkerMap[p]) satkerMap[p] = { count: 0, pagu: 0 };
        satkerMap[p].count += 1;
        satkerMap[p].pagu += (Number(item.pagu) || 0);
      });
      satkerTableData.value = buildTableData(satkerMap, totalPagu.value);
      
      const top10Satker = satkerTableData.value.slice(0, 10);
      satkerChartData.value = {
        labels: top10Satker.map(i => {
          let label = i.label;
          if (label.length > 25) return label.substring(0, 25) + '...';
          return label;
        }),
        datasets: [{
          label: 'Total Pagu',
          data: top10Satker.map(i => i.pagu),
          backgroundColor: '#ec4899',
          borderRadius: 4,
          barPercentage: 0.7,
        }]
      };

      // 11. Analisis Kaji Ulang
      const kajiMap = { 'Ada Kaji Ulang / Revisi': { count: 0, pagu: 0 }, 'Tanpa Revisi': { count: 0, pagu: 0 } };
      data.forEach(item => {
        const isKaji = item._has_kaji_ulang || (item.kaji_ulang_count && item.kaji_ulang_count > 0);
        const key = isKaji ? 'Ada Kaji Ulang / Revisi' : 'Tanpa Revisi';
        kajiMap[key].count += 1;
        kajiMap[key].pagu += (Number(item.pagu) || 0);
      });
      kajiUlangTableData.value = buildTableData(kajiMap, totalPagu.value);
      kajiUlangChartData.value = {
        labels: kajiUlangTableData.value.map(i => i.label),
        datasets: [{
          data: kajiUlangTableData.value.map(i => i.count),
          backgroundColor: ['#ef4444', '#10b981'],
          borderWidth: 0
        }]
      };

      // 12. Status Pengumuman
      const umumMap = { 'Terumumkan': { count: 0, pagu: 0 }, 'Draft / Belum Diumumkan': { count: 0, pagu: 0 } };
      data.forEach(item => {
        const isUmum = item.status_umumkan_rup === 'Sudah' || item.status_aktif_rup === 'Aktif';
        const key = isUmum ? 'Terumumkan' : 'Draft / Belum Diumumkan';
        umumMap[key].count += 1;
        umumMap[key].pagu += (Number(item.pagu) || 0);
      });
      umumkanTableData.value = buildTableData(umumMap, totalPagu.value);
      umumkanChartData.value = {
        labels: umumkanTableData.value.map(i => i.label),
        datasets: [{
          data: umumkanTableData.value.map(i => i.count),
          backgroundColor: ['#3b82f6', '#cbd5e1'],
          borderWidth: 0
        }]
      };
    }
  } catch (err) {
    console.error('Gagal fetch summary stats RUP Penyedia Enriched:', err);
  } finally {
    loading.value = false;
  }
};

watch(() => props.selectedYear, () => {
  loadStatsAndAnalytics();
});

onMounted(() => {
  loadStatsAndAnalytics();
});
</script>
