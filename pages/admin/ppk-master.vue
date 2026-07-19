<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))]">Data PPK (Pejabat Pembuat Komitmen)</h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] mt-1">Lengkapi data PPK untuk integrasi data Non-Tender. Data PPK dari API disamarkan, admin melengkapi secara manual.</p>
      </div>
      <MazBtn @click="fetchPpk" :loading="loading" color="primary" outline size="sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </MazBtn>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <div class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Total PPK</div>
        <div class="text-2xl font-bold text-[color:hsl(var(--maz-foreground))] mt-1">{{ meta.totalFromApi }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <div class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Sudah Dilengkapi</div>
        <div class="text-2xl font-bold text-green-600 mt-1">{{ meta.totalCompleted }}</div>
      </div>
      <div class="bg-[color:hsl(var(--maz-background))] p-4 rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm">
        <div class="text-sm font-semibold text-[color:hsl(var(--maz-muted))] uppercase tracking-wider">Belum Dilengkapi</div>
        <div class="text-2xl font-bold text-amber-500 mt-1">{{ meta.totalIncomplete }}</div>
      </div>
    </div>

    <!-- PPK List -->
    <div class="bg-[color:hsl(var(--maz-background))] rounded-xl border border-[color:hsl(var(--maz-border))] shadow-sm overflow-hidden">
      <div v-if="loading" class="p-10 flex items-center justify-center">
        <MazSpinner color="primary" />
      </div>

      <div v-else class="divide-y divide-[color:hsl(var(--maz-border))]">
        <div 
          v-for="(ppk, idx) in ppkList" 
          :key="ppk.nip_nama_masked" 
          class="p-5 transition-colors"
          :class="{ 'bg-[color:hsl(var(--maz-foreground)_/_2%)]': idx % 2 === 0 }"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-4">
            <!-- Left: Status & Masked Info -->
            <div class="flex items-start gap-3 lg:w-1/3 min-w-0">
              <div class="mt-1">
                <span 
                  v-if="ppk.is_completed"
                  class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span 
                  v-else
                  class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </span>
              </div>
              <div class="min-w-0">
                <div class="text-xs font-mono text-[color:hsl(var(--maz-muted))] break-all">{{ ppk.nip_nama_masked }}</div>
                <div v-if="ppk.nama_lengkap" class="mt-1 text-sm font-bold text-[color:hsl(var(--maz-primary))]">
                  → {{ ppk.nama_lengkap }}
                </div>
                <div v-if="ppk.updated_at" class="text-[10px] text-[color:hsl(var(--maz-muted))] mt-1">
                  Terakhir diperbarui: {{ formatDate(ppk.updated_at) }}
                </div>
              </div>
            </div>

            <!-- Right: Edit Form -->
            <div class="flex-1">
              <div v-if="editingMasked === ppk.nip_nama_masked" class="space-y-3">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider">
                      Nama Lengkap <span class="text-red-500">*</span>
                    </label>
                    <MazInput v-model="editForm.nama_lengkap" placeholder="Nama lengkap PPK" size="sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider">NIP Asli</label>
                    <MazInput v-model="editForm.nip_asli" placeholder="NIP (opsional)" size="sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider">Jabatan</label>
                    <MazInput v-model="editForm.jabatan" placeholder="Jabatan (opsional)" size="sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider">Unit Kerja</label>
                    <MazInput v-model="editForm.unit_kerja" placeholder="Unit kerja (opsional)" size="sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider">Telepon</label>
                    <MazInput v-model="editForm.telepon" placeholder="No. telepon (opsional)" size="sm" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[color:hsl(var(--maz-muted))] mb-1 uppercase tracking-wider">Email</label>
                    <MazInput v-model="editForm.email" placeholder="Email (opsional)" size="sm" />
                  </div>
                </div>
                <div class="flex gap-2 pt-1">
                  <MazBtn @click="savePpk" :loading="saving" color="primary" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan
                  </MazBtn>
                  <MazBtn @click="cancelEdit" color="transparent" size="sm">Batal</MazBtn>
                </div>
              </div>

              <div v-else class="flex items-center gap-2">
                <MazBtn @click="startEdit(ppk)" color="primary" outline size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {{ ppk.is_completed ? 'Edit' : 'Lengkapi Data' }}
                </MazBtn>
                <MazBtn v-if="ppk.is_completed" @click="deletePpk(ppk.nip_nama_masked)" color="danger" outline size="sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </MazBtn>
                <!-- Quick info if completed -->
                <div v-if="ppk.is_completed" class="hidden sm:flex items-center gap-4 text-xs text-[color:hsl(var(--maz-muted))] ml-2">
                  <span v-if="ppk.jabatan">{{ ppk.jabatan }}</span>
                  <span v-if="ppk.unit_kerja">{{ ppk.unit_kerja }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="ppkList.length === 0" class="p-10 text-center text-[color:hsl(var(--maz-muted))]">
          <p class="font-medium">Belum ada data PPK.</p>
          <p class="text-sm mt-1">Pastikan data Non-Tender sudah di-sync terlebih dahulu.</p>
        </div>
      </div>
    </div>

    <!-- Save notification -->
    <div v-if="notification" class="fixed bottom-6 right-6 z-50 max-w-sm">
      <div 
        class="px-4 py-3 rounded-lg shadow-lg text-sm font-medium border"
        :class="{
          'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800': notificationType === 'success',
          'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800': notificationType === 'error'
        }"
      >
        {{ notification }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const loading = ref(true);
const saving = ref(false);
const ppkList = ref([]);
const meta = ref({ totalFromApi: 0, totalCompleted: 0, totalIncomplete: 0 });

// Edit state
const editingMasked = ref(null);
const editForm = ref({
  nama_lengkap: '',
  nip_asli: '',
  jabatan: '',
  unit_kerja: '',
  telepon: '',
  email: ''
});

// Notification
const notification = ref('');
const notificationType = ref('success');
let notificationTimer = null;

const showNotification = (msg, type = 'success') => {
  notification.value = msg;
  notificationType.value = type;
  if (notificationTimer) clearTimeout(notificationTimer);
  notificationTimer = setTimeout(() => { notification.value = ''; }, 3000);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateString));
};

const fetchPpk = async () => {
  loading.value = true;
  try {
    const tahun = new Date().getFullYear().toString();
    const res = await $fetch('/api/admin/ppk-master', { params: { tahun } });
    if (res.success) {
      ppkList.value = res.data;
      meta.value = res.meta;
    }
  } catch (error) {
    console.error('Failed to load PPK', error);
    showNotification('Gagal memuat data PPK', 'error');
  } finally {
    loading.value = false;
  }
};

const startEdit = (ppk) => {
  editingMasked.value = ppk.nip_nama_masked;
  editForm.value = {
    nama_lengkap: ppk.nama_lengkap || '',
    nip_asli: ppk.nip_asli || '',
    jabatan: ppk.jabatan || '',
    unit_kerja: ppk.unit_kerja || '',
    telepon: ppk.telepon || '',
    email: ppk.email || ''
  };
};

const cancelEdit = () => {
  editingMasked.value = null;
  editForm.value = { nama_lengkap: '', nip_asli: '', jabatan: '', unit_kerja: '', telepon: '', email: '' };
};

const savePpk = async () => {
  if (!editForm.value.nama_lengkap.trim()) {
    showNotification('Nama lengkap wajib diisi', 'error');
    return;
  }

  saving.value = true;
  try {
    const res = await $fetch('/api/admin/ppk-master', {
      method: 'POST',
      body: {
        nip_nama_masked: editingMasked.value,
        ...editForm.value
      }
    });
    if (res.success) {
      showNotification(res.message);
      cancelEdit();
      await fetchPpk();
    }
  } catch (error) {
    showNotification('Gagal menyimpan data PPK', 'error');
  } finally {
    saving.value = false;
  }
};

const deletePpk = async (masked) => {
  if (!confirm('Yakin ingin menghapus data PPK ini? Data akan dikembalikan ke status "Belum Dilengkapi".')) return;

  try {
    const res = await $fetch('/api/admin/ppk-master', {
      method: 'DELETE',
      body: { nip_nama_masked: masked }
    });
    if (res.success) {
      showNotification(res.message);
      await fetchPpk();
    }
  } catch (error) {
    showNotification('Gagal menghapus data PPK', 'error');
  }
};

onMounted(() => {
  fetchPpk();
});
</script>
