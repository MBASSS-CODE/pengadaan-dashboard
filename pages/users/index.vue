<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-900 dark:text-0">Manajemen Pengguna</h1>
        <p class="text-600 dark:text-400 mt-2">Kelola akses</p>
      </div>
      <Button label="Tambah Pengguna" icon="pi pi-plus" @click="openNew" />
    </div>

    <div class="card bg-surface-0 dark:bg-surface-800 p-4 shadow rounded-xl border border-surface-200 dark:border-surface-700">
      <DataTable :value="users" :loading="loading" paginator :rows="10" 
                 dataKey="id" responsiveLayout="scroll">
        <Column field="username" header="Username" sortable></Column>
        <Column field="role" header="Role">
          <template #body="slotProps">
            <Tag :value="slotProps.data.role" severity="info" />
          </template>
        </Column>
        <Column header="Aksi" :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editUser(slotProps.data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDelete(slotProps.data)" />
          </template>
        </Column>
        <template #empty>
          <div class="text-center p-4">Tidak ada data pengguna.</div>
        </template>
      </DataTable>
    </div>

    <Dialog v-model:visible="userDialog" :style="{width: '450px'}" header="Detail Pengguna" :modal="true" class="p-fluid">
      <div class="field mb-4">
        <label for="username" class="font-medium mb-2 block">Username</label>
        <InputText id="username" v-model.trim="userForm.username" required="true" autofocus :class="{'p-invalid': submitted && !userForm.username}" />
        <small class="p-error" v-if="submitted && !userForm.username">Username harus diisi.</small>
      </div>
      <div class="field mb-4">
        <label for="password" class="font-medium mb-2 block">Password <span v-if="userForm.id" class="text-500 font-normal">(Kosongkan jika tidak ingin mengubah)</span></label>
        <Password id="password" v-model="userForm.password" :required="!userForm.id" toggleMask :feedback="false" />
        <small class="p-error" v-if="submitted && !userForm.id && !userForm.password">Password harus diisi untuk pengguna baru.</small>
      </div>
      <template #footer>
        <Button label="Batal" icon="pi pi-times" text @click="hideDialog"/>
        <Button label="Simpan" icon="pi pi-check" text @click="saveUser" />
      </template>
    </Dialog>
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
    if (!userForm.value.id && !userForm.value.password) {
      return; // Password required for new user
    }

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
      await $fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });
      loadUsers();
    } catch (error) {
      alert(error.data?.statusMessage || 'Gagal menghapus user');
    }
  }
};

onMounted(() => {
  loadUsers();
});
</script>
