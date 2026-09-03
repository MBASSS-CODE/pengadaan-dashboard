<template>
  <div class="landing-page min-h-screen bg-[color:hsl(var(--maz-background))] text-[color:hsl(var(--maz-foreground))] overflow-x-hidden font-sans">
    <!-- Navbar -->
    <nav class="fixed top-0 left-0 w-full z-50 bg-[color:hsl(var(--maz-background)_/_80%)] backdrop-blur-md border-b border-[color:hsl(var(--maz-border))] transition-all duration-300 py-4 px-6 md:px-12 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span class="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Pengadaan Dashboard
        </span>
      </div>
      <div class="flex items-center gap-4">
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
        <MazBtn v-if="!isLoggedIn" @click="navigateTo('/login')" color="primary" class="font-semibold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-transform flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Masuk
        </MazBtn>
        <MazBtn v-else @click="navigateTo('/dashboard')" color="primary" class="font-semibold shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-transform flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Buka Dashboard
        </MazBtn>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative pt-32 pb-20 px-6 md:px-12 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center z-10">
      <!-- Ambient Background Glows -->
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>

      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium text-sm mb-8 animate-fade-in-up">
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        Sistem Terintegrasi Live
      </div>
      
      <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6 animate-fade-in-up animation-delay-100 max-w-4xl">
        Pusat Kendali <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Pengadaan Terintegrasi</span>
      </h1>
      
      <p class="text-lg md:text-xl text-[color:hsl(var(--maz-muted))] mb-12 max-w-2xl animate-fade-in-up animation-delay-200">
        Pantau realisasi belanja, evaluasi kinerja PPK, dan manfaatkan analisis mendalam untuk pengambilan keputusan strategis—semua dalam satu dashboard canggih.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
        <MazBtn v-if="!isLoggedIn" @click="navigateTo('/login')" color="primary" size="lg" class="shadow-xl shadow-blue-500/25 px-8 font-bold">
          Mulai Sekarang
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </MazBtn>
        <MazBtn v-else @click="navigateTo('/dashboard')" color="primary" size="lg" class="shadow-xl shadow-blue-500/25 px-8 font-bold">
          Menuju Dashboard Utama
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </MazBtn>
        <MazBtn @click="navigateTo('/public-dashboard')" outline color="primary" size="lg" class="px-8 font-bold bg-[color:hsl(var(--maz-background)_/_50%)] backdrop-blur-sm">
          Lihat Dashboard Publik
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </MazBtn>
      </div>

      <!-- Dashboard Image -->
      <div class="mt-16 w-full max-w-5xl relative animate-fade-in-up animation-delay-400">
        <div class="absolute inset-0 bg-gradient-to-t from-[color:hsl(var(--maz-background))] via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
        <div class="rounded-2xl border border-[color:hsl(var(--maz-border))] shadow-2xl overflow-hidden transform perspective-1000 rotate-x-12 scale-50 transition-transform duration-700 hover:rotate-x-0 hover:scale-105">
          <img src="/images/media__1785769232479.png" alt="Dashboard Pengadaan" class="w-full h-auto object-cover" />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 px-6 md:px-12 relative z-20">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Fitur Unggulan Sistem</h2>
          <p class="text-[color:hsl(var(--maz-muted))] max-w-2xl mx-auto">Dirancang untuk memberikan transparansi dan efisiensi maksimal dalam memonitor seluruh proses pengadaan barang dan jasa.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card group">
            <div class="icon-box bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Analisis Realisasi & Perencanaan</h3>
            <p class="text-[color:hsl(var(--maz-muted))]">Visualisasi komprehensif untuk memantau total belanja pengadaan, persentase capaian UMKK, dan Produk Dalam Negeri (PDN) secara instan.</p>
          </div>

          <!-- Feature 2 -->
          <div class="feature-card group">
            <div class="icon-box bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Manajemen Data & Cache Cerdas</h3>
            <p class="text-[color:hsl(var(--maz-muted))]">Sistem admin yang memungkinkan sinkronisasi data dari API Inaproc secara langsung, dilengkapi monitoring penggunaan RAM dan Disk untuk memastikan performa optimal.</p>
          </div>

          <!-- Feature 3 -->
          <div class="feature-card group">
            <div class="icon-box bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Integrasi Data Master</h3>
            <p class="text-[color:hsl(var(--maz-muted))]">Otomatisasi penggabungan data RUP Penyedia, Swakelola, dan Pencatatan Non-Tender ke dalam satu dataset yang siap dianalisis secara transparan.</p>
          </div>

          <!-- Feature 4 -->
          <div class="feature-card group">
            <div class="icon-box bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Evaluasi Kinerja PPK</h3>
            <p class="text-[color:hsl(var(--maz-muted))]">Pantau langsung beban kerja setiap Pejabat Pembuat Komitmen (PPK) dan Satuan Kerja dengan peringkat pagu terbesar secara efisien.</p>
          </div>

          <!-- Feature 5 -->
          <div class="feature-card group">
            <div class="icon-box bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Transparansi Data</h3>
            <p class="text-[color:hsl(var(--maz-muted))]">Akses informasi pengadaan secara terbuka dan akuntabel sesuai prinsip keterbukaan pemerintah yang terintegrasi penuh.</p>
          </div>

          <!-- Feature 6 -->
          <div class="feature-card group">
            <div class="icon-box bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold mb-3">Pencarian & Filter Cepat</h3>
            <p class="text-[color:hsl(var(--maz-muted))]">Temukan paket pengadaan dengan mudah menggunakan fitur pencarian terpadu dan kustomisasi parameter filter tingkat lanjut.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer CTA -->
    <section class="py-20 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 opacity-90 -z-10"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -z-10"></div>
      
      <div class="max-w-4xl mx-auto text-center px-6">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Siap Mengelola Data Pengadaan Lebih Baik?</h2>
        <p class="text-blue-400 mb-10 text-lg">Akses seluruh fitur dashboard sekarang dan dapatkan insight yang Anda butuhkan.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-slate-300 rounded-t-[2.5rem] md:rounded-t-[1rem] pt-16 pb-12 px-6 md:px-12 relative z-20 border-t border-slate-800/80 shadow-2xl -mt-8">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
        
        <!-- Brand Info -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="text-xl font-extrabold tracking-tight text-white">
              Pengadaan Dashboard
            </span>
          </div>
          <p class="text-slate-400 text-sm leading-relaxed max-w-sm">
            Platform transparansi dan monitoring pengadaan barang/jasa pemerintah yang terintegrasi dan mudah diakses.
          </p>
        </div>

        <!-- Menu -->
        <div class="space-y-3">
          <h4 class="text-white font-semibold text-sm tracking-wider">Menu</h4>
          <ul class="space-y-2 text-sm text-slate-400 list-none p-0 m-0">
            <li><a href="#" class="text-slate-400 hover:text-white transition-colors no-underline">Beranda</a></li>
            <li><a href="#" class="text-slate-400 hover:text-white transition-colors no-underline">Fitur</a></li>
            <li><a href="#" class="text-slate-400 hover:text-white transition-colors no-underline">Statistik</a></li>
            <li><a href="#" class="text-slate-400 hover:text-white transition-colors no-underline">FAQ</a></li>
            <li><a href="#" class="text-slate-400 hover:text-white transition-colors no-underline">Konsultasi</a></li>
            <li><a href="#" class="text-slate-400 hover:text-white transition-colors no-underline">Kontak</a></li>
          </ul>
        </div>

        <!-- Akun -->
        <div class="space-y-3">
          <h4 class="text-white font-semibold text-sm tracking-wider">Akun</h4>
          <ul class="space-y-2 text-sm text-slate-400 list-none p-0 m-0">
            <li>
              <NuxtLink v-if="!isLoggedIn" to="/login" class="text-slate-400 hover:text-white transition-colors no-underline">Masuk</NuxtLink>
              <NuxtLink v-else to="/dashboard" class="text-slate-400 hover:text-white transition-colors no-underline">Dashboard</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Tautan Terkait -->
        <div class="space-y-3">
          <h4 class="text-white font-semibold text-sm tracking-wider">Tautan Terkait</h4>
          <ul class="space-y-2 text-sm text-slate-400 list-none p-0 m-0">
            <li><NuxtLink to="/public-dashboard" class="text-slate-400 hover:text-white transition-colors no-underline font-medium text-blue-400">Dashboard Publik</NuxtLink></li>
            <li><a href="https://inaproc.lkpp.go.id" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-white transition-colors no-underline">INAPROC LKPP</a></li>
            <li><a href="https://data.inaproc.id/" target="_blank" rel="noopener noreferrer" class="text-slate-400 hover:text-white transition-colors no-underline">INAPROC DATA</a></li>
          </ul>
        </div>

      </div>

      <!-- Copyright -->
      <div class="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>&copy; 2026 Pengadaan Dashboard. Hak Cipta Dilindungi.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useCookie } from '#imports'

definePageMeta({
  layout: 'blank'
});

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

import { onMounted } from '#imports';
onMounted(() => {
  if (process.client) {
    theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
});
const isLoggedIn = useCookie('is_logged_in');
</script>

<style scoped>
.feature-card {
  @apply bg-[color:hsl(var(--maz-background))] border border-[color:hsl(var(--maz-border))] rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 relative overflow-hidden;
}

.feature-card::before {
  content: '';
  @apply absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 origin-left transition-transform duration-300;
}

.feature-card:hover::before {
  @apply scale-x-100;
}

.icon-box {
  @apply w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-400 { animation-delay: 400ms; }

/* 3D perspective utility */
.perspective-1000 {
  perspective: 1000px;
}
.rotate-x-12 {
  transform: rotateX(12deg) scale(1.05);
}
.hover\:rotate-x-0:hover {
  transform: rotateX(0deg) scale(1);
}
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
