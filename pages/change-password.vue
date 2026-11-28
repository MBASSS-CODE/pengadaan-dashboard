<template>
  <div class="min-h-screen bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    <!-- Ambient Glows -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
    <div class="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

    <!-- Header Actions -->
    <div class="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
      <button
        type="button"
        @click="handleLogout"
        class="flex items-center gap-2 text-sm font-medium text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))] transition-colors bg-transparent border-0 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar Akun
      </button>

      <NuxtLink
        v-if="!isForced"
        :to="homePath"
        class="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline no-underline"
      >
        Kembali ke Dashboard
      </NuxtLink>
    </div>

    <!-- Card -->
    <div class="w-full max-w-[440px] bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] p-6 md:p-8 rounded-2xl shadow-xl relative z-10">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight text-[color:hsl(var(--maz-foreground))]">
            Ganti Password
          </h1>
          <p class="text-xs text-[color:hsl(var(--maz-muted))]">
            Akun: <span class="font-semibold text-[color:hsl(var(--maz-foreground))]">{{ userName || 'Pengguna' }}</span>
          </p>
        </div>
      </div>

      <div
        v-if="isForced"
        class="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs leading-relaxed"
      >
        <strong>Password sementara / default terdeteksi.</strong> Demi keamanan akun Anda, wajib mengganti password terlebih dahulu sebelum dapat mengakses dashboard dan menu lainnya.
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-1">
          <label for="current-password" class="block text-sm text-[color:hsl(var(--maz-foreground))]">Password Saat Ini</label>
          <MazInput
            id="current-password"
            v-model="currentPassword"
            type="password"
            placeholder="Masukkan password saat ini"
            required
            block
            no-label
            size="sm"
          />
        </div>

        <div class="space-y-1">
          <label for="new-password" class="block text-sm text-[color:hsl(var(--maz-foreground))]">Password Baru</label>
          <MazInput
            id="new-password"
            v-model="newPassword"
            type="password"
            placeholder="Minimal 8 karakter"
            required
            block
            no-label
            size="sm"
          />
        </div>

        <div class="space-y-1">
          <label for="confirm-password" class="block text-sm text-[color:hsl(var(--maz-foreground))]">Konfirmasi Password Baru</label>
          <MazInput
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Ulangi password baru"
            required
            block
            no-label
            size="sm"
          />
        </div>

        <div v-if="errorMessage" class="p-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 text-center">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="p-2.5 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center">
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-60 cursor-pointer border-0"
        >
          {{ loading ? 'Menyimpan...' : 'Simpan Password Baru' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getDefaultHomePath } from '~/shared/utils/roles';

definePageMeta({
  layout: 'blank'
});

const router = useRouter();
const userName = useCookie('user_name');
const userRole = useCookie('user_role');
const mustChangeCookie = useCookie('must_change_password');
const isForced = computed(() => String(mustChangeCookie.value) === 'true');
const homePath = computed(() => getDefaultHomePath(userRole.value));

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password baru minimal 8 karakter.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Konfirmasi password baru tidak cocok.';
    return;
  }

  if (newPassword.value === currentPassword.value) {
    errorMessage.value = 'Password baru tidak boleh sama dengan password lama.';
    return;
  }

  loading.value = true;
  try {
    const res = await $fetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
      }
    });

    if (res?.success) {
      mustChangeCookie.value = null;
      successMessage.value = 'Password berhasil diperbarui. Mengalihkan ke dashboard...';
      const targetPath = res.redirectTo || homePath.value;
      setTimeout(() => {
        router.push(targetPath);
      }, 600);
    }
  } catch (error) {
    errorMessage.value = error?.data?.statusMessage || 'Gagal mengganti password.';
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    useCookie('is_logged_in').value = null;
    useCookie('user_role').value = null;
    useCookie('user_name').value = null;
    useCookie('must_change_password').value = null;
    router.push('/login');
  }
};
</script>
