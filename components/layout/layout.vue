<template>
    <div class="app-layout">
        <!-- Sidebar -->
        <aside class="app-sidebar">
            <div class="sidebar-header">
                <h1>UKPBJ</h1>
            </div>
            <nav class="sidebar-nav">
                <NuxtLink to="/" class="nav-item">Home</NuxtLink>
                <NuxtLink to="/users" class="nav-item">Users</NuxtLink>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="app-main">
            <header class="app-header">
                <span class="header-title">Dashboard</span>
                <div class="header-actions">
                    <button 
                        @click="toggleDarkMode" 
                        class="theme-toggle-btn"
                        title="Toggle Dark Mode"
                    >
                        <!-- Sun Icon (shows in dark mode) -->
                        <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="icon icon-sun" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <!-- Moon Icon (shows in light mode) -->
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
import { ref } from 'vue';

const isMobile = ref(false);
const { toggleDarkMode, isDark } = useTheme();
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background-color: hsl(var(--maz-background));
  color: hsl(var(--maz-foreground));
  font-family: var(--maz-font-family, sans-serif);
}

.app-sidebar {
  width: 260px;
  background-color: hsl(var(--maz-background));
  border-right: 1px solid hsl(var(--maz-border));
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--maz-border));
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--maz-primary));
  letter-spacing: 0.5px;
}

.sidebar-nav {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: block;
  padding: 0.75rem 1.25rem;
  border-radius: var(--maz-border-radius, 0.5rem);
  color: hsl(var(--maz-foreground));
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: hsl(var(--maz-primary) / 15%);
  color: hsl(var(--maz-primary));
  transform: translateX(4px);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  height: 4rem;
  background-color: hsl(var(--maz-background));
  border-bottom: 1px solid hsl(var(--maz-border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.header-title {
  font-size: 1.125rem;
  font-weight: 600;
}

.theme-toggle-btn {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: hsl(var(--maz-foreground));
}

.theme-toggle-btn:hover {
  background-color: hsl(var(--maz-foreground) / 10%);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.icon-sun { color: #facc15; }
.icon-moon { color: hsl(var(--maz-foreground)); }

.theme-toggle-btn:hover .icon {
  transform: rotate(15deg) scale(1.1);
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: hsl(var(--maz-foreground) / 3%);
}
</style>