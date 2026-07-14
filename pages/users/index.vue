<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">Manajemen Pengguna</h1>
        <p class="page-subtitle">Kelola akses administrator dan user</p>
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
              <th class="action-column">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.username }}</td>
              <td><span class="role-badge">{{ user.role }}</span></td>
              <td class="action-column">
                <MazBtn size="sm" color="info" @click="editUser(user)" class="btn-action">Edit</MazBtn>
                <MazBtn size="sm" color="danger" @click="confirmDelete(user)" class="btn-action">Hapus</MazBtn>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="3" class="empty-state">Tidak ada data pengguna.</td>
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
          <MazInput type="password" v-model="userForm.password" block no-label />
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
import { ref, onMounted } from 'vue';

definePageMeta({
  middleware: 'auth'
});

const users = ref([]);
const loading = ref(true);
const userDialog = ref(false);
const userForm = ref({});
const submitted = ref(false);

const loadUsers = async () => {
  loading.value = true;
  try {
    const res = await $fetch('/api/users');
    users.value = res.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    loading.value = false;
  }
};

const openNew = () => {
  userForm.value = {};
  submitted.value = false;
  userDialog.value = true;
};

const hideDialog = () => {
  userDialog.value = false;
  submitted.value = false;
};

const saveUser = async () => {
  submitted.value = true;
  if (userForm.value.username) {
    if (!userForm.value.id && !userForm.value.password) return;
    try {
      if (userForm.value.id) {
        await $fetch(`/api/users/${userForm.value.id}`, {
          method: 'PUT',
          body: {
            username: userForm.value.username,
            password: userForm.value.password || undefined
          }
        });
      } else {
        await $fetch('/api/users', {
          method: 'POST',
          body: {
            username: userForm.value.username,
            password: userForm.value.password,
            role: 'admin'
          }
        });
      }
      userDialog.value = false;
      userForm.value = {};
      loadUsers();
    } catch (error) {
      alert(error.data?.statusMessage || 'Terjadi kesalahan saat menyimpan');
    }
  }
};

const editUser = (user) => {
  userForm.value = { ...user, password: '' };
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
