<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Manajemen Pengguna</h1>
        <p class="page-subtitle">Kelola akses administrator, PPK, dan user</p>
      </div>
      <MazBtn @click="openNew">Tambah Pengguna</MazBtn>
    </div>

    <div class="content-card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>PPK Terkait</th>
              <th>Status Password</th>
              <th class="action-column">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td><span class="role-badge" :class="`role-${user.role}`">{{ user.role }}</span></td>
              <td>
                <span v-if="user.role === 'ppk' && user.ppk_nama_lengkap" class="text-sm font-medium">
                  {{ user.ppk_nama_lengkap }}
                  <span v-if="user.ppk_nip_asli" class="block text-xs text-[color:hsl(var(--maz-muted))] font-mono">
                    {{ user.ppk_nip_asli }}
                  </span>
                </span>
                <span v-else-if="user.role === 'ppk'" class="text-xs text-amber-600 dark:text-amber-400">
                  Belum terhubung ke Master PPK
                </span>
                <span v-else class="text-xs text-[color:hsl(var(--maz-muted))]">-</span>
              </td>
              <td>
                <span v-if="user.must_change_password" class="temp-pass-badge">
                  Temporary (Wajib Ganti)
                </span>
                <span v-else class="text-xs text-[color:hsl(var(--maz-muted))]">Normal</span>
              </td>
              <td class="action-column">
                <template v-if="user.role !== 'developer' || isCurrentUserDeveloper">
                  <MazBtn size="sm" color="info" @click="editUser(user)" class="btn-action">Edit</MazBtn>
                  <MazBtn size="sm" color="danger" @click="confirmDelete(user)" class="btn-action">Hapus</MazBtn>
                </template>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="empty-state">Tidak ada data pengguna.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Dialog Modal -->
    <div v-if="userDialog" class="modal-overlay">
      <div class="modal-card">
        <h2 class="modal-title">Detail Pengguna</h2>
        
        <div class="form-group">
          <label class="form-label">Username</label>
          <MazInput v-model="userForm.username" block no-label />
        </div>
        
        <div class="form-group">
          <label class="form-label">Password</label>
          <MazInput
            type="password"
            v-model="userForm.password"
            :placeholder="userForm.id ? 'Kosongkan jika tidak mengubah password' : 'Masukkan password'"
            block
            no-label
          />
        </div>

        <div class="form-group">
          <label class="form-label">Role</label>
          <select v-model="userForm.role" class="form-select">
            <option v-if="isCurrentUserDeveloper" value="developer">Developer</option>
            <option value="admin">Administrator</option>
            <option value="ppk">PPK (Pejabat Pembuat Komitmen)</option>
            <option value="user">User Biasa</option>
          </select>
        </div>

        <div v-if="userForm.role === 'ppk'" class="form-group">
          <label class="form-label">Pilih Data PPK (Master PPK)</label>
          <select v-model="userForm.ppk_master_id" class="form-select">
            <option :value="null">-- Pilih Pejabat Pembuat Komitmen --</option>
            <option v-for="ppk in ppkMasterOptions" :key="ppk.id" :value="ppk.id">
              {{ ppk.nama_lengkap }} ({{ ppk.nip_asli || ppk.nip_nama_masked }})
            </option>
          </select>
          <p v-if="ppkMasterOptions.length === 0" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Belum ada data PPK tersimpan di database. Lengkapi terlebih dahulu di menu Admin → Data PPK.
          </p>
        </div>

        <div class="form-group">
          <label class="temp-checkbox-card">
            <input type="checkbox" v-model="userForm.must_change_password" />
            <div>
              <div class="temp-checkbox-title">Temporary Password (Password Sementara)</div>
              <div class="temp-checkbox-desc">
                Jika dicentang, pengguna wajib mengganti password saat login berikutnya.
              </div>
            </div>
          </label>
        </div>
        
        <div class="modal-actions">
          <MazBtn color="transparent" @click="hideDialog">Batal</MazBtn>
          <MazBtn @click="saveUser">Simpan</MazBtn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { isDeveloper } from '~/shared/utils/roles';

const currentUserRole = useCookie('user_role');
const isCurrentUserDeveloper = computed(() => isDeveloper(currentUserRole.value));

const users = ref([]);
const ppkMasterOptions = ref([]);
const loading = ref(true);
const userDialog = ref(false);
const userForm = ref({ role: 'user', ppk_master_id: null, must_change_password: false });
const submitted = ref(false);

const loadUsers = async () => {
  loading.value = true;
  try {
    const [res, ppkRes] = await Promise.all([
      $fetch('/api/users', {
        headers: useRequestHeaders(['cookie']) // Ensure cookies are passed if running in SSR
      }),
      $fetch('/api/admin/ppk-master', {
        headers: useRequestHeaders(['cookie'])
      }).catch(() => ({ data: [] }))
    ]);
    users.value = res.data || [];
    ppkMasterOptions.value = (ppkRes?.data || [])
      .filter((p) => p.is_in_db && p.id && p.nama_lengkap)
      .sort((a, b) => String(a.nama_lengkap).localeCompare(String(b.nama_lengkap)));
  } catch (error) {
    console.error('Error fetching users:', error);
    // Global fetch plugin will handle 401 redirect
  } finally {
    loading.value = false;
  }
};

const openNew = () => {
  userForm.value = { role: 'user', ppk_master_id: null, must_change_password: false };
  submitted.value = false;
  userDialog.value = true;
};

const hideDialog = () => {
  userDialog.value = false;
  submitted.value = false;
};

const saveUser = async () => {
  submitted.value = true;
  if (!userForm.value.username) return;
  if (!userForm.value.id && !userForm.value.password) {
    alert('Password wajib diisi untuk pengguna baru.');
    return;
  }
  if (userForm.value.role === 'ppk' && !userForm.value.ppk_master_id) {
    alert('Silakan pilih data PPK dari Master PPK.');
    return;
  }

  try {
    const payload = {
      username: userForm.value.username,
      password: userForm.value.password || undefined,
      role: userForm.value.role || 'user',
      ppk_master_id: userForm.value.role === 'ppk' ? userForm.value.ppk_master_id : null,
      must_change_password: Boolean(userForm.value.must_change_password)
    };

    if (userForm.value.id) {
      await $fetch(`/api/users/${userForm.value.id}`, {
        method: 'PUT',
        body: payload
      });
    } else {
      await $fetch('/api/users', {
        method: 'POST',
        body: payload
      });
    }
    userDialog.value = false;
    userForm.value = { role: 'user', ppk_master_id: null, must_change_password: false };
    loadUsers();
  } catch (error) {
    alert(error.data?.statusMessage || 'Terjadi kesalahan saat menyimpan');
  }
};

const editUser = (user) => {
  userForm.value = {
    ...user,
    password: '',
    ppk_master_id: user.ppk_master_id ?? null,
    must_change_password: Boolean(user.must_change_password)
  };
  userDialog.value = true;
};

const confirmDelete = async (user) => {
  if (confirm(`Apakah Anda yakin ingin menghapus ${user.username}?`)) {
    try {
      await $fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      loadUsers();
    } catch (error) {
      alert(error.data?.statusMessage || 'Gagal menghapus user');
    }
  }
};

onMounted(() => loadUsers());
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: hsl(var(--maz-foreground));
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  font-size: 0.95rem;
  color: hsl(var(--maz-muted));
  margin: 0;
}

.content-card {
  background-color: hsl(var(--maz-background));
  border-radius: var(--maz-border-radius, 0.5rem);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid hsl(var(--maz-border));
  padding: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table th, .data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid hsl(var(--maz-border));
}

.data-table th {
  font-weight: 600;
  color: hsl(var(--maz-muted));
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  transition: background-color 0.2s ease;
}

.data-table tbody tr:hover {
  background-color: hsl(var(--maz-foreground) / 5%);
}

.action-column {
  text-align: right;
  white-space: nowrap;
}

.btn-action {
  margin-left: 0.5rem;
}

.role-badge {
  background-color: hsl(var(--maz-primary) / 20%);
  color: hsl(var(--maz-primary));
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.role-badge.role-developer {
  background-color: rgba(139, 92, 246, 0.16);
  color: #7c3aed;
}

.role-badge.role-user {
  background-color: hsl(var(--maz-foreground) / 10%);
  color: hsl(var(--maz-muted));
}

.role-badge.role-ppk {
  background-color: rgba(16, 185, 129, 0.16);
  color: #059669;
}

.temp-pass-badge {
  background-color: rgba(245, 158, 11, 0.16);
  color: #b45309;
  padding: 0.2rem 0.6rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.temp-checkbox-card {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.75rem;
  border-radius: var(--maz-border-radius, 0.5rem);
  border: 1px solid hsl(var(--maz-border));
  background-color: hsl(var(--maz-foreground) / 2%);
  cursor: pointer;
}

.temp-checkbox-card input[type='checkbox'] {
  margin-top: 0.2rem;
  width: 1rem;
  height: 1rem;
  accent-color: hsl(var(--maz-primary));
}

.temp-checkbox-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--maz-foreground));
}

.temp-checkbox-desc {
  font-size: 0.75rem;
  color: hsl(var(--maz-muted));
  margin-top: 0.15rem;
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: hsl(var(--maz-muted));
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-card {
  background-color: hsl(var(--maz-background));
  width: 100%;
  max-width: 450px;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid hsl(var(--maz-border));
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  color: hsl(var(--maz-foreground));
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: hsl(var(--maz-foreground));
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--maz-border-radius, 0.5rem);
  border: 1px solid hsl(var(--maz-border));
  background-color: hsl(var(--maz-background));
  color: hsl(var(--maz-foreground));
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: hsl(var(--maz-primary));
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
