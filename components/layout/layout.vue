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
                <!-- Menu tanpa parent (standalone, e.g. Dashboard) -->
                <template v-for="item in standaloneMenuItems" :key="item.path">
                    <NuxtLink 
                        v-if="(!item.adminOnly || userRole === 'admin') && (!item.endpointActive || isEndpointActive(item.endpointActive))" 
                        :to="item.path" 
                        class="nav-item mb-2" 
                        @click="closeSidebar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path v-for="(path, idx) in item.iconPaths" :key="idx" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="path" />
                        </svg>
                        {{ item.name }}
                    </NuxtLink>
                </template>

                <!-- Kelompok menu collapsible -->
                <div v-for="group in menuGroups" :key="group.label" class="mb-1">
                    <div 
                        class="nav-label mt-2" 
                        @click="toggleGroup(group.label)"
                    >
                        <span>{{ group.label }}</span>
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            class="collapse-icon" 
                            :class="{ 'is-collapsed': isGroupCollapsed(group.label) }"
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    
                    <div v-show="!isGroupCollapsed(group.label)" class="nav-group-items">
                        <template v-for="item in group.items" :key="item.path">
                            <NuxtLink 
                                v-if="(!item.adminOnly || userRole === 'admin') && (!item.endpointActive || isEndpointActive(item.endpointActive))" 
                                :to="item.path" 
                                class="nav-item" 
                                @click="closeSidebar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path v-for="(path, idx) in item.iconPaths" :key="idx" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="path" />
                                </svg>
                                {{ item.name }}
                            </NuxtLink>
                        </template>
                    </div>
                </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { menuGroups, standaloneMenuItems } from './menu';

const router = useRouter();
const route = useRoute();
const isMobile = ref(false);
const isSidebarOpen = ref(true);
const { toggleDarkMode, isDark } = useTheme();
const userRole = useCookie('user_role');
const userName = useCookie('user_name');

// State kelompok menu (Boolean: true = collapsed, false = expanded)
const collapsedGroups = ref({});

// Inisialisasi & update state: buka grup rute baru tanpa menutup grup yang sudah dibuka pengguna
const syncMenuCollapseState = (currentPath) => {
  menuGroups.forEach(group => {
    const hasActiveItem = group.items?.some(item => item.path === currentPath);
    if (collapsedGroups.value[group.label] === undefined) {
      collapsedGroups.value[group.label] = !hasActiveItem;
    } else if (hasActiveItem) {
      collapsedGroups.value[group.label] = false;
    }
  });
};

const isGroupCollapsed = (label) => {
  return collapsedGroups.value[label] !== false;
};

const toggleGroup = (label) => {
  collapsedGroups.value[label] = isGroupCollapsed(label) ? false : true;
};

// Pantau perubahan rute: buka grup rute baru TANPA menutup grup yang sudah pernah dibuka
watch(() => route.path, (newPath) => {
  syncMenuCollapseState(newPath);
}, { immediate: true });

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
  margin-bottom: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-label:hover {
  background-color: hsl(var(--maz-foreground) / 5%);
  color: hsl(var(--maz-foreground));
}

.collapse-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}

.collapse-icon.is-collapsed {
  transform: rotate(-90deg);
}

.nav-group-items {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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