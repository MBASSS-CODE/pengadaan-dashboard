<template>
    <div class="app-layout">
        <!-- Mobile Backdrop -->
        <div v-if="isMobile && isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>

        <!-- Sidebar -->
        <aside class="app-sidebar" :class="{ 'is-mobile': isMobile, 'is-open': isSidebarOpen }">
            <div class="sidebar-header">
                <div class="flex items-center justify-center w-11 h-11 bg-white dark:bg-slate-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-slate-100/80 dark:border-slate-700/80 shrink-0 transition-transform hover:scale-105 cursor-pointer">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/90/National_emblem_of_Indonesia_Garuda_Pancasila.svg" alt="Garuda Logo" class="w-7 h-7 object-contain drop-shadow-sm" />
                </div>
                <h1 class="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 ml-3.5 mt-0.5" style="font-family: 'Inter', sans-serif;">
                    PRISMA <span class="text-blue-600 dark:text-blue-400">MENPAN</span>
                </h1>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-label">Menu Utama</div>
                <NuxtLink to="/" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </NuxtLink>
                <div class="nav-label mt-5">RUP</div>
                <NuxtLink v-if="isEndpointActive('program-master')" to="/rup/program-master" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Program Master
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('history-kaji-ulang')" to="/rup/history-kaji-ulang" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History Kaji Ulang
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('master-satker')" to="/rup/master-satker" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Master Satker
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('paket-anggaran-penyedia')" to="/rup/paket-anggaran-penyedia" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Anggaran Penyedia
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('paket-anggaran-swakelola')" to="/rup/paket-anggaran-swakelola" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Anggaran Swakelola
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('paket-penyedia')" to="/rup/paket-penyedia" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Paket Penyedia
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('paket-swakelola')" to="/rup/paket-swakelola" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Paket Swakelola
                </NuxtLink>
                <NuxtLink v-if="isEndpointActive('paket-swakelola-terumumkan')" to="/rup/paket-swakelola-terumumkan" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Swakelola Terumumkan
                </NuxtLink>

                <div class="nav-label mt-5">Tender</div>
                <NuxtLink v-if="isEndpointActive('non-tender-pengumuman')" to="/tender/non-tender-pengumuman" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Non-Tender Pengumuman
                </NuxtLink>

                <div class="nav-label mt-5">Summary Table</div>
                <NuxtLink to="/summary-table/non-tender-enriched" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Non-Tender Enriched
                </NuxtLink>
                
                <div class="nav-label mt-5">Admin</div>
                <NuxtLink v-if="userRole === 'admin'" to="/admin/system" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Sistem & Cache
                </NuxtLink>
                <NuxtLink v-if="userRole === 'admin'" to="/admin/data-merge" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Kelola Merge Data
                </NuxtLink>
                <NuxtLink v-if="userRole === 'admin'" to="/admin/ppk-master" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Data PPK
                </NuxtLink>
                <NuxtLink v-if="userRole === 'admin'" to="/users" class="nav-item" @click="closeSidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Manajemen Pengguna
                </NuxtLink>
            </nav>

            <div class="sidebar-footer">
                <div class="user-profile">
                    <div class="avatar">
                        <span>{{ displayAvatar }}</span>
                    </div>
                    <div class="user-info">
                        <span class="user-name">{{ displayUserName }}</span>
                        <span class="user-role">{{ displayUserRole }}</span>
                    </div>
                    <button class="logout-btn" title="Logout" @click="handleLogout">
                        <svg xmlns="http://www.w3.org/2000/svg" class="logout-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <div class="app-main">
            <header class="app-header">
                <div class="header-left">
                    <button class="hamburger-btn" @click="toggleSidebar" title="Toggle Sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span class="header-title">Dashboard</span>
                </div>
                <div class="header-actions">
                    <button 
                        @click="toggleDarkMode" 
                        class="theme-toggle-btn"
                        title="Toggle Dark Mode"
                    >
                        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="icon icon-sun" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon icon-moon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    </button>
                </div>
            </header>
            <main class="app-content">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isMobile = ref(false);
const isSidebarOpen = ref(true);
const { toggleDarkMode, isDark } = useTheme();
const userRole = useCookie('user_role');
const userName = useCookie('user_name');

const displayUserName = computed(() => {
    if (userName.value) return userName.value;
    return userRole.value === 'admin' ? 'Admin' : 'User';
});

const displayAvatar = computed(() => {
    return displayUserName.value.charAt(0).toUpperCase();
});

const displayUserRole = computed(() => {
    return userRole.value === 'admin' ? 'Administrator' : 'Standard User';
});

const { data: endpointConfig } = useAsyncData('endpoints-config', () => $fetch('/api/admin/endpoints-config'));

const isEndpointActive = (endpoint) => {
    // If config hasn't loaded yet, assume active to avoid UI flicker
    if (!endpointConfig.value || !endpointConfig.value.data) return true; 
    const activeEndpoints = endpointConfig.value.data.activeEndpoints || {};
    
    // Check across all groups
    for (const group in activeEndpoints) {
        if (activeEndpoints[group].includes(endpoint)) {
            return true;
        }
    }
    return false;
};

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    if (isMobile.value) {
        isSidebarOpen.value = false;
    } else {
        isSidebarOpen.value = true;
    }
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
});

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
    if (isMobile.value) {
        isSidebarOpen.value = false;
    }
};

const handleLogout = async () => {
    try {
        const isLoggedIn = useCookie('is_logged_in');
        const roleCookie = useCookie('user_role');
        const nameCookie = useCookie('user_name');
        isLoggedIn.value = null; // Hapus cookie
        roleCookie.value = null;
        nameCookie.value = null;
        // Optional: Call the backend logout API if it exists
        // await $fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Redirect user to the login page
    router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: hsl(var(--maz-background));
  color: hsl(var(--maz-foreground));
  font-family: var(--maz-font-family, sans-serif);
  overflow: hidden;
}

/* Sidebar Backdrop */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 40;
  animation: fadeIn 0.2s ease;
}

/* Sidebar Styles */
.app-sidebar {
  width: 280px;
  background-color: hsl(var(--maz-background));
  border-right: 1px solid hsl(var(--maz-border));
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.02);
  z-index: 50;
  position: relative;
}

.app-sidebar.is-mobile {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
}

.app-sidebar.is-mobile.is-open {
  transform: translateX(0);
}

.app-sidebar:not(.is-mobile):not(.is-open) {
  margin-left: -280px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--maz-border));
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-box {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, hsl(var(--maz-primary)), hsl(var(--maz-secondary)));
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px hsl(var(--maz-primary) / 30%);
}

.logo-icon {
  width: 20px;
  height: 20px;
  color: white;
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: hsl(var(--maz-foreground));
  letter-spacing: 0.5px;
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  overflow-y: auto;
}

.nav-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 700;
  color: hsl(var(--maz-muted));
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
  padding-left: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border-radius: var(--maz-border-radius, 0.75rem);
  color: hsl(var(--maz-muted));
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.2s ease;
}

.nav-item:hover {
  color: hsl(var(--maz-foreground));
  background-color: hsl(var(--maz-foreground) / 5%);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
  color: hsl(var(--maz-primary));
}

.nav-item.router-link-active {
  background-color: hsl(var(--maz-primary) / 10%);
  color: hsl(var(--maz-primary));
}

.nav-item.router-link-active .nav-icon {
  color: hsl(var(--maz-primary));
}

.nav-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  bottom: 10%;
  width: 4px;
  background-color: hsl(var(--maz-primary));
  border-radius: 0 4px 4px 0;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid hsl(var(--maz-border));
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--maz-border-radius, 0.75rem);
  background-color: hsl(var(--maz-foreground) / 3%);
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background-color: hsl(var(--maz-foreground) / 6%);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: hsl(var(--maz-primary) / 20%);
  color: hsl(var(--maz-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: hsl(var(--maz-foreground));
}

.user-role {
  font-size: 0.75rem;
  color: hsl(var(--maz-muted));
}

.logout-btn {
  background: transparent;
  border: none;
  color: hsl(var(--maz-muted));
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  color: hsl(var(--maz-destructive));
  background-color: hsl(var(--maz-destructive) / 10%);
}

.logout-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Main Content */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  height: 4.5rem;
  background-color: hsl(var(--maz-background));
  border-bottom: 1px solid hsl(var(--maz-border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.hamburger-btn {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: hsl(var(--maz-foreground));
  transition: background-color 0.2s ease;
}

.hamburger-btn:hover {
  background-color: hsl(var(--maz-foreground) / 5%);
}

.hamburger-btn .icon {
  width: 1.5rem;
  height: 1.5rem;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: hsl(var(--maz-foreground));
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

.icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.icon-sun { color: #facc15; }
.icon-moon { color: hsl(var(--maz-foreground)); }

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: hsl(var(--maz-foreground) / 2%);
}
</style>