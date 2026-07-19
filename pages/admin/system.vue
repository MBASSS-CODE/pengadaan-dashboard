<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Sistem & Cache</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Status penyimpanan data, memori, dan penjadwalan</p>
      </div>
      
      <div class="flex gap-2">
        <MazBtn @click="fetchStats" :loading="loading" color="primary" outline size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </MazBtn>
        <MazBtn @click="syncAllEndpoints" :loading="syncLoading" color="danger" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Sync Semua Sekarang
        </MazBtn>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- RAM Usage Card -->
      <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">RAM Digunakan</h2>
            <p class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1" v-if="!loading">{{ formatBytes(stats.ramSizeBytes) }}</p>
            <div v-else class="h-8 w-24 bg-[color:hsl(var(--maz-foreground)_/_10%)] animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Memori cache pada server node.js</p>
      </div>

      <!-- JSON Size Card -->
      <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Ukuran Data (Disk)</h2>
            <p class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1" v-if="!loading">{{ formatBytes(stats.totalSizeBytes) }}</p>
            <div v-else class="h-8 w-24 bg-[color:hsl(var(--maz-foreground)_/_10%)] animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Total ukuran file JSON di disk</p>
      </div>

      <!-- JSON Files Card -->
      <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm flex flex-col justify-between">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total File JSON</h2>
            <p class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1" v-if="!loading">{{ stats.totalFiles }} File</p>
            <div v-else class="h-8 w-16 bg-[color:hsl(var(--maz-foreground)_/_10%)] animate-pulse rounded mt-1"></div>
          </div>
        </div>
        <p class="text-xs text-[color:hsl(var(--maz-muted))]">Jumlah berkas fisik cache tersimpan</p>
      </div>
    </div>

    <!-- Endpoint Aktif (Checklist) -->
    <div class="mb-8">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
        <div class="p-6 border-b border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Endpoint Aktif
            </h2>
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Centang endpoint yang ingin diambil datanya dari API Inaproc dan ditampilkan di dashboard</p>
          </div>
          <MazBtn @click="saveEndpointsConfig" :loading="savingEndpoints" color="primary" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Simpan Perubahan
          </MazBtn>
        </div>

        <div v-if="endpointConfigLoading" class="p-10 flex items-center justify-center">
          <MazSpinner color="primary" />
        </div>

        <div v-else class="p-6">
          <div v-for="(items, group) in endpointRegistry" :key="group" class="mb-6 last:mb-0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-primary))]">{{ group }}</h3>
              <button 
                @click="toggleAllGroup(group)" 
                class="text-xs font-medium text-[color:hsl(var(--maz-primary))] hover:underline cursor-pointer"
              >
                {{ isAllGroupActive(group) ? 'Nonaktifkan Semua' : 'Aktifkan Semua' }}
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <label 
                v-for="item in items" 
                :key="item.endpoint"
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200"
                :class="{
                  'border-[color:hsl(var(--maz-primary)_/_40%)] bg-[color:hsl(var(--maz-primary)_/_5%)]': isEndpointActive(group, item.endpoint),
                  'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]': !isEndpointActive(group, item.endpoint)
                }"
              >
                <input 
                  type="checkbox" 
                  :checked="isEndpointActive(group, item.endpoint)"
                  @change="toggleEndpoint(group, item.endpoint)"
                  class="mt-0.5 w-4 h-4 accent-[hsl(var(--maz-primary))] rounded cursor-pointer"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-semibold text-[color:hsl(var(--maz-foreground))]">{{ item.label }}</div>
                  <div class="text-[11px] text-[color:hsl(var(--maz-muted))] mt-0.5 leading-snug">{{ item.description }}</div>
                </div>
              </label>
            </div>
          </div>

          <div v-if="endpointSaveMessage" class="mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            {{ endpointSaveMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Pengaturan Cron Job -->
      <div class="lg:col-span-1">
        <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
          <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Jadwal Sinkronisasi
          </h2>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-[color:hsl(var(--maz-muted))] mb-2">Format Cron (Menit Jam * * *)</label>
            <MazInput 
              v-model="cronSchedule" 
              placeholder="0 6,12 * * *" 
              :disabled="savingCron"
            />
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-2">
              Contoh: <br/>
              <code class="bg-[color:hsl(var(--maz-foreground)_/_10%)] px-1 py-0.5 rounded">0 6,12 * * *</code> (Setiap jam 06:00 dan 12:00)<br/>
              <code class="bg-[color:hsl(var(--maz-foreground)_/_10%)] px-1 py-0.5 rounded">0 */4 * * *</code> (Setiap 4 jam)<br/>
              <code class="bg-[color:hsl(var(--maz-foreground)_/_10%)] px-1 py-0.5 rounded">30 8 * * *</code> (Setiap jam 08:30 pagi)
            </p>
          </div>
          
          <MazBtn @click="saveCron" :loading="savingCron" color="primary" block>
            Simpan Jadwal
          </MazBtn>
          
          <div v-if="saveMessage" class="mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
            {{ saveMessage }}
          </div>
        </div>

        <!-- Manajemen Data (Backup/Restore) -->
        <div class="bg-[color:hsl(var(--maz-background))] p-6 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm mt-6">
          <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Backup & Restore Data
          </h2>

          <div class="mb-5 border-b border-[color:hsl(var(--maz-border))] pb-5">
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-3">
              Unduh seluruh file data referensi ke dalam format ZIP untuk cadangan.
            </p>
            <MazBtn @click="downloadBackup" color="info" block outline>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Backup (.zip)
            </MazBtn>
          </div>

          <div>
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mb-3">
              Unggah file ZIP cadangan untuk memulihkan atau memasukkan data. <strong>Peringatan:</strong> Akan menimpa data yang ada jika nama file sama.
            </p>
            
            <input 
              type="file" 
              ref="fileInputRef" 
              accept=".zip" 
              class="hidden" 
              @change="handleFileUpload" 
            />
            
            <MazBtn @click="triggerFileInput" :loading="isUploading" color="warning" block outline>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Data (.zip)
            </MazBtn>
            
            <div v-if="uploadMessage" class="mt-3 p-2 rounded-lg text-[11px] font-medium" :class="uploadSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
              {{ uploadMessage }}
            </div>
          </div>
        </div>
      </div>

      <!-- Log Aktivitas -->
      <div class="lg:col-span-2">
        <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden h-full flex flex-col">
          <div class="p-6 border-b border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-background))]">
            <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Riwayat Hit Endpoint (API)
            </h2>
          </div>
          
          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))]">
              <thead class="text-xs uppercase bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))]">
                <tr>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Grup</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Endpoint</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Hasil Data</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Terakhir Sinkronisasi</th>
                  <th scope="col" class="px-6 py-4 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="logs.length === 0">
                  <td colspan="5" class="px-6 py-8 text-center text-[color:hsl(var(--maz-muted))]">Belum ada aktivitas sinkronisasi tercatat.</td>
                </tr>
                <tr 
                  v-for="(log, index) in logs" 
                  :key="index"
                  class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)] transition-colors"
                >
                  <td class="px-6 py-4 font-medium uppercase text-[color:hsl(var(--maz-primary))]">{{ log.group }}</td>
                  <td class="px-6 py-4 font-mono text-xs">{{ log.endpoint }}</td>
                  <td class="px-6 py-4 text-center font-bold">{{ log.count }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(log.lastUpdated) }}</td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2.5 py-1 text-xs font-semibold rounded-full border border-transparent"
                      :class="{
                        'bg-[color:hsl(var(--maz-success)_/_15%)] text-[color:hsl(var(--maz-success)_/_100%)] dark:bg-[color:hsl(var(--maz-success)_/_20%)]': log.status === 'Success',
                        'bg-[color:hsl(var(--maz-destructive)_/_15%)] text-[color:hsl(var(--maz-destructive)_/_100%)] dark:bg-[color:hsl(var(--maz-destructive)_/_20%)]': log.status !== 'Success'
                      }"
                    >
                      {{ log.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>

    <!-- ─── Integrasi Data (Merge) ─────────────────────────────────────────── -->
    <div class="mt-8">
      <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
        <div class="p-6 border-b border-[color:hsl(var(--maz-border))] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 class="text-lg font-bold text-[color:hsl(var(--maz-foreground))] flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-[color:hsl(var(--maz-primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Integrasi Data (Merge)
            </h2>
            <p class="text-xs text-[color:hsl(var(--maz-muted))] mt-1">Gabungkan data Non-Tender dengan RUP, Satker, Kaji Ulang, Anggaran, dan PPK</p>
          </div>
          <MazBtn @click="runMerge" :loading="mergeLoading" color="primary" size="sm" :disabled="!mergeStatus.allRequiredFound">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Jalankan Merge
          </MazBtn>
        </div>

        <div class="p-6">
          <!-- Alur / Stepper -->
          <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Alur Integrasi Data</h3>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
              <div v-for="(step, idx) in mergeSteps" :key="idx" class="flex items-center">
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border"
                  :class="{
                    'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400': step.status === 'done',
                    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400': step.status === 'waiting',
                    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400': step.status === 'error',
                    'bg-[color:hsl(var(--maz-foreground)_/_5%)] border-[color:hsl(var(--maz-border))] text-[color:hsl(var(--maz-muted))]': step.status === 'idle'
                  }"
                >
                  <span v-if="step.status === 'done'">✅</span>
                  <span v-else-if="step.status === 'waiting'">⏳</span>
                  <span v-else-if="step.status === 'error'">❌</span>
                  <span v-else>⬜</span>
                  {{ step.label }}
                </div>
                <svg v-if="idx < mergeSteps.length - 1" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mx-1 text-[color:hsl(var(--maz-muted))] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Prasyarat -->
          <div class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Prasyarat Data Sumber</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div v-for="src in mergeStatus.prerequisites" :key="src.endpoint"
                class="flex items-center gap-3 p-3 rounded-lg border text-sm"
                :class="{
                  'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10': src.found,
                  'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10': !src.found && src.required,
                  'border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]': !src.found && !src.required
                }"
              >
                <span class="text-lg">{{ src.found ? '✅' : (src.required ? '❌' : '⬜') }}</span>
                <div class="min-w-0">
                  <div class="font-semibold text-[color:hsl(var(--maz-foreground))]">
                    {{ src.label }}
                    <span v-if="src.required" class="text-red-500 text-[10px] ml-1">WAJIB</span>
                  </div>
                  <div class="text-[10px] text-[color:hsl(var(--maz-muted))]">
                    {{ src.found ? `${src.count} records` : 'Belum tersedia' }} · {{ src.group }}/{{ src.endpoint }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Last Merge Result -->
          <div v-if="mergeStatus.lastMerge" class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Merge Terakhir</h3>
            <div class="p-4 rounded-lg border border-[color:hsl(var(--maz-border))] bg-[color:hsl(var(--maz-foreground)_/_2%)]">
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span><strong>Waktu:</strong> {{ formatDate(mergeStatus.lastMerge.timestamp) }}</span>
                <span><strong>Trigger:</strong> {{ mergeStatus.lastMerge.trigger }}</span>
                <span><strong>Durasi:</strong> {{ mergeStatus.lastMerge.duration_ms }}ms</span>
                <span><strong>Total:</strong> {{ mergeStatus.lastMerge.result?.total_records }} records</span>
                <span>
                  <strong>Status:</strong>
                  <span :class="mergeStatus.lastMerge.status === 'success' ? 'text-green-600' : 'text-red-600'">{{ mergeStatus.lastMerge.status }}</span>
                </span>
              </div>
              <div v-if="mergeStatus.lastMerge.result" class="mt-3 flex flex-wrap gap-2">
                <span class="px-2 py-1 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">RUP Match: {{ mergeStatus.lastMerge.result.rup_matched }}</span>
                <span class="px-2 py-1 rounded text-[10px] font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400">RUP Unmatched: {{ mergeStatus.lastMerge.result.rup_unmatched }}</span>
                <span class="px-2 py-1 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">PPK Lengkap: {{ mergeStatus.lastMerge.result.ppk_completed }}</span>
                <span class="px-2 py-1 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">PPK Belum: {{ mergeStatus.lastMerge.result.ppk_incomplete }}</span>
                <span class="px-2 py-1 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">Kaji Ulang: {{ mergeStatus.lastMerge.result.has_kaji_ulang }}</span>
              </div>
            </div>
          </div>

          <!-- Anomalies -->
          <div v-if="mergeStatus.lastMerge?.anomalies?.length" class="mb-6">
            <h3 class="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">⚠️ Anomali Terdeteksi</h3>
            <ul class="space-y-1">
              <li v-for="(anomaly, idx) in mergeStatus.lastMerge.anomalies" :key="idx" class="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                <span class="mt-0.5">•</span>
                <span>{{ anomaly }}</span>
              </li>
            </ul>
          </div>

          <!-- Merge History -->
          <div v-if="mergeStatus.history?.length">
            <h3 class="text-sm font-bold uppercase tracking-wider text-[color:hsl(var(--maz-muted))] mb-3">Riwayat Merge</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm text-[color:hsl(var(--maz-foreground))]">
                <thead class="text-xs uppercase bg-[color:hsl(var(--maz-foreground)_/_5%)] text-[color:hsl(var(--maz-muted))]">
                  <tr>
                    <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Waktu</th>
                    <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Trigger</th>
                    <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Records</th>
                    <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Durasi</th>
                    <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))]">Status</th>
                    <th class="px-4 py-3 font-semibold border-b border-[color:hsl(var(--maz-border))] text-center">Anomali</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in mergeStatus.history" :key="h.id" class="border-b border-[color:hsl(var(--maz-border))] hover:bg-[color:hsl(var(--maz-foreground)_/_3%)]">
                    <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(h.timestamp) }}</td>
                    <td class="px-4 py-3 font-mono text-xs">{{ h.trigger }}</td>
                    <td class="px-4 py-3 text-center font-bold">{{ h.result?.total_records || 0 }}</td>
                    <td class="px-4 py-3 text-center">{{ h.duration_ms }}ms</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-0.5 text-xs font-semibold rounded-full"
                        :class="h.status === 'success' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'"
                      >{{ h.status }}</span>
                    </td>
                    <td class="px-4 py-3 text-center">{{ h.anomalies?.length || 0 }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="mergeMessage" class="mt-4 p-3 rounded-lg text-sm" :class="mergeSuccess ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
            {{ mergeMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const loading = ref(true);
const syncLoading = ref(false);
const savingCron = ref(false);
const saveMessage = ref('');

const cronSchedule = ref('0 6,12 * * *');
const logs = ref([]);

const stats = ref({
  totalFiles: 0,
  totalSizeBytes: 0,
  ramSizeBytes: 0
});

// ─── Endpoint Config State ──────────────────────────────────────────────────
const endpointConfigLoading = ref(true);
const savingEndpoints = ref(false);
const endpointSaveMessage = ref('');
const endpointRegistry = ref({});
const localActiveEndpoints = ref({});

const fetchEndpointsConfig = async () => {
  endpointConfigLoading.value = true;
  try {
    const res = await $fetch('/api/admin/endpoints-config');
    if (res.success) {
      endpointRegistry.value = res.data.registry;
      // Deep clone to avoid mutation issues
      localActiveEndpoints.value = JSON.parse(JSON.stringify(res.data.activeEndpoints));
    }
  } catch (error) {
    console.error('Failed to load endpoints config', error);
  } finally {
    endpointConfigLoading.value = false;
  }
};

const isEndpointActive = (group, endpoint) => {
  return localActiveEndpoints.value[group]?.includes(endpoint) ?? false;
};

const toggleEndpoint = (group, endpoint) => {
  if (!localActiveEndpoints.value[group]) {
    localActiveEndpoints.value[group] = [];
  }
  const idx = localActiveEndpoints.value[group].indexOf(endpoint);
  if (idx === -1) {
    localActiveEndpoints.value[group].push(endpoint);
  } else {
    localActiveEndpoints.value[group].splice(idx, 1);
  }
};

const isAllGroupActive = (group) => {
  const registry = endpointRegistry.value[group];
  if (!registry) return false;
  return registry.every(item => isEndpointActive(group, item.endpoint));
};

const toggleAllGroup = (group) => {
  const registry = endpointRegistry.value[group];
  if (!registry) return;
  
  if (isAllGroupActive(group)) {
    // Nonaktifkan semua
    localActiveEndpoints.value[group] = [];
  } else {
    // Aktifkan semua
    localActiveEndpoints.value[group] = registry.map(item => item.endpoint);
  }
};

const saveEndpointsConfig = async () => {
  savingEndpoints.value = true;
  endpointSaveMessage.value = '';
  try {
    const res = await $fetch('/api/admin/endpoints-config', {
      method: 'POST',
      body: { activeEndpoints: localActiveEndpoints.value }
    });
    if (res.success) {
      endpointSaveMessage.value = res.message;
      setTimeout(() => { endpointSaveMessage.value = '' }, 3000);
    } else {
      alert('Gagal: ' + res.message);
    }
  } catch (error) {
    alert('Terjadi kesalahan saat menyimpan konfigurasi endpoint');
  } finally {
    savingEndpoints.value = false;
  }
};

// ─── Backup & Restore ───────────────────────────────────────────────────────
const fileInputRef = ref(null);
const isUploading = ref(false);
const uploadMessage = ref('');
const uploadSuccess = ref(false);

const downloadBackup = () => {
  // Buka rute download backup di tab baru
  window.open('/api/admin/data-backup', '_blank');
};

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click();
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.name.endsWith('.zip')) {
    uploadSuccess.value = false;
    uploadMessage.value = 'Hanya menerima file berekstensi .zip';
    return;
  }

  isUploading.value = true;
  uploadMessage.value = '';
  
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await $fetch('/api/admin/data-import', {
      method: 'POST',
      body: formData
    });
    
    uploadSuccess.value = res.success;
    uploadMessage.value = res.message;
    
    if (res.success) {
      // Refresh stats setelah import berhasil
      setTimeout(() => {
        fetchStats();
      }, 1000);
    }
  } catch (error) {
    uploadSuccess.value = false;
    uploadMessage.value = error.response?._data?.message || error.message || 'Gagal mengunggah file';
  } finally {
    isUploading.value = false;
    // Reset input file agar bisa mengunggah file yang sama lagi jika perlu
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
};

// ─── Existing Functions ─────────────────────────────────────────────────────

const fetchStats = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/admin/system-stats');
    if (res.success) {
      stats.value = res.data;
    }
    await fetchCronInfo();
  } catch (error) {
    console.error('Failed to load system stats', error);
  } finally {
    loading.value = false;
  }
};

const fetchCronInfo = async () => {
  try {
    const res = await $fetch('/api/admin/cron');
    if (res.success) {
      if (res.data.config?.schedule) cronSchedule.value = res.data.config.schedule;
      if (res.data.logs) {
        // Urutkan dari yang terbaru
        logs.value = res.data.logs.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      }
    }
  } catch (error) {
    console.error('Failed to load cron config', error);
  }
};

const saveCron = async () => {
  savingCron.value = true;
  saveMessage.value = '';
  try {
    const res = await $fetch('/api/admin/cron', {
      method: 'POST',
      body: { schedule: cronSchedule.value }
    });
    if (res.success) {
      saveMessage.value = res.message;
      setTimeout(() => { saveMessage.value = '' }, 3000);
    } else {
      alert('Gagal: ' + res.message);
    }
  } catch (error) {
    alert('Terjadi kesalahan saat menyimpan jadwal');
  } finally {
    savingCron.value = false;
  }
};

const syncAllEndpoints = async () => {
  if (!confirm('Apakah Anda yakin ingin menyinkronkan ulang seluruh data sekarang? Proses ini akan berjalan di latar belakang dan mungkin membutuhkan waktu beberapa saat.')) {
    return;
  }
  
  syncLoading.value = true;
  try {
    const res = await $fetch('/api/admin/cron-sync', { method: 'POST' });
    if (res.success) {
      alert('Berhasil: ' + res.message);
      // Wait a bit and refresh logs
      setTimeout(fetchCronInfo, 2000);
    }
  } catch (error) {
    alert('Terjadi kesalahan saat memicu sinkronisasi');
  } finally {
    syncLoading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

onMounted(() => {
  fetchStats();
  fetchEndpointsConfig();
  fetchMergeStatus();
});

// ─── Merge State ────────────────────────────────────────────────────────────
const mergeLoading = ref(false);
const mergeMessage = ref('');
const mergeSuccess = ref(false);
const mergeStatus = ref({
  prerequisites: [],
  allRequiredFound: false,
  lastMerge: null,
  history: []
});

const mergeSteps = computed(() => {
  const hasData = mergeStatus.value.prerequisites?.some(s => s.found && s.endpoint === 'non-tender-pengumuman');
  const hasPpk = mergeStatus.value.prerequisites?.find(s => s.endpoint === 'ppk-master');
  const lastMerge = mergeStatus.value.lastMerge;

  return [
    { label: '1. Sync API', status: hasData ? 'done' : 'waiting' },
    { label: '2. Data Tersimpan', status: mergeStatus.value.allRequiredFound ? 'done' : 'waiting' },
    { label: '3. PPK Dilengkapi', status: hasPpk?.count > 0 ? 'done' : 'waiting' },
    { label: '4. Merge', status: lastMerge?.status === 'success' ? 'done' : (lastMerge?.status === 'failed' ? 'error' : 'idle') },
    { label: '5. Dashboard Ready', status: lastMerge?.status === 'success' ? 'done' : 'idle' }
  ];
});

const fetchMergeStatus = async () => {
  try {
    const tahun = new Date().getFullYear().toString();
    const res = await $fetch('/api/admin/merge-status', { params: { tahun } });
    if (res.success) {
      mergeStatus.value = res.data;
    }
  } catch (error) {
    console.error('Failed to load merge status', error);
  }
};

const runMerge = async () => {
  mergeLoading.value = true;
  mergeMessage.value = '';
  try {
    const tahun = new Date().getFullYear().toString();
    const res = await $fetch('/api/admin/merge', {
      method: 'POST',
      body: { tahun }
    });
    mergeSuccess.value = res.success;
    mergeMessage.value = res.message;
    if (res.success) {
      await fetchMergeStatus();
      setTimeout(() => { mergeMessage.value = ''; }, 5000);
    }
  } catch (error) {
    mergeSuccess.value = false;
    mergeMessage.value = 'Terjadi kesalahan saat menjalankan merge';
  } finally {
    mergeLoading.value = false;
  }
};
</script>
