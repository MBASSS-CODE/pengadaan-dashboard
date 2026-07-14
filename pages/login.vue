<template>
  <div class="flex items-center justify-center min-h-screen bg-surface-50 dark:bg-surface-900">
    <div class="w-full max-w-md p-6">
      <div class="bg-surface-0 dark:bg-surface-800 p-8 shadow rounded-xl border border-surface-200 dark:border-surface-700">
        <div class="text-center mb-8">
          <div class="text-900 dark:text-0 text-3xl font-medium mb-3">Selamat Datang</div>
          <span class="text-600 dark:text-400 font-medium line-height-3">Masuk ke Sistem Dashboard INAPROC</span>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label for="username" class="block text-900 dark:text-0 font-medium mb-2">Username</label>
            <InputText 
              id="username" 
              v-model="username" 
              type="text" 
              class="w-full" 
              placeholder="Masukkan username" 
              required 
            />
          </div>

          <div class="mb-6">
            <label for="password" class="block text-900 dark:text-0 font-medium mb-2">Password</label>
            <Password 
              id="password" 
              v-model="password" 
              :feedback="false" 
              toggleMask 
              class="w-full" 
              inputClass="w-full" 
              placeholder="Masukkan password" 
              required 
            />
          </div>

          <div v-if="errorMessage" class="mb-4 text-red-500 text-sm font-medium">
            {{ errorMessage }}
          </div>

          <Button 
            type="submit" 
            label="Masuk" 
            class="w-full" 
            :loading="loading" 
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Metadata halaman agar tidak menggunakan layout yang memiliki sidebar/header (opsional)
definePageMeta({
  layout: 'blank',
});

const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    });

    if (response.success) {
      // Pindah ke halaman dashboard utama setelah berhasil login
      router.push('/');
    }
  } catch (error) {
    errorMessage.value = error.data?.statusMessage || 'Username atau password salah';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Tambahan styling kustom bila utilitas PrimeFlex/Tailwind tidak mencukupi */
.w-full {
  width: 100%;
}
</style>
