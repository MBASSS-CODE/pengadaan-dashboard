<template>
  <div class="login-container min-h-screen bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))] flex items-center justify-center p-4 relative overflow-hidden font-sans">
    
    <!-- Ambient Glows -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
    <div class="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>

    <!-- Header Actions (Back & Dark Mode) -->
    <div class="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
      <NuxtLink to="/" class="flex items-center gap-2 text-sm font-medium text-[color:hsl(var(--maz-muted))] hover:text-[color:hsl(var(--maz-foreground))] transition-colors no-underline">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Beranda
      </NuxtLink>

      <button 
        @click="toggleTheme" 
        class="theme-toggle-btn"
        title="Toggle Dark Mode"
      >
        <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-400 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[color:hsl(var(--maz-foreground))] transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>

    <!-- Login Card -->
    <div class="login-card w-full max-w-[400px] bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] p-6 md:p-8 rounded-2xl shadow-xl relative z-10 my-8 backdrop-blur-md">
      
      <!-- Brand Header -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span class="text-lg font-bold tracking-tight text-[color:hsl(var(--maz-foreground))]">
          Portal PBJ
        </span>
      </div>

      <!-- Title & Subtitle -->
      <div class="mb-6">
        <h1 class="text-xl md:text-2xl font-bold tracking-tight mb-1.5 text-[color:hsl(var(--maz-foreground))]">
          Masuk ke Portal PBJ
        </h1>
        <p class="text-sm text-[color:hsl(var(--maz-muted))] leading-relaxed">
          Gunakan akun atau lanjutkan dengan SSO terintegrasi.
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-1">
          <label for="username" class="block text-sm text-[color:hsl(var(--maz-foreground))]">Username / Email</label>
          <MazInput 
            id="username" 
            v-model="username" 
            type="text" 
            placeholder="Masukkan username atau email" 
            required 
            block
            no-label
            size="sm"
          />
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm text-[color:hsl(var(--maz-foreground))]">Password</label>
          <MazInput 
            id="password" 
            v-model="password" 
            type="password"
            placeholder="Masukkan password" 
            required 
            block
            no-label
            size="sm"
          />
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2 cursor-pointer select-none text-[color:hsl(var(--maz-muted))]">
            <input type="checkbox" v-model="rememberMe" class="rounded border-[color:hsl(var(--maz-border))] text-blue-600 focus:ring-blue-500 h-4 w-4" />
            <span>Ingat saya</span>
          </label>
        </div>

        <!-- Cloudflare Turnstile -->
        <div id="turnstile-widget" class="w-full mt-1 [&>iframe]:!w-full"></div>

        <div v-if="errorMessage" class="p-2.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 text-center">
          {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          class="w-full font-medium py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2 border-0 outline-none" 
          :disabled="loading"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Masuk
        </button>

        <!-- Divider -->
        <!-- <div class="relative flex items-center justify-center my-4">
          <div class="border-t border-[color:hsl(var(--maz-border))] w-full"></div>
          <span class="bg-[color:hsl(var(--maz-background))] px-2 text-[11px] text-[color:hsl(var(--maz-muted))] absolute uppercase tracking-widest">atau</span>
        </div> -->

        <!-- SSO Button -->
        <!-- <button 
          type="button" 
          class="w-full font-medium py-2.5 px-4 bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center justify-center" 
          @click="handleSSO"
        >
          SSO Terintegrasi
        </button> -->
      </form>

      <!-- Footer Note -->
      <p class="mt-6 text-[11px] text-center text-[color:hsl(var(--maz-muted))] leading-relaxed">
        Jika akun Anda belum memiliki akses, hubungi administrator Portal PBJ.
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCookie, useHead } from '#imports';

useHead({
  script: [
    { src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit', async: true, defer: true }
  ]
});

definePageMeta({
  layout: 'blank',
});

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const turnstileToken = ref('');
const router = useRouter();

// Dark mode logic
const theme = ref('light');

const toggleTheme = () => {
  if (process.client) {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark', 'maz-is-dark');
      document.documentElement.classList.remove('maz-is-light');
    } else {
      document.documentElement.classList.remove('dark', 'maz-is-dark');
      document.documentElement.classList.add('maz-is-light');
    }
  }
};

onMounted(() => {
  if (process.client) {
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    
    // Setup explicit render for SPA routing
    window.onloadTurnstileCallback = () => {
      if (document.getElementById('turnstile-widget') && window.turnstile) {
        window.turnstile.render('#turnstile-widget', {
          sitekey: '0x4AAAAAAEIbwWak0CXz3N7z',
          theme: theme.value === 'dark' ? 'dark' : 'light',
          size: 'flexible'
        });
      }
    };

    // If script is already loaded (e.g. after logout)
    if (window.turnstile) {
      window.onloadTurnstileCallback();
    }
  }
});

const handleLogin = async () => {
  const turnstileResponse = document.querySelector('[name="cf-turnstile-response"]')?.value;
  if (!turnstileResponse) {
    errorMessage.value = 'Selesaikan verifikasi keamanan (Cloudflare) terlebih dahulu.';
    return;
  }
  turnstileToken.value = turnstileResponse;
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
      const isLoggedIn = useCookie('is_logged_in');
      isLoggedIn.value = 'true';
      const userRole = useCookie('user_role');
      userRole.value = response.user.role;
      const userName = useCookie('user_name');
      userName.value = response.user.username;
      router.push('/dashboard');
    }
  } catch (error) {
    errorMessage.value = error.data?.statusMessage || 'Username atau password salah';
  } finally {
    loading.value = false;
  }
};

const handleSSO = () => {
  alert('Layanan SSO sedang disiapkan.');
};
</script>

<style scoped>
.theme-toggle-btn {
  background: hsl(var(--maz-foreground) / 5%);
  border: 1px solid hsl(var(--maz-border));
  padding: 0.6rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: hsl(var(--maz-foreground));
}

.theme-toggle-btn:hover {
  background-color: hsl(var(--maz-foreground) / 10%);
  transform: rotate(15deg) scale(1.05);
}
</style>
